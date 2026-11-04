/**
 * Frame-wide floating surfaces: the tag filter and the annotation picker.
 *
 * Both are anchored popovers; `shell.overlay` is used only so they outlive the
 * row or header control that opened them.
 *
 * @module dsh-workspace-tags/client/components/Overlay
 */
import type { ReactNode } from 'react'
import { TagFilterPanel } from './TagFilterPanel.tsx'
import { TagPickerPanel } from './TagPickerPanel.tsx'
import type { TagsOverlayProps } from './contract.ts'

/**
 * @param props - composed seat props.
 * @returns the two anchored surfaces (each renders null while closed).
 */
export function TagsOverlay(props: TagsOverlayProps): ReactNode {
  const snapshot = props.useTags((state) => state)
  return (
    <>
      <TagFilterPanel
        snapshot={snapshot}
        t={props.t}
        toggleFilter={props.toggleFilter}
        resetFilter={props.resetFilter}
        closeFilter={props.closeFilter}
      />
      <TagPickerPanel
        snapshot={snapshot}
        t={props.t}
        addTag={props.addTag}
        assign={props.assign}
        clearAssignments={props.clearAssignments}
        closePicker={props.closePicker}
      />
    </>
  )
}
