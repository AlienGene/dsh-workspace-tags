/**
 * Every DOM anchor the plugin depends on, in one place.
 *
 * ui-workspace owns the sidebar list and exposes no row/header/view-menu slot,
 * so this plugin decorates and reorders the rendered DOM. CSS-module hashes are
 * build artifacts (`JoiKIa_`, `Kjh-qa_`, …); the author-written suffix after the
 * underscore is what is stable, hence `[class*="_projectRow"]`-style selectors.
 * Structural anchors (`[role="tree"]`, `data-row-key`) are preferred wherever
 * they exist so a hashed-name change cannot break row identity.
 *
 * @module dsh-workspace-tags/client/dom/selectors
 */

/** Stable DOM selectors used by the decorator and the grouping layer. */
export const SELECTORS = {
  sectionHeader: '[class*="_sectionHeader"]',
  headerActions: '[class*="_headerActions"]',
  tree: '[role="tree"]',
  searchTree: '[class*="_searchTree"]',
  flatList: '[class*="_flatList"]',
  groupSection: '[class*="_groupSection"]',
  workspaceRow: '[data-row-key^="workspace:"]',
  sessionRow: '[data-row-key^="session:"]',
  overflowRow: '[data-row-key^="overflow:"]',
  projectText: '[class*="_projectText"]',
  rowActions: '[class*="_rowActions"]',
  viewMenu: '[class*="_viewOptionsMenu"]',
  menuItemLabel: '[class*="_itemLabel"]',
  menuItemIcon: '[class*="_itemIcon"]',
  menuSelected: /(^|\s)[^\s]*_selected(\s|$)/,
} as const

/** Prefix of a workspace row key. */
export const WORKSPACE_KEY_PREFIX = 'workspace:'

/** @returns the sidebar browser root (the section header's parent). */
export function findSidebarRoot(doc: Document): HTMLElement | null {
  const header = doc.querySelector(SELECTORS.sectionHeader)
  const root = header?.parentElement ?? null
  return root instanceof HTMLElement ? root : null
}

/** @returns the workspace region's action strip, when rendered. */
export function findHeaderActions(root: HTMLElement): HTMLElement | null {
  const header = root.querySelector(SELECTORS.sectionHeader)
  const actions = header?.querySelector(`:scope > div${SELECTORS.headerActions}`) ?? null
  return actions instanceof HTMLElement ? actions : null
}

/** @returns the primary workspace list tree (never the search-results tree). */
export function findTree(root: HTMLElement): HTMLElement | null {
  for (const tree of root.querySelectorAll<HTMLElement>(SELECTORS.tree)) {
    if (!tree.matches(SELECTORS.searchTree)) return tree
  }
  return null
}

/** @returns true while the sidebar renders its collapsed rail. */
export function isRail(root: HTMLElement): boolean {
  for (const token of root.classList) if (token.endsWith('_rail')) return true
  return false
}

/**
 * @param row - a workspace tree row.
 * @returns the workspace id encoded in `data-row-key`, or null.
 */
export function workspaceIdOf(row: Element): string | null {
  const key = row.getAttribute('data-row-key')
  if (key === null || !key.startsWith(WORKSPACE_KEY_PREFIX)) return null
  return key.slice(WORKSPACE_KEY_PREFIX.length)
}

/**
 * The workspace row a group section owns. Child workspaces render after the
 * section's own row, so the first descendant is the section's own row.
 * @param section - one `groupSection`.
 * @returns its own row, when present.
 */
export function ownWorkspaceRow(section: Element): HTMLElement | null {
  const row = section.querySelector(SELECTORS.workspaceRow)
  return row instanceof HTMLElement ? row : null
}

/**
 * @param tree - the workspace list tree.
 * @returns the top-level group sections, in DOM order.
 */
export function topLevelSections(tree: HTMLElement): HTMLElement[] {
  return Array.from(tree.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.matches(SELECTORS.groupSection),
  )
}
