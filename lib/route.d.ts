import { TagPayload, TagState } from "./protocol.js";
/** Maximum accepted request body (the whole document is tiny). */
declare const MAX_BODY_BYTES: number;
/** The store operations the handler needs (the class satisfies this structurally). */
interface TagStoreLike {
  snapshot(): TagState;
  write(payload: TagPayload, ifRevision: number): Promise<TagState>;
}
/** Shape read by the handler on every request. */
type TagStoreSeam = () => TagStoreLike | null;
/**
 * @returns the handler to pass to `ctx.connection.fetch.register`.
 * @param getStore - resolves the store once the domain has opened; null while
 *   storage is unavailable, which answers 503 instead of failing activation.
 */
declare function createStateHandler(getStore: TagStoreSeam): (request: Request) => Promise<Response>;
export { MAX_BODY_BYTES, TagStoreLike, TagStoreSeam, createStateHandler };