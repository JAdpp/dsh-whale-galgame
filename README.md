<p align="center">
  <img src="docs/brand/logo-simple.png" width="160" height="160" alt="深海工坊：鲸尾与星光">
</p>

<h1 align="center">dsh-whale-galgame</h1>

<h3 align="center">跨会话任务事件感知的多角色 Galgame 引擎</h3>

<p align="center">
  <strong>简体中文</strong> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a>
</p>

## 简介

在Harness执行工作的间隙，探寻你与模型娘间“非比寻常”的同事关系～(∠・ω< )⌒★

`dsh-whale-galgame` 是专为DeepSeek Harness Web与Desktop打造的独立多角色Galgame界面插件。通过无缝融入日常工作流，它让冰凉的AI交互化作温暖长情的陪伴：

- **6 位性格各异的模型娘**：支持DeepSeek（大肥鱼/鲸鱼娘）、Claude、GPT、Gemini、Kimi与Grok，立绘、好感度、记忆与背景相互独立。
- **外观与内核解耦**：喜欢大肥鱼的机甲，又想用Claude或GPT进行深度对话（NTR?）角色形象与底层回复模型可随心搭配。
- **「小剧场」模式**：告别单一问答，解锁多模型娘联动日常、工作复盘短剧与专属里程碑剧情。
- **伴你成长的羁绊系统**：日常互动与工作Token积累均可提升好感，解锁专属亲昵语气与AI生成的纪念CG。
- **轻量可爱的桌面宠物**：支持常驻屏幕一角，点击即可一键切入Galgame界面。
- **深海工坊像素地图**：宿舍按已接入的模型系列自动增减，配有工作区、茶水休息室和海底观景室；工作时在工位忙碌，空闲时散步或休息，点击模型娘即可和她对话。

![dsh-whale-galgame在DSH Web中的实际运行界面](docs/screenshots/galgame-overview.jpg)

## 可定制化体验

- 四档文字速度、带表情回看的对话记录，支持 H / 右键隐藏界面。
- Web Audio合成音效与BGM，可分别开关和调节音量，默认关闭。
- 根据近期DSH任务类别、本地日期和距上次对话的时间，让回应贴近日常工作。
- 可编辑角色昵称、称呼、问候、性格、语气与 CG 外观描述。
- 可上传背景与立绘，在不同工作区继续同一份对话和设置。
- 同一插件支持DeepSeek Harness Web与Desktop。

关系进度、任务感知和生成规则见[机制说明](docs/mechanics.md)。

## 安装

需要先安装 DeepSeek Harness，并有可用的 `dsh` 命令。

### Web

安装到 `web` profile：

~~~sh
dsh plugin --profile web add dsh-whale-galgame
~~~

停止正在运行的 Web profile，再启动：

~~~sh
dsh --profile web
~~~

源码安装若使用 `pnpm dsh`，保留相同参数即可。

### Desktop

先打开一次 DeepSeek Harness Desktop 完成初始化，在“应用 → 管理 dsh 命令”中安装自带的命令，再彻底退出桌面版（包括托盘）：

~~~sh
dsh plugin --profile desktop add dsh-whale-galgame
~~~

重新打开桌面版即可，也可在桌面版“插件”页面按包名安装；Desktop 使用 `desktop` profile。Web 与 Desktop 使用同一个安装包；若二者使用相同的 `DSH_HOME`，可接续同一份存档。

### 更新与卸载

~~~sh
dsh plugin --profile web update dsh-whale-galgame
dsh plugin --profile web remove dsh-whale-galgame
~~~

操作后重启 Web profile；桌面版将 `web` 换为 `desktop`，操作前先彻底退出，完成后重新打开。

### 从 GitHub 安装

跟随 `main` 最新提交：

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

Git 安装需要现场构建；若 pnpm 报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，将它打印的完整 commit 键按下例加入该 profile 的 `pnpm-workspace.yaml`，每次更新提交时同步更换键，npm 发布包已预构建，无需此项：

~~~yaml
allowBuilds:
  'dsh-whale-galgame@https://codeload.github.com/JAdpp/dsh-whale-galgame/tar.gz/<commit>': true
~~~

## 使用

点击 DSH 会话顶部的 `galgame` 页签或右下角桌宠进入。首次使用可直接选择回复选项，也可输入自己的话。

