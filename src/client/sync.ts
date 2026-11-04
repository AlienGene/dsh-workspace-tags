/**
 * Browser <-> Host persistence for the tag document.
 *
 * The Host route is an authenticated `/api` Fetch route. Reads hydrate the
 * store; writes are serialized so a burst of toggles becomes at most one
 * in-flight request plus one queued latest document. A stale `revision`
 * (another window wrote first) is resolved by re-reading the Host document.
 *
 * @module dsh-workspace-tags/client/sync
 */
import {
  CLIENT_ROUTE,
  isRecord,
  sanitizeStoredState,
  type TagPayload,
  type TagState,
} from '../protocol.ts'
import type { ClientTagStore } from './store.ts'

/** The sync driver handed to `apply` (and to the page's retry button). */
export interface TagSync {
  start(): void
  retry(): void
  dispose(): void
}

/** Successful or refused write, as the Host reports it. */
type WriteOutcome =
  | { ok: true; state: TagState }
  | { ok: false; code: 'conflict'; revision: number }
  | { ok: false; code: 'storage' | 'network' | 'invalid-body' }

const RETRY_LIMIT = 3
const RETRY_BASE_MS = 800

/** @returns the canonical identity of a writable payload. */
function payloadKey(payload: TagPayload): string {
  return JSON.stringify({ tags: payload.tags, assignments: payload.assignments })
}

/** @returns the writable slice of a canonical document. */
function payloadOf(state: TagState): TagPayload {
  return { tags: state.tags, assignments: state.assignments }
}

/**
 * @returns the parsed document, or null when the envelope is not a success.
 */
function readState(payload: unknown): TagState | null {
  if (!isRecord(payload) || payload['ok'] !== true) return null
  const state = payload['state']
  return state === undefined ? null : sanitizeStoredState(state)
}

/**
 * Create the sync driver.
 * @param store - the browser store to hydrate and persist.
 * @returns the driver.
 */
export function createTagSync(store: ClientTagStore): TagSync {
  let disposed = false
  let unsubscribe: (() => void) | null = null
  let controller: AbortController | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let inflight = false
  let pending = false
  let attempts = 0
  let lastKey = ''

  const clearRetry = (): void => {
    if (retryTimer !== null) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  const scheduleRetry = (): void => {
    if (disposed || retryTimer !== null || attempts >= RETRY_LIMIT) return
    attempts += 1
    retryTimer = setTimeout(() => {
      retryTimer = null
      void save()
    }, RETRY_BASE_MS * attempts)
  }

  const read = async (): Promise<TagState | null> => {
    controller?.abort()
    controller = new AbortController()
    let response: Response
    try {
      response = await fetch(CLIENT_ROUTE, {
        method: 'GET',
        headers: { accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      })
    } catch {
      if (!disposed) store.setSyncError('network')
      return null
    }
    if (response.status === 503) {
      store.setSyncError('storage')
      store.setLoading(false)
      return null
    }
    if (!response.ok) {
      store.setSyncError('network')
      store.setLoading(false)
      return null
    }
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      store.setSyncError('network')
      store.setLoading(false)
      return null
    }
    const state = readState(payload)
    if (state === null) {
      store.setSyncError('network')
      store.setLoading(false)
      return null
    }
    return state
  }

  const load = async (): Promise<void> => {
    store.setLoading(true)
    const state = await read()
    if (disposed || state === null) return
    lastKey = payloadKey(payloadOf(state))
    attempts = 0
    store.hydrate(state)
  }

  const reloadAfterConflict = async (): Promise<void> => {
    const state = await read()
    if (disposed || state === null) return
    lastKey = payloadKey(payloadOf(state))
    store.applyServerState(state)
  }

  const write = async (payload: TagPayload, ifRevision: number): Promise<WriteOutcome> => {
    controller?.abort()
    controller = new AbortController()
    let response: Response
    try {
      response = await fetch(CLIENT_ROUTE, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({ ifRevision, ...payload }),
      })
    } catch {
      return { ok: false, code: 'network' }
    }
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = null
    }
    if (response.status === 409) {
      const error = isRecord(body) ? body['error'] : null
      const revision = isRecord(error) && typeof error['revision'] === 'number' ? error['revision'] : 0
      return { ok: false, code: 'conflict', revision }
    }
    if (response.status === 503) return { ok: false, code: 'storage' }
    if (response.status === 400) return { ok: false, code: 'invalid-body' }
    if (!response.ok) return { ok: false, code: 'network' }
    const state = readState(body)
    return state === null ? { ok: false, code: 'network' } : { ok: true, state }
  }

  const save = async (): Promise<void> => {
    if (disposed) return
    if (!store.getSnapshot().hydrated) return
    if (inflight) {
      pending = true
      return
    }
    const current = store.getSnapshot()
    const payload = store.payload()
    const key = payloadKey(payload)
    if (key === lastKey) return
    inflight = true
    try {
      const outcome = await write(payload, current.revision)
      if (disposed) return
      if (outcome.ok) {
        lastKey = key
        attempts = 0
        store.setSyncError(null)
        store.setRevision(outcome.state.revision)
      } else if (outcome.code === 'conflict') {
        store.setSyncError('conflict')
        await reloadAfterConflict()
      } else if (outcome.code === 'storage') {
        store.setSyncError('storage')
      } else {
        store.setSyncError('network')
        scheduleRetry()
      }
    } finally {
      inflight = false
      if (pending && !disposed) {
        pending = false
        void save()
      }
    }
  }

  const onChange = (): void => {
    if (disposed) return
    const snapshot = store.getSnapshot()
    if (!snapshot.hydrated) return
    if (payloadKey(store.payload()) === lastKey) return
    void save()
  }

  return {
    start: () => {
      if (disposed) return
      unsubscribe = store.subscribe(onChange)
      void load()
    },
    retry: () => {
      if (disposed) return
      clearRetry()
      attempts = 0
      if (!store.getSnapshot().hydrated) void load()
      else void save()
    },
    dispose: () => {
      disposed = true
      clearRetry()
      unsubscribe?.()
      unsubscribe = null
      controller?.abort()
      controller = null
    },
  }
}
