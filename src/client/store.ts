/**
 * Browser-side tag state.
 *
 * The store is created inside the plugin's `apply` closure (never at module
 * scope) and handed to the slot components through the registration's `inject`
 * face and to the DOM decorator directly. Snapshots are immutable so a
 * `useSyncExternalStore` selector can compare them by identity.
 *
 * @module dsh-workspace-tags/client/store
 */
import {
  MAX_TAG_TEXT,
  createTagId,
  nextPaletteColor,
  normalizeColor,
  normalizeTagText,
  tagKey,
  tagTextLength,
  tagsForWorkspace,
  workspaceMatchesFilter,
  type Tag,
  type TagPayload,
  type TagState,
} from '../protocol.ts'

/** Why the last write could not be persisted. */
export type TagSyncError = 'storage' | 'network' | 'conflict'

/** Localized tag-name validation codes. */
export type TagNameErrorCode = 'empty' | 'duplicate' | 'too-long'

/** Result of creating or renaming a tag. */
export type TagNameResult = { ok: true; tag: Tag } | { ok: false; code: TagNameErrorCode }

/** The workspace row a picker popover belongs to. */
export interface PickerTarget {
  workspaceId: string
  title: string
  anchor: HTMLElement
}

/** A pending "remove this tag from its whole group" request. */
export interface GroupClearRequest {
  tagId: string
  tagName: string
  workspaceIds: string[]
}

/** One immutable view of the browser state. */
export interface ClientTagSnapshot {
  /** True once a durable document has been read. */
  hydrated: boolean
  /** True while the initial read is in flight. */
  loading: boolean
  /** Non-null while the last persistence attempt failed. */
  syncError: TagSyncError | null
  tags: Tag[]
  assignments: Record<string, string[]>
  /** Selected filter tag ids; empty means show everything. */
  filter: string[]
  /** Whether the sidebar list is grouped by tag. */
  groupByTag: boolean
  /** Anchor of the open filter popover, if any. */
  filterAnchor: HTMLElement | null
  /** Open annotation popover, if any. */
  picker: PickerTarget | null
  /** Collapsed grouping keys: tag ids or the literal `untagged`. */
  collapsedGroups: string[]
  /** Pending destructive confirmation, if any. */
  groupClear: GroupClearRequest | null
  /** Last revision seen from the Host. */
  revision: number
}

/** Actions exposed to every slot component and to the DOM layer. */
export interface ClientTagActions {
  hydrate(state: TagState): void
  applyServerState(state: TagState): void
  setRevision(revision: number): void
  setLoading(loading: boolean): void
  setSyncError(error: TagSyncError | null): void
  addTag(raw: string, color?: string): TagNameResult
  renameTag(id: string, raw: string): TagNameResult
  recolorTag(id: string, color: string): boolean
  removeTag(id: string): void
  assign(workspaceId: string, tagId: string, assigned: boolean): void
  clearAssignments(workspaceId: string): void
  toggleFilter(tagId: string): void
  resetFilter(): void
  setGroupByTag(grouped: boolean): void
  openFilter(anchor: HTMLElement): void
  closeFilter(): void
  openPicker(workspaceId: string, title: string, anchor: HTMLElement): void
  closePicker(): void
  toggleGroupCollapsed(key: string): void
  requestGroupClear(tagId: string, tagName: string, workspaceIds: readonly string[]): void
  dismissGroupClear(): void
  confirmGroupClear(): void
}

/** The public store face. */
export interface ClientTagStore extends ClientTagActions {
  getSnapshot(): ClientTagSnapshot
  subscribe(listener: () => void): () => void
  tagsOf(workspaceId: string): Tag[]
  matchesFilter(workspaceId: string): boolean
  payload(): TagPayload
  revision(): number
  nextColor(): string
}

const EMPTY_SNAPSHOT: ClientTagSnapshot = {
  hydrated: false,
  loading: true,
  syncError: null,
  tags: [],
  assignments: {},
  filter: [],
  groupByTag: false,
  filterAnchor: null,
  picker: null,
  collapsedGroups: [],
  groupClear: null,
  revision: 0,
}