顶栏“角色来源”选择出场角色，“实际对话”选择回复模型；角色可跟随工作区或手动固定，回复可使用默认的 `deepseek-v4-flash`、跟随工作区或选择 DSH 模型目录中的模型。

顶栏“对话历史”用于回看普通对话，“小剧场”记录保存已完成的短剧，“CG图鉴”集中查看生成的图片，并可将 CG 设为背景。

### 深海工坊地图

点击 Galgame 顶栏的“工坊地图”进入，地图在当前 Galgame 内打开。宿舍按 Harness 已接入的模型系列自动增减：只接入 DeepSeek 时只有她的一间宿舍，同系列多个模型版本共用对应模型娘的房间。宿舍最多每排三间，数量增加时自动换排；工作区、茶水休息室和海底观景室保留。支持放大、滚动查看与暂停散步。

角色位置跟随实际 Harness 工作模型：运行中的任务让对应角色前往工位，提问或审批时在工位等待，任务结束后回宿舍或去公共区域活动。可以同时显示多个模型和子 Agent 的工作；同一角色有多个任务时会显示任务数量。

六位模型娘各有主题宿舍，分别参考她们默认视觉小说背景中的深海宫殿、琥珀写作书房、协作工作坊、双棱镜创意工坊、月夜阅读书房和电子工坊。床铺、书架、窗饰与摆设完整保留；公共工作区、茶水休息室、海底观景室与回廊使用重新绘制的完整背景，不把家具拆成贴片，场景内不含电脑或显示屏。

房间之间和边缘空地连续铺满瓷砖，盆栽、花台、落地灯、书柜、长凳和天球仪沿通路之外布置。场景内不显示房名或人物姓名，侧栏“工坊里的她们”保留可点击的角色名单与工作状态。

路线沿 48px 网格穿门通行。角色从桌前地面进入工位后，切换为坐在桌后的专属动作：鲸鱼娘做潮汐推演、Claude 羽笔校稿、GPT 圆规制图、Gemini 棱镜译码、Kimi 月卷归档、Grok 机械检修。

点击像素小人或侧栏“工坊里的她们”中的角色，会进入她的 Galgame 并固定出场角色，保留原来的回复模型设置。已有小剧场会保留进度，可用“继续小剧场”返回。地图闲逛位置不写入存档，也不调用模型生成；系统开启“减少动态效果”时改为静态位置显示。

![深海工坊像素地图，演示状态](docs/screenshots/workshop-map.png)

<details>
<summary>仅接入 DeepSeek 时的布局</summary>

![仅有 DeepSeek 宿舍的自适应地图，虚构状态演示](docs/screenshots/workshop-one-resident.png)

</details>

### 快捷键

| 操作 | 效果 |
| --- | --- |
| 点击台词 / Space / Enter | 补全当前台词；小剧场中整句显示后再次操作推进下一句 |
| H / 在背景或立绘上右键 | 隐藏界面，欣赏立绘 |
| 隐藏时点击 / H / Esc | 恢复界面 |
| 在对话框上向上滚动 | 打开对话记录，回看台词与当时表情 |

### 显示与图片

