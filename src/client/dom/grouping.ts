/**
 * Sidebar list layout: filtering (visual hiding only) and grouping by tag
 * (CSS `order` only). React keeps owning every node; this module never moves,
 * mounts or unmounts a React row.
 *
 * The tag group row deliberately mirrors the native workspace row's format:
 * 34px tall, the same padding/gap/hover, a 16px glyph slot (colour dot, swapped
 * for a chevron on hover/focus), a single ellipsized title and a trailing action
 * area. Its children are indented one level, like native workspace-tree
 * children, via a scoped `--dsh-workspace-indent` override.
 *
 * @module dsh-workspace-tags/client/dom/grouping
 */
import type { TagState } from '../../protocol.ts'
import { SELECTORS, ownWorkspaceRow, workspaceIdOf } from './selectors.ts'
import type { Translate } from '../types.ts'

/** One group section and the facts the painter derives for it. */
export interface SectionView {
  section: HTMLElement
  workspaceId: string
  /** The section's own row survived the filter. */
  selfMatch: boolean
  /** The section or one of its nested sections survived the filter. */
  visible: boolean
  /** The section stays visible but its own row/sessions are filtered out. */
  ownRowHidden: boolean
}

/** Marks a grouping row the plugin owns. */
const GROUP_HEADER_ATTRIBUTE = 'data-dshwt-tag-group'

/** Marks the tree while grouping is active. */
const GROUPING_ATTRIBUTE = 'data-dshwt-group-by-tag'

/** Marks a group section as a member of a rendered tag group. */
const GROUP_MEMBER_ATTRIBUTE = 'data-dshwt-tag-member'

/** Marks a member section whose group is collapsed. */
const GROUP_COLLAPSED_ATTRIBUTE = 'data-dshwt-group-collapsed'

/** Stores the last rendered grouping signature so repaints are no-ops. */
const GROUP_SIGNATURE = 'dshwtGroupSig'

/** The native-style disclosure chevron (rotated when expanded). */
const CHEVRON_SVG = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>'

/**
 * Apply the tag filter to every section, hiding visually only.
 * @param tree - the workspace list tree.
 * @param state - tags and assignments.
 * @param filter - selected tag ids; empty means show everything.
 * @returns one view per section, in DOM order.
 */
export function paintSections(tree: HTMLElement, state: Pick<TagState, 'tags' | 'assignments'>, filter: readonly string[]): SectionView[] {
  const sections = Array.from(tree.querySelectorAll<HTMLElement>(SELECTORS.groupSection))
  const selfMatch = new Map<HTMLElement, boolean>()
  const ids = new Map<HTMLElement, string>()

  for (const section of sections) {
    const row = ownWorkspaceRow(section)
    const workspaceId = row === null ? '' : workspaceIdOf(row) ?? ''
    ids.set(section, workspaceId)
    const assigned = workspaceId === '' ? [] : state.assignments[workspaceId] ?? []
    selfMatch.set(section, filter.length === 0 || (workspaceId !== '' && assigned.some((id) => filter.includes(id))))
  }

  const views: SectionView[] = []
  for (const section of sections) {
    const ownMatch = selfMatch.get(section) === true
    const descendantMatch = ownMatch
      ? true
      : Array.from(section.querySelectorAll<HTMLElement>(SELECTORS.groupSection))
        .some((nested) => nested !== section && selfMatch.get(nested) === true)
    const visible = ownMatch || descendantMatch
    const ownRowHidden = visible && !ownMatch
    section.toggleAttribute('data-dshwt-hidden', !visible)

    const row = ownWorkspaceRow(section)
    if (row !== null) row.toggleAttribute('data-dshwt-self-hidden', ownRowHidden)
    for (const child of Array.from(section.children)) {
      if (!(child instanceof HTMLElement)) continue
      if (child.matches(SELECTORS.sessionRow) || child.matches(SELECTORS.overflowRow)) {
        child.toggleAttribute('data-dshwt-self-hidden', ownRowHidden)
      }
    }

    views.push({ section, workspaceId: ids.get(section) ?? '', selfMatch: ownMatch, visible, ownRowHidden })
  }
  return views
}

/**
 * Render tag group rows, visual order and collapse state. No-op when the same
 * layout is already present.
 * @param tree - the workspace list tree.
 * @param state - tags, assignments, grouping flag and collapsed keys.
 * @param views - result of {@link paintSections}.
 * @param t - localized translator.
 */
