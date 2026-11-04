import { describe, expect, it } from 'vitest'
import { MAX_BODY_BYTES, createStateHandler, type TagStoreLike } from '../src/host/route.ts'
import { emptyState, type TagPayload, type TagState } from '../src/protocol.ts'
import { TagConflictError } from '../src/host/store.ts'

const URL = 'http://dsh.internal/api/dsh-tags/state'

/** Minimal store fake for the route contract. */
class FakeStore implements TagStoreLike {
  state: TagState = emptyState('2026-01-01T00:00:00.000Z')

  snapshot(): TagState {
    return this.state
  }

  async write(payload: TagPayload, ifRevision: number): Promise<TagState> {
    if (ifRevision !== this.state.revision) throw new TagConflictError(this.state.revision)
    this.state = {
      ...this.state,
      revision: this.state.revision + 1,
      tags: payload.tags,
      assignments: payload.assignments,
    }
    return this.state
  }
}

/** @returns a request for the handler. */
function request(method: string, body?: string, contentType = 'application/json'): Request {
  return new Request(URL, {
    method,
    headers: body === undefined ? { accept: 'application/json' } : { accept: 'application/json', 'content-type': contentType },
    ...(body === undefined ? {} : { body }),
  })
}

describe('state route', () => {
  it('answers 503 while storage is unavailable', async () => {
    const handler = createStateHandler(() => null)
    const response = await handler(request('GET'))
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ ok: false, error: { code: 'storage-unavailable' } })
  })

  it('returns the current document', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    const response = await handler(request('GET'))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toMatchObject({ ok: true, state: { revision: 0 } })
  })

  it('accepts a valid write', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    const response = await handler(
      request('POST', JSON.stringify({
        ifRevision: 0,
        tags: [{ id: 'a', text: 'Work', color: '#3b82f6' }],
        assignments: { w1: ['a'] },
      })),
    )
    expect(response.status).toBe(200)
    const body = await response.json() as { ok: boolean; state: TagState }
    expect(body.state.revision).toBe(1)
    expect(body.state.tags).toHaveLength(1)
  })

  it('reports a revision conflict', async () => {
    const store = new FakeStore()
    store.state = { ...store.state, revision: 2 }
    const handler = createStateHandler(() => store)
    const response = await handler(request('POST', JSON.stringify({ ifRevision: 1, tags: [], assignments: {} })))
    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({ ok: false, error: { code: 'conflict', revision: 2 } })
  })

  it('rejects duplicate tag names', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    const response = await handler(
      request('POST', JSON.stringify({
        ifRevision: 0,
        tags: [
          { id: 'a', text: 'Work', color: '#3b82f6' },
          { id: 'b', text: ' work ', color: '#ffffff' },
        ],
        assignments: {},
      })),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ ok: false, error: { code: 'duplicate-tag' } })
  })

  it('rejects malformed bodies and media types', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    expect((await handler(request('POST', '{', 'application/json'))).status).toBe(400)
    expect((await handler(request('POST', '{}', 'text/plain'))).status).toBe(415)
    expect((await handler(request('POST', JSON.stringify({ ifRevision: -1, tags: [], assignments: {} })))).status).toBe(400)
  })

  it('rejects unsupported methods', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    const response = await handler(request('PUT', '{}'))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET, POST')
  })

  it('rejects oversized bodies', async () => {
    const store = new FakeStore()
    const handler = createStateHandler(() => store)
    const body = JSON.stringify({ ifRevision: 0, tags: [], assignments: {}, pad: 'x'.repeat(MAX_BODY_BYTES) })
    const response = await handler(request('POST', body))
    expect(response.status).toBe(413)
  })
})
