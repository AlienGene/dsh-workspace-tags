import { afterEach, describe, expect, it } from 'vitest'
import { createDomController, type DomController } from '../src/client/dom/controller.ts'
import { createClientTagStore, type ClientTagStore } from '../src/client/store.ts'
import { zh } from '../src/client/locales.ts'
import type { Translate } from '../src/client/types.ts'
import { flush, mountSidebar, tagState } from './fixtures.ts'

const t: Translate = (key, vars) => {
  let text: string = zh[key]
  if (vars !== undefined) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}

let controller: DomController | null = null

afterEach(() => {
  controller?.dispose()
  controller = null
  document.body.innerHTML = ''
})

/** Mount the sidebar and start the decorator. */
function setup(store: ClientTagStore): void {
  mountSidebar()
  controller = createDomController({ doc: document, store, t })
  controller.start()
}

const tags = [
  { id: 'a', text: 'Work', color: '#ef4444' },
  { id: 'b', text: 'Urgent', color: '#22c55e' },
  { id: 'c', text: 'Home', color: '#3b82f6' },
]

describe('dom decorator', () => {
  it('renders chips after the project name and caps them', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: { w1: ['a', 'b', 'c'] }, revision: 1 }))
    setup(store)
    await flush()

    const row = document.querySelector('[data-row-key="workspace:w1"]')
    const chips = row?.querySelector(':scope > [data-dshwt-chips]')
    expect(chips).not.toBeNull()
    expect(chips?.querySelectorAll('.dshwt-chip')).toHaveLength(2)
    expect(chips?.querySelector('.dshwt-chip-more')?.textContent).toBe('+2')
    expect(chips?.getAttribute('aria-hidden')).toBe('true')
    expect(chips?.getAttribute('title')).toBe('Work · Urgent · Home')

    const chip = chips?.querySelector('.dshwt-chip') as HTMLElement
    expect(chip.style.getPropertyValue('--dshwt-color')).toBe('#ef4444')
  })

  it('adds a tag button to the row actions and opens the picker on click', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: {}, revision: 1 }))
    setup(store)
    await flush()

    const row = document.querySelector<HTMLElement>('[data-row-key="workspace:w1"]')
    const add = row?.querySelector<HTMLButtonElement>(':scope > [class*="_rowActions"] [data-dshwt-add]')
    expect(add).not.toBeNull()
    expect(add?.getAttribute('aria-label')).toContain('Aurora')

    add?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush()
    expect(store.getSnapshot().picker).toMatchObject({ workspaceId: 'w1', title: 'Aurora' })
  })

  it('adds the filter button and hides the workspace section when filtering', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: { w1: ['a'], w2: ['c'] }, revision: 1 }))
    setup(store)
    await flush()

    const filter = document.querySelector<HTMLButtonElement>('[data-dshwt-filter]')
    expect(filter).not.toBeNull()
    expect(filter?.getAttribute('aria-label')).toBe('按标签筛选')

    filter?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush()
    expect(store.getSnapshot().filterAnchor).toBe(filter)

    store.toggleFilter('a')
    await flush()
    const w1 = document.querySelector('[data-row-key="workspace:w1"]')?.closest('[class*="_groupSection"]')
    const w2 = document.querySelector('[data-row-key="workspace:w2"]')?.closest('[class*="_groupSection"]')
    expect(w1?.hasAttribute('data-dshwt-hidden')).toBe(false)
    expect(w2?.hasAttribute('data-dshwt-hidden')).toBe(true)

    const badge = document.querySelector('.dshwt-filter-badge')
    expect(badge?.textContent).toBe('1')
  })

  it('hides the ungrouped bucket while filtering and shows the empty notice', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: {}, revision: 1 }))
    setup(store)
    await flush()

    store.toggleFilter('a')
    await flush()
    const ungrouped = document.querySelector('[data-row-key="workspace:"]')?.closest('[class*="_groupSection"]')
    expect(ungrouped?.hasAttribute('data-dshwt-hidden')).toBe(true)
    expect(document.querySelector('[data-dshwt-list-empty]')).not.toBeNull()

    const reset = document.querySelector<HTMLButtonElement>('[data-dshwt-reset]')
    reset?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush()
    expect(store.getSnapshot().filter).toEqual([])
    expect(document.querySelector('[data-dshwt-list-empty]')).toBeNull()
  })

  it('groups visually with headers and CSS order while keeping nodes in place', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: { w1: ['a'], w2: ['c'] }, revision: 1 }))
    setup(store)
    await flush()

    store.setGroupByTag(true)
    await flush()

    const tree = document.querySelector('[role="tree"]') as HTMLElement
    expect(tree.hasAttribute('data-dshwt-group-by-tag')).toBe(true)
    const headers = tree.querySelectorAll(':scope > [data-dshwt-tag-group]')
    expect(headers).toHaveLength(3)
    expect(headers[0]?.textContent).toContain('Work')
    expect(headers[2]?.textContent).toContain('未标注')
    const w1 = document.querySelector('[data-row-key="workspace:w1"]')?.closest('[class*="_groupSection"]') as HTMLElement
    const w2 = document.querySelector('[data-row-key="workspace:w2"]')?.closest('[class*="_groupSection"]') as HTMLElement
    expect(w1.style.order).not.toBe('')
    expect(w2.style.order).not.toBe('')
    expect(w1.style.order).not.toBe(w2.style.order)
    // The React-owned list is untouched: the same two sections remain children.
    expect(tree.querySelectorAll(':scope > [class*="_groupSection"]')).toHaveLength(4)

    store.setGroupByTag(false)
    await flush()
    expect(tree.hasAttribute('data-dshwt-group-by-tag')).toBe(false)
    expect(tree.querySelectorAll('[data-dshwt-tag-group]')).toHaveLength(0)
    expect(w1.style.order).toBe('')
  })

  it('degrades safely in flat and rail modes', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: { w1: ['a'] }, revision: 1 }))

    mountSidebar({ flat: true })
    controller = createDomController({ doc: document, store, t })
    controller.start()
    await flush()
    expect(document.querySelector('[data-dshwt-filter]')).toBeNull()
    expect(document.querySelector('[data-dshwt-chips]')).toBeNull()

    controller.dispose()
    mountSidebar({ rail: true })
    controller = createDomController({ doc: document, store, t })
    controller.start()
    await flush()
    expect(document.querySelector('[data-dshwt-filter]')).toBeNull()
  })

  it('removes every injected node on dispose', async () => {
    const store = createClientTagStore()
    store.hydrate(tagState({ tags, assignments: { w1: ['a'] }, revision: 1 }))
    setup(store)
    store.setGroupByTag(true)
    await flush()

    controller?.dispose()
    controller = null
    expect(document.querySelector('[data-dshwt-chips]')).toBeNull()
    expect(document.querySelector('[data-dshwt-add]')).toBeNull()
    expect(document.querySelector('[data-dshwt-filter]')).toBeNull()
    expect(document.querySelector('[data-dshwt-tag-group]')).toBeNull()
  })
})
