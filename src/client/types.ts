/** Shared browser-side types. */
import type { WorkspaceTagsKey } from './locales.ts'

/** Translator bound to this plugin's namespace. */
export type Translate = (key: WorkspaceTagsKey, vars?: Record<string, string | number>) => string
