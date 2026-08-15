# License

This repository contains material under more than one license. The following boundaries are part of the license notice.

## Code, Galgame UI, and documentation — MIT

Copyright (c) 2026 JAdpp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The MIT terms above cover this repository's program code, Galgame UI implementation and project-authored interface design, build scripts, and documentation. The UI was produced with AI assistance but is an unofficial project interface; it is not an official design supplied or endorsed by any named model company.

## Bundled default images — CC BY-NC-SA 4.0

The 16 image files under [`assets/default/`](assets/default/README.md) are distributed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/), subject to the attribution chain and file-level notes in [NOTICE.md](NOTICE.md):

- the whale-girl standing sprite and deep-sea palace background carried forward from `dsh-deep-whale`;
- the eight project-prepared whale-girl expression variants;
- the project-prepared 8-column × 11-row whale-girl desktop-pet animation atlas; and
- the five unofficial, AI-assisted Claude-, GPT-, Gemini-, Kimi-, and Grok-inspired default standing sprites.

For AI-assisted or otherwise project-produced visual material, this license grant applies only to the extent that the maintainer holds the applicable rights. It does not grant rights in third-party names, marks, upstream character contributions, or model output beyond what applicable law and the relevant service terms permit.

The same CC BY-NC-SA 4.0 terms apply to the image payloads embedded as data URLs in `src/client/art.generated.ts` and `lib/client.js`. The source structure, loader logic, and other surrounding program code remain under MIT; embedding an image does not change that image's license or relicense the surrounding code.

The preserved `dsh-deep-whale` license and attribution notice are available at:

- [`assets/default/licenses/dsh-deep-whale-LICENSE.txt`](assets/default/licenses/dsh-deep-whale-LICENSE.txt)
- [`assets/default/licenses/dsh-deep-whale-NOTICE.txt`](assets/default/licenses/dsh-deep-whale-NOTICE.txt)

## dsh-pet implementation reference — BSD 3-Clause

`@linxin666/dsh-pet` was consulted for desktop-pet state animation, click interaction, and DSH integration. The copy of `LICENSE` bundled with that package is BSD 3-Clause and is preserved at [`assets/default/licenses/dsh-pet-LICENSE.txt`](assets/default/licenses/dsh-pet-LICENSE.txt). See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for the upstream package-metadata discrepancy.

The current `pet-spritesheet.webp` was made for this project from the credited whale-girl material. It is not an atlas supplied by `dsh-pet`, and this section does not reclassify that image as a `dsh-pet` asset.

## Screenshots and user material

Documentation screenshots are captures of the running interface. A screenshot does not relicense the characters, backgrounds, or other artwork visible inside it; those elements keep the licenses described above and in [NOTICE.md](NOTICE.md).

User saves, dialogue history, generated CGs, uploaded backgrounds, uploaded sprites, API keys, and private source-art collections are not part of this repository or any license grant made here. Material supplied by a user keeps its existing ownership and license.
