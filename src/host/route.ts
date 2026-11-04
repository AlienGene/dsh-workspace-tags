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
import {
  isRecord,
  validateWritePayload,
  type TagPayload,
  type TagState,
} from '../protocol.ts'
import { TagConflictError } from './store.ts'

/** Maximum accepted request body (the whole document is tiny). */
export const MAX_BODY_BYTES = 256 * 1024

/** The store operations the handler needs (the class satisfies this structurally). */
export interface TagStoreLike {
  snapshot(): TagState
  write(payload: TagPayload, ifRevision: number): Promise<TagState>
}

/** Shape read by the handler on every request. */
export type TagStoreSeam = () => TagStoreLike | null

/**
 * @returns the handler to pass to `ctx.connection.fetch.register`.
 * @param getStore - resolves the store once the domain has opened; null while
 *   storage is unavailable, which answers 503 instead of failing activation.
 */
export function createStateHandler(getStore: TagStoreSeam): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const method = request.method.toUpperCase()
    if (method !== 'GET' && method !== 'POST') {
      return json(405, { ok: false, error: { code: 'method-not-allowed' } }, { allow: 'GET, POST' })
    }

    const store = getStore()
    if (store === null) {
      return json(503, { ok: false, error: { code: 'storage-unavailable' } })
    }

    if (method === 'GET') {
      return json(200, { ok: true, state: store.snapshot() })
    }

    const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
    if (mediaType !== 'application/json') {
      return json(415, { ok: false, error: { code: 'unsupported-media-type' } })
    }

    const declared = Number(request.headers.get('content-length') ?? '')
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: { code: 'payload-too-large' } })
    }

    let raw: string
    try {
      raw = await request.text()
    } catch {
      return json(400, { ok: false, error: { code: 'invalid-body', message: 'body could not be read' } })
    }
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: { code: 'payload-too-large' } })
    }

    let body: unknown
    try {
      body = JSON.parse(raw) as unknown
    } catch {
      return json(400, { ok: false, error: { code: 'invalid-body', message: 'body is not JSON' } })
    }
    if (!isRecord(body)) {
      return json(400, { ok: false, error: { code: 'invalid-body', message: 'body must be an object' } })
    }

    const ifRevision = body['ifRevision']
    if (typeof ifRevision !== 'number' || !Number.isInteger(ifRevision) || ifRevision < 0) {
      return json(400, { ok: false, error: { code: 'invalid-body', message: 'ifRevision must be a non-negative integer' } })
    }

    const validation = validateWritePayload({ tags: body['tags'], assignments: body['assignments'] })
    if (!validation.ok) {
      return json(400, { ok: false, error: { code: validation.code, message: validation.message } })
    }

    try {
      const state: TagState = await store.write(validation.payload, ifRevision)
      return json(200, { ok: true, state })
    } catch (error) {
      if (error instanceof TagConflictError) {
        return json(409, { ok: false, error: { code: 'conflict', revision: error.revision } })
      }
      return json(500, { ok: false, error: { code: 'store-error' } })
    }
  }
}

/**
 * @returns a JSON response with no-store caching.
 * @param status - HTTP status.
 * @param payload - serializable body.
 * @param headers - extra headers (e.g. `allow`).
 */
function json(status: number, payload: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  })
}
