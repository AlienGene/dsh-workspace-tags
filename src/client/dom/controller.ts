/**
 * The DOM decorator: chips beside project names, the tag button on each row,
 * the filter icon in the workspace header, the filtered-empty notice, and the
 * bridge that keeps the view-options injection in sync.
 *
 * Everything is idempotent and driven by one rAF-free microtask-coalesced
 * MutationObserver. The decorator never removes or reorders a React-owned node;
 * it only appends plugin-owned nodes, toggles plugin-owned attributes and sets
 * `order` (visual only) while grouping by tag.
 *
 * @module dsh-workspace-tags/client/dom/controller
 */
import { CHIPS_ATTRIBUTE, ensureChipsHost, renderChips } from './chips.ts'
import { clearGrouping, paintGrouping, paintSections } from './grouping.ts'
import { ensurePluginStyles } from './styles.ts'
import {
  SELECTORS,
  findHeaderActions,
  findSidebarRoot,
  findTree,
  isRail,
  workspaceIdOf,
} from './selectors.ts'
import { syncViewMenu } from './viewMenu.ts'
import type { ClientTagStore, ClientTagSnapshot } from '../store.ts'
import type { Translate } from '../types.ts'

const FILTER_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true"><path d="M2.6 3.2h10.8L9.2 8.2v4.2l-2.4 1.2V8.2L2.6 3.2Z"/></svg>'
const ADD_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M2.6 3.8h3.7l4.6 4.6-3.3 3.3-4.6-4.6V3.8Z"/><path d="M11.4 10.6v3.2M9.8 12.2h3.2"/></svg>'

const EMPTY_ATTRIBUTE = 'data-dshwt-list-empty'
const ADD_ATTRIBUTE = 'data-dshwt-add'
const FILTER_ATTRIBUTE = 'data-dshwt-filter'
const RESET_ATTRIBUTE = 'data-dshwt-reset'

/** Inputs for the decorator. */
export interface DomControllerOptions {
  doc: Document
  store: ClientTagStore
  t: Translate
}

/** The decorator lifecycle. */
export interface DomController {
  start(): void
  dispose(): void
}

/**
 * Create the decorator.
 * @param options - document, store and translator.
 * @returns the lifecycle handle.
 */
