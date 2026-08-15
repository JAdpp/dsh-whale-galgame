# dsh-whale-galgame

![version](https://img.shields.io/badge/version-0.2.0-6fa8dc) ![platform](https://img.shields.io/badge/platform-DSH%20Web-1c9a86) ![license](https://img.shields.io/badge/code-MIT-c8a35f)

**简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

为 DeepSeek Harness Web 打造的多角色 Galgame 对话界面与可选桌宠：角色来源、实际对话模型、背景和立绘都可以独立切换。

![Galgame 界面示意](docs/preview.svg)

> 本仓库是非官方社区插件。公开版本使用隐私安全的中性占位素材，不包含维护者的游戏存档、对话历史、私人 CG、上传图片或本地素材库。

## 主要功能

- **多模型娘**：DeepSeek、Claude、GPT、Gemini、Kimi、Grok 六个独立角色桶；好感度、等级、记忆、聊天历史和 CG 图鉴互不串联。
- **角色与模型解耦**：角色默认跟随工作区模型，也可手动固定；Galgame 对话可使用插件默认 Flash、跟随工作区或选择 DSH 当前可用的任意模型。
- **自定义视觉**：在右上角直接上传 Galgame 背景；每位角色还能独立上传、替换或恢复自己的立绘。
- **Galgame 系统**：三类随机回复选项、好感度与升级、对话历史、CG 图鉴以及可选的升级纪念 CG。
- **可选桌宠**：开启后点击桌宠优先跳转原生 Galgame 标签；与其他悬浮插件冲突时可随时关闭。
- **DSH 设置集成**：在“设置 → 插件 → 插件配置”中统一启停插件、选择角色和对话模型。

![插件设置示意](docs/settings.svg)

## 快速安装

### 前置条件

- 已安装 DeepSeek Harness，并能在终端运行 `dsh`。
- 使用 DSH Web profile。

### 从 GitHub 安装

```sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
```

安装后重启 Web profile。打开任意会话，标签栏应出现 `galgame`。

```sh
dsh --profile web
```

如果你从 Harness 源码运行，请按照自己的安装方式把 `dsh` 替换成对应的 `pnpm dsh` 命令。

### 更新与卸载

```sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
```

更新或卸载后同样需要重启 Web profile。

## 使用与配置

### 顶栏快捷控制

- 点击 **角色来源**：跟随工作区，或固定为某位模型娘。
- 点击 **实际对话**：使用插件默认模型、工作区模型或模型目录中的其他模型。
- 点击 **背景图**：上传、预览、应用或恢复 Galgame 背景。
- 点击 **角色立绘**：为当前角色上传独立立绘，或恢复默认占位图。

背景与立绘支持 PNG、JPEG、WebP、AVIF，浏览器端限制为 12 MB。图片只写入当前工作区的本地存档，不会上传到本仓库。

### 可选的升级 CG

没有 DashScope key 时，聊天、角色切换、历史、好感度和自定义素材仍可正常使用；只有升级 CG 生成功能不可用。需要该功能时，在启动 DSH 的本地环境里设置：

```powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
```

```sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
```

也可以在本地安装副本的 `cordis.patch.yml` 中填写，但不要提交真实 key。仓库配置始终保持空值。

## 数据与隐私

![数据流示意](docs/architecture.svg)

运行时状态保存在当前工作区根目录的 `.whale-girl-save.json`，包括角色状态、聊天历史、CG，以及用户上传的背景和立绘。它不属于插件源码，也被 `.gitignore` 明确排除。

- 普通界面轮询只传元数据；大图通过独立 API 按需读取。
- 自定义立绘按角色隔离；背景属于当前工作区。
- 插件关闭后暂停 Galgame 对话与好感结算，但保留设置入口以便重新开启。
- 公开仓库、README 示意图和构建流程均不使用真实用户历史。

## 开发

```sh
npm ci
npm run prune:art
npm run verify
```

`lib/index.js` 和 `lib/client.js` 是随仓库提交的构建产物，因此 GitHub 安装不需要用户现场编译。修改 `src/` 后请重新构建并提交两份 bundle。

## 仓库结构

```text
build/                         DSH Web 客户端打包适配层
docs/                          隐私安全的 README 矢量示意图
lib/                           可直接安装的宿主端与客户端 bundle
scripts/prune-art.mjs          移除未引用内嵌素材
src/index.ts                   状态、模型路由、存档、CG 与本地 API
src/client/index.ts            Galgame、桌宠、设置与上传界面
src/client/art.generated.ts    公开版本的中性占位素材
cordis.patch.yml               无密钥的默认 DSH bundle 配置
```

## 许可与致谢

软件代码、文档与公开仓库的中性占位素材采用 MIT License。完整说明见 [LICENSE.md](LICENSE.md) 与 [NOTICE.md](NOTICE.md)。

创作与技术脉络感谢：上善、ZipZipPipe、[Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 与 [@linxin666/dsh-pet（dsh-web-ui）](https://github.com/zhu1090093659/dsh-web-ui)。公开包不重新分发他们的原始图片；如果你在本地替换为第三方素材，请自行遵守对应许可和完整署名链。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok 等名称和商标归各自权利人所有。本项目与相关厂商不存在隶属或背书关系。
