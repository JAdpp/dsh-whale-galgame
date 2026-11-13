# MID-NOTES

完成首轮生成与三次定向编辑，全部原始候选均保留。最佳综合候选选为 `walk-cycle-side-mid-4.png`，并逐字节复制为 `walk-cycle-side-mid.png`。**没有任何一轮完全满足全部硬要求**：最终R2仍偏宽、R1基线偏低、部分头顶偏移超限，R4偏向后收脚跟，背景仍有非零alpha残留。最终文件应视为候选，尚未达到直接叠帧验收标准。

选择第4轮的原因：R1接近半步幅，R2基线统一，R4终于与R3有可见的支撑/抬脚差异。第3轮R2的半步幅更准确，因此同样保留以便比较。

## 范围与生成信息

- 仅交付5个PNG和本笔记；没有修改代码、脚本、manifest或其他文档，没有提交。
- 所有PNG均来自内置 `image_gen.imagegen`，通过 `functions.exec` 调用；每次均设置 `transparent_background=true`。工具未公开具体模型ID、seed或revised prompt，不能据此声称某个模型版本。
- 工具暴露了保存文件名，以下仅记录其stem作为source id；没有把工具的完整本地保存位置抄入本笔记。
- PNG保存时只做原文件复制；没有对图像进行缩放、裁切、扭曲、翻转、混合、透明通道清洗或拼图。Python/Pillow只用于只读测量。
- 精确参考为 `walk-cycle-side.png`；未将 `residents-atlas-builtin.png` 传入生成工具。
- 列顺序始终为 DeepSeek / Claude / GPT / Gemini / Kimi / Grok。所有坐标都是256px单元内的局部坐标，y从0开始。

## 测量口径与参考实测

参考本身为1536×1024 RGBA，alpha范围0–254，alpha=0共886,980像素；alpha=1–127共251,450像素，包含低alpha背景残留及边缘。查看器中的彩色外观不能代替alpha检查。由于alpha>0会把背景残留算进去，人物实体包围盒统一以**alpha>127**测量。高度为实体包围盒高度，top为其最上方像素，sole为底部像素；这是像素测量，不是精确骨架或解剖测量。

鞋距为两只鞋实体外轮廓包围盒的水平中心差，**不是鞋外缘跨度，也不是踝关节间距**。对裙摆、GPT龙尾及Grok法杖作人工排除；不同姿势鞋形与截取高度会产生约3–5px误差。候选1的R2为人工估计，约±4px。百分比对比同列参考同一行，目标约50%。

|角色|参考R1鞋距px|参考R2鞋距px|参考R3高度px|参考R3 top|参考R3 sole|
|---|---:|---:|---:|---:|---:|
|DeepSeek|109|91.5|203|29|231|
|Claude|106|91.5|196|36|231|
|GPT|91|92|210|22|231|
|Gemini|108.5|95.5|196|36|231|
|Kimi|109|94.5|196|36|231|
|Grok|114|98.5|204|28|231|

背景验收另取每格四边6px宽的空白条，统计其中alpha非零的像素数。这里本应无人物，因此非零即能直接证明该格背景未完全归零；计数为0只表示边界检查通过，不能证明轮廓外的所有像素都为0。所有候选的实体包围盒都在单元内且留有至少6px边距；低alpha残留仍进入部分边界条，因此完整透明边距要求未通过。

人物位置表格式：`高度(相对参考R3高度差) / top(相对参考R3 top差) / sole`。比例相近不代表上半身图像逐像素相同；可见重绘和发梢变化，未能保证叠帧时上半身完全锁定。

## 逐文件记录

### walk-cycle-side-mid-1.png

像素尺寸：1536×1024；RGBA；6×4个256×256单元。工具：`image_gen.imagegen`；具体模型未公开。source id：`exec-c69cc0ba-7ba7-4497-bb18-ea59f472a7d0`。输入图片按顺序：`walk-cycle-side.png`。

|角色|R1鞋距px / 参考 / 比例|R2鞋距px / 参考 / 比例|
|---|---:|---:|
|DeepSeek|66 / 109 / 61%|27 / 91.5 / 30%|
|Claude|68 / 106 / 64%|24 / 91.5 / 26%|
|GPT|63.5 / 91 / 70%|27 / 92 / 29%|
|Gemini|66 / 108.5 / 61%|27 / 95.5 / 28%|
|Kimi|65 / 109 / 60%|28 / 94.5 / 30%|
|Grok|66 / 114 / 58%|27 / 98.5 / 27%|

