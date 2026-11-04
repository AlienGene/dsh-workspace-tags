/**
 * A small anchored floating panel used by the tag filter and the annotation
 * picker.
 *
 * It is not the `Menu` primitive because the annotation panel hosts a text
 * input and keeps its list open while rows toggle. Placement and material come
 * from the shipped primitives (`useAnchoredPosition`, `MenuSurface`), and the
 * panel dismisses on outside pointer-down or Escape without closing a parent
 * dialog.
 *
 * @module dsh-workspace-tags/client/components/AnchorPanel
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { MenuSurface, useAnchoredPosition } from '@deepseek-ai/dsh-client-ui-primitives'

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
  const anchorRef = useRef<HTMLElement | null>(null)
  anchorRef.current = anchor

  const position = useAnchoredPosition({
    open: open && anchor !== null,
    anchorRef,
    panelRef,
    side: 'bottom',
    align: 'start',
    gap: 6,
    margin: 8,
  })

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

  const style: CSSProperties = {
    position: 'fixed',
    left: position?.left,
    top: position?.top,
    zIndex: 40,
    visibility: position === null ? 'hidden' : 'visible',
  }

  return (
    <MenuSurface ref={panelRef} role="dialog" aria-label={label} className="dshwt-panel" style={style}>
      {children}
    </MenuSurface>
  )
}
