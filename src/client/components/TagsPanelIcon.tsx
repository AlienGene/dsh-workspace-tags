/**
 * The glyph of the sidebar's "Tags" panel row.
 * @module dsh-workspace-tags/client/components/TagsPanelIcon
 */
import type { ReactNode } from 'react'
import { TagGlyph } from './icons.tsx'
import type { TagsIconProps } from './contract.ts'

/**
 * @param props - owner-supplied icon size.
 * @returns the tag glyph.
 */
export function TagsPanelIcon({ size }: TagsIconProps): ReactNode {
  return <TagGlyph size={size} />
}
