import { TagPayload, TagState } from "./protocol.js";
/** Domain name (must match the storage unit-name grammar). */
declare const DOMAIN_NAME = "dsh_tags";
/** Domain version; never bumped for record-schema changes. */
declare const DOMAIN_VERSION = 1;
/** Table holding the single tag document. */
declare const TABLE_NAME = "state";
/** Record key of the single tag document. */
declare const RECORD_KEY = "main";
/** The two operations the domain table exposes to this plugin. */
interface DomainTableLike {
  get(key: string): TagState | undefined;
  put(key: string, value: TagState): Promise<void>;
  update(key: string, update: (current: TagState) => TagState): Promise<TagState>;
}
/** The handle returned by `storageDomain.open`. */
interface DomainHandleLike {
  table(name: string): DomainTableLike;
  close(): Promise<void>;
}
/** The storage-domain service face this plugin uses. */
interface StorageDomainLike {
  open(spec: unknown): Promise<DomainHandleLike>;
}
/** The domain declaration handed to `storageDomain.open`. */
interface TagDomainSpecLike {
  name: string;
  version: number;
  tables: Record<string, {
    valueSchema: {
      parse(value: unknown): unknown;
    };
  }>;
}
/**
 * @returns the domain declaration. The value schema is lenient: a malformed or
 * future record reads as an empty/partial document instead of breaking `open`.
 */
declare function tagDomainSpec(): TagDomainSpecLike;
/** Raised when a write's `ifRevision` no longer matches the stored revision. */
declare class TagConflictError extends Error {
  /** The revision the Host currently holds. */
  readonly revision: number;
  /**
   * @param revision - current stored revision.
   */
  constructor(revision: number);
}
/** One in-memory, durable tag document bound to a domain table. */
declare class TagStore {
  #private;
  /**
   * @param table - the domain's `state` table.
   */
  constructor(table: DomainTableLike);
  /**
   * Read the stored document (creating the initial one on first run).
   * @returns this store for chaining.
   */
  init(): Promise<this>;
  /** @returns the current canonical document (synchronously, from memory). */
  snapshot(): TagState;
  /**
   * Compare-and-set write.
   * @param payload - strictly validated tags and assignments.
   * @param ifRevision - revision the caller saw.
   * @returns the new canonical document.
   * @throws {TagConflictError} when the stored revision moved.
   */
  write(payload: TagPayload, ifRevision: number): Promise<TagState>;
}
export { DOMAIN_NAME, DOMAIN_VERSION, DomainHandleLike, DomainTableLike, RECORD_KEY, StorageDomainLike, TABLE_NAME, TagConflictError, TagDomainSpecLike, TagStore, tagDomainSpec };