# 方向行走图集生成记录

日期：2026-11-13。工作分支：`feat/map-polish-2`。只进行了内置图像生成和两次针对性编辑，共三次调用；没有使用 CLI/API 替代，也没有通过缩放、变形、翻转、重排或阈值抠图加工原图/生成图。PNG 均为生成结果的原样复制。

**结论：最佳候选为 `walk-directions-3.png`，已逐字节复制为 `walk-directions.png`；三次结果都没有满足全部硬要求，不能标为可直接接入的严格合格图集。** 第三版的背景残留少于另外两版，背面换腿更清楚，上方实质轮廓留白充足，但仍有低 alpha 背景残留、Row 2 基线偏高、侧面换腿不够明确、配对帧轻微漂移、背面书/卷轴被遮挡等问题。按要求已停止，不再追加第三次编辑。

## 工具、模型与来源

- 使用工具：内置 `image_gen.imagegen`（运行时调用名 `image_gen__imagegen`），每次均传入 `transparent_background: true`。
- **模型名称/版本未由工具暴露，正式 generation ID 也未单独返回。** 下文只记录工具输出路径及文件名中的来源标识，不将其臆称为特定模型或正式 generation ID。
- 原始角色/风格参考：`assets/workshop/residents-atlas-builtin.png`，1536×1024 RGBA；已实际查看。原提示读取自 `assets/workshop/generation-prompts.json → prompts.sprites`，未修改该文件。
- 原提示写足底锚点 `(128,232)`，原图实测足部约在 y=245–248；本次提示采用用户当前要求 y≈246–248。
- 原图并非完全干净的透明底：alpha 范围0–254，alpha=0共481,032像素，alpha=1共280,922像素；因此提示中特别要求不要复制原图背景/低alpha残留。
- 两次编辑分别以第一版、第二版为编辑目标；第一次编辑还附原图作角色参考，第二次编辑只附第二版。

## 检查方法与判定标准

直接用 Pillow 读取实际 PNG 的尺寸、RGBA、alpha 通道和像素值；没有改写图片。每个256px单元四周6px的边缘带合计为144,000像素。这个边缘带本应全部透明，检测到其中任意alpha非零即可证明“所有人物外背景alpha=0”不成立。低alpha总数包含轮廓边缘，**不能全部当作背景面积**；边缘带指标则是确定的违规证据。

足底/轮廓使用 **alpha≥128** 的实质前景阈值估计，并结合目视确认；不能用alpha>0的整格bbox把残留噪声当成人物。下面的“足底”是最低实质前景像素的本格y坐标，Grok需留意杖底，但这几版的最低实质像素目视落在足部。它不是对所有低alpha边缘的精确鞋底分割，也不是动画锚点已严格合格的保证。bbox以右/下边界不包含的Pillow约定记录。人物身份、视角、物件、动作由主Agent和独立只读审核共同目视检查；无法证实的严格条件按 **not met** 处理。

## 逐文件实测

| 文件 | 像素尺寸 / 模式 | 文件字节数 | alpha范围 | alpha=0像素 | alpha 1–127像素 | alpha=255像素 | 6px边缘带非零alpha像素 / 最大alpha |
|---|---|---:|---|---:|---:|---:|---|
| `walk-directions-1.png` | 1536×1024 / RGBA | 2659083 | 0–254 | 831258 | 170757 | 0 | 8433 / 248 |
| `walk-directions-2.png` | 1536×1024 / RGBA | 2733619 | 0–254 | 199449 | 834880 | 0 | 106429 / 7 |
| `walk-directions-3.png` | 1536×1024 / RGBA | 2613499 | 0–255 | 888597 | 138037 | 1 | 3702 / 7 |
| `walk-directions.png` | 1536×1024 / RGBA | 2613499 | 0–255 | 888597 | 138037 | 1 | 3702 / 7 |

**“背景alpha真正全部0”的判定：四个PNG均为 not met。** 有alpha通道不等于背景满足全0要求。第三版及最终副本的边缘带仍有3,702个非零alpha像素，最大alpha为7。

### 每行足底基线

列顺序均为 DeepSeek、Claude、GPT、Gemini、Kimi、Grok。目标本格y=246–248；若用严格锚点y=247，则目标全图y依次为247、503、759、1015。

