import { createStateHandler } from "./route.js";
import { TABLE_NAME, TagStore, tagDomainSpec } from "./store.js";
import { ROUTE_PATH } from "./protocol.js";
// src/index.ts
/**
* dsh-workspace-tags — Host half.
*
* Owns one durable tag document in the storage domain and exposes it to the
* browser half through one authenticated `/api` Fetch route. The plugin has no
* runtime dependency: it reaches storage and connection through structural
* interfaces and never imports a Host package.
*
* Activation is deliberately tolerant. If storage or the route registry is not
* available, the plugin still activates (so the browser bundle keeps being
* served) and the route answers `503 storage-unavailable` until it is.
*
* @module dsh-workspace-tags
*/
/** Stable plugin name (shown in the plugin inventory). */
const name = "workspace-tags";
/**
* Mount the plugin.
* @param ctx - host context.
*/
function apply(ctx) {
	const holder = { store: null };
	const handler = createStateHandler(() => holder.store);
	ctx.inject(["connection"], (connectionContext) => {
		connectionContext.effect(() => {
			const connection = connectionContext.get("connection");
			if (connection?.fetch?.register === void 0) {
				connectionContext.logger?.warn?.("[workspace-tags] connection.fetch is unavailable; tag route not mounted");
				return () => {};
			}
			return connection.fetch.register({
				path: ROUTE_PATH,
				methods: ["GET", "POST"],
				requestBody: "buffered",
				fetch: handler
			});
		}, "workspace-tags: state route");
	});
	ctx.inject(["storageDomain"], (storageContext) => {
		storageContext.effect(() => {
			let disposed = false;
			let domain = null;
			(async () => {
				try {
					const storage = storageContext.get("storageDomain");
					if (storage === void 0) return;
					const opened = await storage.open(tagDomainSpec());
					if (disposed) {
						await opened.close().catch(() => {});
						return;
					}
					domain = opened;
					const store = new TagStore(opened.table(TABLE_NAME));
					await store.init();
					if (disposed) return;
					holder.store = store;
				} catch (error) {
					storageContext.logger?.warn?.(`[workspace-tags] tag storage unavailable: ${error instanceof Error ? error.message : String(error)}`);
				}
			})();
			return () => {
				disposed = true;
				holder.store = null;
				if (domain !== null) domain.close().catch(() => {});
			};
		}, "workspace-tags: tag storage");
	});
}
export { apply, name };