export function paintGrouping(
  tree: HTMLElement,
  state: Pick<TagState, 'tags' | 'assignments'> & { groupByTag: boolean; collapsedGroups: readonly string[] },
  views: readonly SectionView[],
  t: Translate,
): void {
  if (!state.groupByTag || state.tags.length === 0) {
    clearGrouping(tree)
    return
  }

  const collapsed = new Set(state.collapsedGroups)
  const visible = views.filter((view) => view.visible && !view.ownRowHidden && view.workspaceId !== '')
  const tagIds = new Set(state.tags.map((tag) => tag.id))
  const groups = state.tags.map((tag) => {
    const members: SectionView[] = []
    for (const view of visible) {
      const assigned = state.assignments[view.workspaceId] ?? []
      const first = assigned.find((id) => tagIds.has(id))
      if (first === tag.id) members.push(view)
    }
    return { tag, members }
  }).filter((group) => group.members.length > 0)

  const untagged = visible.filter((view) => {
    const assigned = state.assignments[view.workspaceId] ?? []
    return !assigned.some((id) => tagIds.has(id))
  })

  const signature = [
    'v2',
    `collapsed:${[...collapsed].sort().join(',')}`,
    ...groups.map((group) => `${group.tag.id}:${group.tag.text}:${group.tag.color}:${group.members.map((m) => m.workspaceId).join(',')}`),
    `untagged:${untagged.map((m) => m.workspaceId).join(',')}`,
    t('group.untagged'),
  ].join('|')
  if (tree.dataset[GROUP_SIGNATURE] === signature) return

  clearGrouping(tree)
  tree.setAttribute(GROUPING_ATTRIBUTE, '')
  tree.dataset[GROUP_SIGNATURE] = signature

  let order = 0
  const ordered = new Set<HTMLElement>()
  const doc = tree.ownerDocument

  const appendHeader = (key: string, label: string, color: string | null, count: number, isCollapsed: boolean): void => {
    const row = doc.createElement('div')
    row.className = 'dshwt-group-row'
    row.setAttribute(GROUP_HEADER_ATTRIBUTE, '')
    row.setAttribute('data-dshwt-group-key', key)
    row.setAttribute('data-dshwt-group-toggle', '')
    row.setAttribute('role', 'treeitem')
    row.setAttribute('tabindex', '0')
    row.setAttribute('aria-expanded', String(!isCollapsed))
    if (color === null) row.classList.add('dshwt-group-untagged')
    else row.style.setProperty('--dshwt-color', color)
    row.style.order = String(order)
    order += 1

    const glyph = doc.createElement('span')
    glyph.className = 'dshwt-group-glyph'
    const dot = doc.createElement('span')
    dot.className = 'dshwt-group-dot'
    const chevron = doc.createElement('span')
    chevron.className = 'dshwt-group-chevron'
    chevron.innerHTML = CHEVRON_SVG
    glyph.append(dot, chevron)

    const title = doc.createElement('span')
    title.className = 'dshwt-group-title'
    title.textContent = label
    const counter = doc.createElement('span')
    counter.className = 'dshwt-group-count'
    counter.textContent = String(count)

    row.append(glyph, title, counter)

    if (key !== 'untagged') {
      const actions = doc.createElement('span')
      actions.className = 'dshwt-group-actions'
      const clear = doc.createElement('button')
      clear.type = 'button'
      clear.className = 'dshwt-group-clear'
      clear.setAttribute('data-dshwt-group-clear', '')
      clear.textContent = t('group.clear.label')
      const aria = t('group.clear.aria', { name: label })
      clear.setAttribute('aria-label', aria)
      clear.title = aria
      actions.append(clear)
      row.append(actions)
    }

    tree.append(row)
  }

  const markMembers = (members: readonly SectionView[], key: string): void => {
    const isCollapsed = collapsed.has(key)
    for (const view of members) {
      view.section.setAttribute(GROUP_MEMBER_ATTRIBUTE, '')
      view.section.toggleAttribute(GROUP_COLLAPSED_ATTRIBUTE, isCollapsed)
    }
  }

  for (const group of groups) {
    appendHeader(group.tag.id, group.tag.text, group.tag.color, group.members.length, collapsed.has(group.tag.id))
    markMembers(group.members, group.tag.id)
    for (const view of group.members) {
      view.section.style.order = String(order)
      order += 1
      ordered.add(view.section)
    }
  }
  if (untagged.length > 0) {
    appendHeader('untagged', t('group.untagged'), null, untagged.length, collapsed.has('untagged'))
    markMembers(untagged, 'untagged')
    for (const view of untagged) {
      view.section.style.order = String(order)
      order += 1
      ordered.add(view.section)
    }
  }
  for (const view of views) {
    if (ordered.has(view.section)) continue
    view.section.style.order = String(order)
    order += 1
  }
}

/**
 * Remove grouping rows, order, member markers and collapse markers.
 * @param tree - the workspace list tree.
 */
export function clearGrouping(tree: HTMLElement): void {
  let changed = false
  for (const header of Array.from(tree.querySelectorAll(`:scope > [${GROUP_HEADER_ATTRIBUTE}]`))) {
    header.remove()
    changed = true
  }
  if (tree.hasAttribute(GROUPING_ATTRIBUTE)) {
    tree.removeAttribute(GROUPING_ATTRIBUTE)
    changed = true
  }
  for (const section of Array.from(tree.querySelectorAll<HTMLElement>(SELECTORS.groupSection))) {
    if (section.style.order !== '') {
      section.style.removeProperty('order')
      changed = true
    }
    if (section.hasAttribute(GROUP_MEMBER_ATTRIBUTE)) {
      section.removeAttribute(GROUP_MEMBER_ATTRIBUTE)
      changed = true
    }
    if (section.hasAttribute(GROUP_COLLAPSED_ATTRIBUTE)) {
      section.removeAttribute(GROUP_COLLAPSED_ATTRIBUTE)
      changed = true
    }
  }
  if (changed || tree.dataset[GROUP_SIGNATURE] !== undefined) {
    delete tree.dataset[GROUP_SIGNATURE]
  }
}
