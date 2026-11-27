/**
 * A small anchored floating panel used by the tag filter and the annotation
 * picker.
 *
 * It is not the `Menu` primitive because the annotation panel hosts a text
 * input and keeps its list open while rows toggle. Placement uses CSS Anchor
 * Positioning (DSH 0.2.2 removed `useAnchoredPosition`): the trigger gets an
 * `anchor-name`, the panel sets `position-anchor` and the shared stylesheet
 * supplies placement, fallbacks and size limits. Material comes from
 * `MenuSurface`; the panel dismisses on outside pointer-down or Escape without
 * closing a parent dialog.
 *
 * @module dsh-workspace-tags/client/components/AnchorPanel
 */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { MenuSurface } from '@deepseek-ai/dsh-client-ui-primitives'

/** CSS anchor name shared by the one open filter/picker panel. */
const ANCHOR_NAME = '--dshwt-panel-anchor'

/** Props of {@link AnchorPanel}. */
export interface AnchorPanelProps {
  open: boolean
  anchor: HTMLElement | null
  label: string
  onClose: () => void
  children: ReactNode
}

/**
 * @param props - open state, anchor element, accessible label and body.
 * @returns the positioned panel, or null while closed.
 */
export function AnchorPanel({ open, anchor, label, onClose, children }: AnchorPanelProps): ReactNode {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!open || anchor === null) return
    const previous = anchor.style.getPropertyValue('anchor-name')
    const priority = anchor.style.getPropertyPriority('anchor-name')
    anchor.style.setProperty('anchor-name', ANCHOR_NAME)
    return () => {
      if (previous === '') anchor.style.removeProperty('anchor-name')
      else anchor.style.setProperty('anchor-name', previous, priority)
    }
  }, [open, anchor])

  useEffect(() => {
    if (!open || anchor === null) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target) === true) return
      if (anchor.contains(target)) return
      onClose()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open, anchor, onClose])

  if (!open || anchor === null) return null

  return (
    <MenuSurface ref={panelRef} role="dialog" aria-label={label} className="dshwt-panel" data-dshwt-anchored="">
      {children}
    </MenuSurface>
  )
}
