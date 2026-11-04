/**
 * The tag protocol shared by the Host half and the browser half.
 *
 * Everything here is pure: no Node built-ins, no React, no DOM. The Host uses
 * {@link sanitizeStoredState} on every read (one bad record must never stop the
 * plugin from activating) and {@link validateWritePayload} on every write (the
 * durable copy is canonical and duplicate-free). The browser half reuses the
 * same rules so what it shows and what it sends agree.
 *
 * @module dsh-workspace-tags/protocol
 */

/** Record-level schema version. The storage domain version never changes. */
export const TAG_STATE_SCHEMA_VERSION = 1

/** Upper bound on stored tags; defensive, not a product limit. */
export const MAX_TAGS = 200

/** Maximum tag text length in Unicode code points. */
export const MAX_TAG_TEXT = 24

/** Maximum tag id length in code units. */
export const MAX_TAG_ID = 64

/** Host route the browser half reads and writes. */
export const ROUTE_PATH = '/api/dsh-tags/state'

/** Document-relative path the browser half fetches (prefix-proxy safe). */
export const CLIENT_ROUTE = 'api/dsh-tags/state'

/** Global panel id shared by the `main` page and its sidebar row. */
export const PANEL_ID = 'workspace-tags'

/** Palette used for automatic tag colors and the manager's swatch row. */
export const TAG_PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
] as const

/** Six preset colours offered by the workspace annotation picker. */
export const PICKER_PALETTE = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#64748b',
] as const

/** One durable tag definition. */
export interface Tag {
  /** Stable id (UUID); assignments reference this, never the text. */
  id: string
  /** Display text, already trimmed and length-checked. */
  text: string
  /** Lowercase `#rrggbb`. */
  color: string
}

/** The complete durable document kept as the `dsh_tags` domain record. */
export interface TagState {
  schemaVersion: number
  /** Monotonic CAS counter; the Host increments on every write. */
  revision: number
  tags: Tag[]
  /** Workspace id -> assigned tag ids (deduplicated). */
  assignments: Record<string, string[]>
  updatedAt: string
}

/** The writable slice of {@link TagState}. */
export interface TagPayload {
  tags: Tag[]
  assignments: Record<string, string[]>
}

/** Reasons a write can be refused; stable codes for the HTTP layer. */
export type TagWriteErrorCode =
  | 'invalid-body'
  | 'invalid-tag'
  | 'duplicate-tag'
  | 'too-many-tags'

/** Successful strict validation. */
export interface TagWriteSuccess {
  ok: true
  payload: TagPayload
}

/** Refused strict validation. */
export interface TagWriteFailure {
  ok: false
  code: TagWriteErrorCode
  message: string
}

/** Result of strict write validation. */
export type TagWriteResult = TagWriteSuccess | TagWriteFailure

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const COLOR_SHORT_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i
const WHITESPACE = /\s+/gu

/** @returns a fresh `<now>` timestamp. */
export function nowIso(): string {
  return new Date().toISOString()
}

/** @returns an empty, valid document. */
export function emptyState(updatedAt: string = nowIso()): TagState {
  return {
    schemaVersion: TAG_STATE_SCHEMA_VERSION,
    revision: 0,
    tags: [],
    assignments: {},
    updatedAt,
  }
}

/** @returns true for a non-null, non-array object. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Collapse runs of whitespace and trim. NFC keeps visually identical names
 * from becoming two different tags.
 * @param input - raw user text.
 * @returns the canonical display text.
 */
export function normalizeTagText(input: string): string {
  return input.replace(WHITESPACE, ' ').trim().normalize('NFC')
}

/** @returns the text length in Unicode code points. */
export function tagTextLength(text: string): number {
  return [...text].length
}

/** @returns the case-insensitive uniqueness key for a tag name. */
export function tagKey(text: string): string {
  return normalizeTagText(text).toLowerCase()
}

/**
 * Accept `#rgb` and `#rrggbb`, canonicalize to lowercase `#rrggbb`.
 * @param input - candidate color.
 * @returns the canonical color, or null when invalid.
 */
