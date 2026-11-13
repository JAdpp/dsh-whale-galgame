# Walk-cycle candidate generation and checks

## 结论

只使用内置图像生成工具生成和编辑，随后原样复制 PNG；未用代码扭曲、翻转、重着色、合成动作或清理 alpha。每张表为一次初始生成加三次针对性编辑，已达到指定编辑上限。保留全部八次尝试。

最终文件名仅表示选出的最佳候选，**没有一张通过全部硬要求，尚不能作为已验收的生产素材**：

- `walk-cycle-front-back.png` 是 `walk-cycle-front-back-1.png` 的逐字节副本。六人的左右脚交替、固定头部位置和接近目标的脚底落点较好，风格最接近参考；但人物高 228–247px，超过 200–215px，GPT 部分格的 6px 留白也失败。
- `walk-cycle-side.png` 是 `walk-cycle-side-4.png` 的逐字节副本。六人 R1 近腿前、R2 远腿前，交替清楚，R3 严格右侧 passing、R4 背面双脚并拢；实质前景跨格已修复。但人物高 184–210px，部分过小；基线 228–235，未到 246–248；头部位置仍有漂移。
- 两张最终候选背景都**没有做到轮廓外所有像素 alpha=0**。全部尝试均为 RGBA、alpha 范围 0–254，存在半透明背景残留，不能把 PNG 格式或部分零 alpha 当作透明度通过。
- 六人的主要身份特征在最终候选中可辨认：蓝发女仆及鲸尾、橙发白花及书、白紫发双角及龙翼龙尾、渐变发星饰、深蓝发月饰及卷轴、金色双马尾黑蝴蝶结及权杖。侧面鲸尾局部被头发遮挡，背面清楚。
- 没有修改或提交任何源码、脚本、manifest 或原有文档。

## 工具和参考

- 工具：`image_gen.imagegen`，内置图像生成；所有调用都传入 `transparent_background=true`。
- 模型：工具没有公开准确模型名称或版本；不把旧提示词文件中的模型请求当成本次实际模型。
- 初始两次调用附带 `residents-atlas-builtin.png` 和 `walk-directions.png`，角色身份、风格、尺度参考。参考背景没有被视为目标背景。
- 后续编辑每次只附带该表的上一版候选作为 edit target。
- source id 采用工具暴露的生成文件名 stem；不记录生成目录或绝对本地路径。
- 像素检查使用 Pillow/NumPy，只读 PNG。没有像素修补或背景后处理。

## 检查口径

坐标从 0 开始，相对于各 256×256 cell。基线记录该格 `alpha>127` 主体的最底 y；对于权杖靠近鞋底的格，这是主体包围盒底部代理。因为背景有低 alpha 残留，不能用 `alpha>0` 包围盒冒充脚底或人物高度。每行六列顺序始终为 DeepSeek、Claude、GPT、Gemini、Kimi、Grok。头顶跨度是四行主体顶点的最大差，只能辅助检查 bob，不能证明头部/躯干精确配准。水平中点含头发、尾巴和权杖，也是主体包围盒代理，不是头部中心。

“6px 边带非零数”统计每格四周 6px 边带的非零 alpha 像素，按行六格求和。边带应为全零；非零就说明背景或留白未通过。所有 PNG 总像素为 1,572,864。

## 最终别名完整记录

## walk-cycle-front-back.png

