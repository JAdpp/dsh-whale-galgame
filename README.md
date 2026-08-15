# dsh-whale-galgame

**简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

DeepSeek Harness Web 的 Galgame 对话插件。显示角色与实际回复模型可以分别选择；六个角色分别保存好感度、记忆、聊天记录、CG 图鉴和自定义立绘。桌宠与升级 CG 均可关闭。

![dsh-whale-galgame 在 DSH Web 中的实际运行界面](docs/screenshots/galgame-overview.png)

_截图来自实际运行的 DSH Web，使用演示会话，不包含 API key、文件路径或个人聊天记录。_

## 功能

- 显示角色与回复模型分开选择：角色可以跟随工作区模型或手动固定；回复模型可以使用插件默认的 <code>deepseek-v4-flash</code>、跟随工作区，或从 DSH 模型目录中选择。
- DeepSeek、Claude、GPT、Gemini、Kimi、Grok 六个角色分别保存好感度、等级、记忆、聊天记录、CG 图鉴和立绘。
- 每轮提供亲近、普通、疏离三种倾向的回复，显示顺序随机；也可以直接输入内容。
- 背景、角色立绘、对话历史、CG 图鉴和桌宠均可从界面管理。点击桌宠会打开 <code>galgame</code> 标签页。

## 安装

需要已安装 DeepSeek Harness，并能运行 <code>dsh</code> 的 Web profile。

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

安装完成后，先停止正在运行的 Web profile，再重新启动：

~~~sh
dsh --profile web
~~~

如果源码安装提供的是 <code>pnpm dsh</code>，保留相同参数即可。

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

升级 CG 默认通过 DashScope 的 <code>qwen-image-3.0</code> 生成，尺寸为 1920 × 1080。没有 DashScope key 时，聊天、角色切换、历史、好感度和自定义图片仍可使用，只有 CG 生成不可用。

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

运行时数据保存在当前工作区根目录的 <code>.whale-girl-save.json</code>，其中可能包含角色状态、聊天记录、CG、背景和立绘。请把它当作私人数据处理。

- 普通对话会发送给你在 DSH 中选择的模型提供商。
- 生成升级 CG 时，插件会把文本提示发送到 DashScope。
- 用户上传的背景和立绘保存在工作区存档中，不会随上述两类外部请求发送。

本插件仓库的 <code>.gitignore</code> 无法自动保护其他工作区。如果当前工作区本身也是 Git 仓库，请在该工作区的 <code>.gitignore</code> 中加入：

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

公开仓库不包含维护者的存档、聊天记录、私人 CG、上传图片或本地素材库。

## 开发

~~~sh
npm ci
npm run prune:art
npm run verify
~~~

仓库提交了可直接安装的 <code>lib/index.js</code> 和 <code>lib/client.js</code>。修改 <code>src/</code> 后需要重新构建并提交这两个文件。

## 许可与致谢

代码和文档采用 [MIT License](LICENSE.md)。README 中的真实界面截图以及截图内可见的角色、背景等素材遵循各自原许可；来源与说明见 [NOTICE.md](NOTICE.md)。

感谢上善、ZipZipPipe、[Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 和 [@linxin666/dsh-pet（dsh-web-ui）](https://github.com/zhu1090093659/dsh-web-ui)。使用或重新分发第三方素材前，请确认其许可并保留原作者署名。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok 等名称和商标归各自权利人所有。本项目是非官方社区插件，与相关厂商不存在隶属、合作或背书关系。
