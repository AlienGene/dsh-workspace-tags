/**
 * dsh-workspace-tags — browser half.
 *
 * Wires the browser store, the persistence driver and the DOM decorator, then
 * registers the plugin's three seats: the global Tags page (`main`), its
 * sidebar row (`sidebar.panellist`, rendered above the More row) and the
 * anchored filter/annotation surfaces (`shell.overlay`).
 *
 * @module dsh-workspace-tags/client
 */
import { NS, en, zh } from './locales.ts'
import { createClientTagStore } from './store.ts'
import { createTagSync } from './sync.ts'
import { createDomController } from './dom/controller.ts'
import { ensurePluginStyles } from './dom/styles.ts'
import { PANEL_ID } from '../protocol.ts'
import { TagsPage } from './components/TagsPage.tsx'
import { TagsPanelIcon } from './components/TagsPanelIcon.tsx'
import { TagsOverlay } from './components/Overlay.tsx'
import type { TagsInjected } from './components/contract.ts'
import type { Translate } from './types.ts'

/** Stable browser plugin name. */
export const name = 'dsh-workspace-tags'

/** Services this half needs before `apply` runs. */
export const inject = ['slots', 'locale']

interface SlotRegisterOptions {
  name: string
  key?: string
  id?: string
  order?: number
  label?: string | (() => string)
  locale?: string
  inject?: () => TagsInjected
}

/** Structural Cordis client surface (kept local so the bundle has no Host type dependency). */
interface ClientContext {
  effect(callback: () => (() => void) | void, label?: string): void
  locale: {
    register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
    bind(namespace: string): (key: string, params?: Record<string, string | number>) => string
  }
  slots: {
    inject(slot: string, callback: () => unknown): () => void
    register(options: SlotRegisterOptions, component: unknown): () => void
  }
}

/**
 * Mount the browser half.
 * @param ctx - browser root context carrying slots and locale.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'workspace-tags: dictionaries')
  const t = ctx.locale.bind(NS) as Translate

  const store = createClientTagStore()
  const sync = createTagSync(store)

  if (typeof document !== 'undefined') {
    ensurePluginStyles(document)
    const dom = createDomController({ doc: document, store, t })
    ctx.effect(() => {
      sync.start()
      dom.start()
      return () => {
        dom.dispose()
        sync.dispose()
      }
    }, 'workspace-tags: sync and decorations')
  }

  const injected = (): TagsInjected => ({
    ...store,
    hooks: { tags: store },
    retrySync: () => sync.retry(),
  })

  ctx.effect(() => {
    const disposers: (() => void)[] = []

    // The global Tags page, keyed by the same id as its sidebar row.
    disposers.push(
      ctx.slots.inject('main', () =>
        ctx.slots.register(
          { name: 'main', key: PANEL_ID, locale: NS, inject: injected },
          TagsPage,
        )),
    )

    // Sidebar panel row; the panel list renders it above the More row.
    disposers.push(
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: PANEL_ID, order: 20, locale: NS, label: () => t('panel.tags') },
          TagsPanelIcon,
        )),
    )

    // Anchored filter and annotation surfaces.
    disposers.push(
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          { name: 'shell.overlay', id: 'workspace-tags.surfaces', order: 60, locale: NS, inject: injected },
          TagsOverlay,
        )),
    )

    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'workspace-tags: seats')
}
