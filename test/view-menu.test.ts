import { afterEach, describe, expect, it } from 'vitest'
import { syncViewMenu } from '../src/client/dom/viewMenu.ts'
import { createClientTagStore } from '../src/client/store.ts'
import { zh } from '../src/client/locales.ts'
import type { Translate } from '../src/client/types.ts'
import { mountViewMenu, tagState } from './fixtures.ts'

const t: Translate = (key, vars) => {
  let text: string = zh[key]
  if (vars !== undefined) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}

afterEach(() => {
  document.body.innerHTML = ''
})

/** @returns a store with one tag. */
function hydrate() {
  const store = createClientTagStore()
  store.hydrate(tagState({ tags: [{ id: 'a', text: 'Work', color: '#ef4444' }], revision: 1 }))
  return store
}

describe('view options injection', () => {
  it('adds a "by tag" row after the native grouping rows', () => {
    const store = hydrate()
    const menu = mountViewMenu(0)
    syncViewMenu(document, store, t)

    const wrapper = menu.querySelector('[data-dshwt-group-item]')
    expect(wrapper).not.toBeNull()
    expect(menu.querySelectorAll('[data-dshwt-group-item]')).toHaveLength(1)
    const button = wrapper?.querySelector('button[role="menuitem"]')
    expect(button?.textContent).toBe('按标签')
    expect(button?.querySelector('svg')).not.toBeNull()
    expect(button?.hasAttribute('data-dshwt-view-menu-tag')).toBe(true)
    expect(button?.hasAttribute('data-dshwt-group-by-tag')).toBe(false)

    const nativeRows = Array.from(menu.querySelectorAll('[role="menuitem"]')).filter((item) => !item.hasAttribute('data-dshwt-view-menu-tag'))
    expect(nativeRows[3]?.hasAttribute('data-dshwt-view-menu-tag')).toBe(false)
    const labels = Array.from(menu.querySelectorAll('[role="menuitem"]')).map((item) => item.textContent)
    expect(labels.slice(0, 4)).toEqual(['按工作区', '按工作区树', '单列表', '按标签'])
  })

  it('is idempotent across repeated syncs', () => {
    const store = hydrate()
    const menu = mountViewMenu(0)
    syncViewMenu(document, store, t)
    syncViewMenu(document, store, t)
    syncViewMenu(document, store, t)
    expect(menu.querySelectorAll('[data-dshwt-group-item]')).toHaveLength(1)
  })

  it('turns tag grouping on and closes the menu', () => {
    const store = hydrate()
    const menu = mountViewMenu(0)
    syncViewMenu(document, store, t)
    const button = menu.querySelector<HTMLButtonElement>('[data-dshwt-view-menu-tag]')
    let escapes = 0
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') escapes += 1
    }
    document.addEventListener('keydown', onKey)
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    document.removeEventListener('keydown', onKey)
    expect(store.getSnapshot().groupByTag).toBe(true)
    expect(escapes).toBe(1)
  })

  it('switches a tree/flat grouping to the workspace grouping first', () => {
    const store = hydrate()
    const menu = mountViewMenu(1)
    syncViewMenu(document, store, t)
    const workspaceRow = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[0]
    let clicks = 0
    workspaceRow?.addEventListener('click', () => {
      clicks += 1
    })
    menu.querySelector<HTMLButtonElement>('[data-dshwt-view-menu-tag]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(clicks).toBe(1)
    expect(store.getSnapshot().groupByTag).toBe(true)
  })

  it('turns tag grouping off when a native grouping row is chosen', () => {
    const store = hydrate()
    const menu = mountViewMenu(0)
    syncViewMenu(document, store, t)
    menu.querySelector<HTMLButtonElement>('[data-dshwt-view-menu-tag]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(store.getSnapshot().groupByTag).toBe(true)
    const native = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[1]
    native?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(store.getSnapshot().groupByTag).toBe(false)
  })

  it('stays hidden and resets grouping when no tags exist', () => {
    const store = createClientTagStore()
    store.hydrate(tagState())
    store.setGroupByTag(true)
    const menu = mountViewMenu(0)
    syncViewMenu(document, store, t)
    expect(menu.querySelector('[data-dshwt-group-item]')).toBeNull()
    expect(store.getSnapshot().groupByTag).toBe(false)
  })
})
