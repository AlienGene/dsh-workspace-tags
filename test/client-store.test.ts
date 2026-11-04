import { describe, expect, it } from 'vitest'
import { createClientTagStore } from '../src/client/store.ts'
import { emptyState } from '../src/protocol.ts'

/** @returns a store hydrated with one tag. */
function hydrated() {
  const store = createClientTagStore()
  store.hydrate({
    ...emptyState(),
    tags: [{ id: 'a', text: 'Work', color: '#3b82f6' }],
    revision: 1,
  })
  return store
}

describe('client tag store', () => {
  it('starts empty and loading', () => {
    const store = createClientTagStore()
    expect(store.getSnapshot()).toMatchObject({ hydrated: false, loading: true, tags: [] })
  })

  it('hydrates and prunes a filter that lost its tag', () => {
    const store = hydrated()
    store.toggleFilter('a')
    store.hydrate({ ...emptyState(), tags: [], revision: 2 })
    expect(store.getSnapshot().filter).toEqual([])
  })

  it('creates tags with the next palette color', () => {
    const store = createClientTagStore()
    const first = store.addTag('Work')
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.tag.color).toBe('#ef4444')
    const second = store.addTag('  Home  ')
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.tag.text).toBe('Home')
    expect(second.tag.color).toBe('#f97316')
  })

  it('rejects empty, overlong and duplicate names', () => {
    const store = hydrated()
    expect(store.addTag('   ')).toEqual({ ok: false, code: 'empty' })
    expect(store.addTag('x'.repeat(25))).toEqual({ ok: false, code: 'too-long' })
    expect(store.addTag(' work ')).toEqual({ ok: false, code: 'duplicate' })
  })

  it('renames uniquely and keeps the id', () => {
    const store = hydrated()
    const result = store.renameTag('a', 'Office')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.tag).toMatchObject({ id: 'a', text: 'Office' })
    store.addTag('Home')
    expect(store.renameTag('a', 'home')).toEqual({ ok: false, code: 'duplicate' })
    expect(store.renameTag('missing', 'x')).toEqual({ ok: false, code: 'empty' })
  })

  it('recolors only with a valid color', () => {
    const store = hydrated()
    expect(store.recolorTag('a', '#AABBCC')).toBe(true)
    expect(store.getSnapshot().tags[0]?.color).toBe('#aabbcc')
    expect(store.recolorTag('a', 'red')).toBe(false)
    expect(store.recolorTag('missing', '#ffffff')).toBe(false)
  })

  it('removes a tag from definitions, assignments and the filter', () => {
    const store = hydrated()
    store.assign('w1', 'a', true)
    store.toggleFilter('a')
    store.removeTag('a')
    expect(store.getSnapshot().tags).toEqual([])
    expect(store.getSnapshot().assignments).toEqual({})
    expect(store.getSnapshot().filter).toEqual([])
  })

  it('assigns and clears workspace tags', () => {
    const store = hydrated()
    store.assign('w1', 'a', true)
    store.assign('w1', 'a', true)
    expect(store.getSnapshot().assignments).toEqual({ w1: ['a'] })
    store.assign('w1', 'a', false)
    expect(store.getSnapshot().assignments).toEqual({})
    store.assign('w1', 'a', true)
    store.clearAssignments('w1')
    expect(store.getSnapshot().assignments).toEqual({})
  })

  it('ignores assignments for unknown tags or empty workspace ids', () => {
    const store = hydrated()
    store.assign('', 'a', true)
    store.assign('w1', 'missing', true)
    expect(store.getSnapshot().assignments).toEqual({})
  })

  it('toggles the filter as a set', () => {
    const store = hydrated()
    store.toggleFilter('a')
    expect(store.getSnapshot().filter).toEqual(['a'])
    store.toggleFilter('a')
    expect(store.getSnapshot().filter).toEqual([])
    store.toggleFilter('a')
    store.resetFilter()
    expect(store.getSnapshot().filter).toEqual([])
  })

  it('opens only one floating surface at a time', () => {
    const store = hydrated()
    const anchor = document.createElement('button')
    store.openFilter(anchor)
    expect(store.getSnapshot().filterAnchor).toBe(anchor)
    store.openPicker('w1', 'Aurora', anchor)
    expect(store.getSnapshot().picker?.workspaceId).toBe('w1')
    expect(store.getSnapshot().filterAnchor).toBeNull()
    store.closePicker()
    expect(store.getSnapshot().picker).toBeNull()
  })

  it('notifies subscribers until unsubscribed', () => {
    const store = createClientTagStore()
    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls += 1
    })
    store.addTag('Work')
    unsubscribe()
    store.addTag('Home')
    expect(calls).toBe(1)
  })

  it('exposes the payload and revision for persistence', () => {
    const store = hydrated()
    expect(store.revision()).toBe(1)
    expect(store.payload()).toEqual({ tags: store.getSnapshot().tags, assignments: {} })
  })
})
