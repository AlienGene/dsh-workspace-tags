import { emptyState, nowIso, sanitizeStoredState } from "./protocol.js";
// src/host/store.ts
/**
* Host-side tag storage over the already-mounted storage domain.
*
* The plugin owns one domain (`dsh_tags`) with one table (`state`) and one
* record (`main`). Keeping the whole document in a single record makes "delete
* a tag and strip its assignments from every workspace" one durable write.
*
* The domain object is reached through structural interfaces on purpose: this
* package ships no runtime dependency, so the Host resolves nothing but its own
* modules. The schema is a minimal `{ parse }` object because the domain form
* only ever calls `parse` when loading a stored record.
*
* @module dsh-workspace-tags/store
*/
/** Domain name (must match the storage unit-name grammar). */
const DOMAIN_NAME = "dsh_tags";
/** Domain version; never bumped for record-schema changes. */
const DOMAIN_VERSION = 1;
/** Table holding the single tag document. */
const TABLE_NAME = "state";
/** Record key of the single tag document. */
const RECORD_KEY = "main";
/**
* @returns the domain declaration. The value schema is lenient: a malformed or
* future record reads as an empty/partial document instead of breaking `open`.
*/
function tagDomainSpec() {
	return {
		name: DOMAIN_NAME,
		version: 1,
		tables: { [TABLE_NAME]: { valueSchema: { parse: (value) => sanitizeStoredState(value) } } }
	};
}
/** Raised when a write's `ifRevision` no longer matches the stored revision. */
var TagConflictError = class extends Error {
	/** The revision the Host currently holds. */
	revision;
	/**
	* @param revision - current stored revision.
	*/
	constructor(revision) {
		super("tag state revision conflict");
		this.name = "TagConflictError";
		this.revision = revision;
	}
};
/** One in-memory, durable tag document bound to a domain table. */
var TagStore = class {
	#table;
	#state = emptyState();
	/**
	* @param table - the domain's `state` table.
	*/
	constructor(table) {
		this.#table = table;
	}
	/**
	* Read the stored document (creating the initial one on first run).
	* @returns this store for chaining.
	*/
	async init() {
		const stored = this.#table.get(RECORD_KEY);
		if (stored === void 0) {
			this.#state = emptyState();
			await this.#table.put(RECORD_KEY, this.#state);
			return this;
		}
		this.#state = sanitizeStoredState(stored);
		return this;
	}
	/** @returns the current canonical document (synchronously, from memory). */
	snapshot() {
		return this.#state;
	}
	/**
	* Compare-and-set write.
	* @param payload - strictly validated tags and assignments.
	* @param ifRevision - revision the caller saw.
	* @returns the new canonical document.
	* @throws {TagConflictError} when the stored revision moved.
	*/
	async write(payload, ifRevision) {
		const next = await this.#table.update(RECORD_KEY, (current) => {
			const base = sanitizeStoredState(current);
			if (base.revision !== ifRevision) throw new TagConflictError(base.revision);
			return {
				schemaVersion: 1,
				revision: base.revision + 1,
				tags: payload.tags,
				assignments: payload.assignments,
				updatedAt: nowIso()
			};
		});
		this.#state = sanitizeStoredState(next);
		return this.#state;
	}
};
export { DOMAIN_NAME, DOMAIN_VERSION, RECORD_KEY, TABLE_NAME, TagConflictError, TagStore, tagDomainSpec };
