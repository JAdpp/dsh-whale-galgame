# Third-party licenses and attribution index

This file points to the license evidence preserved with the public default-art distribution. It supplements [LICENSE.md](LICENSE.md) and the file-by-file [NOTICE.md](NOTICE.md); it does not replace either one.

## dsh-deep-whale / maid-atelier

- Upstream project: [Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)
- Relevant skin: [`maid-atelier`](https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/maid-atelier)
- Preserved license: [`assets/default/licenses/dsh-deep-whale-LICENSE.txt`](assets/default/licenses/dsh-deep-whale-LICENSE.txt)
- Preserved attribution notice: [`assets/default/licenses/dsh-deep-whale-NOTICE.txt`](assets/default/licenses/dsh-deep-whale-NOTICE.txt)
- Applicable terms: CC BY-NC-SA 4.0

The reused deep-sea palace background and whale-girl standing sprite, plus project adaptations in the same whale-girl chain, require the full attribution chain: 上善 → ZipZipPipe → Small-tailqwq. The eight project-made expression images are adaptations under the same license.

## f0909172434 / dsh-deepseek-girl-pet

- Upstream project: [f0909172434 / dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)
- Preserved license: [`assets/default/licenses/dsh-deepseek-girl-pet-LICENSE.txt`](assets/default/licenses/dsh-deepseek-girl-pet-LICENSE.txt)
- Applicable terms: MIT License, Copyright (c) 2026 f0909172434

The desktop-pet state mapping, DSH integration, 16-direction pointer following and 1.1-second inactivity reset are adapted from this upstream project. The current implementation uses deterministic work, waiting, meal and idle-action sequences, pointer dragging and keyboard positioning. Clicking opens the Galgame interface. Gaze is active only during idle, yields to idle actions, hover, carrying and transitions, and is disabled for reduced motion.

`assets/default/pet-dafeiyu.webp` replaces the former `pet-spritesheet.webp`. It is AI-assisted artwork made for this project with **Codex's built-in image generator**; the tool does not expose its exact model version. The upstream chibi appearance and 16-direction gaze frames were used as redraw references, and the character design retains the 上善 → ZipZipPipe whale-girl attribution chain. After generation, only cutout-edge cleanup, consistent proportions, foot-line alignment and 6 × 7 atlas assembly (2304 × 3584; 384 × 512 per cell, foot line y = 498; 24 action frames plus 16 gaze frames and two empty cells) were performed, followed by WebP export (lossy q90). It is not a byte-identical copy of the upstream atlas. The new image follows the project's CC BY-NC-SA 4.0 artwork terms to the extent the maintainer holds applicable rights; the upstream MIT license remains preserved for the adapted code.

## ZipZipPipe AI-girl sprites

- Creator: ZipZipPipe ([Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597))
- Original post: [Bilibili](https://www.bilibili.com/opus/1233069202138464289)
- Applicable terms: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

`assets/default/claude-zipzippipe.webp`, `assets/default/gpt-zipzippipe.webp`, and `assets/default/grok-zipzippipe.webp` are adaptations of those originals: the white background was removed, each image was cropped to the figure, and it was converted to WebP. The adaptations are distributed under the same license.

## Project-produced role artwork

The Gemini and Kimi standing sprites and six `bg-*.webp` role backgrounds are unofficial, AI-assisted artwork newly produced for this project, not third-party company art. They are distributed under CC BY-NC-SA 4.0 to the extent the maintainer holds the applicable rights. The six backgrounds are the defaults for DeepSeek, Claude, GPT, Gemini, Kimi, and Grok; the deep-sea palace remains a built-in alternative for DeepSeek. See [NOTICE.md](NOTICE.md) for the exact file-by-file map.

## Generated workshop and historical brand artwork

The nine current runtime images—shared-room backgrounds, the high-resolution workshop office, six themed dorms, resident animation, three walk-cycle key-frame sheets, character-specific workstation animation and outdoor decorations—and the superseded minimalist brand mark `docs/brand/logo-simple.png` were produced with Codex's built-in image generator after the user approved those routes. The tool does not expose its exact model version. The themed dorms reference the credited character backgrounds, preserving furniture and visual motifs; DeepSeek retains the deep-sea-palace map theme even though the default visual-novel background is now the seaside study. The newly drawn shared rooms preserve their interiors, and the map uses books, drawing materials, prisms and mechanical tools instead of computers or monitors. The transparent `decor-atlas-builtin.png` adds plants, flower stands, lamps, bookcases, benches and an armillary sphere beside the continuously tiled outdoor paths.

The PNG atlases remain the masters; the client bundle embeds same-name WebP derivatives with unchanged dimensions and artwork terms. Room atlases use lossy quality 92, and resident, walking, workstation and decoration atlases use near-lossless compression. See [`assets/workshop/README.md`](assets/workshop/README.md) for regeneration with `sharp` and `scripts/convert-workshop-art.mjs` and the required manifest hash updates.

The earlier `manor-atlas-image26.png` and ornate logo draft were produced with GPT Image 2.6 Sunburst and are superseded; neither is current runtime artwork. The old manor image remains in the source tree, and historical generation records and hashes are retained for provenance. These images follow the project's CC BY-NC-SA 4.0 artwork policy, subject to the rights limitation in [LICENSE.md](LICENSE.md). The resident designs and referenced background material retain the attribution above. See [`assets/workshop/README.md`](assets/workshop/README.md) for the file map and generation record.

## Playfair Display wordmark

- Typeface: **Playfair Display Italic**, © The Playfair Display Project Authors
- Source: [Playfair Display project](https://github.com/clauseggers/Playfair-Display) and [Google Fonts Playfair Display sources](https://github.com/google/fonts/tree/main/ofl/playfairdisplay)
- Font license: [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/playfairdisplay/OFL.txt)

The current `docs/brand/logo-title.svg`, `logo-title-dark.svg`, `logo-inline.svg`
and `logo-inline-dark.svg` are graphics made from outlined glyphs, with whale-tail,
starburst, pearl, lace and bow ornaments drawn in code. They do not contain font
software, and no font files are distributed in this repository. The font's OFL
notice records the source of the letterforms; the project graphic follows the
CC BY-NC-SA 4.0 artwork terms and rights limitation in [LICENSE.md](LICENSE.md).
See [`docs/brand/README.md`](docs/brand/README.md) for arrangements and usage.

## Creator profiles

- 上善, original whale-girl character: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)
- ZipZipPipe, maid whale-girl redesign with DeepSeek elements: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)

If their work helped you, consider following the creators and starring [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) or [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet). Report plugin-specific technical problems to [this repository's Issues](https://github.com/JAdpp/dsh-whale-galgame/issues).