| 文件 | 行 | 六列本格足底y（alpha≥128） | 六列全图足底y | 该行实质轮廓高度范围 |
|---|---:|---|---|---|
| `walk-directions-1.png` | 1 | 247, 247, 248, 248, 247, 248 | 247, 247, 248, 248, 247, 248 | 230–242px |
| `walk-directions-1.png` | 2 | 247, 247, 246, 247, 246, 247 | 503, 503, 502, 503, 502, 503 | 231–240px |
| `walk-directions-1.png` | 3 | 246, 246, 246, 246, 246, 246 | 758, 758, 758, 758, 758, 758 | 229–242px |
| `walk-directions-1.png` | 4 | 246, 246, 246, 246, 246, 246 | 1014, 1014, 1014, 1014, 1014, 1014 | 230–243px |
| `walk-directions-2.png` | 1 | 246, 246, 246, 246, 246, 246 | 246, 246, 246, 246, 246, 246 | 210–222px |
| `walk-directions-2.png` | 2 | 242, 242, 243, 243, 242, 242 | 498, 498, 499, 499, 498, 498 | 207–221px |
| `walk-directions-2.png` | 3 | 243, 243, 243, 243, 243, 243 | 755, 755, 755, 755, 755, 755 | 217–234px |
| `walk-directions-2.png` | 4 | 243, 243, 243, 243, 243, 243 | 1011, 1011, 1011, 1011, 1011, 1011 | 219–234px |
| `walk-directions-3.png` | 1 | 246, 246, 246, 246, 246, 246 | 246, 246, 246, 246, 246, 246 | 211–223px |
| `walk-directions-3.png` | 2 | 244, 244, 244, 244, 244, 244 | 500, 500, 500, 500, 500, 500 | 210–222px |
| `walk-directions-3.png` | 3 | 247, 247, 246, 247, 247, 247 | 759, 759, 758, 759, 759, 759 | 222–237px |
| `walk-directions-3.png` | 4 | 246, 246, 246, 246, 246, 246 | 1014, 1014, 1014, 1014, 1014, 1014 | 223–237px |
| `walk-directions.png` | 1 | 246, 246, 246, 246, 246, 246 | 246, 246, 246, 246, 246, 246 | 211–223px |
| `walk-directions.png` | 2 | 244, 244, 244, 244, 244, 244 | 500, 500, 500, 500, 500, 500 | 210–222px |
| `walk-directions.png` | 3 | 247, 247, 246, 247, 247, 247 | 759, 759, 758, 759, 759, 759 | 222–237px |
| `walk-directions.png` | 4 | 246, 246, 246, 246, 246, 246 | 1014, 1014, 1014, 1014, 1014, 1014 | 223–237px |

### 每项硬要求判定

`walk-directions.png` 与第三版完全相同，所有判定均继承第三版。

| 要求 | walk-directions-1.png | walk-directions-2.png | walk-directions-3.png / walk-directions.png |
|---|---|---|---|
| 1536×1024 PNG；6列×4行；256×256 切格 | met | met | met |
| 六列顺序与角色身份、配色保持 | met | met | met |
| Rows 1–2 向右、侧脸仅一眼 | met（目视） | met（目视） | met（目视） |
| Rows 1–2 身体与脸均严格90度侧面 | not met：身体/裙面略有三分之四展开 | not met：仍有少量躯干展开 | not met：仍有少量躯干展开 |
| Rows 1–2 确为右/左腿相反接触姿态 | not met：无法确认，前伸腿轮廓相似 | not met：无法确认，主要改变摆臂 | not met：后腿/摆臂有变化，但无法确认近远腿已交换 |
| Rows 3–4 背面、后脑、无脸无眼 | met（目视） | met（目视） | met（目视） |
| Rows 3–4 相反腿步态 | not met（严格验收）：GPT被尾裙遮挡，其他五列可见交替 | not met（严格验收）：GPT仍不清楚 | met（目视）：比前两版清楚，GPT仍有部分遮挡 |
| 两帧头高、躯干位置与尺度精确锁定 | not met：有约1px头顶漂移及躯干变化 | not met：约1–2px头顶漂移，脚底偏移 | not met：约1–2px头顶漂移，脚底未锁定 |
| 描边、像素簇、调色与SD比例接近参考 | met（目视） | met（目视） | met（目视），部分大步更接近跑步 |
| 人物约200px高并匹配参考尺度 | not met（严格验收）：实质轮廓229–243px；接近原图实际大小 | not met（严格验收）：207–234px，背面仍偏高 | not met（严格验收）：210–237px；比第一版更接近描述 |
| 每格水平大致居中、完整人物、无明显跨格/裁切 | met（目视）；不承诺身体锚点精确x=128 | met（目视）；不承诺身体锚点精确x=128 | met（目视）；不承诺身体锚点精确x=128 |
| 所有行足底在本格y=246–248 | met（alpha≥128估计）；各格不是完全同一y | not met：Rows 2–4 偏高 | not met：Row 2 为y=244 |
| 四边至少6px完全透明留白，附件也不例外 | not met：GPT后两行角顶y=4–5，且有背景残留 | not met：实质轮廓留白够，但低alpha残留进入边缘 | not met：实质轮廓留白够，但低alpha残留进入边缘 |
| 人物以外所有背景alpha确实全为0 | not met | not met | not met |
| 无halo/glow等低alpha残留 | not met：边缘空白有非零alpha | not met：边缘空白有非零alpha | not met：边缘空白仍有alpha=1–7 |
| 每个角度身份附件均可见 | not met：Claude书和Kimi卷轴在背面隐藏 | not met：背面书/卷轴仍隐藏 | not met：背面书/卷轴仍隐藏；侧面角/翼有重叠遮挡 |
| 无左向帧、无额外人物、无混列 | met（目视） | met（目视） | met（目视） |
| 无文字、标签、网格、gutter、水印、地面/接触阴影 | met（目视）；背景残留另计 | met（目视）；背景残留另计 | met（目视）；背景残留另计 |