点击对话框右上角齿轮，调整文字速度、字体、氛围特效、音效、BGM 和音量；文艺字体使用本机字体。
顶栏“个性化 → 背景图 / 角色立绘”支持上传 PNG、JPEG、WebP、AVIF；选择内置背景可恢复随角色切换的场景；图片大小与默认背景规则见[图片说明](docs/mechanics.md#舞台图片与显示设置)。

在“设置 → 插件 → 鲸鱼娘”中设置默认角色与回复模型、启停插件或控制桌宠显示；停用插件会暂停对话与好感度结算，存档保留。

![DSH Web 中的插件配置界面](docs/screenshots/plugin-settings.png)

### 自定义角色设定

顶栏“个性化 → 角色设定”可编辑昵称、对用户的称呼、首次问候、性格、语气和 CG 外观描述。
每个角色单独保存，在所有工作区共享；“恢复默认”只恢复当前角色的这六项设定，保存或恢复均保留好感度、历史与自定义立绘。
问候更新及已有记录的处理见[详细设置](docs/mechanics.md#自定义角色设定)。

### 小剧场

点击顶栏“小剧场”生成角色间的日常短剧或工作复盘，完成后可在“小剧场”记录中回看台词。
联网取材默认开启，可在“设置 → 插件 → 鲸鱼娘 → 小剧场取材”中切换为“只用本地任务类别”。
生成合影CG需在记录中手动点击，使用与升级CG相同的DashScope配置。

![多角色小剧场效果展示](docs/screenshots/side-story-multi-character.png)

### 桌宠

桌宠内置且默认开启，点击进入 Galgame；顶栏“桌宠 · 开/关”与插件设置的“显示桌宠”同步。
隐藏后仍可从 `galgame` 页签进入并重新开启。

### 可选的升级 CG

升级 CG 需要可用的 DashScope key；在启动 DSH 的本地环境中设置 `DASHSCOPE_API_KEY`，例如：

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

CG 是可选功能，未配置key也能聊天、积累好感和使用自定义图片；真实key留在本地环境中。
生成规则与小剧场升级的区别见 [CG 说明](docs/mechanics.md#小剧场与-cg)。

## 数据与隐私

- 全局状态保存在 `DSH_HOME/storages/dsh-whale-galgame/global.json`，工作区 `.whale-girl-save.json` 保存来源/迁移标记，显示偏好在本地 `localStorage`。
- 任务感知在本地用用户明确提交的Harness消息判断活动类型，可参考工具名与状态；不读取工作区文件内容，原文不写入Galgame存档。
- Galgame消息、相关历史、角色设定及日期/关系提示发送给所选模型；Harness 上下文只提供固定任务类别与状态提示。
- 小剧场联网取材只搜索模型名与题材词；CG生成向DashScope发送文本提示，用户上传的背景和立绘留在本地。
- 完整清除需先退出DSH，再删除全局存档、各工作区标记及存档副本，并清除插件显示偏好；“重新开始”只重置等级和好感度。

存储格式、旧版迁移、检索开关、Git忽略项及清除步骤见[数据与隐私详情](docs/privacy.md)。

## 开发

~~~sh
npm ci
npm run sanitize:backgrounds
npm run embed:art
npm run export:art
npm run verify
~~~

`lib/`、`src/client/art.generated.ts` 与 `src/client/workshop.generated.ts` 为不提交的构建产物；源码安装的 `prepare` 会生成它们。美术处理命令与打包范围见[构建说明](docs/mechanics.md#美术清单与构建说明)。

## 许可与致谢

代码、Galgame UI实现与文档采用 [MIT](LICENSE.md)。21 张默认图片采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)（非商业使用，改编以相同许可共享）；项目制作的 AI 辅助图片在维护者持有相应权利的范围内提供。桌宠图集及直接继承的桌宠代码沿用上游 MIT 许可。

感谢创作者与上游项目：

- **上善**创作原始鲸鱼娘，**ZipZipPipe**加入 DeepSeek 元素完成女仆二创，**Small-tailqwq / [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)** 提供沿用的立绘与深海宫殿背景；本项目据此制作表情差分。[上善 Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176) · [ZipZipPipe Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)。
- **ZipZipPipe**绘制 Claude、GPT、Grok 默认立绘（[原作动态](https://www.bilibili.com/opus/1233069202138464289)）；本项目去除白底、按人物裁切并转为 WebP。
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)** 提供桌宠实现与原样保留的图集；本项目调整集成、样式并加入点击进入 Galgame 的交互。
- Gemini、Kimi 立绘、六张角色背景和 Galgame UI 为本项目制作的非官方 AI 辅助素材。
- 当前庄园主题宿舍、公共区、人物、专属工位与室外装饰五张图集及简约 Logo 使用 Codex 内置绘图制作；工具未提供具体模型版本。图片与参考背景、许可和历史素材记录见[庄园美术说明](assets/workshop/README.md)。

完整文件清单、来源与哈希见[默认美术说明](assets/default/README.md)，逐文件许可见 [NOTICE](NOTICE.md)、[第三方许可索引](THIRD_PARTY_LICENSES.md)及[上游许可原文](assets/default/licenses/)。所有角色均为非官方同人形象，名称与商标归各权利人，本项目与相关厂商无隶属、合作或背书关系。

插件问题可提交到[本仓库 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)。

## dsh galgame相关项目友情链接

- [gal-view](https://github.com/Ayase34/gal-view) - DSH Web GUI会话页的Galgame风格对话视图 + 场景元素可视化编辑器
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame) - DSH Web galgame样式对话界面
- [AutoWebUI](https://github.com/FynnReinhardt/deepseek-harness-galgame) - DSH Web galgame角色扮演模式对话界面
