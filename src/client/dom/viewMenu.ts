/**
 * Inject a fourth "Group by" option into ui-workspace's view-options menu.
 *
 * The menu is owned by ui-workspace and offers no slot, so the option is a
 * clone of the shipped "flat" row: same material, same keyboard walk, same
 * placement. Its click switches the native grouping to "workspace" (the only
 * mode whose top-level sections can be visually regrouped) and turns the
 * plugin's tag grouping on; clicking any native grouping row turns it off.
 *
 * @module dsh-workspace-tags/client/dom/view-menu
 */
import type { ClientTagStore } from '../store.ts'
import type { Translate } from '../types.ts'
import { SELECTORS } from './selectors.ts'

const TAG_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true"><path d="M2.8 3.2h4.3l6 6-3.9 3.9-6-6V3.2Z"/><circle cx="5.3" cy="5.7" r=".9" fill="currentColor" stroke="none"/></svg>'

const OUR_ITEM = 'data-dshwt-group-item'
const OUR_BUTTON = 'data-dshwt-group-by-tag'

interface MenuRefs {
  menu: HTMLElement
  item: HTMLButtonElement
  native: HTMLButtonElement[]
  suppress: boolean
  checkTemplate: SVGElement | null
  selectedClass: string | null
}

const menus = new WeakMap<HTMLElement, MenuRefs>()

/**
 * Keep the injected option in sync with the currently open view menu.
 * @param doc - document to inspect.
 * @param store - tag store (grouping flag + tag presence).
 * @param t - localized translator.
 */
export function syncViewMenu(doc: Document, store: ClientTagStore, t: Translate): void {
  const menu = doc.querySelector<HTMLElement>(SELECTORS.viewMenu)
  if (menu === null) return

  if (store.getSnapshot().tags.length === 0) {
    if (store.getSnapshot().groupByTag) store.setGroupByTag(false)
    removeOurItem(menu)
    return
  }

  let refs = menus.get(menu)
  if (refs === undefined) {
    const created = injectItem(doc, menu, store, t)
    if (created === null) return
    refs = created
  }
  applySelection(refs, store.getSnapshot().groupByTag)
}

/**
 * @param menu - the open view-options menu card.
 * @param doc - owner document.
 * @param store - tag store.
 * @param t - localized translator.
 * @returns references for later syncs, or null when the markup changed.
 */
function injectItem(doc: Document, menu: HTMLElement, store: ClientTagStore, t: Translate): MenuRefs | null {
  const native = nativeGroupItems(menu)
  if (native.length < 3) return null
  const template = native[2]?.parentElement
  if (template === null || template === undefined) return null

  const wrapper = template.cloneNode(true) as HTMLElement
  wrapper.setAttribute(OUR_ITEM, '')
  const button = wrapper.querySelector<HTMLButtonElement>('button[role="menuitem"]')
  if (button === null) return null
  button.setAttribute(OUR_BUTTON, '')
  button.removeAttribute('aria-haspopup')
  button.removeAttribute('aria-expanded')
  button.className = button.className.replace(SELECTORS.menuSelected, ' ').replace(/\s+/gu, ' ').trim()
  for (const child of Array.from(button.children)) {
    if (child.tagName.toLowerCase() === 'svg') child.remove()
  }
  const label = button.querySelector(SELECTORS.menuItemLabel)
  if (label !== null) label.textContent = t('group.label')
  const icon = button.querySelector(SELECTORS.menuItemIcon)
  if (icon !== null) icon.innerHTML = TAG_ICON

  const selected = native.find((item) => isSelected(item)) ?? null
  const checkNode = selected?.querySelector<SVGElement>(':scope > svg') ?? null
  const checkTemplate = checkNode === null ? null : (checkNode.cloneNode(true) as SVGElement)
  const selectedClass = selected === null ? null : selectedClassOf(selected)

  template.after(wrapper)

  const refs: MenuRefs = {
    menu,
    item: button,
    native,
    suppress: false,
    checkTemplate,
    selectedClass,
  }
  menus.set(menu, refs)

  button.addEventListener('click', (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    activate(refs, store)
  })
  for (const item of native) {
    item.addEventListener('click', () => {
      if (refs.suppress) return
      store.setGroupByTag(false)
    })
  }

  applySelection(refs, store.getSnapshot().groupByTag)
  return refs
}

/**
 * Turn tag grouping on and move the native grouping to "workspace".
 * @param refs - this menu's references.
 * @param store - tag store.
 */
function activate(refs: MenuRefs, store: ClientTagStore): void {
  refs.suppress = true
  try {
    store.setGroupByTag(true)
    const selected = refs.native.findIndex((item) => isSelected(item))
    if (selected === 0) {
      refs.menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      return
    }
    refs.native[0]?.click()
  } finally {
    refs.suppress = false
  }
}

/**
 * Paint the option's selected state and keep the native "workspace" row from
 * showing a second check.
 * @param refs - this menu's references.
 * @param active - whether tag grouping is on.
 */
function applySelection(refs: MenuRefs, active: boolean): void {
  const ours = refs.item
  const hasCheck = ours.querySelector(':scope > svg') !== null
  if (active) {
    if (refs.selectedClass !== null && !ours.classList.contains(refs.selectedClass)) {
      ours.classList.add(refs.selectedClass)
    }
    if (!hasCheck && refs.checkTemplate !== null) ours.append(refs.checkTemplate.cloneNode(true))
    const workspace = refs.native[0]
    if (workspace !== undefined) {
      workspace.querySelector(':scope > svg')?.remove()
      if (refs.selectedClass !== null) workspace.classList.remove(refs.selectedClass)
    }
  } else {
    if (hasCheck) ours.querySelector(':scope > svg')?.remove()
    if (refs.selectedClass !== null) ours.classList.remove(refs.selectedClass)
  }
}

/** @returns the first three native grouping rows (excludes our injection). */
function nativeGroupItems(menu: HTMLElement): HTMLButtonElement[] {
  const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
  return items.filter((item) => !item.hasAttribute(OUR_BUTTON)).slice(0, 3)
}

/** @returns true when the shipped row renders as the selected option. */
function isSelected(button: HTMLButtonElement): boolean {
  if (button.querySelector(':scope > svg') !== null) return true
  return SELECTORS.menuSelected.test(button.className)
}

/** @returns the selected CSS-module token, when present. */
function selectedClassOf(button: HTMLButtonElement): string | null {
  for (const token of button.classList) if (token.endsWith('_selected')) return token
  return null
}

/**
 * Remove the injected row (used when no tags exist or on dispose).
 * @param menu - the open menu card.
 */
function removeOurItem(menu: HTMLElement): void {
  const wrapper = menu.querySelector(`[${OUR_ITEM}]`)
  if (wrapper !== null) wrapper.remove()
  menus.delete(menu)
}
