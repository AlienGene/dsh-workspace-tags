/**
 * The multi-select tag filter opened from the workspace header.
 *
 * Rows toggle without closing the panel; the footer stays pinned below the
 * scrolling list and carries the reset action. An empty selection means "show
 * everything".
 *
 * @module dsh-workspace-tags/client/components/TagFilterPanel
 */
import type { CSSProperties, ReactNode } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { AnchorPanel } from './AnchorPanel.tsx'
import { CheckGlyph } from './icons.tsx'
import type { ClientTagSnapshot } from '../store.ts'
import type { Translate } from '../types.ts'

/** Props of {@link TagFilterPanel}. */
export interface TagFilterPanelProps {
  snapshot: ClientTagSnapshot
  t: Translate
  toggleFilter(tagId: string): void
  resetFilter(): void
  closeFilter(): void
}

/**
 * @param props - snapshot plus filter actions.
 * @returns the anchored filter panel, or null while closed.
 */
export function TagFilterPanel({ snapshot, t, toggleFilter, resetFilter, closeFilter }: TagFilterPanelProps): ReactNode {
  const selected = snapshot.filter.length
  return (
    <AnchorPanel
      open={snapshot.filterAnchor !== null}
      anchor={snapshot.filterAnchor}
      label={t('filter.label')}
      onClose={closeFilter}
    >
      <div className="dshwt-panel-title">{t('filter.label')}</div>
      {snapshot.tags.length === 0 ? (
        <div className="dshwt-panel-hint">{t('filter.none')}</div>
      ) : (
        <div className="dshwt-panel-list">
          {snapshot.tags.map((tag) => {
            const active = snapshot.filter.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className="dshwt-panel-row"
                aria-pressed={active}
                onClick={() => toggleFilter(tag.id)}
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
        <Button size="sm" variant="outline" disabled={selected === 0} onClick={resetFilter}>
          {t('filter.reset')}
        </Button>
      </div>
    </AnchorPanel>
  )
}
