# dsh-whale-galgame · 跨会话任务事件感知的多角色 Galgame 引擎

**简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

## 简介

在Harness执行工作的间隙，探寻你与模型娘间“非比寻常”的同事关系～(∠・ω< )⌒★

`dsh-whale-galgame` 为 DeepSeek Harness Web 挂载一个独立的多角色轻量 Galgame 游戏面板。插件按事件来源工作区，用本地确定性规则将近期的调试、写作、调研等活动归为 11 类任务事件，再把不含原文的安全分类结果并入全局事件队列；进入 Galgame 闲聊时，当前角色可以自然回应刚才的工作。Harness 中用户提交的原文只参与本地分类，回复模型仅收到固定的任务类别与状态提示，工具参数、工具结果和 assistant 回复正文不会进入这条感知链路。

默认素材提供了DeepSeek、Claude、GPT、Gemini、Kimi、Grok 模型所对应的六位独立萌娘角色，角色立绘与实际回复模型可以自由选择。当前角色、每位角色的关系进度与角色设定、对话历史、回复选项、已消费任务记忆、定制立绘、CG 图鉴、背景，以及 token 结算余额和插件偏好，都在工作区之间保持同一份全局连续状态。工作区和会话只标识 Harness 事件来自哪里并用于采集去重。好感度由三类回复选项、插件运行期间新观察到的 Harness token 用量和长期未互动共同影响，等级不设上限。配置 DashScope key 后，升级可生成与近期任务呼应的 1920 × 1080 横向纪念 CG；桌宠可独立关闭，点击时会打开 Galgame。

![dsh-whale-galgame 在 DSH Web 中的实际运行界面](docs/screenshots/galgame-overview.jpg)

## 功能

- 显示角色与回复模型分开选择：角色可以跟随工作区模型或手动固定；回复模型可以使用默认的 `deepseek-v4-flash`、跟随工作区，或从 DSH 模型目录中选择。
- 六个角色的好感度、等级、角色设定、聊天记录、回复选项、已消费任务记忆、自定义立绘、CG 图鉴和背景彼此分离，但都在工作区之间全局共享；当前角色、token 结算余额和插件偏好也会连续保留。
- 每轮提供亲近、普通、疏离三种倾向的回复，显示顺序随机；也可以直接输入内容。
- 切换角色时会同步切换对应的内置背景；鲸鱼娘默认仍使用深海宫殿，新的海边书房可在“背景图”中选作替代。用户上传背景或保存的 CG 会覆盖角色默认背景，直到恢复内置选项。
- 背景、角色立绘、对话历史、CG 图鉴和桌宠均可从界面管理。点击桌宠会打开 `galgame` 标签页。

## 好感度与跨对话上下文

### 关系进度

每个角色都从 Lv.1、0 点好感开始，状态彼此独立。亲近、普通、疏离三个回复选项分别结算 +1、0、-1，位置每轮随机；自由输入使用轻量关键词规则结算。插件运行期间，从所有工作区新观察到的 Harness `assistant/message` usage 事件会进入同一份全局 token 余额；输入与输出 token 每累计 5,000 个，结算时当前角色增加 1 点。每次结算最多兑换 3 点，余量继续保留；插件自身发起的模型调用不计入，也不回算插件启动前的历史 usage。超过 24 小时未活动后，所有角色按每天 2 点衰减，最低为 0。

升级阈值为 `30 + 15 × (Lv - 1)`，即 30、45、60……。达到阈值后升级，超出部分保留到下一级。等级不设上限。角色语气随关系进度分为五档，Lv.5 后保持最高亲昵档。配置了可用的 DashScope key 时，每次升级会尝试生成一张特殊 CG。

### Harness 任务事件

插件按每个事件来源的工作区，最多检查该工作区最近 72 小时的 16 个顶层 Harness 会话，包括实时与已保存会话，并只扫描每个会话末尾 240 条事件。本地、确定性规则将任务归为代码调试、代码开发、文档总结、文档写作、文学创作、资料调研、数据分析、视觉设计、演示文稿、翻译校对或任务规划，再将安全分类结果合并到全局事件队列。本地分类只使用真人明确提交的 user 正文，并可参考工具名与轮次结束状态。