最终别名，原样复制自 `walk-cycle-front-back-1.png`，无额外生成、变换或修补。以下完整记录重复列出以便单独审查。

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-a5f56311-0961-4f53-a3f8-f03c1b72e3f6`。
- 输入文件：`residents-atlas-builtin.png`、`walk-directions.png`（身份、风格、尺度参考）。
- alpha 实测：min=0，max=254；alpha=0 像素 788,222；alpha 1–254 像素 784,642；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1/R2 六人严格正面且脚位相反；R3/R4 六人背面、无脸，R3 她左脚向上/前、右脚向下拖后，R4 相反。头顶跨度 1–3px，但主体过高，GPT 脚底或头角进入 6px 边带。选中此版保留相对稳定的位置和参考风格。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Claude | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| GPT | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Gemini | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Kimi | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Grok | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 249 / 236 | 248 / 231 | 251 / 247 | 249 / 232 | 249 / 234 | 249 / 233 | 1521 |
| R2 | 247 / 234 | 246 / 230 | 249 / 246 | 249 / 233 | 248 / 232 | 248 / 231 | 1831 |
| R3 | 249 / 236 | 248 / 231 | 250 / 247 | 249 / 232 | 249 / 232 | 248 / 229 | 1810 |
| R4 | 247 / 232 | 247 / 230 | 247 / 244 | 248 / 231 | 247 / 230 | 247 / 228 | 1582 |

四行头顶跨度（六列顺序）：`2, 1, 1, 1, 2, 3` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`136.5, 127.5, 123, 122.5, 123.5, 116`
- R2：`139.5, 130, 123.5, 124.5, 127, 115.5`
- R3：`136, 127.5, 122.5, 124.5, 127, 114.5`
- R4：`136, 126, 122, 124, 124, 114.5`

### Exact prompt

```text
Use case: stylized-concept. Asset type: production RPG walk-cycle sprite atlas. Generate ONE PNG EXACTLY 1536x1024, six columns by four rows of EXACTLY 256x256 cells, no gutters. The two attached atlases are CHARACTER IDENTITY, STYLE and SCALE REFERENCES, not poses to duplicate. Image 1 residents-atlas-builtin.png establishes faces and clothing, image 2 walk-directions.png establishes side/back identities. Preserve their detailed crisp pixel-art clusters, outline weight, palette and charming super-deformed anime women about 3 heads tall. The old walk frames are incorrect; REDRAW genuinely alternating legs.
TRUE RGBA TRANSPARENCY: every pixel outside the figures alpha=0. No coloured backdrop, no gradient, no fake checkerboard, no halo/glow, no ground, no shadows, no grid lines, borders, labels, letters, watermark or UI.
Exactly one full figure in each cell, 24 figures total. Columns left to right ALWAYS: 1 DeepSeek long blue hair, white frilled maid headband, blue-white maid outfit, blue whale tail; 2 Claude long orange hair, white daisy, cream/amber dress, black bodice ribbon, little book; 3 GPT white-lilac hair, two curved white horns, small pale dragon wings and curled tail, white dress, violet eyes; 4 Gemini blue-to-lilac hair, two gold star ornaments, navy/white/lilac dress; 5 Kimi dark navy hair, gold crescent moon, navy/ivory/gold dress and scroll; 6 Grok blonde twin-tails, black bows, black/gold outfit, golden staff.
PIXEL GEOMETRY every 256px cell: figure centered at x128; full figure about 200-215px tall, head top near y34-40, soles baseline y247; all hair, wings, tails, staff within x6..249 and y6..249. Nothing crosses cell boundaries. Lock head center and torso center to exactly the same x/y position and same size in all four rows within each column. Head bob maximum 4px. Only legs, arms, skirt hem, hair tips and tail sway animate. Keep all identity asymmetries consistent rather than mirroring the whole character. Clothes must let both shins and shoes be clearly seen; adjust moving hem slightly, preserve outfit identity.
SHEET: walk-cycle-front-back.
ROW1 (cell y0..255): STRICT FRONT facing viewer, LEFT-foot-forward CONTACT: her anatomical LEFT foot is on VIEWER RIGHT. Make that shoe distinctly lower (sole y247), larger and in front; RIGHT foot on viewer left is back, smaller, lifted on its toe (sole around y231). Left thigh/shin steps down-right, right leg retreats up-left. Her right arm (viewer left) swings forward, left arm swings back.
ROW2 (cell y256..511): SAME STRICT FRONT, RIGHT-foot-forward CONTACT, the EXACT OPPOSITE leg and arm phase. Her RIGHT shoe on VIEWER LEFT is distinctly lower/larger (sole y247); LEFT shoe on viewer right back and toe-lifted (sole around y231). Left arm forward, right arm back. Do not repeat row1's leg arrangement. Heads remain front-facing and stationary, no three-quarter rotation.
ROW3 (cell y512..767): STRICT BACK walking away, NO face visible. LEFT foot (VIEWER LEFT from behind) steps ahead/up, smaller, sole around y231; RIGHT foot viewer right trails toward viewer/down, larger, sole y247. Opposite arm swing.
ROW4 (cell y768..1023): SAME STRICT BACK, RIGHT foot (VIEWER RIGHT) ahead/up smaller sole around y231; LEFT foot viewer left trails/down larger sole y247. Swap arms, hem and hair/tail-tip sway compared to row3.
Contact pose contrast is the entire purpose: each pair MUST visibly reverse which shoe is forward, lower/larger and which leg is lifted. Complete 24 uncut sprites, equal exact cells, genuine transparent PNG. Do not reuse the reference's ambiguous feet.
```

## walk-cycle-side.png

最终别名，原样复制自 `walk-cycle-side-4.png`，无额外生成、变换或修补。以下完整记录重复列出以便单独审查。

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-c88932af-d40b-4c30-b883-9d5cceeedcb8`。
- 输入文件：`walk-cycle-side-3.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 886,980；alpha 1–254 像素 685,884；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1 六人近腿/她右腿前，前鞋低且较大；R2 六人远腿/她左腿前，近腿退后且后鞋较低较大，遮挡关系可辨认。R3 六人右向单眼侧面，直腿承重、另一脚抬起贴近，passing 可读；R4 六人背面无脸、双脚并拢。目测及强 alpha 格边检查未见实质前景跨格。选中此版优先保留核心腿交换、侧面 passing 和格内完整性；位置、尺度和透明度仍失败。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Claude | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| GPT | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Gemini | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Kimi | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Grok | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 235 / 190 | 233 / 185 | 235 / 197 | 234 / 184 | 234 / 185 | 234 / 193 | 1145 |
| R2 | 229 / 190 | 229 / 185 | 229 / 196 | 230 / 185 | 229 / 185 | 229 / 191 | 2843 |
| R3 | 231 / 203 | 231 / 196 | 231 / 210 | 231 / 196 | 231 / 196 | 231 / 204 | 1866 |
| R4 | 228 / 198 | 228 / 192 | 228 / 203 | 228 / 192 | 228 / 193 | 228 / 197 | 1255 |

四行头顶跨度（六列顺序）：`17, 13, 17, 15, 14, 14` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`134.5, 118, 118.5, 119, 101, 111`
- R2：`124.5, 111, 107.5, 104, 93.5, 113`
- R3：`129.5, 116.5, 109, 110, 101.5, 116.5`
- R4：`137, 127.5, 125, 121.5, 108.5, 116.5`

### Exact prompt

```text
Final production edit of attached walk-cycle-side-3.png. Keep 1536x1024 and exact six columns by four rows, every cell256x256. Preserve six identities, right-facing side profiles, and CORRECT NEAR/FAR LEG EXCHANGE:
Row1 near RIGHT leg reaches FORWARD screen-right, big low shoe; far LEFT leg back left. Row2 near RIGHT leg reaches BACK screen-left, big low shoe; far LEFT leg forward screen-right, smaller/higher shoe. Preserve clearly different leg silhouettes and opposite arm swings, hem/tail/hair-tip sway. Do not revert to repeated legs. Row3 strict right-facing profile passing, single eye, weight leg straight and other foot raised close beside. Row4 strict back passing, no faces, feet together.
FIX FIT AND REGISTRATION: redraw ALL complete figures about10-15% SMALLER to full210px height INCLUDING horns/ornaments and tails/staff, from local y37 to y247. Center all HEAD/TORSOS precisely at x128 in EVERY row per column, fixed head height maximum4px bob. Row3 must not shift head forward/right. Body/head size identical all rows. At least6px full transparent margin on every cell edge; wings/hair/tails/staff must stay inside local x12..243. CRITICAL Grok row2: left-swept blonde twin-tail currently crosses into Kimi's cell. TUCK ITS TIP INWARD toward her back; entire Grok row2 including both hair tails must be inside sixth cell x12..243. Nothing at all in neighboring cell.
REMOVE THE ENTIRE BLUE/LILAC/AMBER MISTY GRADIENT BACKDROP. Output true transparent PNG with alpha=0 outside every silhouette and through all holes/gaps. Clean opaque sprites alpha255, no translucent haze, halo, ground, shadow, matte, grid, text or checkerboard. The surrounding canvas must be literally empty transparency, not a faint colored background. Preserve all character colors and pixel-art detail.
```

## 保留的全部尝试

## walk-cycle-front-back-1.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-a5f56311-0961-4f53-a3f8-f03c1b72e3f6`。
- 输入文件：`residents-atlas-builtin.png`、`walk-directions.png`（身份、风格、尺度参考）。
- alpha 实测：min=0，max=254；alpha=0 像素 788,222；alpha 1–254 像素 784,642；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1/R2 六人严格正面且脚位相反；R3/R4 六人背面、无脸，R3 她左脚向上/前、右脚向下拖后，R4 相反。头顶跨度 1–3px，但主体过高，GPT 脚底或头角进入 6px 边带。选中此版保留相对稳定的位置和参考风格。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Claude | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| GPT | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Gemini | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Kimi | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Grok | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 249 / 236 | 248 / 231 | 251 / 247 | 249 / 232 | 249 / 234 | 249 / 233 | 1521 |
| R2 | 247 / 234 | 246 / 230 | 249 / 246 | 249 / 233 | 248 / 232 | 248 / 231 | 1831 |
| R3 | 249 / 236 | 248 / 231 | 250 / 247 | 249 / 232 | 249 / 232 | 248 / 229 | 1810 |
| R4 | 247 / 232 | 247 / 230 | 247 / 244 | 248 / 231 | 247 / 230 | 247 / 228 | 1582 |

