/**
 * The annotation picker opened from a workspace row.
 *
 * Typing a name and pressing Enter creates the tag (auto color) and assigns
 * it; typing an existing name assigns that tag instead. Existing tags toggle
 * without closing the panel.
 *
 * @module dsh-workspace-tags/client/components/TagPickerPanel
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import { PICKER_PALETTE, nextPickerColor, tagKey } from '../../protocol.ts'
import { AnchorPanel } from './AnchorPanel.tsx'
import { CheckGlyph } from './icons.tsx'
import { nameErrorMessage } from './messages.ts'
import type { ClientTagActions, ClientTagSnapshot, TagNameErrorCode } from '../store.ts'
import type { Translate } from '../types.ts'

/** Props of {@link TagPickerPanel}. */
export interface TagPickerPanelProps {
  snapshot: ClientTagSnapshot
  t: Translate
  addTag: ClientTagActions['addTag']
  assign: ClientTagActions['assign']
  clearAssignments: ClientTagActions['clearAssignments']
  closePicker: ClientTagActions['closePicker']
}

/**
 * @param props - snapshot plus the actions the picker drives.
 * @returns the anchored picker, or null while closed.
 */
export function TagPickerPanel({ snapshot, t, addTag, assign, clearAssignments, closePicker }: TagPickerPanelProps): ReactNode {
  const picker = snapshot.picker
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState<string>(() => nextPickerColor(snapshot.tags))
  const [customOpen, setCustomOpen] = useState(false)
  const [error, setError] = useState<TagNameErrorCode | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDraft('')
    setError(null)
    setColor(nextPickerColor(snapshot.tags))
    setCustomOpen(false)
  }, [picker])

  useEffect(() => {
    if (picker !== null) inputRef.current?.focus()
  }, [picker])

  if (picker === null) return null

  const assigned = snapshot.assignments[picker.workspaceId] ?? []

  const submit = (): void => {
    const value = draft.trim()
    if (value.length === 0) {
      setError('empty')
      return
    }
    const result = addTag(value, color)
    if (result.ok) {
      assign(picker.workspaceId, result.tag.id, true)
      setDraft('')
      setError(null)
      setColor(nextPickerColor([...snapshot.tags, result.tag]))
      setCustomOpen(false)
      return
    }
    if (result.code === 'duplicate') {
      const key = tagKey(value)
      const existing = snapshot.tags.find((tag) => tagKey(tag.text) === key)
      if (existing !== undefined) {
        assign(picker.workspaceId, existing.id, true)
        setDraft('')
        setError(null)
        return
      }
    }
    setError(result.code)
  }

  return (
    <AnchorPanel
      open
      anchor={picker.anchor}
      label={t('picker.title', { name: picker.title })}
      onClose={closePicker}
    >
      <div className="dshwt-panel-title">{t('picker.title', { name: picker.title })}</div>
      <div className="dshwt-panel-input-row">
        <div className="dshwt-panel-input-grow">
          <Input
            ref={inputRef}
            value={draft}
            placeholder={t('picker.placeholder')}
            aria-label={t('picker.placeholder')}
            onChange={(event) => {
              setDraft(event.target.value)
              if (error !== null) setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              submit()
            }}
          />
        </div>
      </div>
      <div className="dshwt-picker-colors" role="group" aria-label={t('page.color')}>
        {PICKER_PALETTE.map((preset) => (
          <button
            key={preset}
            type="button"
            className="dshwt-picker-swatch"
            data-dshwt-picker-color={preset}
            style={{ '--dshwt-color': preset } as CSSProperties}
            aria-label={preset}
            title={preset}
            aria-pressed={!customOpen && color === preset}
            onClick={() => {
              setColor(preset)
              setCustomOpen(false)
            }}
          />
        ))}
        <button
          type="button"
          className="dshwt-picker-custom"
          data-dshwt-picker-custom=""
          aria-pressed={customOpen}
          aria-expanded={customOpen}
          onClick={() => setCustomOpen((value) => !value)}
        >
          <span className="dshwt-picker-custom-dot" aria-hidden="true" />
          {t('picker.custom')}
        </button>
      </div>
      {customOpen ? (
        <div className="dshwt-picker-custom-row">
          <input
            type="color"
            className="dshwt-color-input"
            aria-label={t('page.color')}
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
          <span className="dshwt-picker-custom-hint">{t('picker.customHint')}</span>
        </div>
      ) : null}
      {error !== null ? <div className="dshwt-error" role="alert">{nameErrorMessage(error, t)}</div> : null}
      {snapshot.tags.length === 0 ? (
        <div className="dshwt-panel-hint">{t('picker.empty')}</div>
      ) : (
        <div className="dshwt-panel-list">
          {snapshot.tags.map((tag) => {
            const active = assigned.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className="dshwt-panel-row"
                aria-pressed={active}
                onClick={() => assign(picker.workspaceId, tag.id, !active)}
              >
                <span className="dshwt-panel-dot" style={{ '--dshwt-color': tag.color } as CSSProperties} />
                <span className="dshwt-panel-name">{tag.text}</span>
                {active ? <span className="dshwt-panel-check"><CheckGlyph /></span> : null}
              </button>
            )
          })}
        </div>
      )}
      <div className="dshwt-panel-footer">
        <Button
          size="sm"
          variant="outline"
          disabled={assigned.length === 0}
          onClick={() => clearAssignments(picker.workspaceId)}
        >
          {t('picker.clear')}
        </Button>
        <Button size="sm" variant="primary" onClick={closePicker}>
          {t('picker.done')}
        </Button>
      </div>
    </AnchorPanel>
  )
}
