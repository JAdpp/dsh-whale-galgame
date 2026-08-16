# Bundled default art

This directory contains the exact 22 image files embedded in
`src/client/art.generated.ts` and `lib/client.js`. Run `npm run export:art`
from the repository root to reproduce the files from the runtime data URLs.
Only this allowlisted set is part of the public default art pack.

## Runtime assets

| Runtime key | File | Purpose |
| --- | --- | --- |
| `pet-spritesheet` | `pet-spritesheet.webp` | 8 × 11 desktop-pet animation atlas |
| `maid-left` | `maid-left.webp` | DeepSeek / whale-girl default standing sprite |
| `whale-cheerful` | `whale-cheerful.png` | Cheerful expression variant |
| `whale-shy` | `whale-shy.png` | Shy expression variant |
| `whale-serious` | `whale-serious.png` | Serious expression variant |
| `whale-confused` | `whale-confused.png` | Confused expression variant |
| `whale-angry` | `whale-angry.png` | Angry expression variant |
| `whale-frightened` | `whale-frightened.png` | Frightened expression variant |
| `whale-exasperated` | `whale-exasperated.png` | Exasperated expression variant |
| `whale-starry` | `whale-starry.png` | Starry-eyed expression variant |
| `palace-night` | `palace-night.webp` | Default deep-sea palace background |
| `bg-deepseek-seaside-study` | `bg-deepseek-seaside-study.png` | Optional DeepSeek / whale-girl seaside-study background |
| `bg-claude-writing-study` | `bg-claude-writing-study.png` | Claude writing-study default background |
| `bg-gpt-collaboration-workshop` | `bg-gpt-collaboration-workshop.png` | GPT collaboration-workshop default background |
| `bg-gemini-twin-creative-studio` | `bg-gemini-twin-creative-studio.png` | Gemini twin creative-studio default background |
| `bg-kimi-moonlit-reading-study` | `bg-kimi-moonlit-reading-study.png` | Kimi moonlit reading-study default background |
| `bg-grok-electronics-studio` | `bg-grok-electronics-studio.png` | Grok electronics-studio default background |
| `claude-amber-manuscript-mediator-v5` | `claude-amber-manuscript-mediator-v5.png` | Claude-inspired role sprite |
| `gpt-recursive-weaver-v7` | `gpt-recursive-weaver-v7.png` | GPT-inspired role sprite |
| `gemini-dual-prism-translator-v4` | `gemini-dual-prism-translator-v4.png` | Gemini-inspired role sprite |
| `kimi-lunar-scroll-navigator-v5` | `kimi-lunar-scroll-navigator-v5.png` | Kimi-inspired role sprite |
| `grok-cosmic-signal-ranger-v5` | `grok-cosmic-signal-ranger-v5.png` | Grok-inspired role sprite |

## Sources and modifications

- `maid-left.webp` and `palace-night.webp` are redistributed from the
  [`dsh-deep-whale / maid-atelier`](https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/maid-atelier)
  skin. They are byte-identical to the upstream standing sprite and night
  background.
- The eight `whale-*.png` files are full-resolution transparent expression
  variants (935 × 1682/1683) created from the credited maid whale-girl design
  for this plugin.
- `pet-spritesheet.webp` is a byte-identical copy of
  [`f0909172434/dsh-deepseek-girl-pet`](https://github.com/f0909172434/dsh-deepseek-girl-pet)'s
  `assets/spritesheet.webp` (SHA-256
  `234f24a97c18195a00c6093da0090773e675993c169e92e7e13a24c37b323fa2`).
  It remains under the upstream MIT License. This plugin modifies the pet's
  integration and interaction, not the atlas image itself.
- The Claude-, GPT-, Gemini-, Kimi-, and Grok-inspired standing sprites are
  unofficial, AI-assisted concept art created for this project. They do not
  contain or reproduce official model-company artwork or exact logos.
- The six `bg-*.png` role backgrounds are new, AI-assisted project artwork.
  Claude, GPT, Gemini, Kimi, and Grok use their matching background by default.
  DeepSeek keeps the upstream deep-sea palace as its default, with the new
  seaside-study scene available as a built-in alternative. A user-uploaded
  background or a saved CG overrides the current role's built-in background
  until the user restores a built-in choice.
- The Galgame interface itself is React/CSS source under `src/client/index.ts`;
  there is no separate hidden UI image pack.

The whale-girl attribution chain is 上善 → ZipZipPipe → Small-tailqwq. Twenty-one
bundled default images are released under CC BY-NC-SA 4.0, with project-made
assets covered to the extent the maintainer holds applicable rights. The pet
atlas remains under its upstream MIT License. Code, UI source, and documentation
remain under MIT. See [`NOTICE.md`](../../NOTICE.md),
[`LICENSE.md`](../../LICENSE.md), and the preserved upstream texts in
[`licenses/`](licenses/) before redistributing or modifying these files.