|角色|R1 高度差 / top差 / sole|R2 高度差 / top差 / sole|R3 高度差 / top差 / sole|R4 高度差 / top差 / sole|
|---|---|---|---|---|
|DeepSeek|194(-9) / 45(+16) / 238|193(-10) / 39(+10) / 231|205(+2) / 28(-1) / 232|200(-3) / 31(+2) / 230|
|Claude|190(-6) / 49(+13) / 238|188(-8) / 45(+9) / 232|198(+2) / 35(-1) / 232|194(-2) / 37(+1) / 230|
|GPT|201(-9) / 39(+17) / 239|199(-11) / 33(+11) / 231|211(+1) / 22(0) / 232|206(-4) / 25(+3) / 230|
|Gemini|189(-7) / 50(+14) / 238|188(-8) / 45(+9) / 232|198(+2) / 35(-1) / 232|196(0) / 35(-1) / 230|
|Kimi|190(-6) / 50(+14) / 239|187(-9) / 45(+9) / 231|198(+2) / 35(-1) / 232|195(-1) / 36(0) / 230|
|Grok|198(-6) / 41(+13) / 238|194(-10) / 38(+10) / 231|206(+2) / 27(-1) / 232|199(-5) / 32(+4) / 230|

Alpha实测：范围0–254；alpha=0共149,775 / 1,572,864像素；alpha=1–127共993,773像素。低alpha总数含正常边缘，不能全部算作背景，但下表空白边界中的非零像素已证明**背景不是处处alpha=0**。

|角色|R1边界非零像素|R2边界非零像素|R3边界非零像素|R4边界非零像素|
|---|---:|---:|---:|---:|
|DeepSeek|5321|4486|5743|5530|
|Claude|5843|5794|5640|5527|
|GPT|5911|5742|5707|5714|
|Gemini|5347|4892|4959|4911|
|Kimi|5315|4750|4079|4014|
|Grok|4589|4217|4011|4272|

逐行目视检查（六名角色均适用；特殊角色差异已单列于测量表）：

- R1：六人均朝右，步幅比原接触帧窄，但仍为原来的58–70%，偏宽；头顶下移13–17px，基线偏低。
- R2：六人脚距只有约24–28px，更接近并脚/经过姿势，不是所需半步幅；近远腿相位未可靠证实。
- R3：六人均有一只抬起的脚，主体接近原R3；不能可靠确认每人抬的是近腿。
- R4：六人仍全部背面，明确失败。

精确提示词（原样记录）：