只有固定的任务类别与状态提示会发给 Galgame 回复模型和 CG 生成服务。模型娘会在回应当前话题时自然带到一句相关关心，例如代码调试后提醒主人不要熬夜。每个角色的已消费事件指纹与最近提及时间都保存在全局状态中：同一事件不会因为切换工作区而再次向同一角色主动提起，不同事件之间至少间隔 30 分钟。任务事件只影响话题，不直接增减好感度。

## 内置默认美术

插件安装包内嵌并使用 22 项美术素材：六张角色立绘、七张内置背景、八张鲸鱼娘表情差分立绘，以及一张来自 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 的 11 行桌宠动画图集。下面六张图是各模型角色的默认立绘；GitHub 源码仓库中的 [`assets/default/`](assets/default/README.md) 列出了全部图片及其运行时用途。npm 安装包只携带内嵌后的客户端 bundle，不重复收录导出原图或生成图源码。

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="DeepSeek 鲸鱼娘默认立绘"><br><strong>DeepSeek · 鲸鱼娘</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.webp" width="180" alt="Claude 模型娘克洛德默认立绘"><br><strong>Claude · 克洛德</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.webp" width="180" alt="GPT 模型娘小吉默认立绘"><br><strong>GPT · 小吉</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.webp" width="180" alt="Gemini 模型娘双子默认立绘"><br><strong>Gemini · 双子</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.webp" width="180" alt="Kimi 模型娘月见默认立绘"><br><strong>Kimi · 月见</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.webp" width="180" alt="Grok 模型娘洛可默认立绘"><br><strong>Grok · 洛可</strong></td>
  </tr>
</table>

六个角色的新背景如下。Claude、GPT、Gemini、Kimi 和 Grok 默认使用各自背景；DeepSeek 鲸鱼娘仍以 `palace-night.webp` 深海宫殿为默认，下图海边书房是内置可选替代。

<table>
  <tr>
    <td align="center"><img src="assets/default/bg-deepseek-seaside-study.webp" width="260" alt="DeepSeek 鲸鱼娘海边书房可选背景"><br><strong>DeepSeek · 可选替代</strong></td>
    <td align="center"><img src="assets/default/bg-claude-writing-study.webp" width="260" alt="Claude 写作书房默认背景"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/bg-gpt-collaboration-workshop.webp" width="260" alt="GPT 协作工坊默认背景"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/bg-gemini-twin-creative-studio.webp" width="260" alt="Gemini 双子创意工作室默认背景"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/bg-kimi-moonlit-reading-study.webp" width="260" alt="Kimi 月下阅读室默认背景"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/bg-grok-electronics-studio.webp" width="260" alt="Grok 电子工作室默认背景"><br><strong>Grok</strong></td>
  </tr>
</table>

完整运行时素材还包括八张原始分辨率透明 `whale-*.webp` 表情，以及 8 列 × 11 行的 `pet-spritesheet.webp` 桌宠动画图集。前 21 张默认图片与桌宠图集采用不同许可；来源、修改内容和逐文件许可见 [NOTICE](NOTICE.md) 与 [第三方许可索引](THIRD_PARTY_LICENSES.md)。

Galgame 界面的布局、对话框、控件和装饰随 [`src/client/index.ts`](src/client/index.ts) 公开，不依赖未公开的 UI 图片包。

## 安装

需要已安装 DeepSeek Harness，并能运行 `dsh` 的 Web profile。

~~~sh
dsh plugin --profile web add dsh-whale-galgame
~~~

安装完成后，先停止正在运行的 Web profile，再重新启动：

~~~sh
dsh --profile web
~~~

如果源码安装提供的是 `pnpm dsh`，保留相同参数即可。

### 更新与卸载

~~~sh
dsh plugin --profile web update dsh-whale-galgame
dsh plugin --profile web remove dsh-whale-galgame
~~~

更新或卸载后同样需要停止并重新启动 Web profile。