### 配对帧几何证据

下表为每行六列实质前景最高像素y；其中包括头饰/角顶，并非严格的人体头部中心。配对行数值不完全相同，足底表也显示位置漂移，因此不能宣称精确锁定。

| 文件 | Row 1 顶部y | Row 2 顶部y | Row 3 顶部y | Row 4 顶部y |
|---|---|---|---|---|
| `walk-directions-1.png` | 11, 18, 7, 17, 17, 8 | 11, 17, 7, 17, 16, 8 | 12, 18, 5, 16, 16, 13 | 11, 17, 4, 16, 16, 13 |
| `walk-directions-2.png` | 30, 37, 25, 35, 35, 27 | 28, 36, 23, 34, 34, 25 | 19, 27, 10, 24, 24, 21 | 18, 25, 10, 23, 23, 21 |
| `walk-directions-3.png` | 30, 36, 24, 35, 35, 26 | 28, 35, 23, 34, 34, 25 | 19, 26, 10, 23, 23, 20 | 17, 24, 10, 22, 22, 20 |
| `walk-directions.png` | 30, 36, 24, 35, 35, 26 | 28, 35, 23, 34, 34, 25 | 19, 26, 10, 23, 23, 20 | 17, 24, 10, 22, 22, 20 |

## 每次调用的精确提示词与来源

以下代码块为实际传入工具的完整prompt，未做事后改写。图片附件通过 `referenced_image_paths` 传入，路径和角色单列说明；没有将参考图变形或翻转后伪造新视角。

### walk-directions-1.png

- 像素尺寸：1536×1024；PNG RGBA。
- 工具：内置 `image_gen.imagegen`；模型版本未暴露；`transparent_background: true`。
- 操作：初次生成新方向图集。
- 附件：`assets/workshop/residents-atlas-builtin.png（角色身份与风格参考）`。
- 工具返回来源：`exec-bd427ac7-1eb3-4be9-8bd8-10025838090a.png`。
- 输出文件名来源标识：`exec-bd427ac7-1eb3-4be9-8bd8-10025838090a`；正式generation ID未单独暴露。
- SHA-256：`0072bc0a18bc172b0c1b4d138282bde5ee6539b22573470f1f8df8f63ebf9e82`。
- 硬要求检查：见上方该文件所在列、alpha统计和各行足底表；总体 **not met**。

精确prompt：

