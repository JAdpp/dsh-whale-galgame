# 休闲动作图与正面行走修手：生成与检查记录

本文件记录两处素材改动：新增的 `leisure-actions.png`，以及 `walk-cycle-front-back.png` 里六处多余的手的修正。

## 起因

维护者指出两处画错，并要求把“休闲动作”改成各人专属：

1. 人物图集 `residents-atlas-builtin.png` 第 4 行（读写）里，Grok 有三只手：托书、执笔，还有一只握着斧杖。
2. 正面行走帧里，DeepSeek 摆臂的同时围裙前仍留着待机姿势的“双手交握”，多出一只手。
3. 六人原本共用同一个看书写字的姿势；现改为各自的动作：DeepSeek 抱钢盆吃大白饭、Claude 看书批注（内容不变，补上翻页）、GPT 双手捧起微型银河观测、Gemini 用魔法生成水晶、Kimi 用望远镜观星、Grok 挥斧。

## `leisure-actions.png`

- 1536 × 1024，RGBA，6 列 × 4 行，每格 256 × 256；列顺序与其它人物图集相同（DeepSeek、Claude、GPT、Gemini、Kimi、Grok）。**每一列的 4 行是该角色休闲动作的 4 帧循环。**
- SHA-256：`9b268d224f4e2e392d622f15c42155e4035f65ed9aa8659fb386f71d1503d098`。
- 工具：Codex 内置图像生成工具 `image_gen__imagegen`，每次调用都传入 `transparent_background: true`；工具没有报告模型名称或版本。
- 共 4 次尝试（1 次生成 + 3 次编辑）。选用第 2 次的输出，逐字节复制，未做缩放、裁剪、调色、合成或重新编码。第 2 次相对第 1 次收小了 Grok 过大的斧头与动作弧，去掉了 DeepSeek 身边多余的装饰；第 3、4 次在试图“抠掉背景”时重绘了线条与高光，没有采用。
- 参考输入：`residents-atlas-builtin.png`（以其第 1 行待机站姿为身份、画风与比例参考）。

### 实测（Pillow / NumPy 只读）

- alpha 范围 0–254；alpha = 0 的像素 633,491 个，alpha 1–23 的低透明残留 102,488 个，alpha ≥ 128 的主体 817,100 个。与三张行走图一样，轮廓外留有一层很淡的雾，运行时 WebP 由 `scripts/convert-workshop-art.mjs` 清除，母版不动。生成工具在预览里把这层雾显示成了“渐变背景”，实际主体之外是透明的。
- 各格主体（alpha > 127）的上沿在 y = 0–18，下沿在 y = 250–255；人物图集待机行的上沿为 5–16、下沿为 248。也就是说头顶位置与待机行一致，脚底比待机行低 2–7 px。同一列四帧里双脚与道具（如望远镜的三脚架）都画在格内同一位置，所以转换脚本给每列只算一个脚底锚点、四帧共用：横向取四帧双脚中心的中位数，纵向取四帧脚底线的中位数；若像行走图那样逐格按头部取横坐标，会被道具和飞起的头发带偏（Kimi 四帧为 118、118、92、97），播放时人会左右跳。
- 头身比与待机行不同：提示词要求“头与待机行等大”，但生成结果约为两头身（待机与行走约三头身），同样身高下脸宽约为待机行的 1.2 倍。这一点没有靠重画解决，而是在转换脚本里把绘制比例乘以 0.92（最终 0.90），使脸的大小与行走帧一致；也因此地图里休息时不在待机帧与休闲帧之间来回切换。
- GPT 的角在 4 帧里都贴近或碰到格顶（与待机行相同）；Kimi 第 4 行与 Grok 第 4 行的发梢距左边界只有 2 px。没有主体跨入相邻格。

### 逐格目视检查（针对选用的第 2 次）

每格都数过手：24 格均为两只手。以下为生成时的逐格记录，“未达到”的条目照实保留。