type NameCheck = { ok: true; text: string } | { ok: false; code: TagNameErrorCode }

/**
 * Validate one candidate name against the current tags (ignoring the tag being
 * renamed, if any).
 * @param raw - user input.
 * @param tags - current tags.
 * @param exceptId - tag id allowed to keep its current name.
 */
function checkName(raw: string, tags: readonly Tag[], exceptId?: string): NameCheck {
  const text = normalizeTagText(raw)
  const length = tagTextLength(text)
  if (length === 0) return { ok: false, code: 'empty' }
  if (length > MAX_TAG_TEXT) return { ok: false, code: 'too-long' }
  const key = tagKey(text)
  for (const tag of tags) {
    if (tag.id === exceptId) continue
    if (tagKey(tag.text) === key) return { ok: false, code: 'duplicate' }
  }
  return { ok: true, text }
}

/** @returns the assignment map without the given tag id. */
function withoutTag(assignments: Record<string, string[]>, tagId: string): Record<string, string[]> {
  const next: Record<string, string[]> = {}
  for (const [workspaceId, ids] of Object.entries(assignments)) {
    const kept = ids.filter((id) => id !== tagId)
    if (kept.length > 0) next[workspaceId] = kept
  }
  return next
}

/**
 * Create the browser store.
 * @returns the store face used by components and the DOM layer.
 */