四行头顶跨度（六列顺序）：`2, 1, 1, 1, 2, 3` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`136.5, 127.5, 123, 122.5, 123.5, 116`
- R2：`139.5, 130, 123.5, 124.5, 127, 115.5`
- R3：`136, 127.5, 122.5, 124.5, 127, 114.5`
- R4：`136, 126, 122, 124, 124, 114.5`

### Exact prompt

```text
Use case: stylized-concept. Asset type: production RPG walk-cycle sprite atlas. Generate ONE PNG EXACTLY 1536x1024, six columns by four rows of EXACTLY 256x256 cells, no gutters. The two attached atlases are CHARACTER IDENTITY, STYLE and SCALE REFERENCES, not poses to duplicate. Image 1 residents-atlas-builtin.png establishes faces and clothing, image 2 walk-directions.png establishes side/back identities. Preserve their detailed crisp pixel-art clusters, outline weight, palette and charming super-deformed anime women about 3 heads tall. The old walk frames are incorrect; REDRAW genuinely alternating legs.
TRUE RGBA TRANSPARENCY: every pixel outside the figures alpha=0. No coloured backdrop, no gradient, no fake checkerboard, no halo/glow, no ground, no shadows, no grid lines, borders, labels, letters, watermark or UI.
Exactly one full figure in each cell, 24 figures total. Columns left to right ALWAYS: 1 DeepSeek long blue hair, white frilled maid headband, blue-white maid outfit, blue whale tail; 2 Claude long orange hair, white daisy, cream/amber dress, black bodice ribbon, little book; 3 GPT white-lilac hair, two curved white horns, small pale dragon wings and curled tail, white dress, violet eyes; 4 Gemini blue-to-lilac hair, two gold star ornaments, navy/white/lilac dress; 5 Kimi dark navy hair, gold crescent moon, navy/ivory/gold dress and scroll; 6 Grok blonde twin-tails, black bows, black/gold outfit, golden staff.
PIXEL GEOMETRY every 256px cell: figure centered at x128; full figure about 200-215px tall, head top near y34-40, soles baseline y247; all hair, wings, tails, staff within x6..249 and y6..249. Nothing crosses cell boundaries. Lock head center and torso center to exactly the same x/y position and same size in all four rows within each column. Head bob maximum 4px. Only legs, arms, skirt hem, hair tips and tail sway animate. Keep all identity asymmetries consistent rather than mirroring the whole character. Clothes must let both shins and shoes be clearly seen; adjust moving hem slightly, preserve outfit identity.
SHEET: walk-cycle-front-back.
ROW1 (cell y0..255): STRICT FRONT facing viewer, LEFT-foot-forward CONTACT: her anatomical LEFT foot is on VIEWER RIGHT. Make that shoe distinctly lower (sole y247), larger and in front; RIGHT foot on viewer left is back, smaller, lifted on its toe (sole around y231). Left thigh/shin steps down-right, right leg retreats up-left. Her right arm (viewer left) swings forward, left arm swings back.
ROW2 (cell y256..511): SAME STRICT FRONT, RIGHT-foot-forward CONTACT, the EXACT OPPOSITE leg and arm phase. Her RIGHT shoe on VIEWER LEFT is distinctly lower/larger (sole y247); LEFT shoe on viewer right back and toe-lifted (sole around y231). Left arm forward, right arm back. Do not repeat row1's leg arrangement. Heads remain front-facing and stationary, no three-quarter rotation.
ROW3 (cell y512..767): STRICT BACK walking away, NO face visible. LEFT foot (VIEWER LEFT from behind) steps ahead/up, smaller, sole around y231; RIGHT foot viewer right trails toward viewer/down, larger, sole y247. Opposite arm swing.
ROW4 (cell y768..1023): SAME STRICT BACK, RIGHT foot (VIEWER RIGHT) ahead/up smaller sole around y231; LEFT foot viewer left trails/down larger sole y247. Swap arms, hem and hair/tail-tip sway compared to row3.
Contact pose contrast is the entire purpose: each pair MUST visibly reverse which shoe is forward, lower/larger and which leg is lifted. Complete 24 uncut sprites, equal exact cells, genuine transparent PNG. Do not reuse the reference's ambiguous feet.
```