| 格（行,列） | 角色 | 手数 | 动作与个别问题 |
| --- | --- | --- | --- |
| 1,1 | DeepSeek | 2 | 一手勺一手抱钢盆；勺在盆上方，插入米饭不明确。 |
| 2,1 | DeepSeek | 2 | 盛饭勺举起，嘴张开；眼睛闪亮表现有限，勺与嘴尚有距离。 |
| 3,1 | DeepSeek | 2 | 闭眼微笑，勺到嘴边；明确含勺和鼓腮不够清楚。 |
| 4,1 | DeepSeek | 2 | 满足闭眼笑、勺降至盆边；脸颊没有清楚的一粒米。 |
| 1,2 | Claude | 2 | 一手托书一手持笔，低头书写大体符合；原参考外观被重绘。 |
| 2,2 | Claude | 2 | 笔抬起、眼睛睁开；视线偏向观众而非明确回读书行。 |
| 3,2 | Claude | 2 | 一手托书一手伸向页；翻页形态很弱，不像明确的一页正在翻。 |
| 4,2 | Claude | 2 | 仍持笔靠近书页，接近继续写；“已翻页后安静阅读”未清楚区分。 |
| 1,3 | GPT | 2 | 双手托浮动星系、低头；星系较像发光圆盘，与手距离很小。 |
| 2,3 | GPT | 2 | 星系略大；双手高度与第一帧接近，四分之一旋转不明确。 |
| 3,3 | GPT | 2 | 星系上抬至嘴附近，未达到眼睛高度；零星离散星光不明显。 |
| 4,3 | GPT | 2 | 降低星系、有光；旋转进程不可确认，闭眼观察与首帧衔接有限。 |
| 1,4 | Gemini | 2 | 双掌间微弱小光种，基本符合。 |
| 2,4 | Gemini | 2 | 蓝紫晶体成形；相对第一帧变大，但相对第三帧大小差不够明显。 |
| 3,4 | Gemini | 2 | 蓝紫晶体与光芒存在；相对第二帧转动幅度不明显。 |
| 4,4 | Gemini | 2 | 单掌托晶体，另一手放下；张嘴表情更像惊喜，微笑不够明确。 |
| 1,5 | Kimi | 2 | 一手触镜一手垂下，单眼贴目镜；望远镜体积占整格较大。 |
| 2,5 | Kimi | 2（接触区有遮挡） | 双手靠近镜筒/调焦处，未见明确第三手；旋钮接触细节难判。 |
| 3,5 | Kimi | 2 | 抬头看星；头部倾转和重心变化可能超过允许的4px，需要精确测量但本次未做。 |
| 4,5 | Kimi | 2 | 两手持月亮卷轴，未见明确的笔或书写手势；“记笔记”失败。 |
| 1,6 | Grok | 2 | 双手沿斧柄上肩蓄力；头、肩与前几列相比侧转较大，脚位未锁定验证。 |
| 2,6 | Grok | 2 | 双手紧握斧柄中挥，有短弧；脚有旋转/移位，相对首帧不能视为完全固定。 |
| 3,6 | Grok | 2（相邻握柄区） | 双手握低位斧柄、发梢外摆；脚站位仍有变化，斧刃较近右边界。 |
| 4,6 | Grok | 2 | 一手扶斧一手叉腰，表情有挑衅感；斧柄过短，末端未落地，且头/脚姿态与首帧不同。 |

补充一处复核：Kimi 第 4 行卷轴上的图案放大后是一枚带圆环的弯月（月相图），不是文字。

### 提示词（逐字）

第 1 次（生成）：