```text
Use case: identity-preserve.
Create one production pixel-art sprite atlas by editing the attached walk-cycle-side.png reference. This is a tightly registered IN-BETWEEN animation sheet, not a redesign.
OUTPUT: PNG, exactly 1536 x 1024 pixels, genuinely transparent RGBA background, alpha 0 outside the sprites. Six columns and four rows of exactly 256 x 256 pixels; 24 separate full-body sprites. No gaps between cells, no grid lines, no labels, no text, no ground, no gradient, no cast shadow, no glow, no watermark. Remove the reference's visible colored background completely.
REFERENCE ROLES: walk-cycle-side.png is the exact character, drawing style, outline, palette, scale, horizontal positioning and upper-body registration reference. Its ROW THREE is the fixed model for every generated row, in each corresponding column. Its ROW ONE and ROW TWO show only the maximum stride endpoints; do not reproduce their wide stride.
COLUMNS left to right: 1 DeepSeek, blue-haired maid with whale tail; 2 Claude, long orange hair, white flower, cream/amber dress and book; 3 GPT, white-lilac hair, horns, little dragon wings and tail, white dress; 4 Gemini, blue-to-lilac hair, star ornaments, navy/white dress; 5 Kimi, dark navy/purple hair, crescent moon ornament, navy/white dress, scroll; 6 Grok, blonde twin tails, black bows, black/gold outfit, gold staff. Preserve each original identity and every accessory.
ALL 24 FIGURES ARE STRICT RIGHT-FACING SIDE PROFILE. No front view, no back view, no three-quarter view, including the fourth row.
REGISTERED UPPER BODY: In each column use the reference ROW THREE drawing, same pixel-art treatment and chibi proportions. Keep the head, face, hair mass, torso, waist and outfit at the same coordinates and same scale in every row. Do not zoom or recenter the individual character. Head top moves at most 3 pixels. Only legs, feet, arms and the skirt hem change; only tiny hair-tip and tail sway. Figure height about 195-210 pixels, matched to the actual corresponding reference row-three figure, not enlarged. At least 6 pixels clear transparent margin on every cell edge, nothing crosses a cell boundary. Standing shoe soles at local cell y=230-236, one ground baseline in each row.
ROW 1 (cells y=0..255): HALF STRIDE, NEAR LEG FORWARD, FAR LEG BACK. Interpolate halfway from reference row-three feet-together to reference row-one full contact. The visible near shoe is in front, to the right; the far shoe is back, to the left, less visible. Both knees slightly flexed. The forward foot just touches or lifts from the baseline. Horizontal shoe-center separation must be approximately HALF the corresponding row-one reference separation, around 50-55 pixels, NOT the 100-115px wide contact. Noticeably narrower than contact, noticeably wider than passing. Keep feet close under the torso; do not lunge.
ROW 2 (cells y=256..511): HALF STRIDE, FAR LEG FORWARD, NEAR LEG BACK. Halfway between reference row-three passing and reference row-two contact, corresponding shoe-center separation about HALF of reference row two, around 45-55px. The far leg reaches right but is partially behind the near leg and dress, near leg left/back. Knees slightly flexed. Smaller arm swing than full contact.
ROW 3 (cells y=512..767): PASSING WITH NEAR LEG LIFTED. Stand upright on the far leg, its sole at the baseline. Near thigh angles forward with bent knee, near shoe raised off the ground beside the standing far shin. Feet horizontally close, not a wide step. Keep head and torso exactly like reference row three.
ROW 4 (cells y=768..1023): PASSING WITH FAR LEG LIFTED. Remain strict right-facing profile, same head and torso as reference row three. Stand upright on the NEAR leg, its sole at the baseline. FAR knee raised and bent, FAR shoe off ground beside the near shin, partially occluded. Clearly switch the weight-bearing and lifted legs relative to row three.
Motion: arms swing proportionally with smaller excursion than wide contacts; skirt hem, hair tips and tails sway only slightly. All figures face right and are full-body, evenly registered in the original cells. Preserve the reference sprite rendering and crisp fine pixel-art contours. Critical check before output: 6x4 cells; all rows right profile; first two rows have HALF the wide-stride foot separation; fixed row-three head/torso positions; actual transparent alpha 0 background.
```

### walk-cycle-side-mid-2.png

像素尺寸：1536×1024；RGBA；6×4个256×256单元。工具：`image_gen.imagegen`；具体模型未公开。source id：`exec-9b809f9d-ccd9-45c2-8128-cfae7abe82fd`。输入图片按顺序：`walk-cycle-side-mid-1.png`、`walk-cycle-side.png`。

|角色|R1鞋距px / 参考 / 比例|R2鞋距px / 参考 / 比例|
|---|---:|---:|
|DeepSeek|65.5 / 109 / 60%|70 / 91.5 / 77%|
|Claude|66.5 / 106 / 63%|76.5 / 91.5 / 84%|
|GPT|64 / 91 / 70%|66.5 / 92 / 72%|
|Gemini|66 / 108.5 / 61%|69.5 / 95.5 / 73%|
|Kimi|67 / 109 / 61%|70 / 94.5 / 74%|
|Grok|69.5 / 114 / 61%|76 / 98.5 / 77%|