## walk-cycle-front-back-2.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-d5271f4e-27e4-4d54-8c4d-bb499e1511e1`。
- 输入文件：`walk-cycle-front-back-1.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 744,750；alpha 1–254 像素 828,114；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

四行方向和交替保留；背景清理与缩放请求未可靠实现。第一行鞋底落点更低，多格进入底边 6px 区域；不选。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Claude | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| GPT | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Gemini | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Kimi | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Grok | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 251 / 234 | 251 / 229 | 253 / 244 | 252 / 232 | 251 / 232 | 251 / 230 | 1583 |
| R2 | 247 / 233 | 248 / 231 | 250 / 244 | 250 / 232 | 250 / 233 | 249 / 231 | 2157 |
| R3 | 248 / 235 | 248 / 230 | 250 / 245 | 248 / 231 | 248 / 231 | 247 / 228 | 2543 |
| R4 | 247 / 233 | 247 / 231 | 247 / 244 | 247 / 231 | 247 / 231 | 247 / 229 | 2287 |

四行头顶跨度（六列顺序）：`4, 6, 6, 4, 3, 3` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`136.5, 127.5, 122.5, 122, 124, 114.5`
- R2：`139, 128, 122.5, 123.5, 126.5, 115`
- R3：`135, 128, 122, 124, 126, 116`
- R4：`135.5, 126.5, 122, 123.5, 124, 115`

### Exact prompt

```text
Precise-object-edit of walk-cycle-front-back-1.png, the attached edit target. KEEP its exact 1536x1024 dimensions, exact 6 columns x4 rows of 256px cells, six identities, pixel-art detail and already-correct alternating legs. Row1 FRONT her LEFT foot forward = viewer-right shoe low/larger. Row2 FRONT her RIGHT foot forward = viewer-left shoe low/larger. Row3 BACK left foot viewer-left ahead/up and right shoe viewer-right trailing/down. Row4 BACK right foot viewer-right ahead/up and left shoe viewer-left trailing/down. Preserve these four different leg poses and arm swing.
ONLY PRODUCTION CLEANUP:
1 REMOVE THE ENTIRE colour/gradient/low-alpha backdrop. Output actual RGBA transparency with EVERY pixel outside the character silhouettes exactly alpha=0, including all cell edges, gaps, holes between limbs, tail curls, wing gaps and hair gaps. No translucent coloured residue, no matte, no glow, no shadow, no fake checkerboard. Opaque clean crisp figures only on empty transparent canvas. Existing subtle blue/lilac/amber mist MUST disappear.
2 Fit every full figure (hair ornaments, horns, wings/tails/staff included) to 210px tall from cell y37 to y247, feet baseline y247. Center head/torso at cell x128, head y position identical in all rows per column with maximum4px variation. Same size and same head/torso position all rows, no idle reposes. Minimum6px transparent margins around every cell, all extremities contained.
Do not change identity colors or re-copy source reference backgrounds. No labels, no text, no grid lines. Deliver ONE 1536x1024 transparent PNG; the image must visibly be clean cutouts, not the old hazy backdrop.
```

## walk-cycle-front-back-3.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-8025ee9e-8587-4568-b941-d4f5ad818120`。
- 输入文件：`walk-cycle-front-back-2.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 770,141；alpha 1–254 像素 802,723；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

四行方向和交替保留，轮廓更重；背景仍有半透明残留。GPT 第一行主体到 y255，留白失败；不选。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Claude | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| GPT | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Gemini | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Kimi | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Grok | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 252 / 236 | 251 / 230 | 255 / 246 | 253 / 233 | 252 / 233 | 252 / 234 | 1214 |
| R2 | 249 / 236 | 248 / 231 | 251 / 245 | 251 / 234 | 251 / 235 | 250 / 234 | 1419 |
| R3 | 248 / 235 | 248 / 232 | 251 / 247 | 248 / 232 | 248 / 232 | 248 / 231 | 1339 |
| R4 | 247 / 234 | 247 / 232 | 248 / 246 | 247 / 232 | 247 / 232 | 247 / 231 | 1431 |

四行头顶跨度（六列顺序）：`3, 6, 7, 5, 4, 2` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`136, 127, 122, 121, 123, 113.5`
- R2：`138, 126.5, 122.5, 123, 126, 114`
- R3：`135.5, 127, 121.5, 123.5, 125, 116.5`
- R4：`134.5, 126, 121, 123, 123.5, 114.5`

### Exact prompt

```text
Background-extraction edit. The attached image walk-cycle-front-back-2.png is the edit target. Remove the entire background and export a true transparent PNG cutout. Preserve all 24 character sprites and all their poses exactly. Every pixel outside the silhouettes MUST be fully transparent alpha ZERO. The blue, grey, lilac and amber gradient behind them is an unwanted background, DELETE it completely including all translucent haze. There must be no background color at all, no ground shadows or halo. All empty cell edges and gaps must have RGBA alpha=0. The 24 sprites must be crisp fully opaque inside, alpha255, no translucent character faces or dresses. Keep 1536x1024, six equal columns x four equal rows, no resizing, no labels. This is only background removal; preserve the correct left/right foot alternation. PNG with transparent background, isolated clean sprite cutouts.
```

## walk-cycle-front-back-4.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-67f7ebe5-ae2c-4cc6-8ecc-a2aa6b79715e`。
- 输入文件：`walk-cycle-front-back-3.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 969,918；alpha 1–254 像素 602,946；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

六人交替保留，缩小明显，但主体高 182–199px，偏小，比例更圆短，细节有所简化。基线随行从约 238 变到 216，头顶/躯干位置未锁住；不选。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Claude | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| GPT | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Gemini | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Kimi | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |
| Grok | 她左脚；画面右脚低且较大 | 她右脚；画面左脚低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 238 / 192 | 237 / 187 | 239 / 199 | 239 / 191 | 239 / 191 | 240 / 192 | 190 |
| R2 | 230 / 190 | 230 / 187 | 230 / 196 | 230 / 188 | 230 / 188 | 230 / 187 | 355 |
| R3 | 220 / 182 | 220 / 182 | 220 / 193 | 220 / 183 | 220 / 182 | 220 / 182 | 508 |
| R4 | 216 / 182 | 216 / 182 | 216 / 193 | 216 / 182 | 216 / 182 | 216 / 182 | 439 |

四行头顶跨度（六列顺序）：`12, 16, 17, 14, 14, 14` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`142.5, 128.5, 126, 124, 123.5, 116.5`
- R2：`145.5, 130, 127, 124.5, 124.5, 116`
- R3：`143, 130, 127, 125.5, 125.5, 116.5`
- R4：`143.5, 131, 127.5, 125.5, 124.5, 118`

### Exact prompt

```text
Final production edit of attached walk-cycle-front-back-3.png. Keep 1536x1024 canvas and exact six columns x four rows of 256x256 cells. Preserve all character identities, faces, outfits, pixel-art style and correct alternating feet.
The figures are TOO BIG. REDRAW EVERY COMPLETE FIGURE about FIFTEEN PERCENT SMALLER, maintaining same proportions, so full height including horns is exactly210px, from y37 to y247 in each cell. Do not just retain the previous oversize: make obvious empty space above and around every figure. Center head and torso on x128. Identical head/torso position across all rows within a column, maximum4px bob. Soles baseline247 in every cell. All tails/wings/staff/hair fully inside x12..243, with at least6px transparent margin EVERYWHERE. No clipping or cross-cell art.
Keep row1 strict FRONT left foot forward (viewer RIGHT foot lower/larger), row2 strict FRONT right foot forward (viewer LEFT lower/larger). Keep row3 strict BACK left foot ahead/up (viewer left) and right trailing/down; row4 back right ahead/up and left trailing/down. Rows remain visibly distinct opposite contacts; all six girls.
ERASE THE WHOLE MISTY GRADIENT BEHIND THE SPRITES. Make this a real PNG with completely empty TRANSPARENT background, alpha0 exactly, clean cutout silhouettes and transparent gaps between hair/limbs/tails. The pale-blue/lilac/amber gradient is unwanted and must vanish, not fade. Opaque sprites alpha255, no colored translucent background. NO ground shadows, glow, white/black matte, checkerboard, labels or grid. Do not repaint the background in a color: output transparent only.
```

## walk-cycle-side-1.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-d921fc4e-0b14-41b4-a490-5919f84c92a5`。
- 输入文件：`residents-atlas-builtin.png`、`walk-directions.png`（身份、风格、尺度参考）。
- alpha 实测：min=0，max=254；alpha=0 像素 877,056；alpha 1–254 像素 695,808；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1/R2 六人都是近腿/她右腿前，仅手臂变化，核心腿交换失败。R3 多人是三分之四视角，尤其 Gemini/Kimi 偏背侧、Grok 偏前侧；R4 背面双脚并拢。此版不接受。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |
| Claude | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |
| GPT | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |
| Gemini | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |
| Kimi | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |
| Grok | 近腿／她右腿；画面右侧前脚 | 仍是近腿／她右腿；与 R1 同相位 | 只有手臂区别，腿交换失败 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 245 / 218 | 246 / 213 | 245 / 224 | 245 / 213 | 245 / 213 | 246 / 225 | 942 |
| R2 | 241 / 216 | 243 / 211 | 243 / 223 | 243 / 211 | 241 / 209 | 245 / 225 | 165 |
| R3 | 244 / 226 | 245 / 219 | 244 / 236 | 245 / 221 | 244 / 220 | 245 / 229 | 590 |
| R4 | 246 / 230 | 246 / 223 | 245 / 234 | 246 / 223 | 246 / 224 | 246 / 231 | 1203 |

