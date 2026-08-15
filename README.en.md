# dsh-whale-galgame

[简体中文](README.md) · **English** · [日本語](README.ja.md) · [한국어](README.ko.md)

A Galgame conversation view for DeepSeek Harness Web. Choose the displayed character separately from the model that writes replies; DeepSeek, Claude, GPT, Gemini, Kimi, and Grok each keep separate affection, memory, dialogue history, CG gallery, and custom-sprite data. The desktop pet and generated CGs are optional.

The installed plugin embeds and uses 16 real default images: six character sprites, one background, eight whale-girl expressions, and one 11-row desktop-pet animation atlas. The public GitHub source repository also exposes matching exported files in [`assets/default/`](assets/default/README.md); it does not substitute a separate placeholder art set.

![dsh-whale-galgame running in DSH Web](docs/screenshots/galgame-overview.png)

> The plugin interface is currently in Simplified Chinese. This page translates the installation and usage documentation.

## What it does

- Choose the displayed character separately from the reply model. A role can follow the workspace model or be pinned; replies can use the default `deepseek-v4-flash`, follow the workspace, or use a model listed by DSH.
- The six roles keep separate affection, level, memory, dialogue history, CG gallery, and custom-sprite data.
- Each turn offers close, neutral, and distant reply options in shuffled positions. Free-text input remains available.
- Manage the background, per-role sprite, dialogue archive, CG gallery, and desktop pet from the interface. Clicking the pet opens the `galgame` tab.

## Bundled default art

The six images below are the default role sprites used after installation, not README mockups. In the GitHub source repository, [`assets/default/`](assets/default/README.md) lists all 16 exported files and their runtime purposes. The npm installation uses the same images embedded in the client bundle instead of packaging a second raw-image copy.

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="Default DeepSeek whale-girl sprite"><br><strong>DeepSeek · Whale Girl</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.png" width="180" alt="Default Claude-inspired character sprite"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.png" width="180" alt="Default GPT-inspired character sprite"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.png" width="180" alt="Default Gemini-inspired character sprite"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.png" width="180" alt="Default Kimi-inspired character sprite"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.png" width="180" alt="Default Grok-inspired character sprite"><br><strong>Grok</strong></td>
  </tr>
</table>

The rest of the default pack comprises the `palace-night.webp` deep-sea palace background, eight `whale-*.png` expression images, and the 8-column × 11-row `pet-spritesheet.webp` animation atlas. See the [NOTICE](NOTICE.md) and [third-party license index](THIRD_PARTY_LICENSES.md) for sources, modifications, and file-by-file licensing.

The Galgame layout, dialogue box, controls, and decorations are public in [`src/client/index.ts`](src/client/index.ts); there is no undisclosed UI-image pack.

## Install

DeepSeek Harness must be installed with a working `dsh` command and Web profile.

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

After installation, stop the running Web profile and start it again:

~~~sh
dsh --profile web
~~~

If a source installation exposes the command as `pnpm dsh`, keep the same arguments.

### Update and remove

~~~sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
~~~

Stop and restart the Web profile after either operation.

## Use and settings

![Plugin configuration in DSH Web](docs/screenshots/plugin-settings.png)

The Galgame top bar controls the displayed character and actual dialogue model. It also accepts a background or a sprite for the current role. PNG, JPEG, WebP, and AVIF are supported, with a 12 MB browser-side limit per file.

Settings → Plugins → Plugin configuration contains the plugin toggle and the default character and reply-model choices. Disabling the plugin pauses Galgame dialogue and affection settlement without deleting existing data.

## Optional generated CGs

Level-up CGs use DashScope `qwen-image-3.0` at 1920 × 1080 by default. Without a DashScope key, chat, role switching, history, affection, and custom images still work; only CG generation is unavailable.

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

Runtime data is stored in `.whale-girl-save.json` at the active workspace root. It may contain role state, dialogue history, CGs, user backgrounds, and user sprites, so treat it as private data.

- Ordinary dialogue is sent to the model provider selected in DSH.
- Generating a level-up CG sends a text prompt to DashScope.
- User-uploaded backgrounds and sprites remain in the workspace save and are not included in either external request.

This plugin repository's `.gitignore` cannot protect a different workspace automatically. If the active workspace is itself a Git repository, add these entries to that workspace's `.gitignore`:

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

The public repository contains only the default art distributed with the plugin. It contains no maintainer or user save, dialogue history, generated CG, uploaded background, uploaded sprite, API key, or private source-art collection.

## Development

~~~sh
npm ci
npm run export:art
npm run verify
~~~

The repository commits installable `lib/index.js` and `lib/client.js` bundles. Rebuild and commit both after changing `src/`. `npm run export:art` exports the 16 public default images from the runtime data.

## License and credits

Code, the Galgame UI implementation, and documentation are covered by the [MIT License](LICENSE.md). The 16 bundled default images are distributed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/); project-produced AI-assisted images are offered under that license only to the extent the maintainer holds the applicable rights. See the file-by-file [NOTICE](NOTICE.md) and preserved upstream texts in [`assets/default/licenses/`](assets/default/licenses/).

Finally, thank you to the people who made specific artwork and implementation knowledge available to the community:

- **上善** created the original whale-girl character: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176).
- **ZipZipPipe** added DeepSeek elements to that character in the maid whale-girl redesign: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597).
- **Small-tailqwq** published the deep-sea palace background, whale-girl standing sprite, and Galgame UI decorations reused here in [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), together with the full attribution chain. This project built eight additional expression images and one 11-row desktop-pet animation atlas from that material.
- **@linxin666/dsh-pet**, available through [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui), served as an implementation reference for pet states, click interaction, and DSH integration. The current whale-girl pet atlas was made by this project; it did not come from `dsh-pet`.
- **Craybreeding / [Hatch Pet](https://github.com/Craybreeding/hatch-pet)** published the 8 × 11 Codex v2 pet-atlas generation, validation, and packaging workflow. This project used that workflow to organize and check the whale-girl atlas; it did not reuse Hatch Pet's example animal artwork.
- The Claude-, GPT-, Gemini-, Kimi-, and Grok-inspired sprites and the Galgame UI are unofficial, AI-assisted project artwork. They are not official character designs, partnerships, or endorsements from the named companies.

If these open-source materials and implementations help you, consider starring [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui), and [Hatch Pet](https://github.com/Craybreeding/hatch-pet), or following 上善 and ZipZipPipe on Pixiv or Bilibili. Please report installation, runtime, or compatibility problems to [this repository's Issues](https://github.com/JAdpp/dsh-whale-galgame/issues) rather than asking the artists to troubleshoot plugin code.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok, and related marks belong to their respective owners. This is an unofficial community plugin and is not affiliated with, partnered with, or endorsed by those owners.
