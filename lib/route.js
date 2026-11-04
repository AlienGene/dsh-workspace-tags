import { isRecord, validateWritePayload } from "./protocol.js";
import { TagConflictError } from "./store.js";
// src/host/route.ts
/**
* The one HTTP handler the browser half talks to.
*
* Mounted through the authenticated `/api` Fetch-route registry, so the
* Connection service has already enforced the Host/Origin fence and the owner
* principal when this runs. Only the two methods the client uses are accepted,
* the body is size-capped, and every failure carries a stable code.
*
* @module dsh-workspace-tags/route
*/
/** Maximum accepted request body (the whole document is tiny). */
const MAX_BODY_BYTES = 262144;
/**
* @returns the handler to pass to `ctx.connection.fetch.register`.
* @param getStore - resolves the store once the domain has opened; null while
*   storage is unavailable, which answers 503 instead of failing activation.
*/
function createStateHandler(getStore) {
	return async (request) => {
		const method = request.method.toUpperCase();
		if (method !== "GET" && method !== "POST") return json(405, {
			ok: false,
			error: { code: "method-not-allowed" }
		}, { allow: "GET, POST" });
		const store = getStore();
		if (store === null) return json(503, {
			ok: false,
			error: { code: "storage-unavailable" }
		});
		if (method === "GET") return json(200, {
			ok: true,
			state: store.snapshot()
		});
		if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") return json(415, {
			ok: false,
			error: { code: "unsupported-media-type" }
		});
		const declared = Number(request.headers.get("content-length") ?? "");
		if (Number.isFinite(declared) && declared > 262144) return json(413, {
			ok: false,
			error: { code: "payload-too-large" }
		});
		let raw;
		try {
			raw = await request.text();
		} catch {
			return json(400, {
				ok: false,
				error: {
					code: "invalid-body",
					message: "body could not be read"
				}
			});
		}
		if (new TextEncoder().encode(raw).byteLength > 262144) return json(413, {
			ok: false,
			error: { code: "payload-too-large" }
		});
		let body;
		try {
			body = JSON.parse(raw);
		} catch {
			return json(400, {
				ok: false,
				error: {
					code: "invalid-body",
					message: "body is not JSON"
				}
			});
		}
		if (!isRecord(body)) return json(400, {
			ok: false,
			error: {
				code: "invalid-body",
				message: "body must be an object"
			}
		});
		const ifRevision = body["ifRevision"];
		if (typeof ifRevision !== "number" || !Number.isInteger(ifRevision) || ifRevision < 0) return json(400, {
			ok: false,
			error: {
				code: "invalid-body",
				message: "ifRevision must be a non-negative integer"
			}
		});
		const validation = validateWritePayload({
			tags: body["tags"],
			assignments: body["assignments"]
		});
		if (!validation.ok) return json(400, {
			ok: false,
			error: {
				code: validation.code,
				message: validation.message
			}
		});
		try {
			return json(200, {
				ok: true,
				state: await store.write(validation.payload, ifRevision)
			});
		} catch (error) {
			if (error instanceof TagConflictError) return json(409, {
				ok: false,
				error: {
					code: "conflict",
					revision: error.revision
				}
			});
			return json(500, {
				ok: false,
				error: { code: "store-error" }
			});
		}
	};
}
/**
* @returns a JSON response with no-store caching.
* @param status - HTTP status.
* @param payload - serializable body.
* @param headers - extra headers (e.g. `allow`).
*/
function json(status, payload, headers = {}) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			...headers
		}
	});
}
export { MAX_BODY_BYTES, createStateHandler };
