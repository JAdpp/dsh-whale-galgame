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

This project directly adapts the upstream desktop-pet state animation, 16-direction pointer tracking, 1.1-second reset behavior, and DSH integration. It changes the integration and styling and makes a click open the Galgame interface.

`assets/default/pet-spritesheet.webp` is a byte-identical copy of the upstream `assets/spritesheet.webp` (SHA-256 `234f24a97c18195a00c6093da0090773e675993c169e92e7e13a24c37b323fa2`) and remains under the same MIT terms.

## ZipZipPipe AI-girl sprites

- Creator: ZipZipPipe ([Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597))
- Original post: [Bilibili](https://www.bilibili.com/opus/1233069202138464289)
- Applicable terms: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

`assets/default/claude-zipzippipe.webp`, `assets/default/gpt-zipzippipe.webp`, and `assets/default/grok-zipzippipe.webp` are adaptations of those originals: the white background was removed, each image was cropped to the figure, and it was converted to WebP. The adaptations are distributed under the same license.

## Project-produced role artwork

The Gemini and Kimi standing sprites and six `bg-*.webp` role backgrounds are unofficial, AI-assisted artwork newly produced for this project, not third-party company art. They are distributed under CC BY-NC-SA 4.0 to the extent the maintainer holds the applicable rights. The six backgrounds map to DeepSeek, Claude, GPT, Gemini, Kimi, and Grok; the DeepSeek seaside-study scene is an optional built-in alternative, while the other five are their roles' defaults. See [NOTICE.md](NOTICE.md) for the exact file-by-file map.

## Generated workshop and brand artwork

The eight current runtime images—shared-room backgrounds, the high-resolution workshop office, six themed dorms, resident animation, two walk-cycle key-frame sheets, character-specific workstation animation and outdoor decorations—and the current minimalist brand mark were produced with Codex's built-in image generator after the user approved those routes. The tool does not expose its exact model version. The themed dorms reference each character's default visual-novel background, preserving furniture and visual motifs; DeepSeek references the credited deep-sea palace rather than its optional seaside-study background. The newly drawn shared rooms preserve their interiors, and the map uses books, drawing materials, prisms and mechanical tools instead of computers or monitors. The transparent `decor-atlas-builtin.png` adds plants, flower stands, lamps, bookcases, benches and an armillary sphere beside the continuously tiled outdoor paths.

The PNG atlases remain the masters; the client bundle embeds same-name WebP derivatives with unchanged dimensions and artwork terms. Room atlases use lossy quality 92, and resident, walking, workstation and decoration atlases use near-lossless compression. See [`assets/workshop/README.md`](assets/workshop/README.md) for regeneration with `sharp` and `scripts/convert-workshop-art.mjs` and the required manifest hash updates.

The earlier `manor-atlas-image26.png` and ornate logo draft were produced with GPT Image 2.6 Sunburst and are superseded; neither is current runtime artwork. The old manor image remains in the source tree, and historical generation records and hashes are retained for provenance. These images follow the project's CC BY-NC-SA 4.0 artwork policy, subject to the rights limitation in [LICENSE.md](LICENSE.md). The resident designs and referenced background material retain the attribution above. See [`assets/workshop/README.md`](assets/workshop/README.md) for the file map and generation record.

## Creator profiles

- 上善, original whale-girl character: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)
- ZipZipPipe, maid whale-girl redesign with DeepSeek elements: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)

If their work helped you, consider following the creators and starring [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) or [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet). Report plugin-specific technical problems to [this repository's Issues](https://github.com/JAdpp/dsh-whale-galgame/issues).