|角色|R1 高度差 / top差 / sole|R2 高度差 / top差 / sole|R3 高度差 / top差 / sole|R4 高度差 / top差 / sole|
|---|---|---|---|---|
|DeepSeek|197(-6) / 43(+14) / 239|194(-9) / 38(+9) / 231|203(0) / 28(-1) / 230|198(-5) / 31(+2) / 228|
|Claude|191(-5) / 49(+13) / 239|189(-7) / 44(+8) / 232|196(0) / 35(-1) / 230|194(-2) / 36(0) / 229|
|GPT|202(-8) / 38(+16) / 239|201(-9) / 32(+10) / 232|210(0) / 21(-1) / 230|207(-3) / 23(+1) / 229|
|Gemini|190(-6) / 50(+14) / 239|188(-8) / 44(+8) / 231|196(0) / 35(-1) / 230|195(-1) / 34(-2) / 228|
|Kimi|190(-6) / 50(+14) / 239|187(-9) / 44(+8) / 230|196(0) / 35(-1) / 230|194(-2) / 36(0) / 229|
|Grok|199(-5) / 40(+12) / 238|197(-7) / 36(+8) / 232|205(+1) / 26(-2) / 230|199(-5) / 30(+2) / 228|

Alpha实测：范围0–254；alpha=0共1,041,085 / 1,572,864像素；alpha=1–127共122,777像素。低alpha总数含正常边缘，不能全部算作背景，但下表空白边界中的非零像素已证明**背景不是处处alpha=0**。

|角色|R1边界非零像素|R2边界非零像素|R3边界非零像素|R4边界非零像素|
|---|---:|---:|---:|---:|
|DeepSeek|0|0|0|0|
|Claude|1|0|0|1|
|GPT|14|4|0|0|
|Gemini|0|0|0|0|
|Kimi|0|0|3|0|
|Grok|0|0|0|0|

逐行目视检查（六名角色均适用；特殊角色差异已单列于测量表）：

- R1：六人均朝右，鞋距约原来的60–70%，仍偏宽；头部仍比原R3低12–16px。
- R2：六人均有分开的双脚，但鞋距约原来的72–84%，明显超过一半。
- R3：六人均为朝右经过姿势，头顶接近原R3。
- R4：已全部改为朝右侧面；与R3的支撑脚和抬脚重叠关系相近，没有可靠的近远腿交换证据。

精确提示词（原样记录）：

```text
Targeted correction of walk-cycle-side-mid-1.png using walk-cycle-side.png as the registration reference. Output exactly 1536x1024 RGBA, 6 columns x 4 rows of 256px. Preserve the six identities, pixel rendering and column positions.
CRITICAL CHANGE: ALL FOUR ROWS must use the RIGHT-FACING SIDE-PROFILE HEAD AND UPPER BODY FROM ROW THREE OF walk-cycle-side.png. The entire fourth row MUST BE REPLACED WITH RIGHT-FACING SIDE PROFILES; it must not retain any back views. Also make rows one and two the same upright body and scale as row three, not the leaning wide-contact bodies. Use original row-three upper-body/head drawing at the same coordinates in each cell.
Exact head-top local y by column, for EVERY row: DeepSeek=29, Claude=36, GPT=22, Gemini=36, Kimi=36, Grok=28, within 3px. Standing soles local y=231. Full figure height by column approximately 203,196,210,196,196,204px. Do not enlarge or shrink.
POSES:
R1 HALF stride, NEAR leg forward/right, FAR back/left. Shoe centers roughly 50-55px apart; half the original row-one wide stride.
R2 HALF stride, FAR leg forward/right, NEAR back/left. Shoe centers roughly 45-55px apart, NOT feet together. Keep two clearly separated feet, visibly intermediate between wide contact and passing.
R3 NEAR knee lifted and bent in front of the standing FAR shin. Upright right profile, horizontal shoe centers about 10-18px apart; one shoe raised clear of the ground.
R4 FAR knee lifted and bent beside the standing NEAR shin, far shoe partially occluded. Upright RIGHT PROFILE, horizontal shoe centers about 10-18px apart; one shoe raised. Same side-profile face, head, hair silhouette, torso and outfit as row three, never back-facing.
Near leg means closest to the viewer, far means the occluded leg. Small proportional arm swing, subtle hem movement only.
TRANSPARENCY: Discard the colored/gradient reference background AND ALL low-opacity background residue. Outside each figure every pixel alpha must be exactly 0, not alpha 1 or 2. No colored backdrop, no halo, no ground shadow. Do not paint transparency checkerboards. No guides, labels, gutters or text; at least 6 transparent pixels at every cell boundary.
```

