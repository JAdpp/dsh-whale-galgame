# dsh-whale-galgame · 跨会话事件敏感的galgame引擎插件

**简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

DeepSeek Harness Web 的 Galgame 界面对话插件。显示角色与实际回复模型可以分别选择；DeepSeek、Claude、GPT、Gemini、Kimi、Grok 六个模型角色分别保存好感度、记忆、聊天记录、CG 图鉴和自定义立绘。桌宠与升级 CG 均可关闭。

插件安装包实际内嵌并使用 22 项运行时美术：六张角色立绘、七张内置背景、八张鲸鱼娘表情，以及一张来自 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 的 11 行桌宠动画图集。GitHub 公开仓库在 [`assets/default/`](assets/default/README.md) 另行提供同一批可核对的导出图片。

![dsh-whale-galgame 在 DSH Web 中的实际运行界面](docs/screenshots/galgame-overview.jpg)

## 功能

- 显示角色与回复模型分开选择：角色可以跟随工作区模型或手动固定；回复模型可以使用默认的 `deepseek-v4-flash`、跟随工作区，或从 DSH 模型目录中选择。
- 六个角色的好感度、等级、记忆、聊天记录、CG 图鉴和自定义立绘彼此分离。
- 每轮提供亲近、普通、疏离三种倾向的回复，显示顺序随机；也可以直接输入内容。
- 切换角色时会同步切换对应的内置背景；鲸鱼娘默认仍使用深海宫殿，新的海边书房可在“背景图”中选作替代。用户上传背景或保存的 CG 会覆盖角色默认背景，直到恢复内置选项。
- 背景、角色立绘、对话历史、CG 图鉴和桌宠均可从界面管理。点击桌宠会打开 `galgame` 标签页。

## 好感度与跨对话上下文

### 关系进度

每个角色都从 Lv.1、0 点好感开始，状态彼此独立。亲近、普通、疏离三个回复选项分别结算 +1、0、-1，位置每轮随机；自由输入使用轻量关键词规则结算。插件运行期间，同一工作区新产生的 Harness `assistant/message` usage 事件中，输入与输出 token 每累计 5,000 个，当前角色增加 1 点；每次结算最多兑换 3 点，余量继续保留，插件自身发起的模型调用不计入，也不回算历史 usage。超过 24 小时未活动后，所有角色按每天 2 点衰减，最低为 0。

升级阈值为 `30 + 15 × (Lv - 1)`，即 30、45、60……。达到阈值后升级，超出部分保留到下一级；等级不设上限。角色语气随关系进度分为五档，Lv.5 后保持最高亲昵档。启用 CG 生成时，每次升级会生成一张纪念 CG。

### Harness 任务事件

插件最多检查同一工作区内最近 72 小时的 16 个顶层 Harness 会话，包括实时与已保存会话，并只扫描每个会话末尾 240 条事件。本地、确定性规则将任务归为代码调试、代码开发、文档总结、文档写作、文学创作、资料调研、数据分析、视觉设计、演示文稿、翻译校对或任务规划。本地分类只使用真人明确提交的 user 正文，并可参考工具名与轮次结束状态；不读取或发送工具参数、工具结果和 assistant 正文。

只有固定的任务类别与状态提示会发给 Galgame 回复模型和 CG 生成服务。模型娘会在回应当前话题时自然带到一句相关关心，例如代码调试后提醒主人不要熬夜。每个角色分别保存事件指纹与最近提及时间：同一事件对该角色只主动提一次，不同事件之间至少间隔 30 分钟。任务事件只影响话题，不直接增减好感度。

## 内置默认美术

下面六张图是安装后各模型角色使用的默认立绘。GitHub 源码仓库中的 [`assets/default/`](assets/default/README.md) 列出了全部 22 项图片及其运行时用途；npm 安装包只携带内嵌后的客户端 bundle，不重复收录导出原图或生成图源码。

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="DeepSeek 鲸鱼娘默认立绘"><br><strong>DeepSeek · 鲸鱼娘</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.png" width="180" alt="Claude 模型娘默认立绘"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.png" width="180" alt="GPT 模型娘默认立绘"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.png" width="180" alt="Gemini 模型娘默认立绘"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.png" width="180" alt="Kimi 模型娘默认立绘"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.png" width="180" alt="Grok 模型娘默认立绘"><br><strong>Grok</strong></td>
  </tr>
</table>

六个角色的新背景如下。Claude、GPT、Gemini、Kimi 和 Grok 默认使用各自背景；DeepSeek 鲸鱼娘仍以 `palace-night.webp` 深海宫殿为默认，下图海边书房是内置可选替代。

<table>
  <tr>
    <td align="center"><img src="assets/default/bg-deepseek-seaside-study.png" width="260" alt="DeepSeek 鲸鱼娘海边书房可选背景"><br><strong>DeepSeek · 可选替代</strong></td>
    <td align="center"><img src="assets/default/bg-claude-writing-study.png" width="260" alt="Claude 写作书房默认背景"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/bg-gpt-collaboration-workshop.png" width="260" alt="GPT 协作工坊默认背景"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/bg-gemini-twin-creative-studio.png" width="260" alt="Gemini 双子创意工作室默认背景"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/bg-kimi-moonlit-reading-study.png" width="260" alt="Kimi 月下阅读室默认背景"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/bg-grok-electronics-studio.png" width="260" alt="Grok 电子工作室默认背景"><br><strong>Grok</strong></td>
  </tr>
