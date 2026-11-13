# Office high-resolution candidate

Selected: **office-hires.png**, a byte-for-byte copy of **office-hires-2.png**. Two image-generation attempts, including one targeted edit; no upscaling, resampling, compositing or pixel repairs were applied to either generated output. The tool returned **1254×1254**, despite requesting 2048×2048. This meets the 1254 minimum; 2048 preference: **not met**. No source, script, manifest or existing documentation was edited; no commit.

## Files and provenance

| File | Pixels / mode | Operation and exact prompt | Tool / model | Exposed source ID |
|---|---|---|---|---|
| office-reference-627.png | 627×627 RGB | Original atlas crop, box (0,0,627,627); no generation prompt | Pillow crop; no generative model | Upstream manifest: exec-3fe596af-6228-4b06-87d1-6210b2abbcee |
| office-hires-1.png | 1254×1254 RGB | First redraw; exact Prompt 1 below | image_gen.imagegen / Codex built-in image generation; model/version not exposed | exec-eeec5b2d-6f9e-4520-8a89-4a75acbb2e87 |
| office-hires-2.png | 1254×1254 RGB | Targeted edit of 1; exact Prompt 2 below | image_gen.imagegen / Codex built-in image generation; model/version not exposed | exec-fa10d3f9-2e19-4074-9a7c-7237034d5e8a |
| office-hires.png | 1254×1254 RGB | Exact copy of 2; Prompt 2, no additional generation | Same as 2 | Same as 2 |

Source IDs for new generations are the returned PNG filename stems; no separate generation-ID/model-version field was returned. Both calls used `transparent_background: false`. PNG metadata was empty. Do not label these outputs GPT Image 2.6.

Reference: `../public-rooms-atlas.png`, SHA-256 `57993235514e01bf176836adb6b756724a6364f023b48bbde8db9a81af7166e3`. Prompt 1 input order: `office-reference-627.png` (layout), `../themed-rooms-atlas.png` (style only). Prompt 2 input order: `office-hires-1.png` (edit target), `office-reference-627.png` (original layout). The style wording was read from `../generation-prompts.json → publicRoomPrompt`; its older numerical layout was superseded by this task's coordinates.

## Honest checks

These are visual checks against the crop, with real dimensions/mode read from the files. Rug bounds below are approximate outer-border estimates, not exact segmentation. **met** for placement means the same relative layout at visual precision, not pixel-perfect coordinates.

| Hard requirement | Reference crop | Attempt 1 | Attempt 2 and final |
|---|---|---|---|
| Standalone square, >=1254px | **not met**: 627px source only | **met**: 1254px | **met**: 1254px |
| Faithful same room; orthographic RPG camera; crisp HD pixel clusters | **met**: baseline | **met** | **met**; fine edges somewhat smoother than source |
| Ivory/oak/brass, blue curtains, exactly 3 arched ocean windows | **met** | **met** | **met** |
| Exactly 6 empty rugs, 3×2 at original relative positions | **met**: baseline | **met**, approximately; ~2–6px edge differences at 2× | **met**, approximately; ~1–4px edge differences at 2× |
| No desks/chairs/people or objects on rugs | **met** | **met** | **met** |
| North cabinet, scrolls, books, crystals, armillary, hydrangeas, star chart, tall bookcases and sconces above y≈0.34 | **met** | **met**: bottom ≈424/1254=0.338 | **met**: bottom ≈424/1254=0.338 |
| West column, clock, ivy, glass jar and hydrangea vase left of x≈0.12, including foliage | **not met** if treated as a strict limit: source leaves also protrude slightly | **not met**: lower hydrangea leaves reach ≈0.134 | **met**: foliage ends ≈147/1254=0.117 |
| Clear parquet aisle x≈0.87–0.93 to right of rugs | **met** | **met**, approximately: ornate rug edge reaches ≈0.873 | **met**: rug right edge ≈0.868; clear aisle below north furniture |
| Open north doorway at x≈0.87–0.92 | **met** | **met** | **met**: full requested span open through top edge; gap also extends farther left as in source |
| No text/labels/watermarks/UI/people/computers/screens | **met** | **met** | **met**: star chart is decorative geometry, no readable labels |
| Opaque, whole square filled, outer wall frame at edges | **met**: RGB | **met**: RGB | **met**: RGB |

At 1254px the exact 2× target rug bounds are x=192–434 / 520–762 / 848–1090; y=490–736 / 814–1060. Attempt 1 estimates: x≈191–436 / 518–766 / 847–1095; y≈486–737 / 813–1064. Attempt 2/final estimates: x≈194–434 / 520–761 / 847–1089; y≈489–733 / 814–1057. **Exact pixel matching: not met** in both attempts. Attempt 2 improves containment without material new layout drift, so no second corrective edit was used. South edge retains the reference's low wall and right-hand opening; a closed south wall was optional.

SHA-256: reference crop `a1f21f586c6c38984bc4c55dec1bc3eaf81dfbd99e19eac8fd7f4d98214cf273`; attempt 1 `9f6976fa4ff8986fd4695067e48d361e367d26e4201cfec0f226dc5acf2cc76e`; attempt 2/final `514a9a968787583b49eaf24b5124ee6bf39d1372eaa45cb6f4a5190b4891a864`.

## Exact Prompt 1