### walk-cycle-side-mid-3.png

像素尺寸：1536×1024；RGBA；6×4个256×256单元。工具：`image_gen.imagegen`；具体模型未公开。source id：`exec-a5e89cb2-02b3-496c-9b09-a02a5ac78294`。输入图片按顺序：`walk-cycle-side-mid-2.png`、`walk-cycle-side.png`。

|角色|R1鞋距px / 参考 / 比例|R2鞋距px / 参考 / 比例|
|---|---:|---:|
|DeepSeek|46.5 / 109 / 43%|46.5 / 91.5 / 51%|
|Claude|44 / 106 / 42%|48.5 / 91.5 / 53%|
|GPT|45 / 91 / 49%|50 / 92 / 54%|
|Gemini|47.5 / 108.5 / 44%|48.5 / 95.5 / 51%|
|Kimi|46.5 / 109 / 43%|44 / 94.5 / 47%|
|Grok|46.5 / 114 / 41%|56 / 98.5 / 57%|

|角色|R1 高度差 / top差 / sole|R2 高度差 / top差 / sole|R3 高度差 / top差 / sole|R4 高度差 / top差 / sole|
|---|---|---|---|---|
|DeepSeek|206(+3) / 35(+6) / 240|204(+1) / 33(+4) / 236|205(+2) / 27(-2) / 231|204(+1) / 27(-2) / 230|
|Claude|197(+1) / 44(+8) / 240|195(-1) / 41(+5) / 235|198(+2) / 34(-2) / 231|198(+2) / 33(-3) / 230|
|GPT|208(-2) / 33(+11) / 240|206(-4) / 31(+9) / 236|211(+1) / 21(-1) / 231|210(0) / 21(-1) / 230|
|Gemini|195(-1) / 46(+10) / 240|194(-2) / 43(+7) / 236|198(+2) / 34(-2) / 231|198(+2) / 33(-3) / 230|
|Kimi|195(-1) / 46(+10) / 240|195(-1) / 42(+6) / 236|198(+2) / 34(-2) / 231|198(+2) / 33(-3) / 230|
|Grok|205(+1) / 36(+8) / 240|203(-1) / 34(+6) / 236|207(+3) / 25(-3) / 231|204(0) / 27(-1) / 230|

Alpha实测：范围0–254；alpha=0共1,034,825 / 1,572,864像素；alpha=1–127共117,533像素。低alpha总数含正常边缘，不能全部算作背景，但下表空白边界中的非零像素已证明**背景不是处处alpha=0**。

|角色|R1边界非零像素|R2边界非零像素|R3边界非零像素|R4边界非零像素|
|---|---:|---:|---:|---:|
|DeepSeek|0|1|0|0|
|Claude|8|0|3|0|
|GPT|1|0|1|0|
|Gemini|0|0|0|0|
|Kimi|0|0|0|0|
|Grok|0|0|3|0|

逐行目视检查（六名角色均适用；特殊角色差异已单列于测量表）：

- R1：六人鞋距约原来的41–49%，达到窄半步量级；但基线全为240，头顶仍比原R3低6–11px。
- R2：六人鞋距约原来的47–57%，是四轮中最接近一半的R2；基线235–236。
- R3：六人朝右，一只脚在右侧抬起，但近腿身份未可靠确认。
- R4：六人朝右，仍基本重复R3的支撑/抬脚关系，不能称为近远腿交换通过。

精确提示词（原样记录）：

