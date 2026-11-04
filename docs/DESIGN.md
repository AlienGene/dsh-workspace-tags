# 设计说明

## 为什么需要 DOM 增强

DeepSeek Harness 0.2.1-rc.5 的左侧栏工作区浏览区（`sidebar.workspaces`）由 `ui-workspace` **独占**渲染，并且只声明了五个子 slot：

- `sidebar.workspaces.directoryFlow`
- `sidebar.workspaces.session.menu.item`
- `sidebar.workspaces.session.row.action`
- `sidebar.session.row.leading`
- `sidebar.session.row.hover`

**工作区项目行、区头、视图选项菜单都没有扩展点**，工作区列表也没有筛选/自定义分组 API。因此本插件采用两层实现：

- **官方 slot**：侧栏「标签」面板行（`sidebar.panellist` + `main` 页面）、筛选/标注浮层（`shell.overlay`）。
- **DOM 增强**：项目行芯片、行内标签按钮、区头筛选图标、视图菜单第四项、按标签重排。

权衡：官方 slot 的部分完全稳定；DOM 部分依赖渲染结构，但与 UI slot 不同，它不修改 React 的数据和节点归属，只追加插件自己的节点、切换插件自己的属性，以及设置仅影响视觉的 CSS `order`。

## 整体结构

```
浏览器
├─ client store（apply 闭包内创建，不可变快照）
├─ sync（GET /api/dsh-tags/state；串行 POST，revision CAS）
├─ DOM 装饰器
│  ├─ 工作区行：芯片 + 标签按钮
│  ├─ 工作区区头：筛选按钮
│  ├─ 视图选项菜单：注入「按标签」
│  └─ 列表布局：筛选隐藏 + 按标签分组（CSS order）
├─ 标签页（main keyed panel）
└─ 筛选 / 标注浮层（shell.overlay）
Host
├─ storageDomain：dsh_tags / state / main
└─ 已认证 Fetch 路由：GET/POST /api/dsh-tags/state
```

## 数据模型

```ts
interface TagState {
  schemaVersion: 1
  revision: number
  tags: { id, text, color }[]
  assignments: Record<workspaceId, tagId[]>
  updatedAt: string
}
```

- 域版本恒为 `1`；记录自带的 `schemaVersion` 用于未来迁移。
- 写入是 **compare-and-set**：客户端带上读到的 `revision`，Host 在域写链里校验并自增，不匹配返回 409。
- 标签 id 用 UUID；**名称唯一性**按「去首尾/折叠空白 + NFC + 小写」比较，客户端与 Host 各校验一次。
- 删除标签与清理所有 assignments 在同一次 durable 写入里完成。

## 持久化

- `ctx.storageDomain.open` 打开插件自有域，交给 `dsh-base` 已挂载的 JSON 后端；文件位于 `~/.dsh/storages/dsh_tags.json`，由后端负责原子发布与权限。
- 读取用宽松清洗（坏记录/未来字段不会让插件启动失败）；写入用严格校验（重复名称、非法颜色、未知 tagId 等）。
- 浏览器不直接写文件：`ctx.connection.fetch.register` 挂载 `/api/dsh-tags/state`，只有本机 owner 的已认证请求能读写。
- 存储或路由不可用时插件仍会激活（否则客户端 bundle 不会被服务），路由返回 `503`，页面显示提示并支持重试。

## 浏览器状态

- Store 在 `apply` 闭包中创建，通过 `inject` 的 `hooks: { tags }` 变成组件的 `useTags` 选择器钩子；不在模块作用域持有单例（插件重载会重新物化模块）。
- 每次编辑先改本地快照（即时 UI），再由 sync 串行提交；请求在途时只保留最新文档，避免连续开关标签打出多个请求。
- 409 时重新读取 Host 文档覆盖本地并提示；网络失败退避重试，页面提供手动重试。

## DOM 装饰器

- 所有选择器集中在 `src/client/dom/selectors.ts`：
  - 结构性锚点优先：`[role="tree"]`、`[data-row-key^="workspace:"]`、`[class*="_groupSection"]`
  - CSS Module 哈希是构建产物，只匹配作者写的后缀（`[class*="_projectRow"]`）