export function createClientTagStore(): ClientTagStore {
  let snapshot: ClientTagSnapshot = EMPTY_SNAPSHOT
  const listeners = new Set<() => void>()

  const set = (patch: Partial<ClientTagSnapshot>): void => {
    snapshot = { ...snapshot, ...patch }
    for (const listener of listeners) listener()
  }

  const hydrateWith = (state: TagState): void => {
    const tagIds = new Set(state.tags.map((tag) => tag.id))
    set({
      hydrated: true,
      loading: false,
      syncError: null,
      tags: state.tags,
      assignments: state.assignments,
      revision: state.revision,
      filter: snapshot.filter.filter((id) => tagIds.has(id)),
      collapsedGroups: snapshot.collapsedGroups.filter((key) => key === 'untagged' || tagIds.has(key)),
      groupClear: null,
    })
  }

  const addTag = (raw: string, color?: string): TagNameResult => {
    const checked = checkName(raw, snapshot.tags)
    if (!checked.ok) return checked
    const normalizedColor = normalizeColor(color ?? '') ?? nextPaletteColor(snapshot.tags)
    const tag: Tag = { id: createTagId(), text: checked.text, color: normalizedColor }
    set({ tags: [...snapshot.tags, tag] })
    return { ok: true, tag }
  }

  const renameTag = (id: string, raw: string): TagNameResult => {
    const current = snapshot.tags.find((tag) => tag.id === id)
    if (current === undefined) return { ok: false, code: 'empty' }
    const checked = checkName(raw, snapshot.tags, id)
    if (!checked.ok) return checked
    const tag: Tag = { ...current, text: checked.text }
    set({ tags: snapshot.tags.map((candidate) => (candidate.id === id ? tag : candidate)) })
    return { ok: true, tag }
  }

  const recolorTag = (id: string, color: string): boolean => {
    const normalized = normalizeColor(color)
    if (normalized === null) return false
    if (!snapshot.tags.some((tag) => tag.id === id)) return false
    set({ tags: snapshot.tags.map((tag) => (tag.id === id ? { ...tag, color: normalized } : tag)) })
    return true
  }

  const removeTag = (id: string): void => {
    set({
      tags: snapshot.tags.filter((tag) => tag.id !== id),
      assignments: withoutTag(snapshot.assignments, id),
      filter: snapshot.filter.filter((candidate) => candidate !== id),
      collapsedGroups: snapshot.collapsedGroups.filter((key) => key !== id),
      groupClear: snapshot.groupClear?.tagId === id ? null : snapshot.groupClear,
    })
  }

  const assign = (workspaceId: string, tagId: string, assigned: boolean): void => {
    if (workspaceId.length === 0) return
    if (!snapshot.tags.some((tag) => tag.id === tagId)) return
    const current = snapshot.assignments[workspaceId] ?? []
    const has = current.includes(tagId)
    if (assigned === has) return
    const ids = assigned ? [...current, tagId] : current.filter((id) => id !== tagId)
    const assignments = { ...snapshot.assignments }
    if (ids.length > 0) assignments[workspaceId] = ids
    else delete assignments[workspaceId]
    set({ assignments })
  }

  const actions: ClientTagActions = {
    hydrate: hydrateWith,
    applyServerState: hydrateWith,
    setRevision: (revision) => {
      if (snapshot.revision === revision) return
      set({ revision })
    },
    setLoading: (loading) => set({ loading }),
    setSyncError: (syncError) => set({ syncError }),
    addTag,
    renameTag,
    recolorTag,
    removeTag,
    assign,
    clearAssignments: (workspaceId) => {
      if (snapshot.assignments[workspaceId] === undefined) return
      const assignments = { ...snapshot.assignments }
      delete assignments[workspaceId]
      set({ assignments })
    },
    toggleFilter: (tagId) => {
      const filter = snapshot.filter.includes(tagId)
        ? snapshot.filter.filter((id) => id !== tagId)
        : [...snapshot.filter, tagId]
      set({ filter })
    },
    resetFilter: () => {
      if (snapshot.filter.length === 0) return
      set({ filter: [] })
    },
    setGroupByTag: (groupByTag) => {
      if (snapshot.groupByTag === groupByTag) return
      set({ groupByTag })
    },
    openFilter: (anchor) => set({ filterAnchor: anchor, picker: null }),
    closeFilter: () => {
      if (snapshot.filterAnchor === null) return
      set({ filterAnchor: null })
    },
    openPicker: (workspaceId, title, anchor) => set({
      picker: { workspaceId, title, anchor },
      filterAnchor: null,
    }),
    closePicker: () => {
      if (snapshot.picker === null) return
      set({ picker: null })
    },
    toggleGroupCollapsed: (key) => {
      const collapsedGroups = snapshot.collapsedGroups.includes(key)
        ? snapshot.collapsedGroups.filter((candidate) => candidate !== key)
        : [...snapshot.collapsedGroups, key]
      set({ collapsedGroups })
    },
    requestGroupClear: (tagId, tagName, workspaceIds) => {
      const unique = [...new Set(workspaceIds)]
      if (unique.length === 0) return
      set({
        groupClear: { tagId, tagName, workspaceIds: unique },
        filterAnchor: null,
        picker: null,
      })
    },
    dismissGroupClear: () => {
      if (snapshot.groupClear === null) return
      set({ groupClear: null })
    },
    confirmGroupClear: () => {
      const request = snapshot.groupClear
      if (request === null) return
      let changed = false
      const assignments = { ...snapshot.assignments }
      for (const workspaceId of request.workspaceIds) {
        const current = assignments[workspaceId]
        if (current === undefined) continue
        const kept = current.filter((id) => id !== request.tagId)
        if (kept.length === current.length) continue
        changed = true
        if (kept.length > 0) assignments[workspaceId] = kept
        else delete assignments[workspaceId]
      }
      set(changed ? { assignments, groupClear: null } : { groupClear: null })
    },
  }

  return {
    ...actions,
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    tagsOf: (workspaceId) => tagsForWorkspace(snapshot, workspaceId),
    matchesFilter: (workspaceId) => workspaceMatchesFilter(snapshot, workspaceId, snapshot.filter),
    payload: () => ({ tags: snapshot.tags, assignments: snapshot.assignments }),
    revision: () => snapshot.revision,
    nextColor: () => nextPaletteColor(snapshot.tags),
  }
}
