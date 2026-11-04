/**
 * Tag chips rendered beside a workspace project name.
 *
 * Chips are plain DOM (the row belongs to React and there is no row slot); the
 * controller re-renders them idempotently and only when the visible tag set or
 * names/colors actually changed.
 *
 * @module dsh-workspace-tags/client/dom/chips
 */
import type { Tag } from '../../protocol.ts'
import type { Translate } from '../types.ts'

/** Marks the plugin-owned chip strip. */
export const CHIPS_ATTRIBUTE = 'data-dshwt-chips'

/** How many chips fit in a narrow sidebar before the `+N` summary. */
export const MAX_VISIBLE_CHIPS = 1

/** @returns the signature used to skip redundant re-renders. */
export function chipSignature(tags: readonly Tag[]): string {
  return tags.map((tag) => `${tag.id}:${tag.text}:${tag.color}`).join('|')
}

/**
 * Ensure the chip strip exists immediately after the project text.
 * @param row - workspace row.
 * @param title - the project text element (or null when the markup changed).
 * @returns the strip.
 */
export function ensureChipsHost(row: HTMLElement, title: HTMLElement | null): HTMLElement {
  const existing = row.querySelector<HTMLElement>(`:scope > [${CHIPS_ATTRIBUTE}]`)
  if (existing !== null) return existing
  const host = row.ownerDocument.createElement('span')
  host.setAttribute(CHIPS_ATTRIBUTE, '')
  host.setAttribute('aria-hidden', 'true')
  host.draggable = false
  host.className = 'dshwt-chips'
  if (title !== null) title.after(host)
  else row.append(host)
  return host
}

/**
 * Render the strip in place.
 * @param host - strip element from {@link ensureChipsHost}.
 * @param tags - tags assigned to the workspace, in definition order.
 * @param t - localized translator (for the `+N` tooltip).
 */
export function renderChips(host: HTMLElement, tags: readonly Tag[], t: Translate): void {
  const signature = chipSignature(tags)
  if (host.dataset['dshwtSignature'] === signature) return
  host.dataset['dshwtSignature'] = signature
  host.replaceChildren()
  if (tags.length === 0) {
    host.removeAttribute(CHIPS_ATTRIBUTE)
    host.remove()
    return
  }
  host.setAttribute(CHIPS_ATTRIBUTE, '')
  const doc = host.ownerDocument
  for (const tag of tags.slice(0, MAX_VISIBLE_CHIPS)) {
    host.append(createChip(doc, tag))
  }
  const hidden = tags.length - MAX_VISIBLE_CHIPS
  if (hidden > 0) {
    const more = doc.createElement('span')
    more.className = 'dshwt-chip dshwt-chip-more'
    more.textContent = `+${String(hidden)}`
    more.title = tags.map((tag) => tag.text).join(' · ')
    more.setAttribute('data-dshwt-more', '')
    host.append(more)
  }
  host.setAttribute('title', tags.map((tag) => tag.text).join(' · '))
  host.setAttribute('aria-label', `${t('row.tags')}: ${tags.map((tag) => tag.text).join(', ')}`)
}

/**
 * @param doc - owner document.
 * @param tag - the tag to render.
 * @returns one chip element.
 */
export function createChip(doc: Document, tag: Tag): HTMLElement {
  const chip = doc.createElement('span')
  chip.className = 'dshwt-chip'
  chip.setAttribute('data-dshwt-chip', '')
  chip.setAttribute('data-dshwt-tag-id', tag.id)
  chip.style.setProperty('--dshwt-color', tag.color)
  chip.title = tag.text
  const dot = doc.createElement('span')
  dot.className = 'dshwt-chip-dot'
  const label = doc.createElement('span')
  label.className = 'dshwt-chip-label'
  label.textContent = tag.text
  chip.append(dot, label)
  return chip
}