```text
Use case: precise-object-edit / faithful high-detail redraw.
Output ONE standalone square office background PNG, opaque, at the HIGHEST native resolution available: ideally 2048x2048, minimum 1254x1254. This is a new detailed redraw of the attached office, not a resampled enlargement and not a redesign. Do not output an atlas.

INPUT ROLES: Image 1 (office-reference-627.png) is the exact layout and content reference: reproduce this SAME room and composition. Image 2 (themed-rooms-atlas.png) is ONLY the crisp HD pixel-art rendering reference; do not copy its bedrooms, furniture arrangements, desks, chairs, whiteboards or characters.

Faithfully retain Image 1's overhead/front-facing orthographic RPG Maker camera: horizontal north wall and vertical west/east walls, parallel architecture, no vanishing point, no isometric diagonal room edges. MATCH the dorm reference's rich crisp HD pixel clusters, sharply articulated wood grain, books, brass and ivory trim, discrete pixel shading and furniture detail. Polished pixel-art, not soft painterly brushwork or 3D rendering. Preserve the original bright ivory/oak/brass palette, honey parquet, soft sky blue curtains, lilac hydrangeas.

GEOMETRY LOCK — coordinates are fractions of the full square, origin top left. Keep all SIX EMPTY square/rectangular desk rugs in exactly the same 3 columns x 2 rows, at these bounds:
left column x=0.153..0.346; middle x=0.415..0.608; right x=0.676..0.869.
top row y=0.391..0.587; bottom row y=0.649..0.845.
Thus at 2048px rug bounds are approximately x=313..709, 850..1245, 1384..1780 and y=801..1202, 1329..1731. Keep their original thin ivory/blue/gold ornate borders and parquet-like empty centers. Do NOT enlarge, recenter, shift, round, merge, stagger, or place anything on these rugs. All six rug interiors remain completely EMPTY: NO desks, tables, chairs, stools, people, equipment or plants. Those objects will be placed later by game code. Preserve wide clear floor aisles between the rugs.

Retain the exact north wall composition above y approximately 0.34: THREE tall arched ocean-view windows, the same blue draped curtains, candle wall sconces, tall bookcases at the sides and the long oak/brass display cabinet. Keep the scrolls, books, blue/violet crystals, central brass armillary sphere, hydrangea vase and framed star chart in their original order and approximate positions. Keep the slim west-side bookcase column, clock, ivy, glass jar and hydrangea vase wholly along the left edge x approximately 0..0.12. Increase authored surface detail without introducing new furniture or changing silhouettes/footprints.

Preserve the clear honey-parquet vertical strip to the right of all six rugs, x=0.87..0.93. It leads to the visible OPEN NORTH doorway gap at the top-right x approximately 0.87..0.92. Keep the north passage OPEN to the top edge: do not fill it with a door panel, cabinet, plant, wall or lintel across the walkable gap. The south wall may be closed. Keep the low ivory/oak cutaway outer wall frame at the image edges as in the original. The room fills the complete square, no external margin, no padding, no second room.

ABSOLUTE EXCLUSIONS: no text, lettering, labels, numbers, watermarks, signature, UI, people, animals, computers, monitors, screens, keyboards or phones. Exactly three north windows and exactly six empty rug zones. Preserve layout first; fidelity and actual crisp higher-resolution detail are the purpose.
```

## Exact Prompt 2

```text
Use case: precise-object-edit.
Edit Image 1, the generated high-resolution office, with ONLY small geometry corrections listed below. Image 2 is the original 627px office layout reference. Preserve the excellent existing redraw, object identities, palette, crisp HD pixel clusters, lighting, three ocean-view arched windows, blue curtains, north display cabinet and all its instruments, and orthographic RPG Maker camera. Do not redesign or add anything.
Output ONE standalone square opaque PNG at the highest native resolution available, ideally 2048x2048 and at least 1254x1254. Keep the same full-square room and outer frame at the edges, with no margins.

TARGETED CORRECTION 1 — rug edges and right walking strip:
Keep all SIX rugs empty in the existing 3 columns by 2 rows, but tighten their ornate borders into the original exact relative rectangles:
columns x=0.153..0.346, 0.415..0.608, 0.676..0.869;
rows y=0.391..0.587 and 0.649..0.845.
At the current 1254px size, the intended bounds are x=192..434, 520..762, 848..1090; y=490..736 and 814..1060. These are only 2..6px corrections from Image 1, not a new layout. Do not recenter or alter row/column spacing. Keep original blue/ivory/gold rectangular border motifs and parquet-like completely empty rug centers. All six rugs must have NO furniture, desks, chairs, tables, stools, plants, equipment or characters. Keep uninterrupted clear parquet right of the rugs throughout x=0.87..0.93 below the north furniture.

TARGETED CORRECTION 2 — west floral silhouette:
The bottom-left hydrangea leaves in Image 1 protrude to about x=0.134. Gently compress or shift ONLY that west-column vase/foliage inward so the whole west-side bookcase-column ensemble and its foliage, clock, ivy, glass jar and hydrangea vase below y=0.34 stay left of x=0.12. At 1254px the rightmost leaf must end before x=150, ideally x=146, preserving all objects and the clear floor. Do not widen or move the west wall, and do not delete the hydrangea. Do not alter the north-corner bookcase above y=0.34.

INVARIANTS: retain the north-wall furniture entirely above y approximately 0.34; retain the open north doorway gap at top-right x approximately 0.87..0.92, open through the top image edge without wall, cabinet or door panel across it; retain open clear parquet aisle to its south. South wall may stay as in Image 1. Horizontal north/south walls, vertical west/east walls, parallel orthographic architecture, no vanishing point or isometric diagonal walls. Same bright ivory/oak/brass, honey parquet, blue curtains, three arched ocean windows. No text, letters, labels, watermarks, UI, people, animals, computers, screens, keyboards or phones.
Make these two tiny corrections only; retain every other part of Image 1.
```