```text
Use case: stylized-concept / identity-preserve.
Create ONE new production walking-direction sprite atlas, a PNG exactly 1536x1024 pixels with a GENUINELY TRANSPARENT background. The attached image is the CHARACTER IDENTITY AND PIXEL-ART STYLE REFERENCE ONLY. It shows six heroines front-facing; redraw those exact six heroines from strict right-side and rear angles, do not repeat the front-facing views, and do not copy its background or faint alpha noise.

LAYOUT IS A SOFTWARE CONTRACT: six equal columns and four equal rows, 24 cells, each exactly 256x256 pixels, no gutters or visible grid. Exactly one complete full-body figure in every cell. Column centers at global x=128,384,640,896,1152,1408. Each figure is horizontally centered in its own cell. Feet soles at local y=247 (global baselines y=247,503,759,1015). Keep all opaque and partially transparent figure pixels within local x=6..249 and y=6..249, including horns, wings, tail, hair, and staff. At least 6 transparent pixels on every side of every cell. Match the reference's character size, about 200-220 pixels high, with the same cute elegant super-deformed adult anime women about 3 heads tall. Preserve the reference's premium detailed pixel clusters, thin crisp dark outlines, soft bright palette and delicate outfit details, without smoothing into a different illustration style.

SIX COLUMNS LEFT TO RIGHT, identical identity across all four rows:
1. DeepSeek: long deep sky-blue hair, white frilled maid headband with navy ribbons, blue-and-white frilled maid dress and white apron, blue shoes, distinctly visible blue whale tail behind her.
2. Claude: long vivid copper-orange hair, small white daisy flower hairclip, cream puff-sleeve blouse, cream and amber/orange long skirt, black ribbon bodice and brown shoes, small brown book held at her side.
3. GPT: long pearly-white hair shaded pale lilac, TWO white curved dragon horns, elegant layered white dress, tiny pale-lilac dragon wings and curled pale dragon tail, tiny mint-green accessory. Hair must remain white-lilac, never green.
4. Gemini: long pearly hair fading blue to lilac, star ornaments, navy-and-white short dress with fine champagne-gold trim, navy shoes. Keep the two star ornaments visible where the angle permits and the hair gradient readable from behind.
5. Kimi: long deep-navy hair, pale-gold crescent-moon hair ornament, moonlit-navy and ivory scholar dress with delicate gold trim, a rolled manuscript held at her side.
6. Grok: blonde twin tails, black bat-shaped hair bows, black/ivory/gold outfit, dark boots, upright slender golden/brass decorative staff with the ornate head shown in the reference. Entire staff remains inside her cell.

FOUR ROWS TOP TO BOTTOM:
ROW 1: all six WALK TO THE RIGHT, strict 90-degree side profile, body and face in profile, noses pointing right, exactly ONE visible eye each. Contact pose A: the character's RIGHT leg forward toward the right, left leg behind; opposite arm swing.
ROW 2: all six WALK TO THE RIGHT, same strict side profile and exactly ONE visible eye. Contact pose B: LEFT leg forward toward the right, right leg behind; opposite arm swing. Rows 1 and 2 form a two-frame walking loop. For EACH column keep precisely the same head height, torso position, body scale and foot baseline between the pair; only alternate the legs/arms and subtle hair, dress and tail sway. Do not turn the face toward the viewer.
ROW 3: all six WALK AWAY from the viewer, strict BACK VIEW. See the back of the head and hair, backs of the outfits, rear of ornaments, horns, wings, tails; absolutely NO face, NO eyes, NO frontal chest. Walking contact pose A, one leg advancing away, other leg behind.
ROW 4: all six WALK AWAY, strict BACK VIEW, matching pose B with the OTHER leg advancing. Rows 3 and 4 form a two-frame rear walking loop, exactly same head height, torso position, scale and baseline within each pair; only legs/arms and subtle hair/skirt/tail sway change.

Preserve each heroine's recognizable hair length, colors, ornaments, clothing, species features and accessories from the new angles. Show visible alternating feet below skirts so the two walk phases read distinctly. Back views must be genuinely rear views, never three-quarter front. Side views must be genuine profile, never front or three-quarter front. Do not add left-facing frames: those will be mirrored by software.

TRANSPARENCY CONTRACT: alpha must be exactly 0 EVERYWHERE outside the figures. No colored background, no opaque white, no checkerboard painted into the image, no halo, no glow, no ground, no floor, no contact shadow, no cast shadow. No text, no labels, no grid lines, no gutters, no borders, no watermark, no extra people, no detached parts, no cropping, no neighboring-cell overlap. This is a precise game sprite sheet sliced by code, not a poster or concept-art contact sheet.
```

### walk-directions-2.png

