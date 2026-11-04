/**
 * The tag protocol shared by the Host half and the browser half.
 *
 * Everything here is pure: no Node built-ins, no React, no DOM. The Host uses
 * {@link sanitizeStoredState} on every read (one bad record must never stop the
 * plugin from activating) and {@link validateWritePayload} on every write (the
 * durable copy is canonical and duplicate-free). The browser half reuses the
 * same rules so what it shows and what it sends agree.
 *
 * @module dsh-workspace-tags/protocol
 */
/** Record-level schema version. The storage domain version never changes. */
declare const TAG_STATE_SCHEMA_VERSION = 1;
/** Upper bound on stored tags; defensive, not a product limit. */
declare const MAX_TAGS = 200;
/** Maximum tag text length in Unicode code points. */
declare const MAX_TAG_TEXT = 24;
/** Maximum tag id length in code units. */
declare const MAX_TAG_ID = 64;
/** Host route the browser half reads and writes. */
declare const ROUTE_PATH = "/api/dsh-tags/state";
/** Document-relative path the browser half fetches (prefix-proxy safe). */
declare const CLIENT_ROUTE = "api/dsh-tags/state";
/** Global panel id shared by the `main` page and its sidebar row. */
declare const PANEL_ID = "workspace-tags";
/** Palette used for automatic tag colors and the manager's swatch row. */
declare const TAG_PALETTE: readonly ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'];
/** Six preset colours offered by the workspace annotation picker. */
declare const PICKER_PALETTE: readonly ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#64748b'];
/** One durable tag definition. */
interface Tag {
  /** Stable id (UUID); assignments reference this, never the text. */
  id: string;
  /** Display text, already trimmed and length-checked. */
  text: string;
  /** Lowercase `#rrggbb`. */
  color: string;
}
/** The complete durable document kept as the `dsh_tags` domain record. */
interface TagState {
  schemaVersion: number;
  /** Monotonic CAS counter; the Host increments on every write. */
  revision: number;
  tags: Tag[];
  /** Workspace id -> assigned tag ids (deduplicated). */
  assignments: Record<string, string[]>;
  updatedAt: string;
}
/** The writable slice of {@link TagState}. */
interface TagPayload {
  tags: Tag[];
  assignments: Record<string, string[]>;
}
/** Reasons a write can be refused; stable codes for the HTTP layer. */
type TagWriteErrorCode = 'invalid-body' | 'invalid-tag' | 'duplicate-tag' | 'too-many-tags';
/** Successful strict validation. */
interface TagWriteSuccess {
  ok: true;
  payload: TagPayload;
}
/** Refused strict validation. */
interface TagWriteFailure {
  ok: false;
  code: TagWriteErrorCode;
  message: string;
}
/** Result of strict write validation. */
type TagWriteResult = TagWriteSuccess | TagWriteFailure;
/** @returns a fresh `<now>` timestamp. */
declare function nowIso(): string;
/** @returns an empty, valid document. */
declare function emptyState(updatedAt?: string): TagState;
/** @returns true for a non-null, non-array object. */
declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * Collapse runs of whitespace and trim. NFC keeps visually identical names
 * from becoming two different tags.
 * @param input - raw user text.
 * @returns the canonical display text.
 */
declare function normalizeTagText(input: string): string;
/** @returns the text length in Unicode code points. */
declare function tagTextLength(text: string): number;
/** @returns the case-insensitive uniqueness key for a tag name. */
declare function tagKey(text: string): string;
/**
 * Accept `#rgb` and `#rrggbb`, canonicalize to lowercase `#rrggbb`.
 * @param input - candidate color.
 * @returns the canonical color, or null when invalid.
 */
declare function normalizeColor(input: unknown): string | null;
/**
 * Pick the first palette color not already in use, falling back to cycling.
 * @param tags - current tags.
 * @returns a `#rrggbb` color.
 */
declare function nextPaletteColor(tags: readonly Tag[]): string;
/**
 * Pick the first unused picker preset, falling back to cycling.
 * @param tags - current tags.
 * @returns a `#rrggbb` colour.
 */
declare function nextPickerColor(tags: readonly Tag[]): string;
/** @returns a stable tag id (UUID when the platform provides one). */
declare function createTagId(): string;
/** @returns the tags assigned to one workspace, in definition order. */
declare function tagsForWorkspace(state: Pick<TagState, 'tags' | 'assignments'>, workspaceId: string): Tag[];
/**
 * @returns true when the workspace has no assignment (show-all semantics) or
 * when at least one of its tags is selected.
 */
declare function workspaceMatchesFilter(state: Pick<TagState, 'assignments'>, workspaceId: string, filter: readonly string[]): boolean;
/**
 * Lenient reader: keeps every well-formed tag/assignment and silently drops the
 * rest. Used for stored records so a future or corrupted document cannot stop
 * the plugin from activating.
 * @param value - raw stored value.
 * @returns a canonical document.
 */
declare function sanitizeStoredState(value: unknown): TagState;
/**
 * Strict validator for a write: canonical text/colors, no duplicate ids or
 * names, only known tag ids in assignments.
 * @param value - parsed JSON body.
 * @returns the canonical payload or a stable failure code.
 */
declare function validateWritePayload(value: unknown): TagWriteResult;
export { CLIENT_ROUTE, MAX_TAGS, MAX_TAG_ID, MAX_TAG_TEXT, PANEL_ID, PICKER_PALETTE, ROUTE_PATH, TAG_PALETTE, TAG_STATE_SCHEMA_VERSION, Tag, TagPayload, TagState, TagWriteErrorCode, TagWriteFailure, TagWriteResult, TagWriteSuccess, createTagId, emptyState, isRecord, nextPaletteColor, nextPickerColor, normalizeColor, normalizeTagText, nowIso, sanitizeStoredState, tagKey, tagTextLength, tagsForWorkspace, validateWritePayload, workspaceMatchesFilter };