### 从 GitHub 安装（跟随 main 分支）

只有想跟最新提交、而不是 npm 发布版时才需要这条路径：

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

git 安装会当场执行本仓库的 `prepare` 构建脚本，pnpm 默认拦截。首次运行会报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` 并打印一个键，把它写进 profile 的 `pnpm-workspace.yaml`：

~~~yaml
allowBuilds:
  'dsh-whale-galgame@https://codeload.github.com/JAdpp/dsh-whale-galgame/tar.gz/<commit>': true
~~~

该键钉死了具体 commit，每次跟进新提交都要按 pnpm 新打印的值更新。**从 npm 安装完全不涉及这一步**，因为发布包已经预构建，安装期不执行任何脚本。

## 使用与设置

![DSH Web 中的插件配置界面](docs/screenshots/plugin-settings.png)

在 Galgame 顶栏可以切换“角色来源”和“实际对话”，也可以上传背景或当前角色的立绘。背景和立绘支持 PNG、JPEG、WebP、AVIF，浏览器端单个文件上限为 12 MB。

在“设置 → 插件 → 插件配置”中可以启停插件、设置默认角色和默认回复模型。关闭插件会暂停 Galgame 对话和好感度结算，但不会删除已有数据。

### 自定义角色设定

在 Galgame 顶栏点击“角色立绘”旁的“角色设定”，可以编辑当前角色的六项设定：

- 角色昵称
- 对用户的称呼
- 首次问候
- 性格
- 语气
- CG 外观描述

六位角色的自定义设定分别保存，并在所有工作区共享。“保存设定”或“恢复默认”只会修改当前角色的上述六项，不会重置其好感度与等级、长期记忆或自定义立绘。若该角色尚未开始真实对话，修改或恢复“首次问候”会原位更新当前开场问候，自动生成的登场旁白保持不变；一旦已有用户或角色对话，就不会再插入、替换或重播历史。CG 外观描述用于之后生成的升级 CG，不会改写图鉴中已经保存的图片。

自定义设定不能绕过插件的安全约束，也不会取消角色回复的单句限制。

### 内置桌宠

桌宠已经内置在本插件中，无需另外安装。新安装时默认开启，显示在 DSH 主界面右下角；点击桌宠会打开 `galgame` 标签页。Galgame 顶栏的“桌宠 · 开/关”是独立开关，只控制桌宠是否显示。“设置 → 插件 → 插件配置”中的“启用插件”控制的是整个插件；关闭后会隐藏桌宠，并暂停 Galgame 对话和好感度结算。

## 可选的升级 CG

升级 CG 默认通过 DashScope 的 `qwen-image-3.0` 生成，尺寸为 1920 × 1080。没有 DashScope key 时，聊天、角色切换、历史、好感度和自定义图片仍可使用，只有 CG 生成不可用。

推荐只通过启动 DSH 的本地环境变量提供 key：

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

不要把真实 key 写入仓库文件或提交到 Git。

## 数据与隐私

运行时数据分为两层，请把两者都当作私人数据处理：

- `DSH_HOME/storages/dsh-whale-galgame/global.json` 保存完整、连续的 Galgame 状态：当前角色；六位角色各自的关系进度、角色设定、对话历史、当前回复选项、已消费任务记忆、自定义立绘、CG 图鉴与背景；全局任务事件队列、token 结算余额、去重指纹和插件偏好。
- 当前工作区根目录的 `.whale-girl-save.json` 只保留轻量的事件来源与旧存档迁移标记，不再保存一套独立的剧情、聊天、任务记忆或 token 账本。
- 进入新工作区时会直接沿用当前角色、对话历史、回复选项和关系进度；工作区或会话仅用于定位 Harness 事件来源与采集去重，不会触发剧情重开或跨工作区拒绝页。
- 首次打开旧版 v9 工作区存档时，插件会自动把可迁移的剧情与角色数据合并到上述全局文件，并将该工作区的 `.whale-girl-save.json` 改写为来源/迁移标记。

- 普通对话会发送给你在 DSH 中选择的模型提供商。
- 生成升级 CG 时，插件会把文本提示发送到 DashScope。
- 开启小剧场的联网取材后（默认开启），插件会通过 DSH 的 web 能力发起检索。检索词只由角色对应的模型名与题材词构成，**不包含**你的对话内容、工作区内容或任何 Harness 原文。
- 检索结果只用于本次小剧场生成；摘要与来源链接会写入小剧场记录（存档内），网页正文不落盘。
- 在「设置 → 插件 → 插件配置 → 小剧场取材」中选择「只用本地任务类别」即可完全关闭联网，插件不会发起任何检索请求。
- 生成合影 CG 时，插件会把角色外观描述与该场小剧场的情境作为文本提示发送到 DashScope；这一步需要你手动点击触发。
- 用户上传的背景和立绘保存在全局存档中，不会随上述两类外部请求发送。
- Harness 原文不会写入 Galgame 存档。全局状态只保存固定的类别与状态线索、匿名去重指纹和最近提及时间；外部请求中也只包含固定的类别与状态提示。

本插件仓库的 `.gitignore` 无法自动保护其他工作区。如果当前工作区本身也是 Git 仓库，请在该工作区的 `.gitignore` 中加入：

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

## 开发

~~~sh
npm ci
npm run sanitize:backgrounds
npm run embed:art
npm run export:art
npm run verify
~~~

`lib/` 与 `src/client/art.generated.ts` 是构建产物，不再提交到仓库。`prepare` 脚本会在安装时运行 `npm run embed:art` 和 `tsdown`，因此从 git 安装的插件会自行构建，仓库压缩包也保持精简；克隆后执行一次 `npm install` 即可在本地生成它们。`npm run sanitize:backgrounds` 会剥离六张角色背景的非画面 WebP 元数据，`npm run embed:art` 会将白名单原图写入运行时，`npm run export:art` 则反向导出公开的 22 项运行时美术以供核对。

## 许可与致谢

代码、Galgame UI 实现与文档采用 [MIT License](LICENSE.md)。六张角色立绘、七张内置背景和八张鲸鱼娘表情，共 21 张默认图片，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)；本项目制作的 AI 辅助图片仅在维护者持有相应权利的范围内按该许可提供。`pet-spritesheet.webp` 桌宠图集及直接继承自 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 的代码沿用其 MIT 许可。逐文件边界见 [NOTICE](NOTICE.md)，上游许可原文见 [`assets/default/licenses/`](assets/default/licenses/)。

最后，感谢以下创作者把具体作品和实现经验分享给社区：

- **上善**创作了鲸鱼娘的原始角色形象：[Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)。
- **ZipZipPipe**在鲸鱼娘形象上加入 DeepSeek 元素，完成女仆鲸鱼娘二创：[Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)。
- **Small-tailqwq** 在开源项目 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 中提供了本插件沿用的深海宫殿背景。
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)** 以 MIT 许可开源了 DSH 鲸鱼娘桌宠。本插件的桌宠功能基于该项目二次开发，`pet-spritesheet.webp` 与上游相同；本项目调整了插件集成方式与界面样式，并加入点击桌宠进入 Galgame 界面的交互。
- Claude、GPT、Gemini、Kimi、Grok 五张模型娘立绘、六张角色日常背景和 Galgame UI 为本项目制作的非官方 AI 辅助素材，不代表相关厂商的官方形象、合作或背书。

如果这些开源素材和实现对你有帮助，欢迎给 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 与 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 点个 Star，也可以在 Pixiv 或 Bilibili 关注上善与 ZipZipPipe。插件安装、运行或兼容性问题请提交到[本仓库 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)，不要打扰素材作者排查插件代码。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok 等名称和商标归各自权利人所有。本项目是非官方社区插件，与相关厂商不存在隶属、合作或背书关系。

## dsh galgame相关项目友情链接

- [gal-view](https://github.com/Ayase34/gal-view) - DSH Web GUI 会话页的 Galgame 风格对话视图 + 场景元素可视化编辑器
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame) - GalGame 模式界面插件