```text
Create leisure-actions.png, a genuine transparent RGBA PNG exactly 1536 x 1024. Use the attached residents-atlas-builtin.png as identity/style/scale reference, specifically its FIRST ROW standing idle. Asset type: workshop game sprite atlas, matching fine pixel-art finish, outlines, costume details and large chibi heads. Six columns x four rows, exactly 256 x 256 per cell, no gutters, no labels/grid/text. Columns always DeepSeek, Claude, GPT, Gemini, Kimi, Grok. Each column is ONE stationary four-frame leisure loop, read from top to bottom.

Absolute invariants EVERY cell: exactly TWO arms and TWO hands, never residual idle clasped hands or a third prop-holding hand. Same head size and body scale as reference idle row. Head/torso centre remains still with max 4 px bob. Figure centred local x=128. BOTH feet stationary in identical positions across all four rows per column, soles local y=247. All artwork including props/effects must stay inside local x=8..247, y=8..247 with eight fully transparent pixels around edges. No scenery, no floor or large shadows, no opaque/gradient/checkerboard background.

Column 1 DeepSeek blue-haired maid with whale tail: stationary eating plain white rice from a LARGE PLAIN STAINLESS STEEL BASIN. Left arm hugs basin in all frames; right hand holds spoon (only these two hands). Row1 spoon digging into heaped rice; row2 heaped spoon lifted to WIDE OPEN mouth, sparkling eyes; row3 spoon IN mouth, puffed cheeks and CLOSED blissful eyes; row4 chewing contented smile, spoon lowered, ONE rice grain on cheek.
Column 2 Claude orange long hair white flower cream-and-orange dress: brown book, preserve reference row4 reading/annotation appearance. Row1 one hand supports open book, other writes with pen, eyes lowered. Row2 pen lifted reading line back. Row3 one hand supports book and the OTHER turns page (pen tucked into book, no third hand). Row4 page turned, reads on with faint smile.
Column 3 GPT white/lilac hair, horns, dragon wings and tail, white dress and green details: BOTH hands cupped supporting a MINIATURE SPIRAL GALAXY floating just above palms. Row1 hands at chest, looks down; row2 hands slightly higher, galaxy quarter-turned slightly larger; row3 galaxy eye level, sparkling eyes, few tiny stars drifting; row4 hands lower, galaxy turned further with soft glow. Feet still.
Column 4 Gemini blue-to-violet hair gold star ornaments navy/gold white dress: magic crystal. Row1 hands apart at chest with seed of light between palms; row2 small BLUE AND VIOLET two-coloured crystal shard forming; row3 crystal palm-sized turning with sparkles; row4 finished two-coloured crystal floating over ONE raised palm, other hand relaxed, smile.
Column 5 Kimi navy long hair crescent moon ornament navy/gold robe: astronomy. SMALL BRASS TELESCOPE ON SHORT TRIPOD beside her within her cell. Row1 one eye at eyepiece, one hand on tube other hand at side; row2 eye at eyepiece other hand turns focus knob; row3 head lifted looks up, tiny star above; row4 writes on moon scroll, exactly one hand holds scroll and the other writes, telescope stands unsupported beside her. Keep torso planted, achieve eyepiece alignment with small telescope correctly placed. No book.
Column 6 Grok blonde twin tails black/gold dress black bows long X-HEADED AXE: compact axe swing. Row1 BOTH hands grip SAME shaft winding axe above one shoulder; row2 BOTH hands on shaft sweeping diagonally across body with SHORT motion arc; row3 BOTH hands on shaft low on opposite side follow-through, flying hair tips; row4 axe upright planted in ONE hand, OTHER fist on hip, cocky grin. No book, pen or third hand. Compact weapon/effect entirely inside cell. Do not shrink heads or move feet to accommodate action.
Render all 24 cells, exactly four rows. Transparent background.
```

第 2 次（在第 1 次基础上编辑，即选用版本）：