- 像素尺寸：1536×1024；PNG RGBA。
- 工具：内置 `image_gen.imagegen`；模型版本未暴露；`transparent_background: true`。
- 操作：第1次针对性编辑。
- 附件：`assets/workshop/candidates/walk-directions-1.png（编辑目标）`；`assets/workshop/residents-atlas-builtin.png（角色身份与风格参考）`。
- 工具返回来源：`exec-bed7e04d-408f-4ddd-9856-5119a25d6ed2.png`。
- 输出文件名来源标识：`exec-bed7e04d-408f-4ddd-9856-5119a25d6ed2`；正式generation ID未单独暴露。
- SHA-256：`3aa0c1996037c92ce74767a05ca3a8f558bb2f03b901795f24d48e0af8a3c09e`。
- 硬要求检查：见上方该文件所在列、alpha统计和各行足底表；总体 **not met**。

精确prompt：

```text
Use case: precise-object-edit / identity-preserve.
EDIT IMAGE 1, the new directional walk atlas. IMAGE 2 is ONLY the original character identity and style reference. Keep the exact six identities, six columns, four directional rows, right-facing strict profiles in rows 1-2 and strict faceless rear views in rows 3-4. Keep the reference's outfits, pixel clusters, outlines, colors and accessories. Output exactly 1536x1024 RGBA PNG with a real transparent background.

TARGETED REPAIRS:
1. ERASE the background completely, including every low-opacity leftover pixel and the colored gradient. Outside the character silhouettes, the pixels must be EXACTLY RGBA (0,0,0,0), including the full cell borders. No low-opacity colored residue, halo, glow or shadow. Do not preserve any reference background. Do not paint a transparency checkerboard.
2. Make the two walk phases genuinely opposite. Row 1 is right profile with the NEAR/right leg extended forward to the right and FAR/left leg back. Row 2 is right profile with the FAR/left leg extended forward to the right and NEAR/right leg back; the near bent leg and opposite arm visibly change place. Show two distinctly separated feet and opposite sleeve/hand swings. Do not just shift the same leg pose. Row 3 is rear view with RIGHT foot farther away/up and LEFT foot closer/down. Row 4 is rear view with LEFT foot farther away/up and RIGHT foot closer/down. Each back-facing pair must visibly alternate which foot is closer to the viewer. No faces in either rear row.
3. Lock layout for slicing: every local cell exactly 256x256. Each character centered x=128, feet at y=247. ALL parts including horns and staff must stay within local x=6..249 and y=6..249. Reference scale was a little too large: make each complete silhouette about 210-220px tall, so highest pixel around local y=28-38 and bottom sole at y=247. In particular move GPT's horn tips fully inside this margin. Keep precisely the SAME head top, head center, torso position and scale between rows 1/2 in every column and between rows 3/4 in every column. Only legs, arms and tiny hair/tail/skirt sway alternate; no head bob or whole-body translation.

Keep columns exactly: DeepSeek blue-haired blue/white maid with whale tail; Claude copper-orange long hair, white daisy, cream/amber dress and brown book; GPT white-lilac long hair, two white horns, white dress, lilac wings and curled tail; Gemini blue-lilac long hair, stars and navy/white dress; Kimi navy long hair, crescent, navy/ivory scholar dress and scroll; Grok blonde twin tails, black bows, black/gold outfit and the entire ornate golden staff. Make the book and scroll visibly peek out at the sides even in rear view while remaining anatomically held.
No text, labels, gutters, grid lines, furniture, ground, contact shadows, background color, watermark, cropped parts or cell overlaps. This is a precise 24-frame game atlas, not a contact sheet.
```

### walk-directions-3.png

- 像素尺寸：1536×1024；PNG RGBA。
- 工具：内置 `image_gen.imagegen`；模型版本未暴露；`transparent_background: true`。
- 操作：第2次针对性编辑。
- 附件：`assets/workshop/candidates/walk-directions-2.png（编辑目标）`。
- 工具返回来源：`exec-76d2e60c-7e3b-4d05-a135-3c7fb4b60cf7.png`。
- 输出文件名来源标识：`exec-76d2e60c-7e3b-4d05-a135-3c7fb4b60cf7`；正式generation ID未单独暴露。
- SHA-256：`143c5a044e605f0eeced21a1bb2559f1d0a7bd1a619f334b08a2b4df32163d27`。
- 硬要求检查：见上方该文件所在列、alpha统计和各行足底表；总体 **not met**。

精确prompt：

