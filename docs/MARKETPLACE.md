# 插件市场与推广

本文说明 DSH 插件市场的实际机制、如何让 `dsh-workspace-tags` 出现在市场中，以及发布后的推广清单。

## 现状

| 项目 | 状态 |
|---|---|
| npm 包名 `dsh-workspace-tags` | **可用**（registry 返回 404，未被人占用） |
| 包是否可直接发布 | 是：`prepack` 会构建，`files` 包含 `lib/`、`client/`，已声明 `dsh.bundle` 和 `dsh-plugin` 关键词 |
| 当前安装方式 | GitHub Release 附件（`dsh-workspace-tags.tgz`），无需本地构建 |
| 是否已进入 npm / 社区索引 | **尚未发布**；发布需要 npm token |
| GitHub Release | v0.3.1 已发布，附件由 CI 构建 |

## 一、DSH 插件市场是怎么工作的

DSH 没有内置的中央插件商店。「插件 → 发现」读取的是**用户自己添加的索引源**（一个 JSON 文件）。

- 索引格式 1：`format: 1`、市场标题、插件列表、每个插件的版本与安装来源（npm 或 Git commit）。
- DSH 拒绝重定向，索引必须是最终 HTTPS 地址；单次抓取默认 15 秒，成功结果默认缓存 10 分钟。
- 每个版本带 `engines.dsh`；不满足当前 DSH 版本时不能安装。
- 安装来源只有两种：
  - `npm`：安装 `name@version`；
  - `git`：安装 `git+<repo>#<40位 commit>`，可带包目录。
- 官方说明：<https://deepseek-harness.github.io/deepseek-harness/guide/plugin-market>
- 格式说明：<https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/notes/implemented/feature/2026-10-02-plugin-market-index-format.zh.md>

> 官方市场默认没有任何索引源。使用前要在「插件 → 实验性插件 → 更多」中开启「自定义插件市场」，然后到「发现 → 添加索引源」粘贴 URL。DSH Desktop 的 profile 已经带了这个实验性 bundle，但索引源仍需手动添加。

## 二、让别人看到并安装：推荐路线（npm + 社区自动索引）

社区里已经有维护者做了**自动从 npm 发现 DSH 插件**的索引。发布到 npm 后，不需要逐个市场提交，通常会在下一次重建时被收录。

### 1. 发布到 npm

包名和内容都已经准备好。需要你提供一个 npm token（一次性发布用）：

1. 如果没有 npm 账号：<https://www.npmjs.com/signup>，完成邮箱验证。
2. 登录后打开 <https://www.npmjs.com/settings/> → 头像菜单 → **Access Tokens**（或直接访问 `https://www.npmjs.com/settings/<你的用户名>/tokens`）。
3. **Generate New Token**：
   - 选 **Classic Token → Automation**（适合命令行/CI 发布，绕过 2FA 交互）；或
   - 选 **Granular Token**：Permissions → Packages and scopes 选 **Read and write**，勾选该包或所有包；如果账号开了 2FA，勾选 bypass 2FA（仅自动化发布用）。
4. 复制生成的 `npm_...` token，发到这里。**不要**把它写进仓库或 README。

拿到 token 后我会执行（token 只放在临时 npmrc 里，发布后删除）：

```sh
# 临时 ~/.npmrc 或 userconfig，不提交
# //registry.npmjs.org/:_authToken=${NPM_TOKEN}
pnpm publish --access public --no-git-checks
```

发布内容由 `prepack` 触发构建，包含：

- `lib/`（宿主 ESM）
- `client/client.js`（客户端 bundle）
- `cordis.patch.yml`
- `assets/`、两份 README、`screenshots.json`

发布后验证：

```sh
npm view dsh-workspace-tags version
# 0.3.1
```

### 2. 社区自动索引

发布后，以下索引会按自己的规则发现 npm 包（以各索引的实际重建结果为准）：

| 索引 | 地址 | 收录方式 |
|---|---|---|
| REALOIYO DSH 插件索引 | `https://realoiyo.github.io/dsh-plugin-market/index.json` | 每 6 小时从 npm 搜索 `keywords:dsh-plugin`，只保留声明了 `dsh.bundle` 的包；本项目两者都满足，发布后通常 6 小时内出现 |
| dshmarket 的插件目录 | `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` | 社区目录（`dsh-plugin-catalog`，每天构建，当前约 8,600 条）；发布后检查是否被收录 |
| shutongX 索引 | `https://shutongX.github.io/dsh-plugins-index/index.json` | 维护者自己的插件聚合，不是通用自动索引，不作为主要途径 |

在 DSH 里添加：

1. 插件 → 实验性插件 → 更多 → 打开「自定义插件市场」。
2. 插件 → 发现 → **添加索引源** → 粘贴上表 URL。
3. 搜索 `workspace tags` / `dsh-workspace-tags`，确认来源后安装。

