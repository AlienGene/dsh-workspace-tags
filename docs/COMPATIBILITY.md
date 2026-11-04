# 兼容性说明

## 已验证版本

| DSH | 桌面 App | 结果 |
|---|---|---|
| `0.2.1-rc.5` | `0.2.1-rc.5`（macOS arm64） | 端到端通过：标签页增改删、行内标注、芯片、筛选/重置、按标签分组、持久化 |

`package.json` 的 `engines.dsh` 为 `>=0.2.1-rc.5 <0.3.0`。超出该范围时安装器会要求显式版本豁免；本插件尚未在其它版本验证。

## 依赖的 DSH 结构

侧栏没有工作区行/区头/视图菜单扩展点，以下结构是本插件与 DSH 的**全部耦合点**（集中在 [`src/client/dom/selectors.ts`](../src/client/dom/selectors.ts)）：

| 用途 | 选择器 / 属性 | 说明 |
|---|---|---|
| 工作区列表 | `[role="tree"]`（排除 `[class*="_searchTree"]`） | 搜索模式不装饰 |
| 工作区行 | `[role="tree"] [data-row-key^="workspace:"]` | id 取前缀之后；未分组桶的 id 为空字符串 |
| 项目名 | `:scope > span[class*="_projectText"]` | 芯片插在它之后 |
| 行操作区 | `:scope > span[class*="_rowActions"]` | 行内标签按钮追加到此 |
| 分组容器 | `[class*="_groupSection"]` | 过滤隐藏、CSS order 重排都作用于它 |
| 区头操作区 | `[class*="_sectionHeader"] > div[class*="_headerActions"]` | 原生 `max-width:60px`，筛选图标需要覆盖为 92px |
| 视图菜单 | `[class*="_viewOptionsMenu"]` | 前三个 `[role="menuitem"]` 固定是「按工作区 / 按工作区树 / 单列表」 |
| 单列表视图 | `[role="tree"][class*="_flatList"]` | 没有项目行，隐藏筛选入口 |
| 折叠 rail | 根元素 class 以 `_rail` 结尾 | 列表不挂载，不做注入 |

CSS Module 的哈希前缀（如 `JoiKIa_`、`Kjh-qa_`）是构建产物，**不要**匹配完整类名；只匹配作者写的后缀。

## 数据兼容

- 域 `dsh_tags` 版本恒为 `1`；记录内的 `schemaVersion` 目前是 `1`。
- 读取是宽容的：未知字段忽略、坏标签/未知 tagId 丢弃，不会阻止插件启动。
- 写入是严格的：名称唯一（去空白、忽略大小写）、颜色 `#rrggbb`、最多 200 个标签、文本最长 24 字符。
- 升级 DSH 不会迁移或删除 `~/.dsh/storages/dsh_tags.json`。
- 按标签分组后新增的组头行、折叠/取消操作都是插件自有 DOM，不新增对 DSH 选择器的依赖；仍只依赖上表列出的原生结构。

## 升级 DSH 后怎么检查

1. 启动后看侧栏：项目名右侧是否出现芯片、区头是否有筛选图标、面板列表是否有「标签」。
2. 打开视图选项：是否有「按标签」；选中后列表是否出现组头。
3. 若某一项缺失或位置错乱：
   - 在 `client/client.js`（或 DSH 自带包）里搜索对应的后缀（`_projectRow`、`_projectText`、`_rowActions`、`_groupSection`、`_headerActions`、`_viewOptionsMenu`），确认结构是否改名/换层级。
   - 只改 `src/client/dom/selectors.ts` 与对应的绘制函数；数据层、Store、Host 路由无需改动。
4. 如果 DSH 后续为工作区行/区头补上了官方 slot：删除 `src/client/dom/` 中的注入逻辑，把芯片、按钮、筛选和分组入口改成 slot 注册即可，其余代码保持不变。

## 运行环境要求

- Chromium 内核（DSH 桌面 App / 现代浏览器）
- 需要 `color-mix()`、`:scope`、`toggleAttribute`、`MutationObserver`（当前 App 均支持）
- 宿主需要 `storageDomain`（`dsh-base` 默认挂载）与 `connection`（`dsh-web-app` 默认挂载）；缺失时插件仍激活，但路由返回 503，页面会提示存储不可用