export function createDomController(options: DomControllerOptions): DomController {
  const { doc, store, t } = options
  let observer: MutationObserver | null = null
  let unsubscribe: (() => void) | null = null
  let scheduled = false
  let applying = false
  let disposed = false

  const schedule = (): void => {
    if (scheduled || disposed) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      paint()
    })
  }

  const openPickerFor = (anchor: HTMLElement): void => {
    const row = anchor.closest(SELECTORS.workspaceRow)
    if (!(row instanceof HTMLElement)) return
    const workspaceId = workspaceIdOf(row)
    if (workspaceId === null || workspaceId === '') return
    const title = row.querySelector<HTMLElement>(`:scope > span${SELECTORS.projectText}`)?.textContent?.trim()
    // The add button lives in the hover-only action strip, which collapses as
    // soon as the pointer enters the panel. Anchor to the always-visible row
    // instead; chips are stable and anchor themselves.
    const anchorElement = anchor.hasAttribute(ADD_ATTRIBUTE) ? row : anchor
    store.openPicker(workspaceId, title !== undefined && title.length > 0 ? title : workspaceId, anchorElement)
    schedule()
  }

  const onClick = (event: Event): void => {
    const target = event.target
    if (!(target instanceof Element)) return

    const filter = target.closest<HTMLElement>(`[${FILTER_ATTRIBUTE}]`)
    if (filter !== null) {
      event.preventDefault()
      event.stopPropagation()
      if (store.getSnapshot().filterAnchor === filter) store.closeFilter()
      else store.openFilter(filter)
      schedule()
      return
    }

    const reset = target.closest<HTMLElement>(`[${RESET_ATTRIBUTE}]`)
    if (reset !== null) {
      event.preventDefault()
      event.stopPropagation()
      store.resetFilter()
      schedule()
      return
    }

    const add = target.closest<HTMLElement>(`[${ADD_ATTRIBUTE}], [data-dshwt-chip]`)
    if (add !== null) {
      event.preventDefault()
      event.stopPropagation()
      openPickerFor(add)
    }
  }

  const isRelevant = (record: MutationRecord): boolean => {
    const root = findSidebarRoot(doc)
    if (root === null) return true
    const target = record.target
    if (target instanceof Node && root.contains(target)) return true
    for (const node of record.addedNodes) {
      if (node instanceof Element && (node.matches(SELECTORS.viewMenu) || node.querySelector(SELECTORS.viewMenu) !== null)) return true
    }
    return false
  }

  const syncFilterButton = (
    root: HTMLElement,
    headerActions: HTMLElement | null,
    state: ClientTagSnapshot,
    show: boolean,
  ): void => {
    const existing = root.querySelector<HTMLButtonElement>(`[${FILTER_ATTRIBUTE}]`)
    if (!show || headerActions === null) {
      if (existing === null) return
      if (state.filterAnchor === existing) store.closeFilter()
      existing.remove()
      return
    }

    let button = existing
    if (button === null) {
      button = doc.createElement('button')
      button.type = 'button'
      button.setAttribute(FILTER_ATTRIBUTE, '')
      const sample = headerActions.querySelector<HTMLButtonElement>('button')
      button.className = sample?.className ?? 'dshwt-filter'
      button.classList.add('dshwt-filter')
      button.setAttribute('aria-haspopup', 'dialog')
      button.innerHTML = FILTER_ICON
      headerActions.prepend(button)
    }

    const label = t('filter.label')
    button.setAttribute('aria-label', label)
    button.setAttribute('title', label)
    button.setAttribute('aria-expanded', String(state.filterAnchor === button))

    const badge = button.querySelector<HTMLElement>('.dshwt-filter-badge')
    if (state.filter.length === 0) {
      badge?.remove()
    } else {
      const count = badge ?? doc.createElement('span')
      if (badge === null) {
        count.className = 'dshwt-filter-badge'
        button.append(count)
      }
      count.textContent = String(state.filter.length)
    }
  }

  const ensureAddButton = (actions: HTMLElement, name: string): void => {
    let button = actions.querySelector<HTMLButtonElement>(`[${ADD_ATTRIBUTE}]`)
    if (button === null) {
      button = doc.createElement('button')
      button.type = 'button'
      button.setAttribute(ADD_ATTRIBUTE, '')
      const sample = actions.querySelector<HTMLButtonElement>('button')
      button.className = sample?.className ?? 'dshwt-add'
      button.classList.add('dshwt-add')
      button.innerHTML = ADD_ICON
      actions.append(button)
    }
    const label = t('row.add', { name })
    button.setAttribute('aria-label', label)
    button.setAttribute('title', label)
  }

  const syncEmptyNotice = (tree: HTMLElement, show: boolean): void => {
    const existing = tree.querySelector<HTMLElement>(`:scope > [${EMPTY_ATTRIBUTE}]`)
    if (!show) {
      existing?.remove()
      return
    }
    if (existing !== null) return
    const notice = doc.createElement('div')
    notice.setAttribute(EMPTY_ATTRIBUTE, '')
    notice.className = 'dshwt-list-empty'
    notice.setAttribute('role', 'status')
    notice.style.order = '999999'
    const text = doc.createElement('span')
    text.textContent = t('empty.filtered')
    const reset = doc.createElement('button')
    reset.type = 'button'
    reset.setAttribute(RESET_ATTRIBUTE, '')
    reset.className = 'dshwt-list-empty-reset'
    reset.textContent = t('empty.reset')
    notice.append(text, reset)
    tree.append(notice)
  }

  const paint = (): void => {
    if (disposed) return
    const root = findSidebarRoot(doc)
    if (root === null) return

    applying = true
    try {
      const rail = isRail(root)
      const tree = findTree(root)
      const flat = tree !== null && tree.matches(SELECTORS.flatList)
      const headerActions = findHeaderActions(root)

      const initial = store.getSnapshot()
      if (initial.filterAnchor !== null && !initial.filterAnchor.isConnected) store.closeFilter()
      if (initial.picker !== null && !initial.picker.anchor.isConnected) store.closePicker()
      const state = store.getSnapshot()

      if (tree !== null && !flat) {
        for (const row of Array.from(tree.querySelectorAll<HTMLElement>(SELECTORS.workspaceRow))) {
          const workspaceId = workspaceIdOf(row)
          if (workspaceId === null) continue
          if (workspaceId === '') {
            row.querySelector(`:scope > [${CHIPS_ATTRIBUTE}]`)?.remove()
            row.querySelector(`:scope [${ADD_ATTRIBUTE}]`)?.remove()
            continue
          }
          const title = row.querySelector<HTMLElement>(`:scope > span${SELECTORS.projectText}`)
          const actions = row.querySelector<HTMLElement>(`:scope > span${SELECTORS.rowActions}`)
          const tags = store.tagsOf(workspaceId)
          if (tags.length === 0) {
            row.querySelector(`:scope > [${CHIPS_ATTRIBUTE}]`)?.remove()
          } else {
            const host = ensureChipsHost(row, title)
            renderChips(host, tags, (key) => t(key))
          }
          if (actions !== null) ensureAddButton(actions, title?.textContent?.trim() ?? workspaceId)
          row.toggleAttribute('data-dshwt-picker-open', state.picker?.workspaceId === workspaceId)
        }
      }

      syncFilterButton(root, headerActions, state, state.tags.length > 0 && !rail && tree !== null && !flat)

      if (tree !== null && !flat) {
        const views = paintSections(tree, state, state.filter)
        paintGrouping(tree, state, views, t)
        const visibleProjects = views.filter((view) => view.visible && !view.ownRowHidden && view.workspaceId !== '').length
        syncEmptyNotice(tree, state.filter.length > 0 && views.length > 0 && visibleProjects === 0)
      } else if (tree !== null) {
        clearGrouping(tree)
        syncEmptyNotice(tree, false)
      }

      syncViewMenu(doc, store, t)
    } finally {
      applying = false
      observer?.takeRecords()
    }
  }

  return {
    start: () => {
      if (disposed) return
      ensurePluginStyles(doc)
      doc.addEventListener('click', onClick, true)
      unsubscribe = store.subscribe(schedule)
      observer = new MutationObserver((records) => {
        if (applying || disposed) return
        if (records.some(isRelevant)) schedule()
      })
      observer.observe(doc.body, { childList: true, subtree: true })
      schedule()
    },
    dispose: () => {
      if (disposed) return
      disposed = true
      observer?.disconnect()
      observer = null
      unsubscribe?.()
      unsubscribe = null
      doc.removeEventListener('click', onClick, true)
      const owned = '[data-dshwt-chips],[data-dshwt-add],[data-dshwt-filter],[data-dshwt-tag-group],[data-dshwt-list-empty],[data-dshwt-group-item]'
      for (const node of Array.from(doc.querySelectorAll(owned))) node.remove()
      for (const node of Array.from(doc.querySelectorAll('[data-dshwt-hidden],[data-dshwt-self-hidden],[data-dshwt-picker-open]'))) {
        node.removeAttribute('data-dshwt-hidden')
        node.removeAttribute('data-dshwt-self-hidden')
        node.removeAttribute('data-dshwt-picker-open')
      }
      for (const section of Array.from(doc.querySelectorAll<HTMLElement>(SELECTORS.groupSection))) {
        section.style.removeProperty('order')
      }
      for (const tree of Array.from(doc.querySelectorAll<HTMLElement>(SELECTORS.tree))) {
        tree.removeAttribute('data-dshwt-group-by-tag')
        delete tree.dataset['dshwtGroupSig']
      }
    },
  }
}
