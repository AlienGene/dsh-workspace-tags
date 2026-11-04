import { emptyState, type TagState } from '../src/protocol.ts'

/** @returns a hydrated tag document fixture. */
export function tagState(overrides: Partial<TagState> = {}): TagState {
  return { ...emptyState('2026-01-01T00:00:00.000Z'), ...overrides }
}

/**
 * Mount a sidebar fixture matching ui-workspace's rendered structure.
 * @param options - rail (no list), flat (sessions only) or default grouped.
 */
export function mountSidebar(options: { rail?: boolean; flat?: boolean } = {}): void {
  document.body.innerHTML = ''
  const root = document.createElement('div')
  root.className = options.rail === true ? 'Kjh-qa_root Kjh-qa_rail' : 'Kjh-qa_root'

  const header = document.createElement('div')
  header.className = 'Kjh-qa_sectionHeader'
  const label = document.createElement('span')
  label.className = 'Kjh-qa_sectionLabel'
  label.textContent = '工作区'
  const searchSlot = document.createElement('div')
  searchSlot.className = 'Kjh-qa_searchSlot'
  const actions = document.createElement('div')
  actions.className = 'Kjh-qa_headerActions'
  const view = document.createElement('button')
  view.type = 'button'
  view.className = 'Kjh-qa_iconButton'
  view.setAttribute('aria-label', '视图选项')
  const add = document.createElement('button')
  add.type = 'button'
  add.className = 'Kjh-qa_iconButton'
  add.setAttribute('aria-label', '添加工作区')
  actions.append(view, add)
  header.append(label, searchSlot, actions)
  root.append(header)

  if (options.rail !== true) {
    const listArea = document.createElement('div')
    listArea.className = 'Kjh-qa_listArea'
    const tree = document.createElement('div')
    tree.className = options.flat === true ? 'Kjh-qa_list Kjh-qa_flatList' : 'Kjh-qa_list'
    tree.setAttribute('role', 'tree')
    tree.setAttribute('aria-label', '会话')
    if (options.flat === true) {
      tree.append(sessionRow('s1'))
    } else {
      tree.append(
        group('w1', 'Aurora', ['s1']),
        group('w2', 'Nebula', ['s2']),
        group('w3', 'Vega', []),
        group('', '未分组', []),
      )
    }
    listArea.append(tree)
    root.append(listArea)
  }

  document.body.append(root)
}

/** @returns one grouped workspace section. */
function group(workspaceId: string, title: string, sessions: string[]): HTMLElement {
  const section = document.createElement('div')
  section.className = 'Kjh-qa_groupSection'
  section.style.setProperty('--dsh-workspace-indent', '0px')

  const hoverRoot = document.createElement('span')
  hoverRoot.className = '_root_38jqx_3'
  hoverRoot.append(workspaceRow(workspaceId, title, workspaceId !== ''))
  section.append(hoverRoot)

  for (const sessionId of sessions) section.append(sessionRow(sessionId))
  return section
}

/** @returns one workspace row. */
function workspaceRow(workspaceId: string, title: string, withActions: boolean): HTMLElement {
  const row = document.createElement('div')
  row.className = 'JoiKIa_projectRow'
  row.setAttribute('data-row-key', `workspace:${workspaceId}`)
  row.setAttribute('role', 'treeitem')
  row.setAttribute('aria-expanded', 'true')
  row.draggable = true

  const folder = document.createElement('span')
  folder.className = 'JoiKIa_slot JoiKIa_folder'
  const chevron = document.createElement('span')
  chevron.className = 'JoiKIa_slot JoiKIa_chevron'
  const text = document.createElement('span')
  text.className = 'JoiKIa_projectText'
  const inner = document.createElement('span')
  inner.className = 'JoiKIa_title'
  inner.textContent = title
  text.append(inner)
  const actions = document.createElement('span')
  actions.className = 'JoiKIa_rowActions'
  if (withActions) {
    const menu = document.createElement('button')
    menu.type = 'button'
    menu.className = 'JoiKIa_iconButton'
    menu.setAttribute('aria-label', '工作区操作')
    const create = document.createElement('button')
    create.type = 'button'
    create.className = 'JoiKIa_iconButton'
    create.setAttribute('aria-label', '新建会话')
    actions.append(menu, create)
  }
  row.append(folder, chevron, text, actions)
  return row
}

/** @returns one session row. */
function sessionRow(sessionId: string): HTMLElement {
  const row = document.createElement('div')
  row.className = 'JoiKIa_sessionRow'
  row.setAttribute('data-row-key', `session:${sessionId}`)
  row.setAttribute('role', 'treeitem')
  return row
}

/**
 * Mount a fake view-options menu as ui-workspace renders it.
 * @param selected - index (0 workspace, 1 tree, 2 flat) rendered as selected.
 * @returns the menu card.
 */
export function mountViewMenu(selected: 0 | 1 | 2 = 0): HTMLElement {
  const menu = document.createElement('div')
  menu.className = 'Kjh-qa_viewOptionsMenu'
  menu.setAttribute('role', 'menu')
  const labels = ['按工作区', '按工作区树', '单列表', '手动排序', '最近更新']
  labels.forEach((label, index) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'Ne_itemWrap'
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('role', 'menuitem')
    button.className = index === selected ? 'Ne_item Ne_selected' : 'Ne_item'
    const icon = document.createElement('span')
    icon.className = 'Ne_itemIcon'
    const text = document.createElement('span')
    text.className = 'Ne_itemLabel'
    text.textContent = label
    button.append(icon, text)
    if (index === selected) {
      const check = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      check.setAttribute('class', 'Ne_check')
      button.append(check)
    }
    wrapper.append(button)
    menu.append(wrapper)
  })
  document.body.append(menu)
  return menu
}

/** @returns a stable translator for tests. */
export const flush = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}