</table>

完整运行时素材还包括八张 `whale-*.png` 表情，以及 8 列 × 11 行的 `pet-spritesheet.webp` 桌宠动画图集。前 21 张默认图片与桌宠图集采用不同许可；来源、修改内容和逐文件许可见 [NOTICE](NOTICE.md) 与 [第三方许可索引](THIRD_PARTY_LICENSES.md)。

Galgame 界面的布局、对话框、控件和装饰随 [`src/client/index.ts`](src/client/index.ts) 公开，不依赖未公开的 UI 图片包。

## 安装

需要已安装 DeepSeek Harness，并能运行 `dsh` 的 Web profile。

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

安装完成后，先停止正在运行的 Web profile，再重新启动：

~~~sh
dsh --profile web
~~~

如果源码安装提供的是 `pnpm dsh`，保留相同参数即可。

### 更新与卸载

~~~sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
~~~

更新或卸载后同样需要停止并重新启动 Web profile。

## 使用与设置

![DSH Web 中的插件配置界面](docs/screenshots/plugin-settings.png)

在 Galgame 顶栏可以切换“角色来源”和“实际对话”，也可以上传背景或当前角色的立绘。背景和立绘支持 PNG、JPEG、WebP、AVIF，浏览器端单个文件上限为 12 MB。

在“设置 → 插件 → 插件配置”中可以启停插件、设置默认角色和默认回复模型。关闭插件会暂停 Galgame 对话和好感度结算，但不会删除已有数据。

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

运行时数据保存在当前工作区根目录的 `.whale-girl-save.json`，其中可能包含角色状态、聊天记录、CG、用户背景和用户立绘。请把它当作私人数据处理。

- 普通对话会发送给你在 DSH 中选择的模型提供商。
- 生成升级 CG 时，插件会把文本提示发送到 DashScope。
- 用户上传的背景和立绘保存在工作区存档中，不会随上述两类外部请求发送。
- Harness 上下文只会在存档中写入不含原文的事件指纹和最近提及时间，不保存 Harness 原文；外部请求中只包含固定的类别与状态提示。
- 如果当前会话与插件存档不属于同一工作区，Galgame 页面会拒绝读取角色状态和任务摘要，不会跨工作区复用数据。

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

仓库提交了可直接安装的 `lib/index.js` 和 `lib/client.js`。修改 `src/` 后需要重新构建并提交这两个文件；`npm run sanitize:backgrounds` 会剥离六张角色背景的非画面 PNG 元数据，`npm run embed:art` 会将白名单原图写入运行时，`npm run export:art` 则反向导出公开的 22 项运行时美术以供核对。

## 许可与致谢

代码、Galgame UI 实现与文档采用 [MIT License](LICENSE.md)。六张角色立绘、七张内置背景和八张鲸鱼娘表情，共 21 张默认图片，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)；本项目制作的 AI 辅助图片仅在维护者持有相应权利的范围内按该许可提供。`pet-spritesheet.webp` 桌宠图集及直接继承自 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 的代码沿用其 MIT 许可。逐文件边界见 [NOTICE](NOTICE.md)，上游许可原文见 [`assets/default/licenses/`](assets/default/licenses/)。

最后，感谢以下创作者把具体作品和实现经验分享给社区：

- **上善**创作了鲸鱼娘的原始角色形象：[Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)。
- **ZipZipPipe**在鲸鱼娘形象上加入 DeepSeek 元素，完成女仆鲸鱼娘二创：[Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)。
- **Small-tailqwq** 在开源项目 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 中提供了本插件沿用的深海宫殿背景、鲸鱼娘立绘和 Galgame UI 装饰，并保留了完整创作链。本项目在这些素材基础上继续制作了八张表情。
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)** 以 MIT 许可开源了 DSH 鲸鱼娘桌宠。本插件的桌宠功能基于该项目二次开发，`pet-spritesheet.webp` 与上游相同；本项目调整了插件集成方式与界面样式，并加入点击桌宠进入 Galgame 界面的交互。
- Claude、GPT、Gemini、Kimi、Grok 五张模型娘立绘、六张角色日常背景和 Galgame UI 为本项目制作的非官方 AI 辅助素材，不代表相关厂商的官方形象、合作或背书。

如果这些开源素材和实现对你有帮助，欢迎给 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 与 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 点个 Star，也可以在 Pixiv 或 Bilibili 关注上善与 ZipZipPipe。插件安装、运行或兼容性问题请提交到[本仓库 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)，不要打扰素材作者排查插件代码。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok 等名称和商标归各自权利人所有。本项目是非官方社区插件，与相关厂商不存在隶属、合作或背书关系。

## dsh galgame相关项目友情链接

- [gal-view](https://github.com/Ayase34/gal-view)
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame)
