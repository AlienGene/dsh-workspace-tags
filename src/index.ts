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
import { createStateHandler } from './host/route.ts'
import {
  TABLE_NAME,
  TagStore,
  tagDomainSpec,
  type DomainHandleLike,
  type StorageDomainLike,
} from './host/store.ts'
import { ROUTE_PATH } from './protocol.ts'

/** Stable plugin name (shown in the plugin inventory). */
export const name = 'workspace-tags'

interface HostLogger {
  warn?(message: string): void
  error?(message: string): void
}

/** The Cordis surface this plugin uses, declared structurally. */
export interface HostContext {
  inject(names: readonly string[], callback: (ctx: HostContext) => void): void
  effect(callback: () => (() => void) | void, label?: string): void
  get<T = unknown>(key: string): T | undefined
  logger?: HostLogger
}

interface FetchRoute {
  path: string
  methods: ('GET' | 'HEAD' | 'POST')[]
  requestBody: 'buffered' | 'streaming'
  fetch(request: Request): Promise<Response>
}

interface ConnectionLike {
  fetch: { register(route: FetchRoute): () => void }
}

/**
 * Mount the plugin.
 * @param ctx - host context.
 */
export function apply(ctx: HostContext): void {
  const holder: { store: TagStore | null } = { store: null }
  const handler = createStateHandler(() => holder.store)

  ctx.inject(['connection'], (connectionContext) => {
    connectionContext.effect(() => {
      const connection = connectionContext.get<ConnectionLike>('connection')
      if (connection?.fetch?.register === undefined) {
        connectionContext.logger?.warn?.('[workspace-tags] connection.fetch is unavailable; tag route not mounted')
        return () => {}
      }
      return connection.fetch.register({
        path: ROUTE_PATH,
        methods: ['GET', 'POST'],
        requestBody: 'buffered',
        fetch: handler,
      })
    }, 'workspace-tags: state route')
  })

  ctx.inject(['storageDomain'], (storageContext) => {
    storageContext.effect(() => {
      let disposed = false
      let domain: DomainHandleLike | null = null

      void (async () => {
        try {
          const storage = storageContext.get<StorageDomainLike>('storageDomain')
          if (storage === undefined) return
          const opened = await storage.open(tagDomainSpec())
          if (disposed) {
            await opened.close().catch(() => {})
            return
          }
          domain = opened
          const store = new TagStore(opened.table(TABLE_NAME))
          await store.init()
          if (disposed) return
          holder.store = store
        } catch (error) {
          storageContext.logger?.warn?.(`[workspace-tags] tag storage unavailable: ${error instanceof Error ? error.message : String(error)}`)
        }
      })()

      return () => {
        disposed = true
        holder.store = null
        if (domain !== null) void domain.close().catch(() => {})
      }
    }, 'workspace-tags: tag storage')
  })
}
