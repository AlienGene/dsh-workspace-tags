/**
 * The tag manager content rendered by the sidebar's Tags page.
 *
 * Add, rename, recolor and delete live here; names are unique (trimmed,
 * case-insensitive) and every edit is persisted immediately through the store.
 *
 * @module dsh-workspace-tags/client/components/TagManager
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import { TAG_PALETTE, nextPaletteColor, type Tag } from '../../protocol.ts'
import { TrashGlyph } from './icons.tsx'
import { nameErrorMessage } from './messages.ts'
import type { ClientTagActions, ClientTagSnapshot, TagNameErrorCode } from '../store.ts'
import type { Translate } from '../types.ts'

/** Props of {@link TagManager}. */
export interface TagManagerProps {
  snapshot: ClientTagSnapshot
  t: Translate
  addTag: ClientTagActions['addTag']
  renameTag: ClientTagActions['renameTag']
  recolorTag: ClientTagActions['recolorTag']
  removeTag: ClientTagActions['removeTag']
}

/**
 * @param props - snapshot plus the manager actions.
 * @returns the add form and the tag list.
 */
export function TagManager({ snapshot, t, addTag, renameTag, recolorTag, removeTag }: TagManagerProps): ReactNode {
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState<string>(() => nextPaletteColor(snapshot.tags))
  const [error, setError] = useState<TagNameErrorCode | null>(null)

  useEffect(() => {
    setColor(nextPaletteColor(snapshot.tags))
  }, [snapshot.tags.length])

  const add = (): void => {
    const result = addTag(draft, color)
    if (!result.ok) {
      setError(result.code)
      return
    }
    setDraft('')
    setError(null)
    setColor(nextPaletteColor([...snapshot.tags, result.tag]))
  }

  const usageOf = (tagId: string): number => {
    let count = 0
    for (const assigned of Object.values(snapshot.assignments)) {
      if (assigned.includes(tagId)) count += 1
    }
    return count
  }

  return (
    <>
      <form
        className="dshwt-add-form"
        onSubmit={(event) => {
          event.preventDefault()
          add()
        }}
      >
        <label>
          <Input
            value={draft}
            placeholder={t('page.addPlaceholder')}
            aria-label={t('page.addPlaceholder')}
            onChange={(event) => {
              setDraft(event.target.value)
              if (error !== null) setError(null)
            }}
          />
        </label>
        <input
          type="color"
          className="dshwt-color-input"
          aria-label={t('page.color')}
          title={t('page.color')}
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
        <Button type="submit" size="sm" variant="primary" disabled={draft.trim().length === 0}>
          {t('page.add')}
        </Button>
      </form>
      {error !== null ? <div className="dshwt-error" role="alert">{nameErrorMessage(error, t)}</div> : null}

      {snapshot.tags.length === 0 ? (
        <div className="dshwt-empty-state">
          <strong>{t('page.empty')}</strong>
          {t('page.emptyHint')}
        </div>
      ) : (
        <div className="dshwt-tag-list">
          {snapshot.tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              usage={usageOf(tag.id)}
              t={t}
              renameTag={renameTag}
              recolorTag={recolorTag}
              removeTag={removeTag}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface TagRowProps {
  tag: Tag
  usage: number
  t: Translate
  renameTag: ClientTagActions['renameTag']
  recolorTag: ClientTagActions['recolorTag']
  removeTag: ClientTagActions['removeTag']
}

/**
 * One editable tag row: color, text, usage and delete confirmation.
 * @param props - the tag and the actions it drives.
 * @returns the row and its optional palette.
 */
function TagRow({ tag, usage, t, renameTag, recolorTag, removeTag }: TagRowProps): ReactNode {
  const [draft, setDraft] = useState(tag.text)
  const [error, setError] = useState<TagNameErrorCode | null>(null)
  const [palette, setPalette] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setDraft(tag.text)
  }, [tag.text])

  const commit = (): void => {
    if (draft === tag.text) {
      setError(null)
      return
    }
    const result = renameTag(tag.id, draft)
    if (result.ok) setError(null)
    else setError(result.code)
  }

  return (
    <div className="dshwt-tag-item">
      <div className="dshwt-tag-row">
        <button
          type="button"
          className="dshwt-swatch"
          style={{ '--dshwt-color': tag.color } as CSSProperties}
          aria-label={t('page.color')}
          title={t('page.color')}
          aria-expanded={palette}
          onClick={() => setPalette((value) => !value)}
        />
        <div className="dshwt-tag-main">
          <Input
            value={draft}
            aria-label={`${t('page.title')}: ${tag.text}`}
            onChange={(event) => {
              setDraft(event.target.value)
              if (error !== null) setError(null)
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commit()
              } else if (event.key === 'Escape') {
                event.preventDefault()
                setDraft(tag.text)
                setError(null)
              }
            }}
          />
          {confirming ? (
            <span className="dshwt-usage">{t('page.deleteConfirm', { name: tag.text })}</span>
          ) : (
            <span className="dshwt-usage">{t('page.usage', { count: usage })}</span>
          )}
          {error !== null ? <div className="dshwt-error" role="alert">{nameErrorMessage(error, t)}</div> : null}
        </div>
        <div className="dshwt-tag-side">
          {confirming ? (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setConfirming(false)
                  removeTag(tag.id)
                }}
              >
                {t('page.delete')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                {t('page.deleteCancel')}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              icon={<TrashGlyph />}
              aria-label={t('page.delete')}
              title={t('page.delete')}
              onClick={() => setConfirming(true)}
            />
          )}
        </div>
      </div>
      {palette ? (
        <div className="dshwt-palette">
          {TAG_PALETTE.map((preset) => (
            <button
              key={preset}
              type="button"
              className="dshwt-palette-btn"
              style={{ '--dshwt-color': preset } as CSSProperties}
              aria-label={preset}
              title={preset}
              aria-pressed={tag.color === preset}
              onClick={() => recolorTag(tag.id, preset)}
            />
          ))}
          <input
            type="color"
            className="dshwt-color-input"
            aria-label={t('page.customColor')}
            title={t('page.customColor')}
            value={tag.color}
            onChange={(event) => recolorTag(tag.id, event.target.value)}
          />
        </div>
      ) : null}
    </div>
  )
}