- 一个微任务合并的 `MutationObserver` 监听 `body`，只对侧栏子树和视图菜单相关的变更安排一次 `paint`；绘制自身产生的变更在结束时用 `takeRecords()` 丢弃。
- 绘制是幂等的：
  - 芯片带签名，内容未变不重建
  - 按钮/节点存在则复用
  - 分组带布局签名，未变不重排
- 不 `remove()` React 节点、不写 React 拥有的 `class`/`style`/`data-row-key`；只追加插件节点、切换插件属性、在分组时写 `style.order`。
- React 重挂载（切视图、搜索、折叠、HMR）后观察器会自动补回。

## 筛选

- 纯视觉隐藏：给 `groupSection` 加 `data-dshwt-hidden`，CSS `display:none !important`。
- 树形分组下，父分组不匹配但后代匹配时，只隐藏父分组自己的项目行和直属会话行，保留嵌套分组路径。
- 「未分组」桶没有 workspaceId，筛选时整体隐藏。
- 没有可见项目时插入一条带「清除筛选」的空状态。

## 按标签分组

- 用 CSS `order` 重排顶层 `groupSection`，**不移动任何 DOM 节点**，React 的增删和 FLIP 动画不受影响。
- 组头与原生工作区行同格式：34px 行高、8px 内边距、16px glyph 槽（色点；悬停/聚焦或收起时换成 chevron）、14px/700 标签名、行尾数量与 hover 操作区。成员 section 通过 `--dsh-workspace-indent: 12px` 缩进一级，视觉上等同原生「按工作区树」的子项。
- 选中「按标签」时，程序化点击原生的「按工作区」项，把列表切到可重排的分组视图；然后插入组头节点并写 `order`。
- 组顺序等于标签创建顺序；一个项目归入其**最早创建**的标签；没有标签的项目归入「未标注」；空组不显示。
- 标注浮层的颜色行提供 6 个预设色；「自定义」展开原生取色器，只有展开后才可设定任意颜色。
- 折叠：点击组头或按 Enter/Space 切换 `collapsedGroups`；成员的 `data-dshwt-group-collapsed` 控制显示，布局签名包含折叠集合，重绘后焦点回到同一组头。
- 取消：组头 hover 显示「取消」；控制器计算该组的**完整成员**（按首标签），写入 `groupClear` 请求；`Modal` 确认后一次性从这些工作区移除该标签，标签定义保留。被筛选临时隐藏的成员也计入，因此组会真正消失。
- 分组期间禁用工作区拖拽（避免与视觉顺序冲突），退出时还原 `order`、组头、成员标记和折叠标记。
- 点击原生任一分组项会关闭按标签分组；标签清空时自动关闭。

## 视图菜单注入

- ui-workspace 的视图菜单没有 slot，因此克隆第三个分组项（单列表）作为模板，替换文字与图标，插入到它之后；保留原生菜单的样式、键盘遍历和关闭行为。
- 激活「按标签」后，给我们的行加原生 selected 样式与勾选，并隐藏原生「按工作区」的勾选，避免双选。
- 菜单项使用独立的 `data-dshwt-view-menu-tag` 标记，绝不能复用分组树的 `data-dshwt-group-by-tag`（后者有 `display:flex;flex-direction:column` 的树布局样式，会把菜单项挤成上下两行）。
- 菜单关闭即随 React 门户卸载；下次打开重新注入。

## 测试

- 协议：清洗、严格校验、唯一性、颜色规范化、筛选并集
- Host：域表 CAS、初始 seed、路由方法/媒体类型/大小/400/409/503
- 客户端：Store 动作、级联删除、筛选、浮层单开、折叠、分组取消（完整成员/保留标签定义）
- DOM（jsdom）：芯片、按钮、筛选隐藏、树形路径、空状态、分组、视图菜单注入/退出、flat/rail 降级、dispose
- 产物：客户端工厂 banner/id/外置依赖、宿主无裸运行时 import
