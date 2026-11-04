/**
 * Sidebar list layout: filtering (visual hiding only) and grouping by tag
 * (CSS `order` only). React keeps owning every node; this module never moves,
 * mounts or unmounts a React row.
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

/** Marks a grouping header the plugin owns. */
const GROUP_HEADER_ATTRIBUTE = 'data-dshwt-tag-group'

/** Marks the tree while grouping is active. */
const GROUPING_ATTRIBUTE = 'data-dshwt-group-by-tag'

/** Stores the last rendered grouping signature so repaints are no-ops. */
const GROUP_SIGNATURE = 'dshwtGroupSig'

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
 * Render tag headers and visual order. No-op when the same layout is already
 * present.
 * @param tree - the workspace list tree.
 * @param state - tags, assignments and the grouping flag.
 * @param views - result of {@link paintSections}.
 * @param t - localized translator.
 */
export function paintGrouping(
  tree: HTMLElement,
  state: Pick<TagState, 'tags' | 'assignments'> & { groupByTag: boolean },
  views: readonly SectionView[],
  t: Translate,
): void {
  if (!state.groupByTag || state.tags.length === 0) {
    clearGrouping(tree)
    return
  }

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
    'on',
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
  const appendHeader = (key: string, label: string, color: string | null, count: number): void => {
    const header = doc.createElement('div')
    header.setAttribute(GROUP_HEADER_ATTRIBUTE, '')
    header.setAttribute('data-dshwt-group-key', key)
    header.setAttribute('role', 'presentation')
    if (color === null) header.classList.add('dshwt-group-untagged')
    else header.style.setProperty('--dshwt-color', color)
    header.style.order = String(order)
    order += 1
    const dot = doc.createElement('span')
    dot.className = 'dshwt-group-dot'
    const name = doc.createElement('span')
    name.className = 'dshwt-group-label'
    name.textContent = label
    const counter = doc.createElement('span')
    counter.className = 'dshwt-group-count'
    counter.textContent = String(count)
    header.append(dot, name, counter)
    tree.append(header)
  }

  for (const group of groups) {
    appendHeader(group.tag.id, group.tag.text, group.tag.color, group.members.length)
    for (const view of group.members) {
      view.section.style.order = String(order)
      order += 1
      ordered.add(view.section)
    }
  }
  if (untagged.length > 0) {
    appendHeader('untagged', t('group.untagged'), null, untagged.length)
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
 * Remove grouping headers, order and the tree marker.
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
  }
  if (changed || tree.dataset[GROUP_SIGNATURE] !== undefined) {
    delete tree.dataset[GROUP_SIGNATURE]
  }
}
