window.__ModuleLoader__.load({
	id: "dsh-workspace-tags",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/locales.ts
		/** Locale namespace owned by this plugin. */
		const NS = "workspaceTags";
		/** Simplified Chinese dictionary (key-set source of truth). */
		const zh = {
			"panel.tags": "标签",
			"page.title": "标签",
			"page.description": "用颜色标记工作区项目，然后在侧栏按标签筛选或分组。",
			"page.addPlaceholder": "输入标签名称",
			"page.add": "添加标签",
			"page.empty": "还没有标签",
			"page.emptyHint": "在上方输入名称添加第一个标签，然后到工作区行上标注。",
			"page.usage": "用于 {count} 个项目",
			"page.delete": "删除",
			"page.deleteConfirm": "删除「{name}」？它会从所有项目中移除。",
			"page.deleteCancel": "取消",
			"page.color": "标签颜色",
			"page.palette": "预设颜色",
			"page.customColor": "自定义颜色",
			"error.empty": "标签名称不能为空",
			"error.duplicate": "已存在同名标签",
			"error.tooLong": "名称最多 {max} 个字符",
			"error.save": "保存失败，请重试",
			"error.storage": "标签存储不可用，修改不会保存",
			"picker.title": "标注「{name}」",
			"picker.placeholder": "输入名称新建标签",
			"picker.clear": "清除",
			"picker.done": "完成",
			"picker.empty": "还没有标签，输入名称回车即可创建。",
			"filter.label": "按标签筛选",
			"filter.reset": "重置",
			"filter.count": "已选 {count} 个标签",
			"filter.none": "还没有标签",
			"group.label": "按标签",
			"group.untagged": "未标注",
			"group.collapse": "收起",
			"group.expand": "展开",
			"group.clear.label": "取消",
			"group.clear.aria": "取消「{name}」标签",
			"group.clear.title": "取消标签「{name}」？",
			"group.clear.body": "将从该分组的 {count} 个项目移除该标签。标签本身会保留，可稍后再次使用。",
			"group.clear.confirm": "确认取消",
			"group.clear.back": "返回",
			"common.close": "关闭",
			"row.add": "为「{name}」标注标签",
			"row.tags": "标签",
			"empty.filtered": "没有匹配所选标签的项目",
			"empty.reset": "清除筛选",
			"status.loading": "正在加载标签…",
			"status.retry": "重试",
			"overlay.label": "工作区标签"
		};
		/** English dictionary, key-for-key complete. */
		const en = {
			"panel.tags": "Tags",
			"page.title": "Tags",
			"page.description": "Tag Workspace projects with colors, then filter or group the sidebar by tag.",
			"page.addPlaceholder": "Tag name",
			"page.add": "Add tag",
			"page.empty": "No tags yet",
			"page.emptyHint": "Add the first tag above, then annotate a Workspace row in the sidebar.",
			"page.usage": "Used by {count} projects",
			"page.delete": "Delete",
			"page.deleteConfirm": "Delete \"{name}\"? It will be removed from every project.",
			"page.deleteCancel": "Cancel",
			"page.color": "Tag color",
			"page.palette": "Preset colors",
			"page.customColor": "Custom color",
			"error.empty": "Tag name cannot be empty",
			"error.duplicate": "A tag with this name already exists",
			"error.tooLong": "Keep it to {max} characters or fewer",
			"error.save": "Couldn't save, please retry",
			"error.storage": "Tag storage is unavailable; changes will not be saved",
			"picker.title": "Tag \"{name}\"",
			"picker.placeholder": "Type a name to create a tag",
			"picker.clear": "Clear",
			"picker.done": "Done",
			"picker.empty": "No tags yet. Type a name and press Enter to create one.",
			"filter.label": "Filter by tag",
			"filter.reset": "Reset",
			"filter.count": "{count} tags selected",
			"filter.none": "No tags yet",
			"group.label": "By tag",
			"group.untagged": "Untagged",
			"group.collapse": "Collapse",
			"group.expand": "Expand",
			"group.clear.label": "Remove",
			"group.clear.aria": "Remove tag \"{name}\"",
			"group.clear.title": "Remove tag \"{name}\"?",
			"group.clear.body": "This removes the tag from {count} projects in this group. The tag itself is kept and can be used again.",
			"group.clear.confirm": "Remove",
			"group.clear.back": "Back",
			"common.close": "Close",
			"row.add": "Tag \"{name}\"",
			"row.tags": "Tags",
			"empty.filtered": "No projects match the selected tags",
			"empty.reset": "Clear filter",
			"status.loading": "Loading tags…",
			"status.retry": "Retry",
			"overlay.label": "Workspace tags"
		};
		/** Document-relative path the browser half fetches (prefix-proxy safe). */
		const CLIENT_ROUTE = "api/dsh-tags/state";
		/** Global panel id shared by the `main` page and its sidebar row. */
		const PANEL_ID = "workspace-tags";
		/** Palette used for automatic tag colors and the manager's swatch row. */
		const TAG_PALETTE = [
			"#ef4444",
			"#f97316",
			"#eab308",
			"#22c55e",
			"#14b8a6",
			"#3b82f6",
			"#6366f1",
			"#a855f7",
			"#ec4899",
			"#64748b"
		];
		const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
		const COLOR_SHORT_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
		const WHITESPACE = /\s+/gu;
		/** @returns a fresh `<now>` timestamp. */
		function nowIso() {
			return (/* @__PURE__ */ new Date()).toISOString();
		}
		/** @returns an empty, valid document. */
		function emptyState(updatedAt = nowIso()) {
			return {
				schemaVersion: 1,
				revision: 0,
				tags: [],
				assignments: {},
				updatedAt
			};
		}
		/** @returns true for a non-null, non-array object. */
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Collapse runs of whitespace and trim. NFC keeps visually identical names
		* from becoming two different tags.
		* @param input - raw user text.
		* @returns the canonical display text.
		*/
		function normalizeTagText(input) {
			return input.replace(WHITESPACE, " ").trim().normalize("NFC");
		}
		/** @returns the text length in Unicode code points. */
		function tagTextLength(text) {
			return [...text].length;
		}
		/** @returns the case-insensitive uniqueness key for a tag name. */
		function tagKey(text) {
			return normalizeTagText(text).toLowerCase();
		}
		/**
		* Accept `#rgb` and `#rrggbb`, canonicalize to lowercase `#rrggbb`.
		* @param input - candidate color.
		* @returns the canonical color, or null when invalid.
		*/
		function normalizeColor(input) {
			if (typeof input !== "string") return null;
			const raw = input.trim();
			const short = COLOR_SHORT_PATTERN.exec(raw);
			if (short !== null) {
				const r = short[1] ?? "";
				const g = short[2] ?? "";
				const b = short[3] ?? "";
				return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
			}
			return COLOR_PATTERN.test(raw) ? raw.toLowerCase() : null;
		}
		/**
		* Pick the first palette color not already in use, falling back to cycling.
		* @param tags - current tags.
		* @returns a `#rrggbb` color.
		*/
		function nextPaletteColor(tags) {
			const used = new Set(tags.map((tag) => tag.color));
			for (const color of TAG_PALETTE) if (!used.has(color)) return color;
			const index = tags.length % TAG_PALETTE.length;
			return TAG_PALETTE[index] ?? TAG_PALETTE[0];
		}
		/** @returns a stable tag id (UUID when the platform provides one). */
		function createTagId() {
			const cryptoLike = globalThis.crypto;
			if (typeof cryptoLike?.randomUUID === "function") return cryptoLike.randomUUID();
			return `tag-${String(Date.now())}-${Math.random().toString(36).slice(2, 10)}`;
		}
		/** @returns the tags assigned to one workspace, in definition order. */
		function tagsForWorkspace(state, workspaceId) {
			const assigned = state.assignments[workspaceId];
			if (assigned === void 0 || assigned.length === 0) return [];
			const byId = new Map(state.tags.map((tag) => [tag.id, tag]));
			const result = [];
			for (const id of assigned) {
				const tag = byId.get(id);
				if (tag !== void 0) result.push(tag);
			}
			return result;
		}
		/**
		* @returns true when the workspace has no assignment (show-all semantics) or
		* when at least one of its tags is selected.
		*/
		function workspaceMatchesFilter(state, workspaceId, filter) {
			if (filter.length === 0) return true;
			const assigned = state.assignments[workspaceId];
			if (assigned === void 0) return false;
			return assigned.some((id) => filter.includes(id));
		}
		/**
		* Lenient reader: keeps every well-formed tag/assignment and silently drops the
		* rest. Used for stored records so a future or corrupted document cannot stop
		* the plugin from activating.
		* @param value - raw stored value.
		* @returns a canonical document.
		*/
		function sanitizeStoredState(value) {
			const base = emptyState();
			if (!isRecord(value)) return base;
			const revision = typeof value["revision"] === "number" && Number.isInteger(value["revision"]) && value["revision"] >= 0 ? value["revision"] : 0;
			const updatedAt = typeof value["updatedAt"] === "string" ? value["updatedAt"] : base.updatedAt;
			const tags = [];
			const ids = /* @__PURE__ */ new Set();
			const keys = /* @__PURE__ */ new Set();
			const rawTags = value["tags"];
			if (Array.isArray(rawTags)) for (const candidate of rawTags) {
				if (tags.length >= 200) break;
				if (!isRecord(candidate)) continue;
				const id = candidate["id"];
				const text = candidate["text"];
				const color = normalizeColor(candidate["color"]);
				if (typeof id !== "string" || id.length === 0 || id.length > 64) continue;
				if (typeof text !== "string") continue;
				if (color === null) continue;
				const normalized = normalizeTagText(text);
				const length = tagTextLength(normalized);
				if (length === 0 || length > 24) continue;
				const key = tagKey(normalized);
				if (ids.has(id) || keys.has(key)) continue;
				ids.add(id);
				keys.add(key);
				tags.push({
					id,
					text: normalized,
					color
				});
			}
			const assignments = {};
			const rawAssignments = value["assignments"];
			if (isRecord(rawAssignments)) for (const [workspaceId, rawIds] of Object.entries(rawAssignments)) {
				if (workspaceId.length === 0) continue;
				if (!Array.isArray(rawIds)) continue;
				const seen = /* @__PURE__ */ new Set();
				const kept = [];
				for (const id of rawIds) {
					if (typeof id !== "string" || !ids.has(id) || seen.has(id)) continue;
					seen.add(id);
					kept.push(id);
				}
				if (kept.length > 0) assignments[workspaceId] = kept;
			}
			return {
				schemaVersion: 1,
				revision,
				tags,
				assignments,
				updatedAt
			};
		}
		// src/client/store.ts
		/**
		* Browser-side tag state.
		*
		* The store is created inside the plugin's `apply` closure (never at module
		* scope) and handed to the slot components through the registration's `inject`
		* face and to the DOM decorator directly. Snapshots are immutable so a
		* `useSyncExternalStore` selector can compare them by identity.
		*
		* @module dsh-workspace-tags/client/store
		*/
		const EMPTY_SNAPSHOT = {
			hydrated: false,
			loading: true,
			syncError: null,
			tags: [],
			assignments: {},
			filter: [],
			groupByTag: false,
			filterAnchor: null,
			picker: null,
			collapsedGroups: [],
			groupClear: null,
			revision: 0
		};
		/**
		* Validate one candidate name against the current tags (ignoring the tag being
		* renamed, if any).
		* @param raw - user input.
		* @param tags - current tags.
		* @param exceptId - tag id allowed to keep its current name.
		*/
		function checkName(raw, tags, exceptId) {
			const text = normalizeTagText(raw);
			const length = tagTextLength(text);
			if (length === 0) return {
				ok: false,
				code: "empty"
			};
			if (length > 24) return {
				ok: false,
				code: "too-long"
			};
			const key = tagKey(text);
			for (const tag of tags) {
				if (tag.id === exceptId) continue;
				if (tagKey(tag.text) === key) return {
					ok: false,
					code: "duplicate"
				};
			}
			return {
				ok: true,
				text
			};
		}
		/** @returns the assignment map without the given tag id. */
		function withoutTag(assignments, tagId) {
			const next = {};
			for (const [workspaceId, ids] of Object.entries(assignments)) {
				const kept = ids.filter((id) => id !== tagId);
				if (kept.length > 0) next[workspaceId] = kept;
			}
			return next;
		}
		/**
		* Create the browser store.
		* @returns the store face used by components and the DOM layer.
		*/
		function createClientTagStore() {
			let snapshot = EMPTY_SNAPSHOT;
			const listeners = /* @__PURE__ */ new Set();
			const set = (patch) => {
				snapshot = {
					...snapshot,
					...patch
				};
				for (const listener of listeners) listener();
			};
			const hydrateWith = (state) => {
				const tagIds = new Set(state.tags.map((tag) => tag.id));
				set({
					hydrated: true,
					loading: false,
					syncError: null,
					tags: state.tags,
					assignments: state.assignments,
					revision: state.revision,
					filter: snapshot.filter.filter((id) => tagIds.has(id)),
					collapsedGroups: snapshot.collapsedGroups.filter((key) => key === "untagged" || tagIds.has(key)),
					groupClear: null
				});
			};
			const addTag = (raw, color) => {
				const checked = checkName(raw, snapshot.tags);
				if (!checked.ok) return checked;
				const normalizedColor = normalizeColor(color ?? "") ?? nextPaletteColor(snapshot.tags);
				const tag = {
					id: createTagId(),
					text: checked.text,
					color: normalizedColor
				};
				set({ tags: [...snapshot.tags, tag] });
				return {
					ok: true,
					tag
				};
			};
			const renameTag = (id, raw) => {
				const current = snapshot.tags.find((tag) => tag.id === id);
				if (current === void 0) return {
					ok: false,
					code: "empty"
				};
				const checked = checkName(raw, snapshot.tags, id);
				if (!checked.ok) return checked;
				const tag = {
					...current,
					text: checked.text
				};
				set({ tags: snapshot.tags.map((candidate) => candidate.id === id ? tag : candidate) });
				return {
					ok: true,
					tag
				};
			};
			const recolorTag = (id, color) => {
				const normalized = normalizeColor(color);
				if (normalized === null) return false;
				if (!snapshot.tags.some((tag) => tag.id === id)) return false;
				set({ tags: snapshot.tags.map((tag) => tag.id === id ? {
					...tag,
					color: normalized
				} : tag) });
				return true;
			};
			const removeTag = (id) => {
				set({
					tags: snapshot.tags.filter((tag) => tag.id !== id),
					assignments: withoutTag(snapshot.assignments, id),
					filter: snapshot.filter.filter((candidate) => candidate !== id),
					collapsedGroups: snapshot.collapsedGroups.filter((key) => key !== id),
					groupClear: snapshot.groupClear?.tagId === id ? null : snapshot.groupClear
				});
			};
			const assign = (workspaceId, tagId, assigned) => {
				if (workspaceId.length === 0) return;
				if (!snapshot.tags.some((tag) => tag.id === tagId)) return;
				const current = snapshot.assignments[workspaceId] ?? [];
				if (assigned === current.includes(tagId)) return;
				const ids = assigned ? [...current, tagId] : current.filter((id) => id !== tagId);
				const assignments = { ...snapshot.assignments };
				if (ids.length > 0) assignments[workspaceId] = ids;
				else delete assignments[workspaceId];
				set({ assignments });
			};
			return {
				hydrate: hydrateWith,
				applyServerState: hydrateWith,
				setRevision: (revision) => {
					if (snapshot.revision === revision) return;
					set({ revision });
				},
				setLoading: (loading) => set({ loading }),
				setSyncError: (syncError) => set({ syncError }),
				addTag,
				renameTag,
				recolorTag,
				removeTag,
				assign,
				clearAssignments: (workspaceId) => {
					if (snapshot.assignments[workspaceId] === void 0) return;
					const assignments = { ...snapshot.assignments };
					delete assignments[workspaceId];
					set({ assignments });
				},
				toggleFilter: (tagId) => {
					const filter = snapshot.filter.includes(tagId) ? snapshot.filter.filter((id) => id !== tagId) : [...snapshot.filter, tagId];
					set({ filter });
				},
				resetFilter: () => {
					if (snapshot.filter.length === 0) return;
					set({ filter: [] });
				},
				setGroupByTag: (groupByTag) => {
					if (snapshot.groupByTag === groupByTag) return;
					set({ groupByTag });
				},
				openFilter: (anchor) => set({
					filterAnchor: anchor,
					picker: null
				}),
				closeFilter: () => {
					if (snapshot.filterAnchor === null) return;
					set({ filterAnchor: null });
				},
				openPicker: (workspaceId, title, anchor) => set({
					picker: {
						workspaceId,
						title,
						anchor
					},
					filterAnchor: null
				}),
				closePicker: () => {
					if (snapshot.picker === null) return;
					set({ picker: null });
				},
				toggleGroupCollapsed: (key) => {
					const collapsedGroups = snapshot.collapsedGroups.includes(key) ? snapshot.collapsedGroups.filter((candidate) => candidate !== key) : [...snapshot.collapsedGroups, key];
					set({ collapsedGroups });
				},
				requestGroupClear: (tagId, tagName, workspaceIds) => {
					const unique = [...new Set(workspaceIds)];
					if (unique.length === 0) return;
					set({
						groupClear: {
							tagId,
							tagName,
							workspaceIds: unique
						},
						filterAnchor: null,
						picker: null
					});
				},
				dismissGroupClear: () => {
					if (snapshot.groupClear === null) return;
					set({ groupClear: null });
				},
				confirmGroupClear: () => {
					const request = snapshot.groupClear;
					if (request === null) return;
					let changed = false;
					const assignments = { ...snapshot.assignments };
					for (const workspaceId of request.workspaceIds) {
						const current = assignments[workspaceId];
						if (current === void 0) continue;
						const kept = current.filter((id) => id !== request.tagId);
						if (kept.length === current.length) continue;
						changed = true;
						if (kept.length > 0) assignments[workspaceId] = kept;
						else delete assignments[workspaceId];
					}
					set(changed ? {
						assignments,
						groupClear: null
					} : { groupClear: null });
				},
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				tagsOf: (workspaceId) => tagsForWorkspace(snapshot, workspaceId),
				matchesFilter: (workspaceId) => workspaceMatchesFilter(snapshot, workspaceId, snapshot.filter),
				payload: () => ({
					tags: snapshot.tags,
					assignments: snapshot.assignments
				}),
				revision: () => snapshot.revision,
				nextColor: () => nextPaletteColor(snapshot.tags)
			};
		}
		// src/client/sync.ts
		/**
		* Browser <-> Host persistence for the tag document.
		*
		* The Host route is an authenticated `/api` Fetch route. Reads hydrate the
		* store; writes are serialized so a burst of toggles becomes at most one
		* in-flight request plus one queued latest document. A stale `revision`
		* (another window wrote first) is resolved by re-reading the Host document.
		*
		* @module dsh-workspace-tags/client/sync
		*/
		const RETRY_LIMIT = 3;
		const RETRY_BASE_MS = 800;
		/** @returns the canonical identity of a writable payload. */
		function payloadKey(payload) {
			return JSON.stringify({
				tags: payload.tags,
				assignments: payload.assignments
			});
		}
		/** @returns the writable slice of a canonical document. */
		function payloadOf(state) {
			return {
				tags: state.tags,
				assignments: state.assignments
			};
		}
		/**
		* @returns the parsed document, or null when the envelope is not a success.
		*/
		function readState(payload) {
			if (!isRecord(payload) || payload["ok"] !== true) return null;
			const state = payload["state"];
			return state === void 0 ? null : sanitizeStoredState(state);
		}
		/**
		* Create the sync driver.
		* @param store - the browser store to hydrate and persist.
		* @returns the driver.
		*/
		function createTagSync(store) {
			let disposed = false;
			let unsubscribe = null;
			let controller = null;
			let retryTimer = null;
			let inflight = false;
			let pending = false;
			let attempts = 0;
			let lastKey = "";
			const clearRetry = () => {
				if (retryTimer !== null) {
					clearTimeout(retryTimer);
					retryTimer = null;
				}
			};
			const scheduleRetry = () => {
				if (disposed || retryTimer !== null || attempts >= RETRY_LIMIT) return;
				attempts += 1;
				retryTimer = setTimeout(() => {
					retryTimer = null;
					save();
				}, RETRY_BASE_MS * attempts);
			};
			const read = async () => {
				controller?.abort();
				controller = new AbortController();
				let response;
				try {
					response = await fetch(CLIENT_ROUTE, {
						method: "GET",
						headers: { accept: "application/json" },
						credentials: "same-origin",
						cache: "no-store",
						signal: controller.signal
					});
				} catch {
					if (!disposed) store.setSyncError("network");
					return null;
				}
				if (response.status === 503) {
					store.setSyncError("storage");
					store.setLoading(false);
					return null;
				}
				if (!response.ok) {
					store.setSyncError("network");
					store.setLoading(false);
					return null;
				}
				let payload;
				try {
					payload = await response.json();
				} catch {
					store.setSyncError("network");
					store.setLoading(false);
					return null;
				}
				const state = readState(payload);
				if (state === null) {
					store.setSyncError("network");
					store.setLoading(false);
					return null;
				}
				return state;
			};
			const load = async () => {
				store.setLoading(true);
				const state = await read();
				if (disposed || state === null) return;
				lastKey = payloadKey(payloadOf(state));
				attempts = 0;
				store.hydrate(state);
			};
			const reloadAfterConflict = async () => {
				const state = await read();
				if (disposed || state === null) return;
				lastKey = payloadKey(payloadOf(state));
				store.applyServerState(state);
			};
			const write = async (payload, ifRevision) => {
				controller?.abort();
				controller = new AbortController();
				let response;
				try {
					response = await fetch(CLIENT_ROUTE, {
						method: "POST",
						headers: {
							accept: "application/json",
							"content-type": "application/json"
						},
						credentials: "same-origin",
						cache: "no-store",
						signal: controller.signal,
						body: JSON.stringify({
							ifRevision,
							...payload
						})
					});
				} catch {
					return {
						ok: false,
						code: "network"
					};
				}
				let body;
				try {
					body = await response.json();
				} catch {
					body = null;
				}
				if (response.status === 409) {
					const error = isRecord(body) ? body["error"] : null;
					return {
						ok: false,
						code: "conflict",
						revision: isRecord(error) && typeof error["revision"] === "number" ? error["revision"] : 0
					};
				}
				if (response.status === 503) return {
					ok: false,
					code: "storage"
				};
				if (response.status === 400) return {
					ok: false,
					code: "invalid-body"
				};
				if (!response.ok) return {
					ok: false,
					code: "network"
				};
				const state = readState(body);
				return state === null ? {
					ok: false,
					code: "network"
				} : {
					ok: true,
					state
				};
			};
			const save = async () => {
				if (disposed) return;
				if (!store.getSnapshot().hydrated) return;
				if (inflight) {
					pending = true;
					return;
				}
				const current = store.getSnapshot();
				const payload = store.payload();
				const key = payloadKey(payload);
				if (key === lastKey) return;
				inflight = true;
				try {
					const outcome = await write(payload, current.revision);
					if (disposed) return;
					if (outcome.ok) {
						lastKey = key;
						attempts = 0;
						store.setSyncError(null);
						store.setRevision(outcome.state.revision);
					} else if (outcome.code === "conflict") {
						store.setSyncError("conflict");
						await reloadAfterConflict();
					} else if (outcome.code === "storage") store.setSyncError("storage");
					else {
						store.setSyncError("network");
						scheduleRetry();
					}
				} finally {
					inflight = false;
					if (pending && !disposed) {
						pending = false;
						save();
					}
				}
			};
			const onChange = () => {
				if (disposed) return;
				if (!store.getSnapshot().hydrated) return;
				if (payloadKey(store.payload()) === lastKey) return;
				save();
			};
			return {
				start: () => {
					if (disposed) return;
					unsubscribe = store.subscribe(onChange);
					load();
				},
				retry: () => {
					if (disposed) return;
					clearRetry();
					attempts = 0;
					if (!store.getSnapshot().hydrated) load();
					else save();
				},
				dispose: () => {
					disposed = true;
					clearRetry();
					unsubscribe?.();
					unsubscribe = null;
					controller?.abort();
					controller = null;
				}
			};
		}
		// src/client/dom/chips.ts
		/** Marks the plugin-owned chip strip. */
		const CHIPS_ATTRIBUTE = "data-dshwt-chips";
		/** @returns the signature used to skip redundant re-renders. */
		function chipSignature(tags) {
			return tags.map((tag) => `${tag.id}:${tag.text}:${tag.color}`).join("|");
		}
		/**
		* Ensure the chip strip exists immediately after the project text.
		* @param row - workspace row.
		* @param title - the project text element (or null when the markup changed).
		* @returns the strip.
		*/
		function ensureChipsHost(row, title) {
			const existing = row.querySelector(`:scope > [${CHIPS_ATTRIBUTE}]`);
			if (existing !== null) return existing;
			const host = row.ownerDocument.createElement("span");
			host.setAttribute(CHIPS_ATTRIBUTE, "");
			host.setAttribute("aria-hidden", "true");
			host.draggable = false;
			host.className = "dshwt-chips";
			if (title !== null) title.after(host);
			else row.append(host);
			return host;
		}
		/**
		* Render the strip in place.
		* @param host - strip element from {@link ensureChipsHost}.
		* @param tags - tags assigned to the workspace, in definition order.
		* @param t - localized translator (for the `+N` tooltip).
		*/
		function renderChips(host, tags, t) {
			const signature = chipSignature(tags);
			if (host.dataset["dshwtSignature"] === signature) return;
			host.dataset["dshwtSignature"] = signature;
			host.replaceChildren();
			if (tags.length === 0) {
				host.removeAttribute(CHIPS_ATTRIBUTE);
				host.remove();
				return;
			}
			host.setAttribute(CHIPS_ATTRIBUTE, "");
			const doc = host.ownerDocument;
			for (const tag of tags.slice(0, 1)) host.append(createChip(doc, tag));
			const hidden = tags.length - 1;
			if (hidden > 0) {
				const more = doc.createElement("span");
				more.className = "dshwt-chip dshwt-chip-more";
				more.textContent = `+${String(hidden)}`;
				more.title = tags.map((tag) => tag.text).join(" · ");
				more.setAttribute("data-dshwt-more", "");
				host.append(more);
			}
			host.setAttribute("title", tags.map((tag) => tag.text).join(" · "));
			host.setAttribute("aria-label", `${t("row.tags")}: ${tags.map((tag) => tag.text).join(", ")}`);
		}
		/**
		* @param doc - owner document.
		* @param tag - the tag to render.
		* @returns one chip element.
		*/
		function createChip(doc, tag) {
			const chip = doc.createElement("span");
			chip.className = "dshwt-chip";
			chip.setAttribute("data-dshwt-chip", "");
			chip.setAttribute("data-dshwt-tag-id", tag.id);
			chip.style.setProperty("--dshwt-color", tag.color);
			chip.title = tag.text;
			const dot = doc.createElement("span");
			dot.className = "dshwt-chip-dot";
			const label = doc.createElement("span");
			label.className = "dshwt-chip-label";
			label.textContent = tag.text;
			chip.append(dot, label);
			return chip;
		}
		// src/client/dom/selectors.ts
		/**
		* Every DOM anchor the plugin depends on, in one place.
		*
		* ui-workspace owns the sidebar list and exposes no row/header/view-menu slot,
		* so this plugin decorates and reorders the rendered DOM. CSS-module hashes are
		* build artifacts (`JoiKIa_`, `Kjh-qa_`, …); the author-written suffix after the
		* underscore is what is stable, hence `[class*="_projectRow"]`-style selectors.
		* Structural anchors (`[role="tree"]`, `data-row-key`) are preferred wherever
		* they exist so a hashed-name change cannot break row identity.
		*
		* @module dsh-workspace-tags/client/dom/selectors
		*/
		/** Stable DOM selectors used by the decorator and the grouping layer. */
		const SELECTORS = {
			sectionHeader: "[class*=\"_sectionHeader\"]",
			headerActions: "[class*=\"_headerActions\"]",
			tree: "[role=\"tree\"]",
			searchTree: "[class*=\"_searchTree\"]",
			flatList: "[class*=\"_flatList\"]",
			groupSection: "[class*=\"_groupSection\"]",
			workspaceRow: "[data-row-key^=\"workspace:\"]",
			sessionRow: "[data-row-key^=\"session:\"]",
			overflowRow: "[data-row-key^=\"overflow:\"]",
			projectText: "[class*=\"_projectText\"]",
			rowActions: "[class*=\"_rowActions\"]",
			viewMenu: "[class*=\"_viewOptionsMenu\"]",
			menuItemLabel: "[class*=\"_itemLabel\"]",
			menuItemIcon: "[class*=\"_itemIcon\"]",
			menuSelected: /(^|\s)[^\s]*_selected(\s|$)/
		};
		/** @returns the sidebar browser root (the section header's parent). */
		function findSidebarRoot(doc) {
			const root = doc.querySelector(SELECTORS.sectionHeader)?.parentElement ?? null;
			return root instanceof HTMLElement ? root : null;
		}
		/** @returns the workspace region's action strip, when rendered. */
		function findHeaderActions(root) {
			const actions = root.querySelector(SELECTORS.sectionHeader)?.querySelector(`:scope > div${SELECTORS.headerActions}`) ?? null;
			return actions instanceof HTMLElement ? actions : null;
		}
		/** @returns the primary workspace list tree (never the search-results tree). */
		function findTree(root) {
			for (const tree of root.querySelectorAll(SELECTORS.tree)) if (!tree.matches(SELECTORS.searchTree)) return tree;
			return null;
		}
		/** @returns true while the sidebar renders its collapsed rail. */
		function isRail(root) {
			for (const token of root.classList) if (token.endsWith("_rail")) return true;
			return false;
		}
		/**
		* @param row - a workspace tree row.
		* @returns the workspace id encoded in `data-row-key`, or null.
		*/
		function workspaceIdOf(row) {
			const key = row.getAttribute("data-row-key");
			if (key === null || !key.startsWith("workspace:")) return null;
			return key.slice(10);
		}
		/**
		* The workspace row a group section owns. Child workspaces render after the
		* section's own row, so the first descendant is the section's own row.
		* @param section - one `groupSection`.
		* @returns its own row, when present.
		*/
		function ownWorkspaceRow(section) {
			const row = section.querySelector(SELECTORS.workspaceRow);
			return row instanceof HTMLElement ? row : null;
		}
		// src/client/dom/grouping.ts
		/** Marks a grouping row the plugin owns. */
		const GROUP_HEADER_ATTRIBUTE = "data-dshwt-tag-group";
		/** Marks the tree while grouping is active. */
		const GROUPING_ATTRIBUTE = "data-dshwt-group-by-tag";
		/** Marks a group section as a member of a rendered tag group. */
		const GROUP_MEMBER_ATTRIBUTE = "data-dshwt-tag-member";
		/** Marks a member section whose group is collapsed. */
		const GROUP_COLLAPSED_ATTRIBUTE = "data-dshwt-group-collapsed";
		/** Stores the last rendered grouping signature so repaints are no-ops. */
		const GROUP_SIGNATURE = "dshwtGroupSig";
		/** The native-style disclosure chevron (rotated when expanded). */
		const CHEVRON_SVG = "<svg viewBox=\"0 0 16 16\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m6 3 5 5-5 5\"/></svg>";
		/**
		* Apply the tag filter to every section, hiding visually only.
		* @param tree - the workspace list tree.
		* @param state - tags and assignments.
		* @param filter - selected tag ids; empty means show everything.
		* @returns one view per section, in DOM order.
		*/
		function paintSections(tree, state, filter) {
			const sections = Array.from(tree.querySelectorAll(SELECTORS.groupSection));
			const selfMatch = /* @__PURE__ */ new Map();
			const ids = /* @__PURE__ */ new Map();
			for (const section of sections) {
				const row = ownWorkspaceRow(section);
				const workspaceId = row === null ? "" : workspaceIdOf(row) ?? "";
				ids.set(section, workspaceId);
				const assigned = workspaceId === "" ? [] : state.assignments[workspaceId] ?? [];
				selfMatch.set(section, filter.length === 0 || workspaceId !== "" && assigned.some((id) => filter.includes(id)));
			}
			const views = [];
			for (const section of sections) {
				const ownMatch = selfMatch.get(section) === true;
				const descendantMatch = ownMatch ? true : Array.from(section.querySelectorAll(SELECTORS.groupSection)).some((nested) => nested !== section && selfMatch.get(nested) === true);
				const visible = ownMatch || descendantMatch;
				const ownRowHidden = visible && !ownMatch;
				section.toggleAttribute("data-dshwt-hidden", !visible);
				const row = ownWorkspaceRow(section);
				if (row !== null) row.toggleAttribute("data-dshwt-self-hidden", ownRowHidden);
				for (const child of Array.from(section.children)) {
					if (!(child instanceof HTMLElement)) continue;
					if (child.matches(SELECTORS.sessionRow) || child.matches(SELECTORS.overflowRow)) child.toggleAttribute("data-dshwt-self-hidden", ownRowHidden);
				}
				views.push({
					section,
					workspaceId: ids.get(section) ?? "",
					selfMatch: ownMatch,
					visible,
					ownRowHidden
				});
			}
			return views;
		}
		/**
		* Render tag group rows, visual order and collapse state. No-op when the same
		* layout is already present.
		* @param tree - the workspace list tree.
		* @param state - tags, assignments, grouping flag and collapsed keys.
		* @param views - result of {@link paintSections}.
		* @param t - localized translator.
		*/
		function paintGrouping(tree, state, views, t) {
			if (!state.groupByTag || state.tags.length === 0) {
				clearGrouping(tree);
				return;
			}
			const collapsed = new Set(state.collapsedGroups);
			const visible = views.filter((view) => view.visible && !view.ownRowHidden && view.workspaceId !== "");
			const tagIds = new Set(state.tags.map((tag) => tag.id));
			const groups = state.tags.map((tag) => {
				const members = [];
				for (const view of visible) if ((state.assignments[view.workspaceId] ?? []).find((id) => tagIds.has(id)) === tag.id) members.push(view);
				return {
					tag,
					members
				};
			}).filter((group) => group.members.length > 0);
			const untagged = visible.filter((view) => {
				return !(state.assignments[view.workspaceId] ?? []).some((id) => tagIds.has(id));
			});
			const signature = [
				"v2",
				`collapsed:${[...collapsed].sort().join(",")}`,
				...groups.map((group) => `${group.tag.id}:${group.tag.text}:${group.tag.color}:${group.members.map((m) => m.workspaceId).join(",")}`),
				`untagged:${untagged.map((m) => m.workspaceId).join(",")}`,
				t("group.untagged")
			].join("|");
			if (tree.dataset[GROUP_SIGNATURE] === signature) return;
			clearGrouping(tree);
			tree.setAttribute(GROUPING_ATTRIBUTE, "");
			tree.dataset[GROUP_SIGNATURE] = signature;
			let order = 0;
			const ordered = /* @__PURE__ */ new Set();
			const doc = tree.ownerDocument;
			const appendHeader = (key, label, color, count, isCollapsed) => {
				const row = doc.createElement("div");
				row.className = "dshwt-group-row";
				row.setAttribute(GROUP_HEADER_ATTRIBUTE, "");
				row.setAttribute("data-dshwt-group-key", key);
				row.setAttribute("data-dshwt-group-toggle", "");
				row.setAttribute("role", "treeitem");
				row.setAttribute("tabindex", "0");
				row.setAttribute("aria-expanded", String(!isCollapsed));
				if (color === null) row.classList.add("dshwt-group-untagged");
				else row.style.setProperty("--dshwt-color", color);
				row.style.order = String(order);
				order += 1;
				const glyph = doc.createElement("span");
				glyph.className = "dshwt-group-glyph";
				const dot = doc.createElement("span");
				dot.className = "dshwt-group-dot";
				const chevron = doc.createElement("span");
				chevron.className = "dshwt-group-chevron";
				chevron.innerHTML = CHEVRON_SVG;
				glyph.append(dot, chevron);
				const title = doc.createElement("span");
				title.className = "dshwt-group-title";
				title.textContent = label;
				const counter = doc.createElement("span");
				counter.className = "dshwt-group-count";
				counter.textContent = String(count);
				row.append(glyph, title, counter);
				if (key !== "untagged") {
					const actions = doc.createElement("span");
					actions.className = "dshwt-group-actions";
					const clear = doc.createElement("button");
					clear.type = "button";
					clear.className = "dshwt-group-clear";
					clear.setAttribute("data-dshwt-group-clear", "");
					clear.textContent = t("group.clear.label");
					const aria = t("group.clear.aria", { name: label });
					clear.setAttribute("aria-label", aria);
					clear.title = aria;
					actions.append(clear);
					row.append(actions);
				}
				tree.append(row);
			};
			const markMembers = (members, key) => {
				const isCollapsed = collapsed.has(key);
				for (const view of members) {
					view.section.setAttribute(GROUP_MEMBER_ATTRIBUTE, "");
					view.section.toggleAttribute(GROUP_COLLAPSED_ATTRIBUTE, isCollapsed);
				}
			};
			for (const group of groups) {
				appendHeader(group.tag.id, group.tag.text, group.tag.color, group.members.length, collapsed.has(group.tag.id));
				markMembers(group.members, group.tag.id);
				for (const view of group.members) {
					view.section.style.order = String(order);
					order += 1;
					ordered.add(view.section);
				}
			}
			if (untagged.length > 0) {
				appendHeader("untagged", t("group.untagged"), null, untagged.length, collapsed.has("untagged"));
				markMembers(untagged, "untagged");
				for (const view of untagged) {
					view.section.style.order = String(order);
					order += 1;
					ordered.add(view.section);
				}
			}
			for (const view of views) {
				if (ordered.has(view.section)) continue;
				view.section.style.order = String(order);
				order += 1;
			}
		}
		/**
		* Remove grouping rows, order, member markers and collapse markers.
		* @param tree - the workspace list tree.
		*/
		function clearGrouping(tree) {
			let changed = false;
			for (const header of Array.from(tree.querySelectorAll(`:scope > [${GROUP_HEADER_ATTRIBUTE}]`))) {
				header.remove();
				changed = true;
			}
			if (tree.hasAttribute(GROUPING_ATTRIBUTE)) {
				tree.removeAttribute(GROUPING_ATTRIBUTE);
				changed = true;
			}
			for (const section of Array.from(tree.querySelectorAll(SELECTORS.groupSection))) {
				if (section.style.order !== "") {
					section.style.removeProperty("order");
					changed = true;
				}
				if (section.hasAttribute(GROUP_MEMBER_ATTRIBUTE)) {
					section.removeAttribute(GROUP_MEMBER_ATTRIBUTE);
					changed = true;
				}
				if (section.hasAttribute(GROUP_COLLAPSED_ATTRIBUTE)) {
					section.removeAttribute(GROUP_COLLAPSED_ATTRIBUTE);
					changed = true;
				}
			}
			if (changed || tree.dataset[GROUP_SIGNATURE] !== void 0) delete tree.dataset[GROUP_SIGNATURE];
		}
		// src/client/dom/styles.ts
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
		const STYLE_ATTRIBUTE = "dsh-workspace-tags/ui.css";
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
`;
		/**
		* Add the plugin stylesheet to a document once.
		* @param doc - document to decorate.
		* @returns the stylesheet element (existing or new).
		*/
		function ensurePluginStyles(doc) {
			const existing = doc.querySelector(`style[data-plugin-css="${STYLE_ATTRIBUTE}"]`);
			if (existing !== null) return existing;
			const style = doc.createElement("style");
			style.dataset["plugin"] = "dsh-workspace-tags";
			style.dataset["pluginCss"] = STYLE_ATTRIBUTE;
			style.textContent = CSS;
			doc.head.append(style);
			return style;
		}
		// src/client/dom/viewMenu.ts
		const TAG_ICON = "<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2.8 3.2h4.3l6 6-3.9 3.9-6-6V3.2Z\"/><circle cx=\"5.3\" cy=\"5.7\" r=\".9\" fill=\"currentColor\" stroke=\"none\"/></svg>";
		const OUR_ITEM = "data-dshwt-group-item";
		const OUR_BUTTON = "data-dshwt-group-by-tag";
		const menus = /* @__PURE__ */ new WeakMap();
		/**
		* Keep the injected option in sync with the currently open view menu.
		* @param doc - document to inspect.
		* @param store - tag store (grouping flag + tag presence).
		* @param t - localized translator.
		*/
		function syncViewMenu(doc, store, t) {
			const menu = doc.querySelector(SELECTORS.viewMenu);
			if (menu === null) return;
			if (store.getSnapshot().tags.length === 0) {
				if (store.getSnapshot().groupByTag) store.setGroupByTag(false);
				removeOurItem(menu);
				return;
			}
			let refs = menus.get(menu);
			if (refs === void 0) {
				const created = injectItem(doc, menu, store, t);
				if (created === null) return;
				refs = created;
			}
			applySelection(refs, store.getSnapshot().groupByTag);
		}
		/**
		* @param menu - the open view-options menu card.
		* @param doc - owner document.
		* @param store - tag store.
		* @param t - localized translator.
		* @returns references for later syncs, or null when the markup changed.
		*/
		function injectItem(doc, menu, store, t) {
			const native = nativeGroupItems(menu);
			if (native.length < 3) return null;
			const template = native[2]?.parentElement;
			if (template === null || template === void 0) return null;
			const wrapper = template.cloneNode(true);
			wrapper.setAttribute(OUR_ITEM, "");
			const button = wrapper.querySelector("button[role=\"menuitem\"]");
			if (button === null) return null;
			button.setAttribute(OUR_BUTTON, "");
			button.removeAttribute("aria-haspopup");
			button.removeAttribute("aria-expanded");
			button.className = button.className.replace(SELECTORS.menuSelected, " ").replace(/\s+/gu, " ").trim();
			for (const child of Array.from(button.children)) if (child.tagName.toLowerCase() === "svg") child.remove();
			const label = button.querySelector(SELECTORS.menuItemLabel);
			if (label !== null) label.textContent = t("group.label");
			const icon = button.querySelector(SELECTORS.menuItemIcon);
			if (icon !== null) icon.innerHTML = TAG_ICON;
			const selected = native.find((item) => isSelected(item)) ?? null;
			const checkNode = selected?.querySelector(":scope > svg") ?? null;
			const checkTemplate = checkNode === null ? null : checkNode.cloneNode(true);
			const selectedClass = selected === null ? null : selectedClassOf(selected);
			template.after(wrapper);
			const refs = {
				menu,
				item: button,
				native,
				suppress: false,
				checkTemplate,
				selectedClass
			};
			menus.set(menu, refs);
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				activate(refs, store);
			});
			for (const item of native) item.addEventListener("click", () => {
				if (refs.suppress) return;
				store.setGroupByTag(false);
			});
			applySelection(refs, store.getSnapshot().groupByTag);
			return refs;
		}
		/**
		* Turn tag grouping on and move the native grouping to "workspace".
		* @param refs - this menu's references.
		* @param store - tag store.
		*/
		function activate(refs, store) {
			refs.suppress = true;
			try {
				store.setGroupByTag(true);
				if (refs.native.findIndex((item) => isSelected(item)) === 0) {
					refs.menu.dispatchEvent(new KeyboardEvent("keydown", {
						key: "Escape",
						bubbles: true
					}));
					return;
				}
				refs.native[0]?.click();
			} finally {
				refs.suppress = false;
			}
		}
		/**
		* Paint the option's selected state and keep the native "workspace" row from
		* showing a second check.
		* @param refs - this menu's references.
		* @param active - whether tag grouping is on.
		*/
		function applySelection(refs, active) {
			const ours = refs.item;
			const hasCheck = ours.querySelector(":scope > svg") !== null;
			if (active) {
				if (refs.selectedClass !== null && !ours.classList.contains(refs.selectedClass)) ours.classList.add(refs.selectedClass);
				if (!hasCheck && refs.checkTemplate !== null) ours.append(refs.checkTemplate.cloneNode(true));
				const workspace = refs.native[0];
				if (workspace !== void 0) {
					workspace.querySelector(":scope > svg")?.remove();
					if (refs.selectedClass !== null) workspace.classList.remove(refs.selectedClass);
				}
			} else {
				if (hasCheck) ours.querySelector(":scope > svg")?.remove();
				if (refs.selectedClass !== null) ours.classList.remove(refs.selectedClass);
			}
		}
		/** @returns the first three native grouping rows (excludes our injection). */
		function nativeGroupItems(menu) {
			return Array.from(menu.querySelectorAll("[role=\"menuitem\"]")).filter((item) => !item.hasAttribute(OUR_BUTTON)).slice(0, 3);
		}
		/** @returns true when the shipped row renders as the selected option. */
		function isSelected(button) {
			if (button.querySelector(":scope > svg") !== null) return true;
			return SELECTORS.menuSelected.test(button.className);
		}
		/** @returns the selected CSS-module token, when present. */
		function selectedClassOf(button) {
			for (const token of button.classList) if (token.endsWith("_selected")) return token;
			return null;
		}
		/**
		* Remove the injected row (used when no tags exist or on dispose).
		* @param menu - the open menu card.
		*/
		function removeOurItem(menu) {
			const wrapper = menu.querySelector(`[${OUR_ITEM}]`);
			if (wrapper !== null) wrapper.remove();
			menus.delete(menu);
		}
		// src/client/dom/controller.ts
		/**
		* The DOM decorator: chips beside project names, the tag button on each row,
		* the filter icon in the workspace header, the filtered-empty notice, and the
		* bridge that keeps the view-options injection in sync.
		*
		* Everything is idempotent and driven by one rAF-free microtask-coalesced
		* MutationObserver. The decorator never removes or reorders a React-owned node;
		* it only appends plugin-owned nodes, toggles plugin-owned attributes and sets
		* `order` (visual only) while grouping by tag.
		*
		* @module dsh-workspace-tags/client/dom/controller
		*/
		const FILTER_ICON = "<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2.6 3.2h10.8L9.2 8.2v4.2l-2.4 1.2V8.2L2.6 3.2Z\"/></svg>";
		const ADD_ICON = "<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linejoin=\"round\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M2.6 3.8h3.7l4.6 4.6-3.3 3.3-4.6-4.6V3.8Z\"/><path d=\"M11.4 10.6v3.2M9.8 12.2h3.2\"/></svg>";
		const EMPTY_ATTRIBUTE = "data-dshwt-list-empty";
		const ADD_ATTRIBUTE = "data-dshwt-add";
		const FILTER_ATTRIBUTE = "data-dshwt-filter";
		const RESET_ATTRIBUTE = "data-dshwt-reset";
		/**
		* Create the decorator.
		* @param options - document, store and translator.
		* @returns the lifecycle handle.
		*/
		function createDomController(options) {
			const { doc, store, t } = options;
			let observer = null;
			let unsubscribe = null;
			let scheduled = false;
			let applying = false;
			let disposed = false;
			let pendingGroupFocusKey = null;
			const schedule = () => {
				if (scheduled || disposed) return;
				scheduled = true;
				queueMicrotask(() => {
					scheduled = false;
					paint();
				});
			};
			const openPickerFor = (anchor) => {
				const row = anchor.closest(SELECTORS.workspaceRow);
				if (!(row instanceof HTMLElement)) return;
				const workspaceId = workspaceIdOf(row);
				if (workspaceId === null || workspaceId === "") return;
				const title = row.querySelector(`:scope > span${SELECTORS.projectText}`)?.textContent?.trim();
				const anchorElement = anchor.hasAttribute(ADD_ATTRIBUTE) ? row : anchor;
				store.openPicker(workspaceId, title !== void 0 && title.length > 0 ? title : workspaceId, anchorElement);
				schedule();
			};
			/** @returns the workspace ids whose earliest tag is `key` (the whole group). */
			const groupMembers = (tree, key) => {
				const state = store.getSnapshot();
				const tagIds = new Set(state.tags.map((tag) => tag.id));
				const members = [];
				const seen = /* @__PURE__ */ new Set();
				for (const section of Array.from(tree.querySelectorAll(SELECTORS.groupSection))) {
					const row = ownWorkspaceRow(section);
					const workspaceId = row === null ? null : workspaceIdOf(row);
					if (workspaceId === null || workspaceId === "" || seen.has(workspaceId)) continue;
					if ((state.assignments[workspaceId] ?? []).find((id) => tagIds.has(id)) !== key) continue;
					seen.add(workspaceId);
					members.push(workspaceId);
				}
				return members;
			};
			const onClick = (event) => {
				const target = event.target;
				if (!(target instanceof Element)) return;
				const filter = target.closest(`[${FILTER_ATTRIBUTE}]`);
				if (filter !== null) {
					event.preventDefault();
					event.stopPropagation();
					if (store.getSnapshot().filterAnchor === filter) store.closeFilter();
					else store.openFilter(filter);
					schedule();
					return;
				}
				if (target.closest(`[${RESET_ATTRIBUTE}]`) !== null) {
					event.preventDefault();
					event.stopPropagation();
					store.resetFilter();
					schedule();
					return;
				}
				const clear = target.closest("[data-dshwt-group-clear]");
				if (clear !== null) {
					event.preventDefault();
					event.stopPropagation();
					const key = clear.closest("[data-dshwt-tag-group]")?.getAttribute("data-dshwt-group-key");
					const root = findSidebarRoot(doc);
					const tree = root === null ? null : findTree(root);
					if (typeof key === "string" && key !== "untagged" && tree !== null) {
						const name = store.getSnapshot().tags.find((tag) => tag.id === key)?.text;
						const members = groupMembers(tree, key);
						if (members.length > 0) store.requestGroupClear(key, name ?? key, members);
						schedule();
					}
					return;
				}
				const toggle = target.closest("[data-dshwt-group-toggle]");
				if (toggle !== null) {
					event.preventDefault();
					event.stopPropagation();
					const key = toggle.getAttribute("data-dshwt-group-key");
					if (key !== null) {
						pendingGroupFocusKey = key;
						store.toggleGroupCollapsed(key);
						schedule();
					}
					return;
				}
				const add = target.closest(`[${ADD_ATTRIBUTE}], [data-dshwt-chip]`);
				if (add !== null) {
					event.preventDefault();
					event.stopPropagation();
					openPickerFor(add);
				}
			};
			const onKeyDown = (event) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				const target = event.target;
				if (!(target instanceof Element)) return;
				const toggle = target.closest("[data-dshwt-group-toggle]");
				if (toggle === null) return;
				if (target.closest("[data-dshwt-group-clear]") !== null) return;
				const key = toggle.getAttribute("data-dshwt-group-key");
				if (key === null) return;
				event.preventDefault();
				event.stopPropagation();
				pendingGroupFocusKey = key;
				store.toggleGroupCollapsed(key);
				schedule();
			};
			const isRelevant = (record) => {
				const root = findSidebarRoot(doc);
				if (root === null) return true;
				const target = record.target;
				if (target instanceof Node && root.contains(target)) return true;
				for (const node of record.addedNodes) if (node instanceof Element && (node.matches(SELECTORS.viewMenu) || node.querySelector(SELECTORS.viewMenu) !== null)) return true;
				return false;
			};
			const syncFilterButton = (root, headerActions, state, show) => {
				const existing = root.querySelector(`[${FILTER_ATTRIBUTE}]`);
				if (!show || headerActions === null) {
					if (existing === null) return;
					if (state.filterAnchor === existing) store.closeFilter();
					existing.remove();
					return;
				}
				let button = existing;
				if (button === null) {
					button = doc.createElement("button");
					button.type = "button";
					button.setAttribute(FILTER_ATTRIBUTE, "");
					const sample = headerActions.querySelector("button");
					button.className = sample?.className ?? "dshwt-filter";
					button.classList.add("dshwt-filter");
					button.setAttribute("aria-haspopup", "dialog");
					button.innerHTML = FILTER_ICON;
					headerActions.prepend(button);
				}
				const label = t("filter.label");
				button.setAttribute("aria-label", label);
				button.setAttribute("title", label);
				button.setAttribute("aria-expanded", String(state.filterAnchor === button));
				const badge = button.querySelector(".dshwt-filter-badge");
				if (state.filter.length === 0) badge?.remove();
				else {
					const count = badge ?? doc.createElement("span");
					if (badge === null) {
						count.className = "dshwt-filter-badge";
						button.append(count);
					}
					count.textContent = String(state.filter.length);
				}
			};
			const ensureAddButton = (actions, name) => {
				let button = actions.querySelector(`[${ADD_ATTRIBUTE}]`);
				if (button === null) {
					button = doc.createElement("button");
					button.type = "button";
					button.setAttribute(ADD_ATTRIBUTE, "");
					const sample = actions.querySelector("button");
					button.className = sample?.className ?? "dshwt-add";
					button.classList.add("dshwt-add");
					button.innerHTML = ADD_ICON;
					actions.append(button);
				}
				const label = t("row.add", { name });
				button.setAttribute("aria-label", label);
				button.setAttribute("title", label);
			};
			const syncEmptyNotice = (tree, show) => {
				const existing = tree.querySelector(`:scope > [${EMPTY_ATTRIBUTE}]`);
				if (!show) {
					existing?.remove();
					return;
				}
				if (existing !== null) return;
				const notice = doc.createElement("div");
				notice.setAttribute(EMPTY_ATTRIBUTE, "");
				notice.className = "dshwt-list-empty";
				notice.setAttribute("role", "status");
				notice.style.order = "999999";
				const text = doc.createElement("span");
				text.textContent = t("empty.filtered");
				const reset = doc.createElement("button");
				reset.type = "button";
				reset.setAttribute(RESET_ATTRIBUTE, "");
				reset.className = "dshwt-list-empty-reset";
				reset.textContent = t("empty.reset");
				notice.append(text, reset);
				tree.append(notice);
			};
			const paint = () => {
				if (disposed) return;
				const root = findSidebarRoot(doc);
				if (root === null) return;
				applying = true;
				try {
					const rail = isRail(root);
					const tree = findTree(root);
					const flat = tree !== null && tree.matches(SELECTORS.flatList);
					const headerActions = findHeaderActions(root);
					const initial = store.getSnapshot();
					if (initial.filterAnchor !== null && !initial.filterAnchor.isConnected) store.closeFilter();
					if (initial.picker !== null && !initial.picker.anchor.isConnected) store.closePicker();
					const state = store.getSnapshot();
					if (tree !== null && !flat) for (const row of Array.from(tree.querySelectorAll(SELECTORS.workspaceRow))) {
						const workspaceId = workspaceIdOf(row);
						if (workspaceId === null) continue;
						if (workspaceId === "") {
							row.querySelector(`:scope > [${CHIPS_ATTRIBUTE}]`)?.remove();
							row.querySelector(`:scope [${ADD_ATTRIBUTE}]`)?.remove();
							continue;
						}
						const title = row.querySelector(`:scope > span${SELECTORS.projectText}`);
						const actions = row.querySelector(`:scope > span${SELECTORS.rowActions}`);
						const tags = store.tagsOf(workspaceId);
						if (tags.length === 0) row.querySelector(`:scope > [${CHIPS_ATTRIBUTE}]`)?.remove();
						else renderChips(ensureChipsHost(row, title), tags, (key) => t(key));
						if (actions !== null) ensureAddButton(actions, title?.textContent?.trim() ?? workspaceId);
						row.toggleAttribute("data-dshwt-picker-open", state.picker?.workspaceId === workspaceId);
					}
					syncFilterButton(root, headerActions, state, state.tags.length > 0 && !rail && tree !== null && !flat);
					if (tree !== null && !flat) {
						const views = paintSections(tree, state, state.filter);
						paintGrouping(tree, state, views, t);
						if (pendingGroupFocusKey !== null) {
							const key = pendingGroupFocusKey;
							pendingGroupFocusKey = null;
							tree.querySelector(`[data-dshwt-tag-group][data-dshwt-group-key="${key}"]`)?.focus();
						}
						const visibleProjects = views.filter((view) => view.visible && !view.ownRowHidden && view.workspaceId !== "").length;
						syncEmptyNotice(tree, state.filter.length > 0 && views.length > 0 && visibleProjects === 0);
					} else if (tree !== null) {
						clearGrouping(tree);
						syncEmptyNotice(tree, false);
					}
					syncViewMenu(doc, store, t);
				} finally {
					applying = false;
					observer?.takeRecords();
				}
			};
			return {
				start: () => {
					if (disposed) return;
					ensurePluginStyles(doc);
					doc.addEventListener("click", onClick, true);
					doc.addEventListener("keydown", onKeyDown, true);
					unsubscribe = store.subscribe(schedule);
					observer = new MutationObserver((records) => {
						if (applying || disposed) return;
						if (records.some(isRelevant)) schedule();
					});
					observer.observe(doc.body, {
						childList: true,
						subtree: true
					});
					schedule();
				},
				dispose: () => {
					if (disposed) return;
					disposed = true;
					observer?.disconnect();
					observer = null;
					unsubscribe?.();
					unsubscribe = null;
					doc.removeEventListener("click", onClick, true);
					doc.removeEventListener("keydown", onKeyDown, true);
					for (const node of Array.from(doc.querySelectorAll("[data-dshwt-chips],[data-dshwt-add],[data-dshwt-filter],[data-dshwt-tag-group],[data-dshwt-list-empty],[data-dshwt-group-item]"))) node.remove();
					for (const node of Array.from(doc.querySelectorAll("[data-dshwt-hidden],[data-dshwt-self-hidden],[data-dshwt-picker-open],[data-dshwt-tag-member],[data-dshwt-group-collapsed]"))) {
						node.removeAttribute("data-dshwt-hidden");
						node.removeAttribute("data-dshwt-self-hidden");
						node.removeAttribute("data-dshwt-picker-open");
						node.removeAttribute("data-dshwt-tag-member");
						node.removeAttribute("data-dshwt-group-collapsed");
					}
					for (const section of Array.from(doc.querySelectorAll(SELECTORS.groupSection))) section.style.removeProperty("order");
					for (const tree of Array.from(doc.querySelectorAll(SELECTORS.tree))) {
						tree.removeAttribute("data-dshwt-group-by-tag");
						delete tree.dataset["dshwtGroupSig"];
					}
				}
			};
		}
		// src/client/components/icons.tsx
		/**
		* Inline glyphs owned by this plugin.
		*
		* The shipped icon set has no tag/filter glyph, so these are small inline SVGs
		* that inherit `currentColor` like every primitive icon.
		*
		* @module dsh-workspace-tags/client/components/icons
		*/
		/** @returns the plugin's tag mark. */
		function TagGlyph({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.2,
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 3.2h4.3l6 6-3.9 3.9-6-6V3.2Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "5.3",
					cy: "5.7",
					r: ".9",
					fill: "currentColor",
					stroke: "none"
				})]
			});
		}
		/** @returns a check mark for selected rows. */
		function CheckGlyph({ size = 14 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.6,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3.4 8.4 3 3 6.2-6.8" })
			});
		}
		/** @returns a trash glyph for destructive row actions. */
		function TrashGlyph({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.2 4.4h9.6M6.4 4.4V3.2h3.2v1.2M4.6 4.4l.6 8.2h5.6l.6-8.2M6.7 6.8v3.6M9.3 6.8v3.6" })
			});
		}
		// src/client/components/messages.ts
		/**
		* Human copy for a tag-name validation code.
		* @param code - validation failure.
		* @param t - localized translator.
		* @returns the localized message.
		*/
		function nameErrorMessage(code, t) {
			switch (code) {
				case "empty": return t("error.empty");
				case "duplicate": return t("error.duplicate");
				case "too-long": return t("error.tooLong", { max: 24 });
			}
		}
		// src/client/components/TagManager.tsx
		/**
		* The tag manager content rendered by the sidebar's Tags page.
		*
		* Add, rename, recolor and delete live here; names are unique (trimmed,
		* case-insensitive) and every edit is persisted immediately through the store.
		*
		* @module dsh-workspace-tags/client/components/TagManager
		*/
		/**
		* @param props - snapshot plus the manager actions.
		* @returns the add form and the tag list.
		*/
		function TagManager({ snapshot, t, addTag, renameTag, recolorTag, removeTag }) {
			const [draft, setDraft] = (0, react.useState)("");
			const [color, setColor] = (0, react.useState)(() => nextPaletteColor(snapshot.tags));
			const [error, setError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				setColor(nextPaletteColor(snapshot.tags));
			}, [snapshot.tags.length]);
			const add = () => {
				const result = addTag(draft, color);
				if (!result.ok) {
					setError(result.code);
					return;
				}
				setDraft("");
				setError(null);
				setColor(nextPaletteColor([...snapshot.tags, result.tag]));
			};
			const usageOf = (tagId) => {
				let count = 0;
				for (const assigned of Object.values(snapshot.assignments)) if (assigned.includes(tagId)) count += 1;
				return count;
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					className: "dshwt-add-form",
					onSubmit: (event) => {
						event.preventDefault();
						add();
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							value: draft,
							placeholder: t("page.addPlaceholder"),
							"aria-label": t("page.addPlaceholder"),
							onChange: (event) => {
								setDraft(event.target.value);
								if (error !== null) setError(null);
							}
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "color",
							className: "dshwt-color-input",
							"aria-label": t("page.color"),
							title: t("page.color"),
							value: color,
							onChange: (event) => setColor(event.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "submit",
							size: "sm",
							variant: "primary",
							disabled: draft.trim().length === 0,
							children: t("page.add")
						})
					]
				}),
				error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshwt-error",
					role: "alert",
					children: nameErrorMessage(error, t)
				}) : null,
				snapshot.tags.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshwt-empty-state",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("page.empty") }), t("page.emptyHint")]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshwt-tag-list",
					children: snapshot.tags.map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagRow, {
						tag,
						usage: usageOf(tag.id),
						t,
						renameTag,
						recolorTag,
						removeTag
					}, tag.id))
				})
			] });
		}
		/**
		* One editable tag row: color, text, usage and delete confirmation.
		* @param props - the tag and the actions it drives.
		* @returns the row and its optional palette.
		*/
		function TagRow({ tag, usage, t, renameTag, recolorTag, removeTag }) {
			const [draft, setDraft] = (0, react.useState)(tag.text);
			const [error, setError] = (0, react.useState)(null);
			const [palette, setPalette] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setDraft(tag.text);
			}, [tag.text]);
			const commit = () => {
				if (draft === tag.text) {
					setError(null);
					return;
				}
				const result = renameTag(tag.id, draft);
				if (result.ok) setError(null);
				else setError(result.code);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshwt-tag-item",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshwt-tag-row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshwt-swatch",
							style: { "--dshwt-color": tag.color },
							"aria-label": t("page.color"),
							title: t("page.color"),
							"aria-expanded": palette,
							onClick: () => setPalette((value) => !value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshwt-tag-main",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									value: draft,
									"aria-label": `${t("page.title")}: ${tag.text}`,
									onChange: (event) => {
										setDraft(event.target.value);
										if (error !== null) setError(null);
									},
									onBlur: commit,
									onKeyDown: (event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											commit();
										} else if (event.key === "Escape") {
											event.preventDefault();
											setDraft(tag.text);
											setError(null);
										}
									}
								}),
								confirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshwt-usage",
									children: t("page.deleteConfirm", { name: tag.text })
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshwt-usage",
									children: t("page.usage", { count: usage })
								}),
								error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshwt-error",
									role: "alert",
									children: nameErrorMessage(error, t)
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshwt-tag-side",
							children: confirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "primary",
								onClick: () => {
									setConfirming(false);
									removeTag(tag.id);
								},
								children: t("page.delete")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setConfirming(false),
								children: t("page.deleteCancel")
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrashGlyph, {}),
								"aria-label": t("page.delete"),
								title: t("page.delete"),
								onClick: () => setConfirming(true)
							})
						})
					]
				}), palette ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshwt-palette",
					children: [TAG_PALETTE.map((preset) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshwt-palette-btn",
						style: { "--dshwt-color": preset },
						"aria-label": preset,
						title: preset,
						"aria-pressed": tag.color === preset,
						onClick: () => recolorTag(tag.id, preset)
					}, preset)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "color",
						className: "dshwt-color-input",
						"aria-label": t("page.customColor"),
						title: t("page.customColor"),
						value: tag.color,
						onChange: (event) => recolorTag(tag.id, event.target.value)
					})]
				}) : null]
			});
		}
		// src/client/components/TagsPage.tsx
		/**
		* @param props - composed seat props (locale, injected actions, tag hook).
		* @returns the page.
		*/
		function TagsPage(props) {
			const snapshot = props.useTags((state) => state);
			const { t } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "dshwt-page",
				"aria-label": t("page.title"),
				"data-dshwt-page": "",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshwt-page-scroll",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshwt-page-content",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								className: "dshwt-page-title",
								children: t("page.title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "dshwt-page-desc",
								children: t("page.description")
							}),
							snapshot.syncError !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshwt-banner",
								role: "status",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: snapshot.syncError === "storage" ? t("error.storage") : t("error.save") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dshwt-banner-spacer" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										onClick: () => props.retrySync(),
										children: t("status.retry")
									})
								]
							}) : null,
							!snapshot.hydrated && snapshot.loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshwt-banner",
								role: "status",
								children: t("status.loading")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagManager, {
								snapshot,
								t,
								addTag: props.addTag,
								renameTag: props.renameTag,
								recolorTag: props.recolorTag,
								removeTag: props.removeTag
							})
						]
					})
				})
			});
		}
		// src/client/components/TagsPanelIcon.tsx
		/**
		* @param props - owner-supplied icon size.
		* @returns the tag glyph.
		*/
		function TagsPanelIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagGlyph, { size });
		}
		// src/client/components/GroupClearDialog.tsx
		/**
		* @param props - snapshot plus the confirm/dismiss actions.
		* @returns the dialog, or null while no request is pending.
		*/
		function GroupClearDialog({ snapshot, t, onDismiss, onConfirm }) {
			const request = snapshot.groupClear;
			if (request === null) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: onDismiss,
				title: t("group.clear.title", { name: request.tagName }),
				closeLabel: t("common.close"),
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onDismiss,
					children: t("group.clear.back")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: onConfirm,
					children: t("group.clear.confirm")
				})] }),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dshwt-dialog-body",
					children: t("group.clear.body", { count: request.workspaceIds.length })
				})
			});
		}
		// src/client/components/AnchorPanel.tsx
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
		/**
		* @param props - open state, anchor element, accessible label and body.
		* @returns the positioned panel, or null while closed.
		*/
		function AnchorPanel({ open, anchor, label, onClose, children }) {
			const panelRef = (0, react.useRef)(null);
			const anchorRef = (0, react.useRef)(null);
			anchorRef.current = anchor;
			const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open: open && anchor !== null,
				anchorRef,
				panelRef,
				side: "bottom",
				align: "start",
				gap: 6,
				margin: 8
			});
			(0, react.useEffect)(() => {
				if (!open || anchor === null) return;
				const onPointerDown = (event) => {
					const target = event.target;
					if (!(target instanceof Node)) return;
					if (panelRef.current?.contains(target) === true) return;
					if (anchor.contains(target)) return;
					onClose();
				};
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					event.stopPropagation();
					onClose();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [
				open,
				anchor,
				onClose
			]);
			if (!open || anchor === null) return null;
			const style = {
				position: "fixed",
				left: position?.left,
				top: position?.top,
				zIndex: 40,
				visibility: position === null ? "hidden" : "visible"
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
				ref: panelRef,
				role: "dialog",
				"aria-label": label,
				className: "dshwt-panel",
				style,
				children
			});
		}
		// src/client/components/TagFilterPanel.tsx
		/**
		* @param props - snapshot plus filter actions.
		* @returns the anchored filter panel, or null while closed.
		*/
		function TagFilterPanel({ snapshot, t, toggleFilter, resetFilter, closeFilter }) {
			const selected = snapshot.filter.length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(AnchorPanel, {
				open: snapshot.filterAnchor !== null,
				anchor: snapshot.filterAnchor,
				label: t("filter.label"),
				onClose: closeFilter,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-title",
						children: t("filter.label")
					}),
					snapshot.tags.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-hint",
						children: t("filter.none")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-list",
						children: snapshot.tags.map((tag) => {
							const active = snapshot.filter.includes(tag.id);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dshwt-panel-row",
								"aria-pressed": active,
								onClick: () => toggleFilter(tag.id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-dot",
										style: { "--dshwt-color": tag.color }
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-name",
										children: tag.text
									}),
									active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-check",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckGlyph, {})
									}) : null
								]
							}, tag.id);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-footer",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled: selected === 0,
							onClick: resetFilter,
							children: t("filter.reset")
						})
					})
				]
			});
		}
		// src/client/components/TagPickerPanel.tsx
		/**
		* The annotation picker opened from a workspace row.
		*
		* Typing a name and pressing Enter creates the tag (auto color) and assigns
		* it; typing an existing name assigns that tag instead. Existing tags toggle
		* without closing the panel.
		*
		* @module dsh-workspace-tags/client/components/TagPickerPanel
		*/
		/**
		* @param props - snapshot plus the actions the picker drives.
		* @returns the anchored picker, or null while closed.
		*/
		function TagPickerPanel({ snapshot, t, addTag, assign, clearAssignments, closePicker }) {
			const picker = snapshot.picker;
			const [draft, setDraft] = (0, react.useState)("");
			const [color, setColor] = (0, react.useState)(() => nextPaletteColor(snapshot.tags));
			const [error, setError] = (0, react.useState)(null);
			const inputRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				setDraft("");
				setError(null);
				setColor(nextPaletteColor(snapshot.tags));
			}, [picker]);
			(0, react.useEffect)(() => {
				if (picker !== null) inputRef.current?.focus();
			}, [picker]);
			if (picker === null) return null;
			const assigned = snapshot.assignments[picker.workspaceId] ?? [];
			const submit = () => {
				const value = draft.trim();
				if (value.length === 0) {
					setError("empty");
					return;
				}
				const result = addTag(value, color);
				if (result.ok) {
					assign(picker.workspaceId, result.tag.id, true);
					setDraft("");
					setError(null);
					setColor(nextPaletteColor([...snapshot.tags, result.tag]));
					return;
				}
				if (result.code === "duplicate") {
					const key = tagKey(value);
					const existing = snapshot.tags.find((tag) => tagKey(tag.text) === key);
					if (existing !== void 0) {
						assign(picker.workspaceId, existing.id, true);
						setDraft("");
						setError(null);
						return;
					}
				}
				setError(result.code);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(AnchorPanel, {
				open: true,
				anchor: picker.anchor,
				label: t("picker.title", { name: picker.title }),
				onClose: closePicker,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-title",
						children: t("picker.title", { name: picker.title })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshwt-panel-input-row",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshwt-panel-input-grow",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								ref: inputRef,
								value: draft,
								placeholder: t("picker.placeholder"),
								"aria-label": t("picker.placeholder"),
								onChange: (event) => {
									setDraft(event.target.value);
									if (error !== null) setError(null);
								},
								onKeyDown: (event) => {
									if (event.key !== "Enter") return;
									event.preventDefault();
									submit();
								}
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "color",
							className: "dshwt-color-input",
							"aria-label": t("page.color"),
							title: t("page.color"),
							value: color,
							onChange: (event) => setColor(event.target.value)
						})]
					}),
					error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-error",
						role: "alert",
						children: nameErrorMessage(error, t)
					}) : null,
					snapshot.tags.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-hint",
						children: t("picker.empty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshwt-panel-list",
						children: snapshot.tags.map((tag) => {
							const active = assigned.includes(tag.id);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dshwt-panel-row",
								"aria-pressed": active,
								onClick: () => assign(picker.workspaceId, tag.id, !active),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-dot",
										style: { "--dshwt-color": tag.color }
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-name",
										children: tag.text
									}),
									active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshwt-panel-check",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckGlyph, {})
									}) : null
								]
							}, tag.id);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshwt-panel-footer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled: assigned.length === 0,
							onClick: () => clearAssignments(picker.workspaceId),
							children: t("picker.clear")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "primary",
							onClick: closePicker,
							children: t("picker.done")
						})]
					})
				]
			});
		}
		// src/client/components/Overlay.tsx
		/**
		* @param props - composed seat props.
		* @returns the two anchored surfaces (each renders null while closed).
		*/
		function TagsOverlay(props) {
			const snapshot = props.useTags((state) => state);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagFilterPanel, {
					snapshot,
					t: props.t,
					toggleFilter: props.toggleFilter,
					resetFilter: props.resetFilter,
					closeFilter: props.closeFilter
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TagPickerPanel, {
					snapshot,
					t: props.t,
					addTag: props.addTag,
					assign: props.assign,
					clearAssignments: props.clearAssignments,
					closePicker: props.closePicker
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupClearDialog, {
					snapshot,
					t: props.t,
					onDismiss: props.dismissGroupClear,
					onConfirm: props.confirmGroupClear
				})
			] });
		}
		// src/client/index.tsx
		/**
		* dsh-workspace-tags — browser half.
		*
		* Wires the browser store, the persistence driver and the DOM decorator, then
		* registers the plugin's three seats: the global Tags page (`main`), its
		* sidebar row (`sidebar.panellist`, rendered above the More row) and the
		* anchored filter/annotation surfaces (`shell.overlay`).
		*
		* @module dsh-workspace-tags/client
		*/
		/** Stable browser plugin name. */
		const name = "dsh-workspace-tags";
		/** Services this half needs before `apply` runs. */
		const inject = ["slots", "locale"];
		/**
		* Mount the browser half.
		* @param ctx - browser root context carrying slots and locale.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "workspace-tags: dictionaries");
			const t = ctx.locale.bind(NS);
			const store = createClientTagStore();
			const sync = createTagSync(store);
			if (typeof document !== "undefined") {
				ensurePluginStyles(document);
				const dom = createDomController({
					doc: document,
					store,
					t
				});
				ctx.effect(() => {
					sync.start();
					dom.start();
					return () => {
						dom.dispose();
						sync.dispose();
					};
				}, "workspace-tags: sync and decorations");
			}
			const injected = () => ({
				...store,
				hooks: { tags: store },
				retrySync: () => sync.retry()
			});
			ctx.effect(() => {
				const disposers = [];
				disposers.push(ctx.slots.inject("main", () => ctx.slots.register({
					name: "main",
					key: PANEL_ID,
					locale: NS,
					inject: injected
				}, TagsPage)));
				disposers.push(ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
					name: "sidebar.panellist",
					id: PANEL_ID,
					order: 20,
					locale: NS,
					label: () => t("panel.tags")
				}, TagsPanelIcon)));
				disposers.push(ctx.slots.inject("shell.overlay", () => ctx.slots.register({
					name: "shell.overlay",
					id: "workspace-tags.surfaces",
					order: 60,
					locale: NS,
					inject: injected
				}, TagsOverlay)));
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, "workspace-tags: seats");
		}
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
