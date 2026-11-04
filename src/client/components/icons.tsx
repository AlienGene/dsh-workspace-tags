/**
 * Inline glyphs owned by this plugin.
 *
 * The shipped icon set has no tag/filter glyph, so these are small inline SVGs
 * that inherit `currentColor` like every primitive icon.
 *
 * @module dsh-workspace-tags/client/components/icons
 */

/** @returns the plugin's tag mark. */
export function TagGlyph({ size = 16 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" aria-hidden="true">
      <path d="M2.8 3.2h4.3l6 6-3.9 3.9-6-6V3.2Z" />
      <circle cx="5.3" cy="5.7" r=".9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** @returns a check mark for selected rows. */
export function CheckGlyph({ size = 14 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.4 8.4 3 3 6.2-6.8" />
    </svg>
  )
}

/** @returns a trash glyph for destructive row actions. */
export function TrashGlyph({ size = 16 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.2 4.4h9.6M6.4 4.4V3.2h3.2v1.2M4.6 4.4l.6 8.2h5.6l.6-8.2M6.7 6.8v3.6M9.3 6.8v3.6" />
    </svg>
  )
}