```text
Edit walk-cycle-side-mid-2.png, using walk-cycle-side.png only as exact scale/position reference. Targeted repair of FIRST TWO ROWS. Keep rows three and four as right-facing profiles.
1536x1024 PNG, exactly 6 columns x 4 rows, 256x256 cells, true alpha-zero transparent background, no text, guides, ground or shadows.
FIRST TWO ROWS MUST BE RE-DRAWN AROUND THE UPRIGHT ROW-THREE BODY, not retain the existing leaning contact head/body. Copy each corresponding original ROW-THREE head, face, hair, torso and outfit drawing at its exact local coordinates into rows one and two. Only adjust legs/feet, small arm swing and hem. Head top in EVERY ROW by column: 29,36,22,36,36,28px (+/-3). Standing sole y=231px in every cell. Target full figure height: 203,196,210,196,196,204px. Restore the upright torso and same head-to-waist position as row three; no separate scaling or shifts between frames. Keep original horizontal centering.
R1 HALF STRIDE near leg forward/right, far leg back/left: exact target horizontal distance between SHOE CENTERS by column = 55,53,46,54,55,57 pixels. Current row-one 64-68px is still too wide. Bring the shoes closer under the body. Both knees relaxed, short step, not a lunge. Near leg in front of far leg.
R2 HALF STRIDE far leg forward/right, near leg back/left: target SHOE-CENTER distances = 46,46,46,48,47,49 pixels. Far foot is forward but partly occluded; near foot is back and in front visually. Two clearly separated shoes; must be wider than feet-together but only HALF of the original contact reference distance.
R3 passing: near knee raised/bent, far leg supports body, lifted near shoe clear of baseline beside standing shin.
R4 passing: far knee raised/bent and far shoe partly hidden beside standing near shin, NEAR leg supports body. This must show the OPPOSITE lifted leg to R3. All faces and bodies in R4 remain right-facing strict side profile.
Preserve six original heroines in their column order and every identity accessory; same pixel palette, outline and pixel-art style. Hair tips, tails and skirt hems barely sway. Background pixels outside the figures must have alpha exactly 0; eliminate any low-opacity colored background residue, halo, glow or shadow. At least 6px clear transparent cell borders.
```

### walk-cycle-side-mid-4.png

像素尺寸：1536×1024；RGBA；6×4个256×256单元。工具：`image_gen.imagegen`；具体模型未公开。source id：`exec-4cc7e164-62dc-4db1-92a1-121497308182`。输入图片按顺序：`walk-cycle-side-mid-3.png`。

|角色|R1鞋距px / 参考 / 比例|R2鞋距px / 参考 / 比例|
|---|---:|---:|
|DeepSeek|49 / 109 / 45%|56 / 91.5 / 61%|
|Claude|51.5 / 106 / 49%|60.5 / 91.5 / 66%|
|GPT|51.5 / 91 / 57%|57.5 / 92 / 63%|
|Gemini|56.5 / 108.5 / 52%|59 / 95.5 / 62%|
|Kimi|54.5 / 109 / 50%|58 / 94.5 / 61%|
|Grok|50.5 / 114 / 44%|62 / 98.5 / 63%|

|角色|R1 高度差 / top差 / sole|R2 高度差 / top差 / sole|R3 高度差 / top差 / sole|R4 高度差 / top差 / sole|
|---|---|---|---|---|
|DeepSeek|205(+2) / 33(+4) / 237|203(0) / 31(+2) / 233|207(+4) / 25(-4) / 231|207(+4) / 25(-4) / 231|
|Claude|197(+1) / 42(+6) / 238|195(-1) / 39(+3) / 233|200(+4) / 32(-4) / 231|199(+3) / 31(-5) / 229|
|GPT|208(-2) / 31(+9) / 238|205(-5) / 29(+7) / 233|213(+3) / 19(-3) / 231|212(+2) / 19(-3) / 230|
|Gemini|196(0) / 43(+7) / 238|195(-1) / 39(+3) / 233|200(+4) / 32(-4) / 231|200(+4) / 31(-5) / 230|
|Kimi|197(+1) / 42(+6) / 238|195(-1) / 39(+3) / 233|200(+4) / 32(-4) / 231|199(+3) / 31(-5) / 229|
|Grok|205(+1) / 33(+5) / 237|203(-1) / 31(+3) / 233|208(+4) / 23(-5) / 230|205(+1) / 26(-2) / 230|

Alpha实测：范围0–254；alpha=0共993,055 / 1,572,864像素；alpha=1–127共151,103像素。低alpha总数含正常边缘，不能全部算作背景，但下表空白边界中的非零像素已证明**背景不是处处alpha=0**。

|角色|R1边界非零像素|R2边界非零像素|R3边界非零像素|R4边界非零像素|
|---|---:|---:|---:|---:|
|DeepSeek|0|2|14|13|
|Claude|25|40|2|5|
|GPT|92|5|24|63|
|Gemini|84|48|73|10|
|Kimi|2|11|40|9|
|Grok|4|30|50|20|

