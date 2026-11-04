/**
 * One stylesheet for everything this plugin adds: the DOM decorations, the
 * sidebar-group headers, the anchored popovers and the tag page.
 *
 * Tokens come from ui-theme; fallbacks keep the plugin legible in test/plain
 * environments. Injected once per document, like the shipped client bundles
 * (a second injection after HMR is a no-op).
 *
 * @module dsh-workspace-tags/client/dom/styles
 */

/** Key used to keep the sheet single-injected. */
export const STYLE_ATTRIBUTE = 'dsh-workspace-tags/ui.css'

const CSS = `
/* ---------- chips beside a project name ---------- */
[data-dshwt-chips]{display:inline-flex;align-items:center;gap:3px;flex:none;max-width:50%;min-width:0;overflow:hidden;vertical-align:middle}
.dshwt-chip{display:inline-flex;align-items:center;gap:4px;height:17px;padding:0 5px;border-radius:999px;border:.5px solid color-mix(in srgb,var(--dshwt-color) 62%,transparent);background:color-mix(in srgb,var(--dshwt-color) 10%,transparent);color:var(--dsw-alias-label-secondary,#5b6470);font-size:10px;line-height:15px;font-weight:500;white-space:nowrap;max-width:96px;overflow:hidden;text-overflow:ellipsis;flex:none}
.dshwt-chip-dot{width:6px;height:6px;border-radius:50%;background:var(--dshwt-color);flex:none}
.dshwt-chip-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
.dshwt-chip-more{--dshwt-color:var(--dsw-alias-border-l4,#c6ccd6);color:var(--dsw-alias-label-tertiary,#7a8494)}
.dshwt-chip-more.dshwt-chip-more{background:transparent}

/* ---------- row action button (fallback when the native class is unavailable) ---------- */
.dshwt-add{border-radius:var(--dsw-radius-xs,4px);cursor:pointer;width:16px;height:16px;color:var(--dsw-alias-label-tertiary,#7a8494);background:0 0;border:none;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}
.dshwt-add:hover{color:var(--dsw-alias-label-primary,#1f2328)}

/* ---------- workspace header filter button ---------- */
.dshwt-filter{position:relative}
.dshwt-filter-badge{position:absolute;top:1px;right:1px;min-width:11px;height:11px;padding:0 2px;border-radius:999px;background:var(--dsw-alias-state-business-primary,#3b82f6);color:#fff;font-size:8px;line-height:11px;text-align:center;font-weight:600;pointer-events:none}
[class*="_rail"] [data-dshwt-filter]{display:none!important}

/* ---------- filter/group hiding ---------- */
[data-dshwt-hidden]{display:none!important}
[data-dshwt-self-hidden]{display:none!important}
[data-dshwt-picker-open]>[class*="_rowActions"]{display:inline-flex!important}

/* ---------- grouping by tag (CSS order only; nodes never move) ---------- */
[data-dshwt-group-by-tag]{display:flex;flex-direction:column}
[data-dshwt-group-by-tag]>*{flex:none}
[data-dshwt-group-by-tag]>[class*="_groupSection"]{margin-top:2px!important}
[data-dshwt-tag-group]{display:flex;align-items:center;gap:6px;height:34px;padding:0 8px;margin:8px 0 2px;border-radius:var(--dsw-radius-md,8px);color:var(--dsw-alias-label-primary,#1f2328);box-sizing:border-box;cursor:pointer;user-select:none;outline:none}
[data-dshwt-tag-group]:first-child{margin-top:0}
[data-dshwt-tag-group]:hover,[data-dshwt-tag-group]:focus-visible{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
[data-dshwt-tag-group]:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-state-business-primary,#3b82f6)}
.dshwt-group-glyph{width:16px;height:20px;display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-caption,#9aa3b2)}
.dshwt-group-dot{width:9px;height:9px;border-radius:50%;background:var(--dshwt-color);flex:none}
.dshwt-group-chevron{display:none;align-items:center;justify-content:center;color:var(--dshwt-color,var(--dsw-alias-label-caption,#9aa3b2));transition:transform .15s var(--ds-ease-in-out,ease)}
[data-dshwt-tag-group]:hover .dshwt-group-dot,[data-dshwt-tag-group]:focus-visible .dshwt-group-dot{display:none}
[data-dshwt-tag-group]:hover .dshwt-group-chevron,[data-dshwt-tag-group]:focus-visible .dshwt-group-chevron{display:inline-flex}
[data-dshwt-tag-group][aria-expanded="false"] .dshwt-group-dot{display:none}
[data-dshwt-tag-group][aria-expanded="false"] .dshwt-group-chevron{display:inline-flex}
[data-dshwt-tag-group][aria-expanded="true"] .dshwt-group-chevron{transform:rotate(90deg)}
.dshwt-group-title{flex:1;min-width:0;font-size:14px;line-height:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshwt-group-untagged .dshwt-group-dot{background:transparent;border:1px solid var(--dsw-alias-border-l4,#c6ccd6);box-sizing:border-box}
.dshwt-group-untagged .dshwt-group-title{color:var(--dsw-alias-label-tertiary,#7a8494)}
.dshwt-group-count{font-size:12px;line-height:16px;color:var(--dsw-alias-label-tertiary,#7a8494);flex:none}
.dshwt-group-actions{display:none;align-items:center;gap:4px;flex:none}
[data-dshwt-tag-group]:hover .dshwt-group-actions,[data-dshwt-tag-group]:focus-within .dshwt-group-actions{display:inline-flex}
.dshwt-group-clear{border:none;background:none;color:var(--dsw-alias-label-tertiary,#7a8494);font-size:11px;line-height:16px;padding:2px 4px;border-radius:4px;cursor:pointer;flex:none}
.dshwt-group-clear:hover{color:var(--dsw-alias-label-error,#d33);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
[data-dshwt-tag-member]{--dsh-workspace-indent:12px!important}
[data-dshwt-group-collapsed]{display:none!important}

/* ---------- filtered-empty notice ---------- */
.dshwt-list-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 16px;color:var(--dsw-alias-label-tertiary,#7a8494);font-size:12px;line-height:18px;text-align:center}
.dshwt-list-empty-reset{border:none;background:none;color:var(--dsw-alias-label-link,#2563eb);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:4px}
.dshwt-list-empty-reset:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}

/* ---------- anchored popovers ---------- */
.dshwt-panel{box-sizing:border-box;display:flex;flex-direction:column;gap:2px;min-width:248px;max-width:330px;max-height:min(430px,70vh);padding:6px;color:var(--dsw-alias-label-primary,#1f2328)}
.dshwt-panel-title{padding:6px 8px 4px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#5b6470);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshwt-panel-list{display:flex;flex-direction:column;gap:1px;min-height:0;overflow-y:auto}
.dshwt-panel-row{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:none;border-radius:6px;background:none;color:inherit;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.dshwt-panel-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dshwt-panel-row[aria-pressed="true"]{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dshwt-panel-dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--dshwt-color)}
.dshwt-panel-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshwt-panel-check{flex:none;display:inline-flex;color:var(--dsw-alias-state-business-primary,#3b82f6)}
.dshwt-panel-hint{padding:8px;color:var(--dsw-alias-label-tertiary,#7a8494);font-size:12px;line-height:18px}
.dshwt-panel-input-row{padding:2px 4px 6px;display:flex;align-items:center;gap:6px}
.dshwt-panel-input-grow{flex:1;min-width:0;display:flex}
.dshwt-picker-colors{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:0 4px 6px}
.dshwt-picker-swatch{width:18px;height:18px;border-radius:50%;border:2px solid transparent;background:var(--dshwt-color);cursor:pointer;padding:0;flex:none}
.dshwt-picker-swatch[aria-pressed="true"]{border-color:var(--dsw-alias-label-primary,#1f2328)}
.dshwt-picker-custom{display:inline-flex;align-items:center;gap:4px;border:none;background:none;color:var(--dsw-alias-label-tertiary,#7a8494);font-size:11px;line-height:16px;padding:2px 4px;border-radius:4px;cursor:pointer;flex:none}
.dshwt-picker-custom:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));color:var(--dsw-alias-label-secondary,#5b6470)}
.dshwt-picker-custom[aria-pressed="true"]{color:var(--dsw-alias-label-primary,#1f2328);background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}
.dshwt-picker-custom-dot{width:14px;height:14px;border-radius:50%;flex:none;background:conic-gradient(from 0deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444);box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.dshwt-picker-custom-row{display:flex;align-items:center;gap:6px;padding:0 4px 6px}
.dshwt-picker-custom-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#7a8494)}
.dshwt-panel-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:2px;padding:6px 4px 2px;border-top:1px solid var(--dsw-alias-border-l3,#e3e7ee)}
.dshwt-dialog-body{margin:0;color:var(--dsw-alias-label-secondary,#5b6470);font-size:13px;line-height:20px}
.dshwt-panel-count{font-size:11px;color:var(--dsw-alias-label-tertiary,#7a8494);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---------- tag page ---------- */
.dshwt-page{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#1f2328)}
.dshwt-page-scroll{flex:1;min-height:0;overflow-y:auto}
.dshwt-page-content{box-sizing:border-box;max-width:760px;margin:0 auto;padding:40px 32px 72px}
.dshwt-page-title{margin:0;font-size:22px;line-height:30px;font-weight:600}
.dshwt-page-desc{margin:6px 0 26px;color:var(--dsw-alias-label-secondary,#5b6470);font-size:13px;line-height:20px}
.dshwt-add-form{display:flex;align-items:center;gap:8px;margin-bottom:22px}
.dshwt-add-form>label{flex:1;min-width:0}
.dshwt-add-swatch{width:30px;height:30px;border-radius:50%;border:2px solid color-mix(in srgb,var(--dshwt-color) 60%,transparent);background:var(--dshwt-color);flex:none;cursor:pointer;padding:0}
.dshwt-tag-list{display:flex;flex-direction:column;gap:8px}
.dshwt-tag-item{display:flex;flex-direction:column;gap:2px}
.dshwt-tag-row{display:flex;align-items:flex-start;gap:10px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l3,#e3e7ee);border-radius:10px;background:var(--dsw-alias-bg-layer-1,transparent)}
.dshwt-swatch{width:22px;height:22px;border-radius:50%;border:2px solid color-mix(in srgb,var(--dshwt-color) 60%,transparent);background:var(--dshwt-color);flex:none;cursor:pointer;padding:0;margin-top:3px}
.dshwt-tag-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.dshwt-usage{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#7a8494)}
.dshwt-tag-side{display:flex;align-items:center;gap:4px;flex:none}
.dshwt-error{margin:4px 0 0;color:var(--dsw-alias-label-error,#d33);font-size:12px;line-height:18px}
.dshwt-palette{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 0 2px}
.dshwt-palette-btn{width:18px;height:18px;border-radius:50%;border:1px solid rgba(0,0,0,.12);cursor:pointer;padding:0;background:var(--dshwt-color)}
.dshwt-palette-btn[aria-pressed="true"]{box-shadow:0 0 0 2px var(--dsw-alias-label-primary,#1f2328)}
.dshwt-color-input{width:24px;height:24px;padding:0;border:1px solid var(--dsw-alias-border-l3,#e3e7ee);border-radius:50%;background:none;cursor:pointer;overflow:hidden;appearance:none;-webkit-appearance:none}
.dshwt-color-input::-webkit-color-swatch-wrapper{padding:0}
.dshwt-color-input::-webkit-color-swatch{border:none;border-radius:50%}
.dshwt-delete-confirm{display:flex;align-items:center;gap:6px}
.dshwt-empty-state{padding:44px 16px;text-align:center;color:var(--dsw-alias-label-tertiary,#7a8494);font-size:13px;line-height:20px}
.dshwt-empty-state strong{display:block;color:var(--dsw-alias-label-secondary,#5b6470);font-size:14px;margin-bottom:6px}
.dshwt-banner{display:flex;align-items:center;gap:8px;margin:0 0 18px;padding:8px 12px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b45309) 10%,transparent);color:var(--dsw-alias-state-warn-primary,#b45309);font-size:12px;line-height:18px}
.dshwt-banner-spacer{flex:1}
`

/**
 * Add the plugin stylesheet to a document once.
 * @param doc - document to decorate.
 * @returns the stylesheet element (existing or new).
 */
export function ensurePluginStyles(doc: Document): HTMLStyleElement {
  const existing = doc.querySelector<HTMLStyleElement>(`style[data-plugin-css="${STYLE_ATTRIBUTE}"]`)
  if (existing !== null) return existing
  const style = doc.createElement('style')
  style.dataset['plugin'] = 'dsh-workspace-tags'
  style.dataset['pluginCss'] = STYLE_ATTRIBUTE
  style.textContent = CSS
  doc.head.append(style)
  return style
}