```text
Edit the supplied latest leisure-actions-1.png. Keep the exact 1536x1024 six-column four-row atlas, characters, identities, head sizes, costume rendering and action sequence. CRITICAL CHANGE: REMOVE THE ENTIRE COLOURED GRADIENT BACKGROUND TO ACTUAL ALPHA=0 TRANSPARENCY. This is a transparent sprite asset, not an illustration on a painted backdrop. No checkerboard pattern drawn in image either. Every non-sprite pixel must be transparent.

Correct cell containment without shrinking characters: all artwork within each local 256x256 cell x=8..247,y=8..247. Grok column6 row1 axe near top and right edges: shorten shaft and reduce axe head to fit, keeping X-shaped axe. Row2 Grok shorten wide motion arc so it does not approach cell edges. Row3 Grok axe on right: shorten shaft, axe head stays at least 8 px from right edge and bottom edge. Fix foot anchors: across all four rows in each column shoes must occupy identical pixel positions, both soles at local y=247, centred around local x=128. Heads and torsos stay still across rows (max4px).
Retain exactly TWO arms TWO hands in every cell, no extra hands.
Specific action corrections: DeepSeek row3 spoon tip inside mouth, visibly puffed cheeks with closed blissful eyes; row4 content smile and ONE grain of white rice ON CHEEK, spoon lowered. Remove floating decorative flowers around DeepSeek row3 and stars around DeepSeek row2 (keep effects only for galaxy/crystal/Kimi star). Gemini row1 replace already formed crystal with just tiny seed of light; row2 small shard, row3 full palm size. Kimi row4 one hand holds moon scroll and OTHER hand writes with a small pen, telescope stands beside her; do not add a third hand. Claude row4 reading faint smile with pen at rest rather than writing. GPT row3 raise cupped hands and galaxy to eye level, preserve head position and foot anchors. Do not change any other subjects, palette or layout. Genuine transparent PNG.
```

## `walk-cycle-front-back.png`：六处多余的手

`walk-cycle-front-back.png` 是从待机站姿画出来的，站姿里每人双手在身前交握。正面两行里有六格在已经画出两条摆动手臂的情况下，仍把交握的双手留在衣服上（Kimi 那一格是在持卷轴的手之外又多了一条垂下的手臂），看上去就是第三只手。

先试了让图像生成工具只改这几处（3 次编辑）：三次都把整张图重画了一遍——脸、发丝高光、衣褶都有变化，其中两次还丢掉了 DeepSeek 的鲸尾——因此**没有采用**。

实际采用的做法是只动这六小块，其余像素原样保留：

- 以修正前的母版（SHA-256 `80ee61a9ffa518755d713710fd8e4d43a5e0977048a33921fb0e108be773807c`）为底；
- 每处用一个手工给定的小蒙版（椭圆或多边形，坐标为格内像素）圈住多余的手及其描边；
- 用 OpenCV 的 Telea 修补（`cv2.inpaint`，半径 3）从周围的衣料颜色向内填充；
- alpha 通道不变；全图 1,572,864 个像素里共改动 2,197 个。

| 格（列, 行） | 蒙版（格内坐标） | 修掉的内容 |
| --- | --- | --- |
| DeepSeek，第 1 行 | 椭圆，中心 (139, 158.5)，半径 12 × 9.5 | 围裙前交握的双手 |
| DeepSeek，第 2 行 | 椭圆，中心 (134.5, 159)，半径 9.5 × 8 | 围裙前交握的双手 |
| GPT，第 1 行 | 椭圆，中心 (127, 161)，半径 12 × 10 | 裙前交握的双手 |
| GPT，第 2 行 | 椭圆，中心 (121.5, 158.5)，半径 10.5 × 8.5 | 裙前交握的双手 |
| Gemini，第 1 行 | 椭圆，中心 (127.5, 160.5)，半径 9 × 9.5 | 裙前交握的双手 |
| Kimi，第 1 行 | 多边形 (160,151) (172,150) (184,160) (184,176) (170,177) (163,166) (159,158) | 持卷轴的手之外多出的垂臂与手 |

修正后的母版 SHA-256：`37db551ee0a26be8834e6c04911a352f8f5e8d17316f2a762f9a7c7918fd25ec`。修补处放大看是一小片柔和的衣料色，没有重新画出布纹；按地图里的显示尺寸不可辨。Claude 与 Grok 的正面两行、以及全部背面两行原本就是两只手，没有改动。

## 人物图集里停用的旧帧

`residents-atlas-builtin.png` 文件本身没有改动。它的第 2～4 行（两帧旧的斜向行走、读写）不再绘制：行走改用三张 `walk-cycle-*`，读写被本图的休闲动作取代。这三行里已知的画错——第 3 行 DeepSeek 多一只手、第 4 行 Grok 三只手——随之不再出现在界面上。
