import { describe, expect, it } from 'vitest'
import {
  MAX_TAG_TEXT,
  TAG_PALETTE,
  nextPaletteColor,
  normalizeColor,
  normalizeTagText,
  sanitizeStoredState,
  tagKey,
  tagsForWorkspace,
  validateWritePayload,
  workspaceMatchesFilter,
  type Tag,
} from '../src/protocol.ts'

/** @returns a valid tag fixture. */
function tag(id: string, text: string, color = '#3b82f6'): Tag {
  return { id, text, color }
}

describe('tag text', () => {
  it('collapses whitespace and trims', () => {
    expect(normalizeTagText('  work   in \n progress ')).toBe('work in progress')
  })

  it('uses a case-insensitive uniqueness key', () => {
    expect(tagKey('  Urgent ')).toBe('urgent')
    expect(tagKey('URGENT')).toBe(tagKey('urgent'))
  })
})

describe('normalizeColor', () => {
  it('accepts and canonicalizes rrggbb', () => {
    expect(normalizeColor('#AABBCC')).toBe('#aabbcc')
  })

  it('expands rgb shorthand', () => {
    expect(normalizeColor('#ABC')).toBe('#aabbcc')
  })

  it('rejects invalid colors', () => {
    expect(normalizeColor('red')).toBeNull()
    expect(normalizeColor('#12')).toBeNull()
    expect(normalizeColor(12)).toBeNull()
  })
})

describe('nextPaletteColor', () => {
  it('prefers the first unused palette color', () => {
    expect(nextPaletteColor([])).toBe(TAG_PALETTE[0])
    expect(nextPaletteColor([tag('a', 'one', TAG_PALETTE[0])])).toBe(TAG_PALETTE[1])
  })

  it('cycles when every color is used', () => {
    const tags = TAG_PALETTE.map((color, index) => tag(String(index), `t${String(index)}`, color))
    expect(nextPaletteColor(tags)).toBe(TAG_PALETTE[0])
  })
})

describe('sanitizeStoredState', () => {
  it('returns an empty state for garbage', () => {
    const state = sanitizeStoredState(null)
    expect(state.tags).toEqual([])
    expect(state.assignments).toEqual({})
    expect(state.revision).toBe(0)
  })

  it('drops malformed tags and unknown assignments', () => {
    const state = sanitizeStoredState({
      revision: 3,
      tags: [
        tag('a', ' ok '),
        { id: 'b', text: '   ', color: '#ffffff' },
        { id: 'a', text: 'duplicate id', color: '#ffffff' },
        { id: 'c', text: 'ok', color: 'not-a-color' },
        { id: 'd', text: 'OK', color: '#ffffff' },
      ],
      assignments: { w1: ['a', 'missing', 'a'], w2: [], w3: 'no' },
    })
    expect(state.revision).toBe(3)
    expect(state.tags.map((entry) => entry.text)).toEqual(['ok'])
    expect(state.assignments).toEqual({ w1: ['a'] })
  })

  it('caps overlong text', () => {
    const state = sanitizeStoredState({ tags: [tag('a', 'x'.repeat(MAX_TAG_TEXT + 1))], assignments: {} })
    expect(state.tags).toEqual([])
  })
})

describe('validateWritePayload', () => {
  it('accepts and canonicalizes a valid document', () => {
    const result = validateWritePayload({
      tags: [tag('a', '  Work  '), tag('b', 'Home', '#ABC')],
      assignments: { w1: ['a', 'b', 'a'], w2: ['missing'] },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload.tags).toEqual([
      { id: 'a', text: 'Work', color: '#3b82f6' },
      { id: 'b', text: 'Home', color: '#aabbcc' },
    ])
    expect(result.payload.assignments).toEqual({ w1: ['a', 'b'] })
  })

  it('rejects duplicate names case-insensitively', () => {
    const result = validateWritePayload({ tags: [tag('a', 'Work'), tag('b', ' work ')], assignments: {} })
    expect(result).toMatchObject({ ok: false, code: 'duplicate-tag' })
  })

  it('rejects empty, overlong and invalid tags', () => {
    expect(validateWritePayload({ tags: [tag('a', ' ')], assignments: {} })).toMatchObject({ ok: false, code: 'invalid-tag' })
    expect(validateWritePayload({ tags: [tag('a', 'x'.repeat(MAX_TAG_TEXT + 1))], assignments: {} })).toMatchObject({ ok: false, code: 'invalid-tag' })
    expect(validateWritePayload({ tags: [tag('a', 'ok', 'red')], assignments: {} })).toMatchObject({ ok: false, code: 'invalid-tag' })
    expect(validateWritePayload({ tags: [tag('a', 'ok'), tag('a', 'other')], assignments: {} })).toMatchObject({ ok: false, code: 'invalid-tag' })
  })

  it('rejects malformed containers', () => {
    expect(validateWritePayload(null)).toMatchObject({ ok: false, code: 'invalid-body' })
    expect(validateWritePayload({ tags: 'no', assignments: {} })).toMatchObject({ ok: false, code: 'invalid-body' })
    expect(validateWritePayload({ tags: [], assignments: [] })).toMatchObject({ ok: false, code: 'invalid-body' })
    expect(validateWritePayload({ tags: [], assignments: { w: ['missing'] } })).toMatchObject({ ok: true })
  })
})

describe('workspace helpers', () => {
  const state = {
    tags: [tag('a', 'Work'), tag('b', 'Home')],
    assignments: { w1: ['a', 'b'], w2: ['b'] } as Record<string, string[]>,
  }

  it('returns assigned tags in definition order', () => {
    expect(tagsForWorkspace(state, 'w1').map((entry) => entry.id)).toEqual(['a', 'b'])
    expect(tagsForWorkspace(state, 'w3')).toEqual([])
  })

  it('treats an empty filter as show-all', () => {
    expect(workspaceMatchesFilter(state, 'w1', [])).toBe(true)
  })

  it('matches the union of selected tags', () => {
    expect(workspaceMatchesFilter(state, 'w2', ['a'])).toBe(false)
    expect(workspaceMatchesFilter(state, 'w2', ['a', 'b'])).toBe(true)
  })
})