四行头顶跨度（六列顺序）：`11, 10, 13, 9, 10, 6` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`127.5, 119, 113.5, 120, 122, 121`
- R2：`119.5, 112.5, 109.5, 116.5, 119, 120.5`
- R3：`122, 110, 102.5, 110, 111.5, 126`
- R4：`133, 124.5, 120, 121, 126, 124.5`

### Exact prompt

```text
Use case: stylized-concept. Asset type: production RPG walk-cycle sprite atlas. Generate ONE PNG EXACTLY 1536x1024, six columns by four rows of EXACTLY 256x256 cells, no gutters. The two attached atlases are CHARACTER IDENTITY, STYLE and SCALE REFERENCES, not poses to duplicate. Image 1 residents-atlas-builtin.png establishes faces and clothing, image 2 walk-directions.png establishes side/back identities. Preserve their detailed crisp pixel-art clusters, outline weight, palette and charming super-deformed anime women about 3 heads tall. The old walk frames are incorrect; REDRAW genuinely alternating legs.
TRUE RGBA TRANSPARENCY: every pixel outside the figures alpha=0. No coloured backdrop, no gradient, no fake checkerboard, no halo/glow, no ground, no shadows, no grid lines, borders, labels, letters, watermark or UI.
Exactly one full figure in each cell, 24 figures total. Columns left to right ALWAYS: 1 DeepSeek long blue hair, white frilled maid headband, blue-white maid outfit, blue whale tail; 2 Claude long orange hair, white daisy, cream/amber dress, black bodice ribbon, little book; 3 GPT white-lilac hair, two curved white horns, small pale dragon wings and curled tail, white dress, violet eyes; 4 Gemini blue-to-lilac hair, two gold star ornaments, navy/white/lilac dress; 5 Kimi dark navy hair, gold crescent moon, navy/ivory/gold dress and scroll; 6 Grok blonde twin-tails, black bows, black/gold outfit, golden staff.
PIXEL GEOMETRY every 256px cell: figure centered at x128; full figure about 200-215px tall, head top near y34-40, soles baseline y247; all hair, wings, tails, staff within x6..249 and y6..249. Nothing crosses cell boundaries. Lock head center and torso center to exactly the same x/y position and same size in all four rows within each column. Head bob maximum 4px. Only legs, arms, skirt hem, hair tips and tail sway animate. Keep all identity asymmetries consistent rather than mirroring the whole character. Clothes must let both shins and shoes be clearly seen; adjust moving hem slightly, preserve outfit identity.
SHEET: walk-cycle-side.
ROW1 (y0..255): all six STRICT RIGHT-FACING SIDE PROFILES, one eye visible, head/nose point RIGHT. Wide-stride CONTACT. NEAR leg = her anatomical RIGHT leg = visibly larger/lower foreground leg drawn OVER far leg: it reaches FORWARD to screen RIGHT, shoe around x170,y247 and emerges overlapping IN FRONT of skirt hem. FAR LEFT leg reaches BACK to screen LEFT, shoe around x95,y234, partially occluded by skirt/near leg. Two feet separated horizontally about 70px (one third body height). NEAR arm swings BACK to screen left, FAR arm forward to screen right.
ROW2 (y256..511): same locked RIGHT-FACING profile/head/torso. OPPOSITE CONTACT. NEAR RIGHT leg now reaches BACK to screen LEFT, larger shoe around x87,y247, drawn IN FRONT OF far leg and overlaps the BACK/LEFT skirt hem. FAR LEFT leg reaches FORWARD screen RIGHT, smaller shoe around x165,y234, emerging from BEHIND the FRONT/RIGHT hem. Make near shin start at the front layer of hip and visibly slope down-left. Near leg must be visibly on top of the far leg at crossing. NEAR arm swings FORWARD to screen right, FAR arm back to screen left. This is NOT row1 repeated: the large low foreground shoe changes from RIGHT in row1 to LEFT in row2. Reverse skirt-hem tilt, hair-tip and tail sway. Do not rotate the body or head. Preserve costume and shoe colors, use natural foreground outline/occlusion and slightly larger/lower near leg to distinguish legs.
ROW3 (y512..767): same strict RIGHT-FACING profile and fixed head/torso, PASSING pose: tall on one straight weight-bearing leg (foot beneath body x128,y247), other knee lifted, foot passing beside it beneath body, feet close together horizontally (less than 20px separation), NO wide stride.
ROW4 (y768..1023): STRICT BACK view PASSING pose, no face visible, standing feet together under body at y247. Keep all rear identity details. No side/front figures in row4.
The alternating NEAR-leg foreground is the entire purpose. The wide-stride feet must clearly exchange foreground/background depth between row1 and row2 even though both face right. Complete 24 uncut sprites, equal exact cells, genuine transparent PNG.
```

