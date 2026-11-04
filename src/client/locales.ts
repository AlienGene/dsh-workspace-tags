/**
 * Locale dictionaries for the tag plugin.
 *
 * The namespace is registered from `apply` and named on every slot
 * registration, so the framework synthesizes the `t` seat for each component.
 *
 * @module dsh-workspace-tags/client/locales
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Locale namespace owned by this plugin. */
export const NS = 'workspaceTags'

/** Simplified Chinese dictionary (key-set source of truth). */
export const zh = {
  'panel.tags': '标签',
  'page.title': '标签',
  'page.description': '用颜色标记工作区项目，然后在侧栏按标签筛选或分组。',
  'page.addPlaceholder': '输入标签名称',
  'page.add': '添加标签',
  'page.empty': '还没有标签',
  'page.emptyHint': '在上方输入名称添加第一个标签，然后到工作区行上标注。',
  'page.usage': '用于 {count} 个项目',
  'page.delete': '删除',
  'page.deleteConfirm': '删除「{name}」？它会从所有项目中移除。',
  'page.deleteCancel': '取消',
  'page.color': '标签颜色',
  'page.palette': '预设颜色',
  'page.customColor': '自定义颜色',
  'error.empty': '标签名称不能为空',
  'error.duplicate': '已存在同名标签',
  'error.tooLong': '名称最多 {max} 个字符',
  'error.save': '保存失败，请重试',
  'error.storage': '标签存储不可用，修改不会保存',
  'picker.title': '标注「{name}」',
  'picker.placeholder': '输入名称新建标签',
  'picker.clear': '清除',
  'picker.done': '完成',
  'picker.empty': '还没有标签，输入名称回车即可创建。',
  'filter.label': '按标签筛选',
  'filter.reset': '重置',
  'filter.count': '已选 {count} 个标签',
  'filter.none': '还没有标签',
  'group.label': '按标签',
  'group.untagged': '未标注',
  'group.collapse': '收起',
  'group.expand': '展开',
  'group.clear.label': '取消',
  'group.clear.aria': '取消「{name}」标签',
  'group.clear.title': '取消标签「{name}」？',
  'group.clear.body': '将从该分组的 {count} 个项目移除该标签。标签本身会保留，可稍后再次使用。',
  'group.clear.confirm': '确认取消',
  'group.clear.back': '返回',
  'common.close': '关闭',
  'row.add': '为「{name}」标注标签',
  'row.tags': '标签',
  'empty.filtered': '没有匹配所选标签的项目',
  'empty.reset': '清除筛选',
  'status.loading': '正在加载标签…',
  'status.retry': '重试',
  'overlay.label': '工作区标签',
} as const

/** Key union of the dictionary. */
export type WorkspaceTagsKey = keyof typeof zh

/** English dictionary, key-for-key complete. */
export const en: Record<WorkspaceTagsKey, string> = {
  'panel.tags': 'Tags',
  'page.title': 'Tags',
  'page.description': 'Tag Workspace projects with colors, then filter or group the sidebar by tag.',
  'page.addPlaceholder': 'Tag name',
  'page.add': 'Add tag',
  'page.empty': 'No tags yet',
  'page.emptyHint': 'Add the first tag above, then annotate a Workspace row in the sidebar.',
  'page.usage': 'Used by {count} projects',
  'page.delete': 'Delete',
  'page.deleteConfirm': 'Delete "{name}"? It will be removed from every project.',
  'page.deleteCancel': 'Cancel',
  'page.color': 'Tag color',
  'page.palette': 'Preset colors',
  'page.customColor': 'Custom color',
  'error.empty': 'Tag name cannot be empty',
  'error.duplicate': 'A tag with this name already exists',
  'error.tooLong': 'Keep it to {max} characters or fewer',
  'error.save': "Couldn't save, please retry",
  'error.storage': 'Tag storage is unavailable; changes will not be saved',
  'picker.title': 'Tag "{name}"',
  'picker.placeholder': 'Type a name to create a tag',
  'picker.clear': 'Clear',
  'picker.done': 'Done',
  'picker.empty': 'No tags yet. Type a name and press Enter to create one.',
  'filter.label': 'Filter by tag',
  'filter.reset': 'Reset',
  'filter.count': '{count} tags selected',
  'filter.none': 'No tags yet',
  'group.label': 'By tag',
  'group.untagged': 'Untagged',
  'group.collapse': 'Collapse',
  'group.expand': 'Expand',
  'group.clear.label': 'Remove',
  'group.clear.aria': 'Remove tag "{name}"',
  'group.clear.title': 'Remove tag "{name}"?',
  'group.clear.body': 'This removes the tag from {count} projects in this group. The tag itself is kept and can be used again.',
  'group.clear.confirm': 'Remove',
  'group.clear.back': 'Back',
  'common.close': 'Close',
  'row.add': 'Tag "{name}"',
  'row.tags': 'Tags',
  'empty.filtered': 'No projects match the selected tags',
  'empty.reset': 'Clear filter',
  'status.loading': 'Loading tags…',
  'status.retry': 'Retry',
  'overlay.label': 'Workspace tags',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    workspaceTags: WorkspaceTagsKey
  }
}
