/**
 * Component-facing contracts for the slot registrations.
 *
 * The framework composes each seat's props from the runtime share, the
 * declared locale and this plugin's `inject` face; these aliases spell that
 * composition out so components stay typed without importing the renderer.
 *
 * @module dsh-workspace-tags/client/components/contract
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ClientTagActions, ClientTagSnapshot } from '../store.ts'
import type { NS } from '../locales.ts'

/** Bare observable source bound into the synthesized `useTags` selector hook. */
export interface TagSource {
  getSnapshot(): ClientTagSnapshot
  subscribe(listener: () => void): () => void
}

/** Business face every registration receives. */
export interface TagsInjected extends ClientTagActions {
  hooks: { tags: TagSource }
  /** Retry the last failed persistence step. */
  retrySync(): void
}

/** Props of the `main` panel page. */
export type TagsPageProps = PropsRuntime<'main'> & PropsLocale<typeof NS> & InjectFace<TagsInjected>

/** Props of the `shell.overlay` registration. */
export type TagsOverlayProps = PropsRuntime<'shell.overlay'> & PropsLocale<typeof NS> & InjectFace<TagsInjected>

/** Props of the `sidebar.panellist` icon. */
export type TagsIconProps = PropsRuntime<'sidebar.panellist'> & PropsLocale<typeof NS>
