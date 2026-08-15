# Notices, asset map, and credits

## Public-distribution boundary

This public repository includes the exact 16 default image files used by the installed plugin. It does not include a placeholder-art substitute.

It does **not** include a maintainer or user save, dialogue history, generated CG, uploaded background, uploaded character sprite, API key, or private source-art collection. Those remain local user data and are outside this distribution.

## Whale-girl attribution chain

The whale-girl material follows this attribution chain:

1. **上善** — creator of the original 鲸鱼娘 / whale-girl character: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176).
2. **ZipZipPipe** — creator of the maid whale-girl redesign that added DeepSeek elements: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597).
3. **Small-tailqwq / dsh-deep-whale** — publisher of the open-source `maid-atelier` skin, including the deep-sea palace background, whale-girl standing sprite, UI decorations, and the preserved attribution chain: [GitHub repository](https://github.com/Small-tailqwq/dsh-deep-whale) · [`maid-atelier` directory](https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/maid-atelier).
4. **dsh-whale-galgame** — prepared eight additional expression images and one 8-column × 11-row desktop-pet animation atlas from the credited whale-girl material for this plugin.

This chain is distributed under CC BY-NC-SA 4.0. Preserve the full attribution, use the material only on the license's noncommercial terms, and license adaptations under the same terms. The upstream license and notice copies are preserved at [`assets/default/licenses/dsh-deep-whale-LICENSE.txt`](assets/default/licenses/dsh-deep-whale-LICENSE.txt) and [`assets/default/licenses/dsh-deep-whale-NOTICE.txt`](assets/default/licenses/dsh-deep-whale-NOTICE.txt).

## File-by-file map of the 16 bundled images

All files in this table are distributed under CC BY-NC-SA 4.0. For project-produced, AI-assisted images, that grant applies only to the extent the maintainer holds the applicable rights.

| # | File | Source and role | Modifications in this distribution |
| ---: | --- | --- | --- |
| 1 | `assets/default/maid-left.webp` | `dsh-deep-whale / maid-atelier`; DeepSeek whale-girl default standing sprite | Byte-identical export of the upstream runtime asset; filename and runtime key are documented here. |
| 2 | `assets/default/palace-night.webp` | `dsh-deep-whale / maid-atelier`; default deep-sea palace background | Byte-identical export of the upstream runtime asset; filename and runtime key are documented here. |
| 3 | `assets/default/whale-cheerful.png` | Project-prepared cheerful expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 4 | `assets/default/whale-shy.png` | Project-prepared shy expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 5 | `assets/default/whale-serious.png` | Project-prepared serious expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 6 | `assets/default/whale-confused.png` | Project-prepared confused expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 7 | `assets/default/whale-angry.png` | Project-prepared angry expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 8 | `assets/default/whale-frightened.png` | Project-prepared frightened expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 9 | `assets/default/whale-exasperated.png` | Project-prepared exasperated expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 10 | `assets/default/whale-starry.png` | Project-prepared starry-eyed expression in the whale-girl chain | Resized and processed as a 400 × 720 transparent PNG for the plugin's expression system. |
| 11 | `assets/default/pet-spritesheet.webp` | Project-prepared desktop-pet adaptation in the whale-girl chain | Assembled with a Hatch Pet workflow into an 8-column × 11-row WebP atlas, adding animation frames, poses, and a Chinese fortune-dialogue frame. This is not an atlas supplied by `dsh-pet`. |
| 12 | `assets/default/claude-amber-manuscript-mediator-v5.png` | Unofficial Claude-inspired, AI-assisted project artwork | Exported as a 1024 × 1536 runtime PNG and assigned to the Claude role; it does not reproduce an official character design or exact logo. |
| 13 | `assets/default/gpt-recursive-weaver-v7.png` | Unofficial GPT-inspired, AI-assisted project artwork | Exported as a 1024 × 1536 runtime PNG and assigned to the GPT role; it does not reproduce an official character design or exact logo. |
| 14 | `assets/default/gemini-dual-prism-translator-v4.png` | Unofficial Gemini-inspired, AI-assisted project artwork | Exported as a 1024 × 1536 runtime PNG and assigned to the Gemini role; it does not reproduce an official character design or exact logo. |
| 15 | `assets/default/kimi-lunar-scroll-navigator-v5.png` | Unofficial Kimi-inspired, AI-assisted project artwork | Exported as a 1024 × 1536 runtime PNG and assigned to the Kimi role; it does not reproduce an official character design or exact logo. |
| 16 | `assets/default/grok-cosmic-signal-ranger-v5.png` | Unofficial Grok-inspired, AI-assisted project artwork | Exported as a 1024 × 1536 runtime PNG and assigned to the Grok role; it does not reproduce an official character design or exact logo. |

The exported file list is reproducible from the embedded runtime data with `npm run export:art`. [`assets/default/README.md`](assets/default/README.md) records the corresponding runtime keys. The same image payloads are embedded as data URLs in `src/client/art.generated.ts` and `lib/client.js`; those payloads retain the image licenses listed here, while the surrounding program code remains under MIT.

## Galgame interface

The Galgame interface layout, frames, controls, dialogue presentation, and current React/CSS implementation were produced for this unofficial project with AI assistance and are covered by this repository's MIT license. The visual direction retains and adapts decorative ideas made available by the `dsh-deep-whale / maid-atelier` skin, while the public plugin has no separate hidden UI-image pack.

This interface is not official artwork, a product partnership, or an endorsement from DeepSeek, Claude, OpenAI, Google, Moonshot AI, xAI, or any related company.

## dsh-pet implementation reference

`@linxin666/dsh-pet`, distributed through [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui), was consulted for desktop-pet state animation, click interaction, and DSH integration. It did **not** provide the current whale-girl sprite atlas.

The package metadata observed during integration names Apache-2.0, while the `LICENSE` file bundled inside the package is BSD 3-Clause. This repository does not attempt to resolve that upstream discrepancy. It preserves and cites the bundled license text at [`assets/default/licenses/dsh-pet-LICENSE.txt`](assets/default/licenses/dsh-pet-LICENSE.txt) and makes no claim that the current atlas came from that package.

## Hatch Pet workflow reference

[Craybreeding / Hatch Pet](https://github.com/Craybreeding/hatch-pet) publishes an 8 × 11 Codex v2 pet-atlas generation, validation, and packaging workflow. This project used that workflow to organize and check `pet-spritesheet.webp`; it did not copy Hatch Pet's example animal artwork. Hatch Pet identifies its project-specific additions under MIT and upstream-derived skill files under Apache-2.0. No Hatch Pet code or example asset is shipped in this repository.

## Documentation screenshots

The screenshots under `docs/screenshots/` are captures of the plugin running in DSH Web, not hand-drawn or generated interface mockups. Cropping was used to focus on the plugin; no replacement UI was drawn over the captures.

- `docs/screenshots/galgame-overview.png` shows the running Galgame view with the default whale-girl sprite and deep-sea palace background. The pictured artwork remains under CC BY-NC-SA 4.0.
- `docs/screenshots/plugin-settings.png` shows the real DSH Web plugin-settings dialog. DSH Web and visible surrounding components remain subject to their own licenses.

Inclusion in a screenshot does not relicense any pictured work.

## Friendly links

- Star [Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) for the open-source deep-sea palace background, whale-girl standing sprite, UI decoration work, and attribution record.
- Star [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) for the DSH Web community ecosystem that distributes `@linxin666/dsh-pet`.
- Star [Craybreeding / Hatch Pet](https://github.com/Craybreeding/hatch-pet) for the open pet-atlas generation, validation, and packaging workflow.
- Follow 上善 on [Pixiv](https://www.pixiv.net/users/62155430) or [Bilibili](https://space.bilibili.com/4456176), and ZipZipPipe on [Pixiv](https://www.pixiv.net/users/18604994) or [Bilibili](https://space.bilibili.com/4168597).

Please send plugin installation, runtime, or compatibility reports to [dsh-whale-galgame Issues](https://github.com/JAdpp/dsh-whale-galgame/issues), not to the artists.

## Product and trademark notice

DeepSeek, DeepSeek Harness, Claude, ChatGPT, GPT, Gemini, Kimi, Grok, and all related names and marks belong to their respective owners. This community plugin is unofficial and is not endorsed by, affiliated with, or partnered with those owners.