```text
Edit this 1536x1024 directional sprite atlas. Preserve the six identities, pixel-art rendering, 6x4 grid with 256x256 cells, column order and all accessories. Deliver a real transparent RGBA PNG at exactly 1536x1024.

CRITICAL FIX 1 — CLEAN TRANSPARENCY: COMPLETELY DELETE THE BLUE/ORANGE/PURPLE GRADIENT BACKDROP, all atmosphere, shadows and low-opacity colored residue. The backdrop must not survive even faintly. Treat this as precise pixel-art cutout sprites on an EMPTY canvas. Use hard pixel edges and BINARY ALPHA: all figure pixels alpha=255, ALL other pixels alpha=0. Absolutely no semitransparent pixels, halo or glow. The invisible background RGB should be one uniform neutral value, never colored gradients. No checkerboard drawn. Every 6px perimeter of each 256x256 cell must be totally empty with alpha exactly zero.

CRITICAL FIX 2 — ACTUALLY SWAP THE LEGS AND ARMS IN ROW 2: Rows 1 and 2 still look like the same stride. Keep row 1's forward near leg. REDRAW ONLY THE LIMBS OF ROW 2 so that the near/right leg goes BACKWARD toward the left and the far/left leg extends FORWARD toward the right. The near backward knee and boot must visibly overlap in FRONT of the skirt at the LEFT, while the distant forward boot is visible at the RIGHT behind the dress. The near arm swings FORWARD in row 2, not backward; the far arm swings back. Maintain strict 90-degree body/face profile, exactly one visible eye, facing right. This must read as two opposite contact phases, not a shorter copy of the same step.
Rows 3 and 4 remain true rear views with no eyes or face. Row 3: left foot at the lower/near position and right foot raised farther away. Row 4: right foot at the lower/near position and left foot raised farther away. Make GPT's alternating two shoes visible below the skirt and to the sides of the curled tail. Keep the rear-view Claude book and Kimi scroll peeking out from the side of the body.

CRITICAL FIX 3 — GRID ALIGNMENT: The current feet in rows 2-4 are too high. Make the LOWEST SOLE pixel in EACH cell local y=247, without shifting the head or torso. Global foot baselines must be 247,503,759,1015. Every character centered at local x=128. Exactly matching head top and torso position between paired rows 1/2 and rows 3/4 for each column; no head bob or sideways drift. Whole silhouettes about 210-220px tall. Keep all pixels, including horns, staff, wings, tail and hair, at least 6px from all cell edges, so coordinates stay within x=6..249,y=6..249.

Columns remain DeepSeek blue long hair/maid outfit/whale tail; Claude copper-orange long hair/white flower/cream amber dress/brown book; GPT white lilac long hair/TWO horns/white dress/dragon wings and tail; Gemini blue lilac hair/star ornaments/navy white dress; Kimi navy long hair/crescent/navy ivory scholar dress/scroll; Grok blonde twin tails/black bows/black gold outfit/complete golden staff. No extra or missing characters, no mixed identities. No labels, text, grid lines, gutters, watermark, ground, furniture, colored background or shadows. Preserve the detailed reference-quality pixel clusters and outline weight.
```

### walk-directions.png

- 像素尺寸：1536×1024；PNG RGBA；2613499字节。
- 来源：`walk-directions-3.png` 的逐字节副本，未经任何像素处理。
- 有效精确prompt：与上方 `walk-directions-3.png` 代码块完全相同；复制操作未再调用生成工具，也无新增prompt或generation ID。
- 工具/模型/来源标识：继承第三版，模型版本未暴露，来源文件 `exec-76d2e60c-7e3b-4d05-a135-3c7fb4b60cf7.png`。
- SHA-256：`143c5a044e605f0eeced21a1bb2559f1d0a7bd1a619f334b08a2b4df32163d27`，与第三版一致。
- 每项硬要求、真实alpha、每行脚底基线：均与第三版完全相同，具体数值和 **met / not met** 见上表。
- 选优原因：背景边缘残留少于另外两版，背面相反脚位较清楚，整体尺寸比第一版更接近描述；未达到的条件没有用后处理掩盖。

## 范围确认

本次仅新增 `walk-directions-1.png`、`walk-directions-2.png`、`walk-directions-3.png`、`walk-directions.png` 和本文件。没有修改源码、脚本、manifest或其他文档，没有提交，没有读取或修改另一个会话的 `office-hires*.png`。没有生成需要保留的临时脚本/预览文件。

