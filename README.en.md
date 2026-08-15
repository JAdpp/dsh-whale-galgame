# dsh-whale-galgame

[简体中文](README.md) · **English** · [日本語](README.ja.md) · [한국어](README.ko.md)

A Galgame conversation view for DeepSeek Harness Web. Choose the displayed character separately from the model that writes replies; each of the six roles keeps its own affection, memory, dialogue history, CG gallery, and custom sprite. The desktop pet and generated CGs are optional.

![dsh-whale-galgame running in DSH Web](docs/screenshots/galgame-overview.png)

_This screenshot shows the plugin running in DSH Web with a demonstration conversation. It contains no API key, local file path, or personal chat history._

> The plugin interface is currently in Simplified Chinese. This page translates the installation and usage documentation.

## What it does

- Choose the displayed character separately from the reply model. A role can follow the workspace model or be pinned; replies can use the default <code>deepseek-v4-flash</code>, follow the workspace, or use a model listed by DSH.
- DeepSeek, Claude, GPT, Gemini, Kimi, and Grok keep separate affection, level, memory, dialogue history, CG gallery, and custom sprite data.
- Each turn offers positive, neutral, and distant reply options in shuffled positions. Free-text input remains available.
- Manage the background, per-role sprite, dialogue archive, CG gallery, and desktop pet from the interface. Clicking the pet opens the <code>galgame</code> tab.

## Install

DeepSeek Harness must be installed with a working <code>dsh</code> command and Web profile.

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

After installation, stop the running Web profile and start it again:

~~~sh
dsh --profile web
~~~

If a source installation exposes the command as <code>pnpm dsh</code>, keep the same arguments.

### Update and remove

~~~sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
~~~

Stop and restart the Web profile after either operation.

## Use and settings

![Plugin configuration in DSH Web](docs/screenshots/plugin-settings.png)

The Galgame top bar controls the character source and actual dialogue model. It also accepts a background or a sprite for the current role. PNG, JPEG, WebP, and AVIF are supported, with a 12 MB browser-side limit per file.

Settings → Plugins → Plugin configuration contains the plugin toggle and the default character and reply-model choices. Disabling the plugin pauses Galgame dialogue and affection settlement without deleting existing data.

## Optional generated CGs

Level-up CGs use DashScope <code>qwen-image-3.0</code> at 1920 × 1080 by default. Without a DashScope key, chat, role switching, history, affection, and custom images still work; only CG generation is unavailable.

Provide the key only through the local environment that starts DSH:

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

Do not write a real key into repository files or commit one to Git.

## Data and privacy

Runtime data is stored in <code>.whale-girl-save.json</code> at the active workspace root. It may contain role state, dialogue history, CGs, backgrounds, and sprites, so treat it as private data.

- Ordinary dialogue is sent to the model provider selected in DSH.
- Generating a level-up CG sends a text prompt to DashScope.
- User-uploaded backgrounds and sprites remain in the workspace save and are not included in either external request.

This plugin repository's <code>.gitignore</code> cannot protect a different workspace automatically. If the active workspace is itself a Git repository, add these entries to that workspace's <code>.gitignore</code>:

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

The public repository contains no maintainer save, dialogue history, private CG, uploaded image, or local source-art collection.

## Development

~~~sh
npm ci
npm run prune:art
npm run verify
~~~

The repository commits installable <code>lib/index.js</code> and <code>lib/client.js</code> bundles. Rebuild and commit both after changing <code>src/</code>.

## License and credits

Code and documentation are covered by the [MIT License](LICENSE.md). The real interface screenshots in this README, and any characters, backgrounds, or other artwork visible in them, remain subject to their respective original licenses. See [NOTICE.md](NOTICE.md) for sources and details.

Thanks to 上善, ZipZipPipe, [Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), and [@linxin666/dsh-pet in dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui). Check the applicable license and preserve author attribution before using or redistributing third-party artwork.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok, and related marks belong to their respective owners. This is an unofficial community plugin and is not affiliated with, partnered with, or endorsed by those owners.
