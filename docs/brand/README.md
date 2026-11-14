# Project wordmark

The current logo is the wordmark **dsh-whale-galgame**. It has two arrangements,
each supplied for light and dark backgrounds:

| Arrangement | Light background | Dark background |
| --- | --- | --- |
| Stacked title | [`logo-title.svg`](logo-title.svg) | [`logo-title-dark.svg`](logo-title-dark.svg) |
| Single line | [`logo-inline.svg`](logo-inline.svg) | [`logo-inline-dark.svg`](logo-inline-dark.svg) |

The letterforms come from **Playfair Display Italic**, © The Playfair Display
Project Authors, licensed under **SIL Open Font License 1.1**. They have been
converted to outlines: these SVGs are graphics made from glyph outlines and do
not contain font software. No font files are distributed with the repository,
and rendering requires no external font or network resource. The typeface
source and license are linked in [`THIRD_PARTY_LICENSES.md`](../../THIRD_PARTY_LICENSES.md).

The top of the **l** in “whale” becomes a whale tail with golden starbursts.
The two hyphens are golden lines with pearls, and lace trim with a bow sits
under “whale”. These ornaments are drawn in code. The wordmark does not
incorporate a model company's logo. The graphic follows the project's
CC BY-NC-SA 4.0 artwork terms to the extent the maintainer holds applicable
rights; see [`LICENSE.md`](../../LICENSE.md).

All four README editions put the stacked title inside the centered `<h1>`,
at about 380 CSS pixels wide, with `<picture>` choosing the light- or dark-background
variant through `prefers-color-scheme`. The subtitle and language switcher
remain centered below it. The plugin's runtime interface does not embed a logo.

[`logo-simple.png`](logo-simple.png), the previous 1254 × 1254 transparent
whale-tail-and-star mark made with Codex's built-in image generator on
2026-11-12 (exact model version not exposed), is **superseded** and retained
as a historical asset. Both the earlier hand-drawn SVG and ornate Image 2.6
draft are also superseded. Historical prompts, provenance, dimensions and
SHA-256 records remain in [`assets/workshop`](../../assets/workshop/README.md);
they describe those historical marks, not the current wordmark.