## walk-cycle-side-2.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-dbd83db2-079f-46d5-8431-c35b75796bd8`。
- 输入文件：`walk-cycle-side-1.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 862,491；alpha 1–254 像素 710,373；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1/R2 六人已实现近腿前和远腿前交换。R3 Gemini/Kimi/Grok 仍明显三分之四视角，其余也未统一严格侧面；R4 背面双脚并拢。R2 Grok 向左甩的金发实质跨入 Kimi 格右缘：格边强 alpha 棕金像素不是背景噪点；不选。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Claude | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| GPT | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Gemini | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Kimi | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Grok | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 246 / 219 | 246 / 213 | 246 / 225 | 246 / 214 | 246 / 214 | 247 / 227 | 1540 |
| R2 | 244 / 219 | 244 / 213 | 244 / 226 | 245 / 214 | 244 / 213 | 244 / 226 | 1584 |
| R3 | 246 / 230 | 246 / 221 | 245 / 238 | 246 / 222 | 245 / 223 | 246 / 232 | 1448 |
| R4 | 245 / 229 | 246 / 223 | 245 / 235 | 245 / 223 | 246 / 226 | 245 / 230 | 1357 |

四行头顶跨度（六列顺序）：`11, 10, 14, 10, 12, 6` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`127.5, 117.5, 112.5, 117.5, 119.5, 119.5`
- R2：`118.5, 107.5, 100, 100.5, 136, 110.5`
- R3：`123.5, 108, 102, 108.5, 111.5, 124.5`
- R4：`133, 124, 118.5, 118.5, 124, 123.5`

### Exact prompt

```text
Precise-object-edit of walk-cycle-side-1.png, the attached 1536x1024 edit target. Exact six columns by four 256px rows, 24 complete pixel-art figures, identities and outfit features unchanged.
CRITICAL: ROW2 LEGS ARE WRONG in the target. They repeat row1's near-leg-forward pose. REDRAW THE ENTIRE TWO LEGS BELOW EACH SKIRT IN ROW2, all six characters. Preserve row2 head and torso location and right-facing profile. Make the NEAR RIGHT LEG step BACK to screen LEFT. It is the front-layer leg, noticeably larger/lower and occludes the far thigh at their crossing. Its thigh begins x128,y192, knee x110,y214, ankle x87,y239, foot pointed right with sole at x87..107,y247. Long diagonal near shin slopes DOWN-LEFT. It is NOT a lifted small curled leg. Make FAR LEFT LEG step FORWARD screen RIGHT: its shin is behind the near leg, smaller foot at x166,y233, partially hidden at its root by the FRONT/RIGHT skirt hem. Thus row2's LARGE LOW FOREGROUND SHOE is on the LEFT, while row1's LARGE LOW FOREGROUND SHOE is on the RIGHT. Opposite near/far legs, clearly different silhouettes, same shoe colors. Both side strides about70px horizontal shoe separation. Row2 near arm FORWARD RIGHT, far arm BACK LEFT. Row1 near arm BACK LEFT, far arm FORWARD RIGHT. Reverse hem tilt, hair-tip and tail sway row2. Do NOT just retain the target's two small rear feet on the left and two large forward feet on the right; that is the specific failure to fix.
ROW1 stays strict right-facing side contact, near leg forward right, far back left. ROW3 redraw as STRICT RIGHT-FACING PROFILE, one eye visible with nose pointing right (not three-quarter front or back), weight leg straight at x128,y247, other foot lifted passing alongside within20px horizontally. Same head/torso position and scale as contact rows. ROW4 stays full BACK passing, no face, feet together.
ALSO REMOVE ENTIRE COLOURED HAZY BACKDROP: true PNG alpha=0 everywhere outside figures, no mist, tint, ground, shadow, halo, gradient, checkerboard or matte, even low-opacity. Crisp opaque pixel-art cutouts only.
Fit each complete figure INCLUDING ornaments/horns/hair/wings/tails/staff to about210px tall from local y37 to y247, centered cell x128. Head/torso same exact x/y and size all four rows within column, max4px bob. Minimum6px fully transparent cell padding. No bleed, no labels/text/gridlines. One 1536x1024 transparent PNG.
```

## walk-cycle-side-3.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-3fd85bf0-eb3f-4d0a-848f-bd8b5dc0e5cb`。
- 输入文件：`walk-cycle-side-2.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 834,180；alpha 1–254 像素 738,684；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1/R2 六人近远腿交换保留，R3 更接近右向侧面 passing，R4 背面双脚并拢。但后几列发生明显水平错位，多个角色前景进入相邻格；不选。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Claude | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| GPT | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Gemini | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Kimi | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Grok | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 247 / 221 | 247 / 215 | 247 / 228 | 247 / 215 | 247 / 215 | 248 / 228 | 3666 |
| R2 | 244 / 219 | 244 / 213 | 244 / 226 | 244 / 213 | 244 / 213 | 244 / 226 | 4013 |
| R3 | 248 / 232 | 248 / 225 | 248 / 243 | 248 / 225 | 248 / 225 | 248 / 236 | 2401 |
| R4 | 246 / 231 | 246 / 225 | 246 / 239 | 246 / 225 | 246 / 227 | 246 / 232 | 3613 |

四行头顶跨度（六列顺序）：`11, 11, 14, 11, 13, 8` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`129.5, 116.5, 115.5, 135.5, 127.5, 95.5`
- R2：`119, 107, 100.5, 129.5, 127.5, 95.5`
- R3：`126, 108.5, 102.5, 105, 135.5, 96`
- R4：`132, 125.5, 119, 138, 127.5, 99.5`

### Exact prompt

```text
Precise targeted edit of walk-cycle-side-2.png. Keep dimensions 1536x1024 and 6 columns x4 rows of 256px cells, six identities, crisp pixel art, all correct leg alternation. Row1 near/right leg FORWARD to screen right (large low shoe); row2 near/right leg BACK to screen left (large low shoe), far/left leg forward right (smaller higher shoe). Preserve these newly correct different legs.
Fix ROW3 only for pose/camera: all SIX characters must have EXACTLY THE SAME STRICT RIGHT-FACING SIDE PROFILE HEAD AND TORSO as row1. Copy row1 head scale, x/y location, single-eye side face and nose orientation conceptually into row3. Redraw row3 from a perfectly SIDE camera, not three-quarter front/back: narrow profile chest, nose points right. Tall straight weight leg at x128,y247 and other foot lifted passing close beside it within20px horizontal, no wide stride. No forward-facing eyes/chest. In particular Gemini, Kimi and Grok must not look toward or away from viewer.
Geometry all rows: fit every complete silhouette including horns/hair/tail/staff within 210px height, head top local y37 and soles local y247, centered x128. Fixed head position in all four rows per column, maximum4px bob. Row4 remains rear view feet together.
Remove the ENTIRE unwanted colored blue/lilac/amber backdrop and its low-alpha haze. Actual transparent PNG with background alpha ZERO, not merely faint or translucent. Sprites opaque alpha255 inside, crisp edges, no shadows/ground/halo/checkerboard/grid/text. All 6px cell margins and gaps fully transparent. Preserve all identity ornaments, clothes and colors.
```

## walk-cycle-side-4.png

- 像素尺寸：1536×1024；RGBA；6×4 cell，每格 256×256。
- 工具／模型：`image_gen.imagegen`；准确模型／版本未公开；`transparent_background=true`。
- generation/source id：`exec-c88932af-d40b-4c30-b883-9d5cceeedcb8`。
- 输入文件：`walk-cycle-side-3.png`（编辑目标）。
- alpha 实测：min=0，max=254；alpha=0 像素 886,980；alpha 1–254 像素 685,884；alpha=255 像素 0。**轮廓外 alpha 并非全零，背景要求失败。**

R1 六人近腿/她右腿前，前鞋低且较大；R2 六人远腿/她左腿前，近腿退后且后鞋较低较大，遮挡关系可辨认。R3 六人右向单眼侧面，直腿承重、另一脚抬起贴近，passing 可读；R4 六人背面无脸、双脚并拢。目测及强 alpha 格边检查未见实质前景跨格。选中此版优先保留核心腿交换、侧面 passing 和格内完整性；位置、尺度和透明度仍失败。

| Character | R1 哪只脚向前 | R2 哪只脚向前 | R1/R2 肉眼区别 |
|---|---|---|---|
| DeepSeek | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Claude | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| GPT | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Gemini | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Kimi | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |
| Grok | 近腿／她右腿；画面右侧前脚 | 远腿／她左腿；近右腿向后、画面左侧后鞋低且较大 | 腿位明显相反，通过目测 |

| 行 | DeepSeek 基线 / 高度 | Claude | GPT | Gemini | Kimi | Grok | 6px 边带非零数（六格合计） |
|---|---|---|---|---|---|---|---|
| R1 | 235 / 190 | 233 / 185 | 235 / 197 | 234 / 184 | 234 / 185 | 234 / 193 | 1145 |
| R2 | 229 / 190 | 229 / 185 | 229 / 196 | 230 / 185 | 229 / 185 | 229 / 191 | 2843 |
| R3 | 231 / 203 | 231 / 196 | 231 / 210 | 231 / 196 | 231 / 196 | 231 / 204 | 1866 |
| R4 | 228 / 198 | 228 / 192 | 228 / 203 | 228 / 192 | 228 / 193 | 228 / 197 | 1255 |

四行头顶跨度（六列顺序）：`17, 13, 17, 15, 14, 14` px。

主体包围盒水平中点（六列顺序，目标居中约 x128；含尾巴/权杖）：

- R1：`134.5, 118, 118.5, 119, 101, 111`
- R2：`124.5, 111, 107.5, 104, 93.5, 113`
- R3：`129.5, 116.5, 109, 110, 101.5, 116.5`
- R4：`137, 127.5, 125, 121.5, 108.5, 116.5`

### Exact prompt

```text
Final production edit of attached walk-cycle-side-3.png. Keep 1536x1024 and exact six columns by four rows, every cell256x256. Preserve six identities, right-facing side profiles, and CORRECT NEAR/FAR LEG EXCHANGE:
Row1 near RIGHT leg reaches FORWARD screen-right, big low shoe; far LEFT leg back left. Row2 near RIGHT leg reaches BACK screen-left, big low shoe; far LEFT leg forward screen-right, smaller/higher shoe. Preserve clearly different leg silhouettes and opposite arm swings, hem/tail/hair-tip sway. Do not revert to repeated legs. Row3 strict right-facing profile passing, single eye, weight leg straight and other foot raised close beside. Row4 strict back passing, no faces, feet together.
FIX FIT AND REGISTRATION: redraw ALL complete figures about10-15% SMALLER to full210px height INCLUDING horns/ornaments and tails/staff, from local y37 to y247. Center all HEAD/TORSOS precisely at x128 in EVERY row per column, fixed head height maximum4px bob. Row3 must not shift head forward/right. Body/head size identical all rows. At least6px full transparent margin on every cell edge; wings/hair/tails/staff must stay inside local x12..243. CRITICAL Grok row2: left-swept blonde twin-tail currently crosses into Kimi's cell. TUCK ITS TIP INWARD toward her back; entire Grok row2 including both hair tails must be inside sixth cell x12..243. Nothing at all in neighboring cell.
REMOVE THE ENTIRE BLUE/LILAC/AMBER MISTY GRADIENT BACKDROP. Output true transparent PNG with alpha=0 outside every silhouette and through all holes/gaps. Clean opaque sprites alpha255, no translucent haze, halo, ground, shadow, matte, grid, text or checkerboard. The surrounding canvas must be literally empty transparency, not a faint colored background. Preserve all character colors and pixel-art detail.
```

## 完成边界

核心左右脚交换已在最终候选中实现；透明背景、人物尺寸与固定落点没有全部实现。保留候选供后续比较，未将其标为 ready to integrate。达到三次编辑上限后停止，没有改用现有图的程序变形或重着色来伪造帧。