逐行目视检查（六名角色均适用；特殊角色差异已单列于测量表）：

- R1：六人鞋距约原来的44–57%，接近一半；基线237–238仍略低；六人的头顶偏差分别为+4、+6、+9、+7、+6、+5px，均超过±3px。
- R2：六人鞋距约原来的61–66%，比一半偏宽；基线全233。DeepSeek、Claude、Gemini、Kimi、Grok头顶在±3px内，GPT为+7px。与R1的近远腿遮挡顺序仍不能可靠逐人确认。
- R3：六人均朝右，右侧脚抬起、左侧脚支撑；不能仅凭同款鞋可靠证明近腿身份。头顶较原R3上移3–5px。
- R4：六人均朝右，改为右侧脚支撑、左后脚抬起，与R3有可见区别；但更像向后收脚跟/后踢，膝盖未明显向前抬，不满足清楚的抬膝经过姿势。近远腿的解剖身份仍不确定。

精确提示词（原样记录）：

```text
Final targeted edit of walk-cycle-side-mid-3.png. Preserve its existing pixel artwork, column order, character identities, upper bodies, scale and narrow half-stride shapes. Exactly 1536x1024 transparent RGBA PNG, 6x4 cells of 256px. Do not add text, lines, gutters, backgrounds or shadows.
1. REGISTRATION ONLY: In each of the six ROW-ONE cells, move the complete figure UP by exactly 9 pixels within that same cell, without scaling. Row-one soles currently y240 must land at y231. In each ROW-TWO cell move the complete figure UP by exactly 5 pixels, without scaling; soles must land at y230-231. Keep their horizontal coordinates. Do not shift or scale row three or row four. All four rows should now have heads at the same local y and soles at one local y231 baseline, matched to original reference row three. Original reference head-top y by column: 29,36,22,36,36,28. Keep 6px blank cell margins.
2. LEG IDENTITY: Preserve the short half-strides in rows one and two. Row one NEAR shoe forward/right and FAR shoe back/left. Row two FAR shoe forward/right and NEAR shoe back/left, half-stride, not a repeated row-one leg layering. Shoe-center target separations R1=55,53,46,54,55,57px; R2=46,46,46,48,47,49px.
Make ROW FOUR a genuinely OPPOSITE-LEG passing pose to row three, while keeping the right-facing head/torso identical. ROW THREE: near leg is the bright foreground bent lifted leg, near shoe raised forward beside the far standing shin; far standing leg partly occluded. ROW FOUR: NEAR leg is now the bright foreground straight SUPPORT leg with sole at y231; FAR leg is bent and lifted BEHIND it, darker and partly occluded at knee/shoe by the near standing leg and hem. Do not repeat row-three leg layering. All 24 figures remain strict RIGHT-FACING SIDE PROFILE.
3. ALPHA CLEANUP IS MANDATORY: Remove every background pixel and every translucent background residue. Outside the actual crisp character silhouettes set alpha exactly ZERO, including all low-alpha gradient/noise/halo pixels. Every 6px strip along every 256px cell edge must be entirely alpha=0. The unused space and corners must be alpha=0, not 1, 2, 3 or a faded colored background. Preserve only sprite pixels and clean pixel-art edges. Do not paint checkerboards; export actual transparent alpha. Do not add any glow or ground shadow.
Do not redesign, zoom, resample the pixel style, or change the hair, faces, accessories, outfits or color palette. Only apply the registration, leg-layering and transparent-background corrections above.
```

### walk-cycle-side-mid.png

像素尺寸1536×1024，RGBA，6×4单元。它是 `walk-cycle-side-mid-4.png` 的原始字节副本，无另一次生成、无图像处理。工具、具体模型未知状态、source id、精确提示词、两行逐角色鞋距、四行逐角色高度/top/sole及alpha检查，均与上面的 `walk-cycle-side-mid-4.png` 记录完全相同。source id：`exec-4cc7e164-62dc-4db1-92a1-121497308182`。精确提示词为第4轮代码块全文。

此最终命名仅表示本轮最佳综合候选，不表示通过硬性要求。第4轮遗留问题完整适用于此文件。已达到用户给定的最多三次编辑上限，未用程序伪造补帧或修alpha。
