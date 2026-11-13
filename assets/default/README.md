# Bundled default art

This directory contains the exact 22 image files embedded in
`src/client/art.generated.ts` and `lib/client.js`. Run `npm run export:art`
from the repository root to reproduce the files from the runtime data URLs.
Only this allowlisted set is part of the public default art pack.

## Runtime assets

| Runtime key | File | Purpose |
| --- | --- | --- |
| `pet-dafeiyu` | `pet-dafeiyu.webp` | 6 × 7 desktop-pet animation atlas; 2304 × 3584, 384 × 512 per cell |
| `maid-left` | `maid-left.webp` | DeepSeek / whale-girl default standing sprite |
| `whale-cheerful` | `whale-cheerful.webp` | Cheerful expression variant |
| `whale-shy` | `whale-shy.webp` | Shy expression variant |
| `whale-serious` | `whale-serious.webp` | Serious expression variant |
| `whale-confused` | `whale-confused.webp` | Confused expression variant |
| `whale-angry` | `whale-angry.webp` | Angry expression variant |
| `whale-frightened` | `whale-frightened.webp` | Frightened expression variant |
| `whale-exasperated` | `whale-exasperated.webp` | Exasperated expression variant |
| `whale-starry` | `whale-starry.webp` | Starry-eyed expression variant |
| `palace-night` | `palace-night.webp` | Built-in alternative deep-sea palace background |
| `bg-deepseek-seaside-study` | `bg-deepseek-seaside-study.webp` | Default DeepSeek / whale-girl seaside-study background |
| `bg-claude-writing-study` | `bg-claude-writing-study.webp` | Claude writing-study default background |
| `bg-gpt-collaboration-workshop` | `bg-gpt-collaboration-workshop.webp` | GPT collaboration-workshop default background |
| `bg-gemini-twin-creative-studio` | `bg-gemini-twin-creative-studio.webp` | Gemini twin creative-studio default background |
| `bg-kimi-moonlit-reading-study` | `bg-kimi-moonlit-reading-study.webp` | Kimi moonlit reading-study default background |
| `bg-grok-electronics-studio` | `bg-grok-electronics-studio.webp` | Grok electronics-studio default background |
| `claude-zipzippipe` | `claude-zipzippipe.webp` | Claude role sprite by ZipZipPipe |
| `gpt-zipzippipe` | `gpt-zipzippipe.webp` | GPT role sprite by ZipZipPipe |
| `gemini-dual-prism-translator-v4` | `gemini-dual-prism-translator-v4.webp` | Gemini-inspired role sprite |
| `kimi-lunar-scroll-navigator-v5` | `kimi-lunar-scroll-navigator-v5.webp` | Kimi-inspired role sprite |
| `grok-zipzippipe` | `grok-zipzippipe.webp` | Grok role sprite by ZipZipPipe |

The atlas has 40 named frames and two unused cells. Rows 0–3 retain the 24
work, waiting, meal, idle-action, hover, carry and landing frames. Rows 4–6
contain `look-0` through `look-15`: clockwise from up in 22.5° steps, at
column `n % 6`, row `4 + floor(n / 6)`; the last two cells are empty.
All cells share the foot line at y = 498. Runtime CSS uses 1152 × 1792 pixels
before the pet's density scale.

## Sources and modifications

- `maid-left.webp` and `palace-night.webp` are redistributed from the
  [`dsh-deep-whale / maid-atelier`](https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/maid-atelier)
  skin. They are byte-identical to the upstream standing sprite and night
  background.
- The eight `whale-*.webp` files are full-resolution transparent expression
  variants (935 × 1682/1683) created from the credited maid whale-girl design
  for this plugin.
- `pet-dafeiyu.webp` is AI-assisted artwork made for this project with
  **Codex's built-in image generator**; the tool does not expose its exact model
  version. It redraws the chibi appearance from
  [`f0909172434/dsh-deepseek-girl-pet`](https://github.com/f0909172434/dsh-deepseek-girl-pet)'s
  atlas (previously distributed here as `pet-spritesheet.webp`) as a reference.
  The added 16 gaze frames redraw the upstream 16-direction frames as references.
  The character design retains the 上善 → ZipZipPipe whale-girl attribution chain.
  After generation, only cutout-edge cleanup, consistent proportions, foot-line
  alignment and 6 × 7 atlas assembly were performed, followed by WebP export
  (lossy q90). This is not a byte-identical upstream copy. It follows the
  project's CC BY-NC-SA 4.0 artwork terms, to the extent the maintainer holds
  applicable rights. The upstream MIT license is retained for the adapted pet
  state mapping and DSH integration code.
- The Claude, GPT, and Grok standing sprites are by ZipZipPipe
  ([original post](https://www.bilibili.com/opus/1233069202138464289)) under CC BY-NC-SA 4.0. This project removed the
  white background, cropped them to the figure, and converted them to WebP.
- The Gemini- and Kimi-inspired standing sprites are unofficial, AI-assisted
  concept art created for this project. They do not contain or reproduce
  official model-company artwork or exact logos.
- The six `bg-*.webp` role backgrounds are new, AI-assisted project artwork.
  Claude, GPT, Gemini, Kimi, and Grok use their matching background by default.
  DeepSeek uses the seaside study by default, with the upstream deep-sea palace
  available as a built-in alternative. A user-uploaded
  background or a saved CG overrides the current role's built-in background
  until the user restores a built-in choice.
- The Galgame interface itself is React/CSS source under `src/client/index.ts`;
  there is no separate hidden UI image pack.

The reused whale-girl material retains the 上善 → ZipZipPipe → Small-tailqwq
attribution chain; the new pet redraw retains 上善 → ZipZipPipe and credits its
chibi reference above. All 22 bundled default images follow CC BY-NC-SA 4.0,
with project-made assets covered to the extent the maintainer holds applicable
rights. Code, UI source, and documentation
remain under MIT. See [`NOTICE.md`](../../NOTICE.md),
[`LICENSE.md`](../../LICENSE.md), and the preserved upstream texts in
[`licenses/`](licenses/) before redistributing or modifying these files.