export function normalizeColor(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  const short = COLOR_SHORT_PATTERN.exec(raw)
  if (short !== null) {
    const r = short[1] ?? ''
    const g = short[2] ?? ''
    const b = short[3] ?? ''
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return COLOR_PATTERN.test(raw) ? raw.toLowerCase() : null
}

/**
 * Pick the first palette color not already in use, falling back to cycling.
 * @param tags - current tags.
 * @returns a `#rrggbb` color.
 */
export function nextPaletteColor(tags: readonly Tag[]): string {
  const used = new Set(tags.map((tag) => tag.color))
  for (const color of TAG_PALETTE) if (!used.has(color)) return color
  const index = tags.length % TAG_PALETTE.length
  return TAG_PALETTE[index] ?? TAG_PALETTE[0]
}

/**
 * Pick the first unused picker preset, falling back to cycling.
 * @param tags - current tags.
 * @returns a `#rrggbb` colour.
 */
export function nextPickerColor(tags: readonly Tag[]): string {
  const used = new Set(tags.map((tag) => tag.color))
  for (const color of PICKER_PALETTE) if (!used.has(color)) return color
  const index = tags.length % PICKER_PALETTE.length
  return PICKER_PALETTE[index] ?? PICKER_PALETTE[0]
}

/** @returns a stable tag id (UUID when the platform provides one). */
export function createTagId(): string {
  const cryptoLike = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (typeof cryptoLike?.randomUUID === 'function') return cryptoLike.randomUUID()
  return `tag-${String(Date.now())}-${Math.random().toString(36).slice(2, 10)}`
}

/** @returns the tags assigned to one workspace, in definition order. */
export function tagsForWorkspace(state: Pick<TagState, 'tags' | 'assignments'>, workspaceId: string): Tag[] {
  const assigned = state.assignments[workspaceId]
  if (assigned === undefined || assigned.length === 0) return []
  const byId = new Map(state.tags.map((tag) => [tag.id, tag]))
  const result: Tag[] = []
  for (const id of assigned) {
    const tag = byId.get(id)
    if (tag !== undefined) result.push(tag)
  }
  return result
}

/**
 * @returns true when the workspace has no assignment (show-all semantics) or
 * when at least one of its tags is selected.
 */
export function workspaceMatchesFilter(
  state: Pick<TagState, 'assignments'>,
  workspaceId: string,
  filter: readonly string[],
): boolean {
  if (filter.length === 0) return true
  const assigned = state.assignments[workspaceId]
  if (assigned === undefined) return false
  return assigned.some((id) => filter.includes(id))
}

/**
 * Lenient reader: keeps every well-formed tag/assignment and silently drops the
 * rest. Used for stored records so a future or corrupted document cannot stop
 * the plugin from activating.
 * @param value - raw stored value.
 * @returns a canonical document.
 */
export function sanitizeStoredState(value: unknown): TagState {
  const base = emptyState()
  if (!isRecord(value)) return base

  const revision = typeof value['revision'] === 'number'
    && Number.isInteger(value['revision'])
    && value['revision'] >= 0
    ? value['revision']
    : 0

  const updatedAt = typeof value['updatedAt'] === 'string' ? value['updatedAt'] : base.updatedAt

  const tags: Tag[] = []
  const ids = new Set<string>()
  const keys = new Set<string>()
  const rawTags = value['tags']
  if (Array.isArray(rawTags)) {
    for (const candidate of rawTags) {
      if (tags.length >= MAX_TAGS) break
      if (!isRecord(candidate)) continue
      const id = candidate['id']
      const text = candidate['text']
      const color = normalizeColor(candidate['color'])
      if (typeof id !== 'string' || id.length === 0 || id.length > MAX_TAG_ID) continue
      if (typeof text !== 'string') continue
      if (color === null) continue
      const normalized = normalizeTagText(text)
      const length = tagTextLength(normalized)
      if (length === 0 || length > MAX_TAG_TEXT) continue
      const key = tagKey(normalized)
      if (ids.has(id) || keys.has(key)) continue
      ids.add(id)
      keys.add(key)
      tags.push({ id, text: normalized, color })
    }
  }

  const assignments: Record<string, string[]> = {}
  const rawAssignments = value['assignments']
  if (isRecord(rawAssignments)) {
    for (const [workspaceId, rawIds] of Object.entries(rawAssignments)) {
      if (workspaceId.length === 0) continue
      if (!Array.isArray(rawIds)) continue
      const seen = new Set<string>()
      const kept: string[] = []
      for (const id of rawIds) {
        if (typeof id !== 'string' || !ids.has(id) || seen.has(id)) continue
        seen.add(id)
        kept.push(id)
      }
      if (kept.length > 0) assignments[workspaceId] = kept
    }
  }

  return {
    schemaVersion: TAG_STATE_SCHEMA_VERSION,
    revision,
    tags,
    assignments,
    updatedAt,
  }
}

/**
 * Strict validator for a write: canonical text/colors, no duplicate ids or
 * names, only known tag ids in assignments.
 * @param value - parsed JSON body.
 * @returns the canonical payload or a stable failure code.
 */
export function validateWritePayload(value: unknown): TagWriteResult {
  if (!isRecord(value)) return { ok: false, code: 'invalid-body', message: 'body must be an object' }
  const rawTags = value['tags']
  if (!Array.isArray(rawTags)) return { ok: false, code: 'invalid-body', message: 'tags must be an array' }
  if (rawTags.length > MAX_TAGS) {
    return { ok: false, code: 'too-many-tags', message: `at most ${String(MAX_TAGS)} tags are allowed` }
  }

  const tags: Tag[] = []
  const ids = new Set<string>()
  const keys = new Set<string>()
  for (const candidate of rawTags) {
    if (!isRecord(candidate)) return { ok: false, code: 'invalid-tag', message: 'tag must be an object' }
    const id = candidate['id']
    const text = candidate['text']
    const color = normalizeColor(candidate['color'])
    if (typeof id !== 'string' || id.length === 0 || id.length > MAX_TAG_ID) {
      return { ok: false, code: 'invalid-tag', message: 'tag id is invalid' }
    }
    if (ids.has(id)) return { ok: false, code: 'invalid-tag', message: 'tag id is duplicated' }
    if (typeof text !== 'string') return { ok: false, code: 'invalid-tag', message: 'tag text must be a string' }
    const normalized = normalizeTagText(text)
    const length = tagTextLength(normalized)
    if (length === 0) return { ok: false, code: 'invalid-tag', message: 'tag text is empty' }
    if (length > MAX_TAG_TEXT) {
      return { ok: false, code: 'invalid-tag', message: `tag text is longer than ${String(MAX_TAG_TEXT)} characters` }
    }
    if (color === null) return { ok: false, code: 'invalid-tag', message: 'tag color is invalid' }
    const key = tagKey(normalized)
    if (keys.has(key)) return { ok: false, code: 'duplicate-tag', message: 'tag names must be unique' }
    ids.add(id)
    keys.add(key)
    tags.push({ id, text: normalized, color })
  }

  const rawAssignments = value['assignments']
  if (!isRecord(rawAssignments)) {
    return { ok: false, code: 'invalid-body', message: 'assignments must be an object' }
  }
  const assignments: Record<string, string[]> = {}
  for (const [workspaceId, rawIds] of Object.entries(rawAssignments)) {
    if (workspaceId.length === 0) return { ok: false, code: 'invalid-body', message: 'workspace id is empty' }
    if (!Array.isArray(rawIds)) {
      return { ok: false, code: 'invalid-body', message: 'assignment must be an array' }
    }
    const seen = new Set<string>()
    const kept: string[] = []
    for (const id of rawIds) {
      if (typeof id !== 'string') return { ok: false, code: 'invalid-body', message: 'assignment id must be a string' }
      if (!ids.has(id) || seen.has(id)) continue
      seen.add(id)
      kept.push(id)
    }
    if (kept.length > 0) assignments[workspaceId] = kept
  }

  return { ok: true, payload: { tags, assignments } }
}
