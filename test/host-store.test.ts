import { describe, expect, it } from 'vitest'
import {
  TABLE_NAME,
  TagConflictError,
  TagStore,
  tagDomainSpec,
  type DomainTableLike,
  type TagDomainSpecLike,
} from '../src/host/store.ts'
import { emptyState, type TagState } from '../src/protocol.ts'

/** In-memory domain table with the same update-chain contract. */
class FakeTable implements DomainTableLike {
  value: TagState | undefined

  get(): TagState | undefined {
    return this.value === undefined ? undefined : structuredClone(this.value)
  }

  async put(): Promise<void> {
    this.value = emptyState()
  }

  async update(_key: string, update: (current: TagState) => TagState): Promise<TagState> {
    if (this.value === undefined) throw new Error('missing record')
    const next = update(structuredClone(this.value))
    this.value = structuredClone(next)
    return structuredClone(next)
  }
}

describe('tagDomainSpec', () => {
  it('declares a single lenient table', () => {
    const spec: TagDomainSpecLike = tagDomainSpec()
    expect(spec.name).toBe('dsh_tags')
    expect(spec.version).toBe(1)
    expect(Object.keys(spec.tables)).toEqual([TABLE_NAME])
    const parsed = spec.tables[TABLE_NAME]?.valueSchema.parse({ tags: 'nonsense' })
    expect(parsed).toMatchObject({ revision: 0, tags: [], assignments: {} })
  })
})

describe('TagStore', () => {
  it('seeds the initial document once', async () => {
    const table = new FakeTable()
    const store = await new TagStore(table).init()
    expect(store.snapshot().revision).toBe(0)
    expect(store.snapshot().tags).toEqual([])
    expect(table.value).toBeDefined()
  })

  it('reads an existing document', async () => {
    const table = new FakeTable()
    table.value = {
      schemaVersion: 1,
      revision: 4,
      tags: [{ id: 'a', text: 'Work', color: '#3b82f6' }],
      assignments: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const store = await new TagStore(table).init()
    expect(store.snapshot().revision).toBe(4)
    expect(store.snapshot().tags).toHaveLength(1)
  })

  it('writes with compare-and-set and bumps the revision', async () => {
    const table = new FakeTable()
    const store = await new TagStore(table).init()
    const next = await store.write(
      { tags: [{ id: 'a', text: 'Work', color: '#3b82f6' }], assignments: { w1: ['a'] } },
      0,
    )
    expect(next.revision).toBe(1)
    expect(store.snapshot().assignments).toEqual({ w1: ['a'] })
  })

  it('refuses a stale revision with the current one', async () => {
    const table = new FakeTable()
    const store = await new TagStore(table).init()
    await store.write({ tags: [], assignments: {} }, 0)
    await expect(store.write({ tags: [], assignments: {} }, 0)).rejects.toBeInstanceOf(TagConflictError)
    try {
      await store.write({ tags: [], assignments: {} }, 0)
    } catch (error) {
      expect((error as TagConflictError).revision).toBe(1)
    }
  })
})