> 这些索引是第三方内容，安装前请核对确认框中的 npm 包名与版本。索引有缓存，刚发布时可能需要等下一次重建或重启 DSH。

## 三、可选路线：自建索引

如果不想发布 npm，也可以自己托管一个 format 1 的 `index.json`，把 URL 发给用户添加。

- 索引和图标放在任意静态 HTTPS 主机上；不能重定向。
- 安装来源可选：
  - `npm`（需要 npm 发布）；
  - `git`：`{ "type": "git", "url": "https://github.com/AlienGene/dsh-workspace-tags.git", "commit": "<40位 SHA>" }`。**注意**：仓库默认分支只有 TypeScript 源码，Git 安装不会自动构建；Git 来源必须指向一个包含 `lib/`、`client/` 的构建提交（例如单独的 `dist` 分支/标签），否则安装后没有可加载的 bundle。
- 最小版本条目示意（npm 来源）：

```json
{
  "format": 1,
  "title": { "en": "My DSH plugins", "zh": "我的 DSH 插件" },
  "plugins": [
    {
      "name": "dsh-workspace-tags",
      "title": { "en": "Workspace Tags", "zh": "工作区标签" },
      "description": { "en": "Colored tags for workspace projects", "zh": "给工作区项目加彩色标签" },
      "icon": "icons/workspace-tags.svg",
      "author": "AlienGene",
      "homepage": "https://github.com/AlienGene/dsh-workspace-tags#readme",
      "repository": { "url": "https://github.com/AlienGene/dsh-workspace-tags" },
      "metadata": {
        "category": "ui",
        "labels": ["workspace", "tags", "sidebar"],
        "keywords": ["dsh", "dsh-plugin", "workspace", "tags"]
      },
      "versions": [
        {
          "version": "0.3.1",
          "publishTimestamp": 1793750400,
          "source": { "type": "npm" },
          "engines": { "dsh": ">=0.2.1-rc.5 <0.3.0" }
        }
      ]
    }
  ],
  "metadata": {
    "categories": { "ui": { "title": { "en": "Interface", "zh": "界面" } } },
    "labels": { "workspace": { "title": { "en": "Workspace", "zh": "工作区" } } }
  }
}
```

- 发布前用 `@deepseek-ai/dsh-plugin-market-index` 的 `parseMarketIndex` 校验（DSH 对整份索引严格校验，一条不合规就整份拒绝）。
- 自建索引的好处是完全可控；缺点是每个用户都要手动添加一次 URL，不会像 npm 社区索引那样自动覆盖。

## 四、推广清单

**仓库与文档**

- [x] 英文 README（`README.en.md`）与中文 README 双向语言链接
- [x] 截图：预览、侧栏、标注、筛选、分组、折叠、取消确认、标签页
- 建议补一段 10–15 秒的 GIF/录屏（标注 → 筛选 → 分组）放在 README 顶部；静态截图已经覆盖主要功能
- GitHub 仓库描述建议：`Colored tags, tag filtering, and tag grouping for DeepSeek Harness workspace projects.`
- GitHub topics 建议：`deepseek-harness`、`dsh`、`dsh-plugin`、`dsh-bundle`、`plugin-market`、`workspace`、`tags`、`sidebar`、`typescript`
- 仓库 Settings → Social preview 上传 `assets/preview.png`
- Release 说明里固定写安装命令与兼容版本；每个版本更新 CHANGELOG

**分发**

- 发布 npm（需要 token）→ 社区索引自动收录
- 把社区索引 URL 写进 README/Release，用户可直接在「发现」中添加
- 如需更广的人工目录，可向社区索引维护者提 issue/PR；不要向与 DSH 无关的榜单批量投递
- 此前已取消 X / 小红书等社交投放，这里不再生成相关物料；GitHub、npm、社区索引是主要渠道

**持续维护**

- 每个版本：改版本号 → `pnpm run check` → 打 tag → Release 附件 → npm publish → 等社区索引重建
- DSH 升级后优先验证侧栏 DOM 选择器（见 `docs/COMPATIBILITY.md`）
- 保持 `engines.dsh` 与当前 DSH 版本一致；索引里的 `engines.dsh` 必须与包内一致，否则市场判为不兼容

## 五、下一步

当前只差 npm token。你可以：

1. 按上面的步骤生成 token 并发来，我完成 0.3.1 发布，随后确认 REALOIYO 索引收录；或
2. 暂不发布 npm，我改用自建索引 + 构建提交的方式，给你一个可直接添加的索引 URL（覆盖面会小很多）。

在你确认之前，GitHub Release 附件安装方式已经可用，功能不受影响。
