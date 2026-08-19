# 小剧场模式 · 产品功能方案

> 状态：v1 / v2 / v3 均已实现。面向 `dsh-whale-galgame` v0.4.0。
>
> 用户可见名称是「小剧场」；代码内部标识仍用 `sideStory` / `side-story`（仓库惯例是
> 英文标识符 + 中文文案）。

## 1. 定位

主线是「一对一陪伴」，支线是「多角色同台的短剧」。它承载这个题材真正的生命力——
技术宅对模型最新表现的吐槽与扭曲爱：模型娘们听说了外界对自己的评价，然后在工坊里
炸开锅。

主线回答「她今天陪我说了什么」，支线回答「她们最近被人怎么说，以及她们怎么反应」。

## 2. 技术前提（已验证）

Harness 平台自带 web 能力，**不需要自建爬虫**：

| 能力 | 来源 |
| --- | --- |
| `ctx.web.search({ query, maxResults }, signal)` | `@deepseek-ai/dsh-web` seam |
| `ctx.web.fetch({ url }, signal)` | 同上 |
| 原生 `web_search` provider | `@deepseek-ai/dsh-web-search-deepseek` |

`WebSearchResult` 形状：

```ts
{
  content?: string                       // provider 生成的摘要（DeepSeek 不返回）
  sources: Array<{
    url: string
    title?: string
    snippet?: string
    publishedAt?: string                 // ISO-8601，用于时效窗口过滤
  }>
  truncated: boolean
}
```

插件侧只需在 `cordis.patch.yml` 的 inject 里加 `web`。

**provider 可能未配置**：seam 会抛 `WebError`（`WEB_PROVIDER_UNAVAILABLE` /
`WEB_PROVIDER_AMBIGUOUS` 等）。这不是异常路径，是常态——决定了第 4 节的降级链。

## 3. 核心机制：「传闻」+ 起承转合，玩家是场上的人

小剧场不复述新闻，而是让**角色听到关于自己的传闻并当着主人的面炸开锅**。结构固定为
起承转合，玩家的选择就嵌在「转」和「合」之间：

```
起   旁白：今天工坊里飘着一个说法……
承   当事人 in-character 反应：害羞 / 嘴硬 / 较真 / 装没听见
转   另一个角色把话题拧到意想不到的方向 —— 笑点在这里
     ↓ 玩家开口（三条选项 = 主人此刻要说的话）
合   角色对主人刚说的那句话作出回应，旁白收场并揭示好感变化
```

选了三幕剧之外的起承转合，理由是「转」正是这个体量的笑点引擎，而三幕剧的冲突-解决
模型对一段两分钟的短剧太重。

**玩家必须在场，这是硬约束。** 选项是主人用第一人称说出口的话，不是角色的台词，也不
是对主人的第三人称描述：

- 对：「我陪你一起把它抓出来」
- 错：「主人最棒了（鲸鱼娘拍拍）」—— 这是角色在说话，玩家又被挤出场了

选中的那句会作为 `speaker: 'user'` 的一拍落到台上，随后播放该选项自带的 `reply`
（1–2 拍）。**没有 `reply` 的场景直接判废**——否则玩家按完按钮就冷场，正是"我没参与
到剧情里"的根源。

这套结构同时承担三个产品职能：

1. **把敌意转成角色处境。** 尖刻评价进来后，焦点从「这话对不对」变成「她被这么说了，
   你怎么办」。玩家选的是待人态度，不是站队立场。
2. **保住吐槽的爽感。** 「补刀」始终是可选项，代价是那个角色掉好感。用机制平衡，不靠
   删选项。
3. **天然限定不断言。** 「听说」的措辞让未核实的说法停在传闻层，不会变成剧情事实。

**好感变化在选择前不显示。** 按钮上标 `角色↑/↓` 等于提前剧透，破坏角色扮演；改为在
「合」的收场旁白里揭示谁更亲近了、谁无语了。这条揭示由服务端按实际结算结果拼出，不
经模型，保证和存档一致。

**小剧场会写进对话历史。** 整场转录追加到每一个上过场的角色的 `chatLines`，所以切到
配角那边也能看到她参演的这一场。角色台词带「名字：」前缀，因为历史抽屉每行只渲染一个
说话人。

## 4. 剧情种子：三源降级链

三种来源不是互斥方案，是一条链。任一环不可用就自动落到下一环，功能永不 dead。

| 优先级 | 种子源 | 触发条件 | 特点 |
| --- | --- | --- | --- |
| 1 | **web 检索** | `ctx.web` 有可用 search provider，且命中题材路由 | 时效性最强，多角色天然 |
| 2 | **本地活动** | 上面任一条不满足 | 复用 `activity-context.ts` 已有的 11 类分类，零外部依赖，且因为关于玩家自己而更好笑 |
| 3 | **玩家自填** | 玩家在入口手动输入一句话题 | 判断权在人，可绕过路由 |

玩家自填始终可用，不受 1/2 影响——它同时是「我就想看她们聊这个」的玩法出口。

## 5. 检索层

### 5.1 query 构造

按在场角色对应的模型名 + 能力向词汇构造，而不是泛搜公司名：

```
"<模型名>" (发布 OR 更新 OR 评测 OR 跑分 OR 手感 OR 吐槽 OR 梗)
```

- `maxResults`: 6–8
- 时效窗口：按 `publishedAt` 过滤，默认 14 天（可配）；无 `publishedAt` 的源保留但降权
- 语言：中英各检一次，中文源优先（题材受众在东亚社区）

### 5.2 题材路由

命中以下类目的检索结果**不进入生成**，直接降级到种子源 2：

```
诉讼 / 监管处罚 / 裁员 / 安全事故 / 数据泄露 / 人事变动 / 财务与股价 / 涉及具体个人的争议
```

这不是内容审查，是**题材适配**——裁员和诉讼做不成轻松小品，硬做只会调性翻车，而且
它是自动生成的，你没有逐条预审的机会。路由判定用关键词表 + 一次轻量分类调用。

### 5.3 溯源

场景底部渲染来源条（`title ?? hostname(url)`，可点开）。这既是可信度出口，也是
「想深挖的玩家自己去看」的引导。

## 6. 生成层：场景脚本契约

一次模型调用产出结构化脚本。**不能复用主线的 system 提示**——主线写死了
「每次只回复一句话、不超过 40 字、不要提到其他角色」，与支线要求正相反。

```ts
type CharId = 'deepseek' | 'claude' | 'chatgpt' | 'gemini' | 'kimi' | 'grok'
type Emotion = 'cheerful' | 'shy' | 'serious' | 'confused'
              | 'angry' | 'frightened' | 'exasperated' | 'starry'

interface SideStoryScene {
  seed: { kind: 'web' | 'activity' | 'manual'; summary: string }
  sources: Array<{ url: string; title: string }>      // web 种子才有
  cast: CharId[]                                       // 2–3 人，决定左/中/右槽位
  beats: Array<
    | { speaker: CharId; text: string; emotion: Emotion }
    | { speaker: 'narrator'; text: string }
  >
  choices: Array<{
    id: string
    text: string
    effects: Partial<Record<CharId, -1 | 0 | 1>>       // 核心：多角色结算
  }>
}
```

生成约束写进 system：

- 只使用 `cast` 内的角色，人设/语气取自各角色既有的 `persona` / `tone` 字段
- 检索内容一律以传闻措辞引用，禁止断言为事实
- 禁止让角色代表真实公司发言；角色是「深海女仆工坊的同事」，不是公司代言人
- `beats` 6–10 拍，单拍不超过 40 字（沿用主线的一屏一句节奏）
- `choices` 恰好 3 条，覆盖亲近 / 中立 / 补刀三种倾向

## 7. 舞台层：多角色 UI

现状：`.whg-sprite-wrap` 是单 flex 子元素承载一张立绘。

改动：

```css
.whg-stage { display:flex; align-items:flex-end; justify-content:space-around }
.whg-stage-slot { flex:0 1 auto; height:100%; transition:filter .3s, transform .3s }
.whg-stage-slot[data-active="false"] { filter:brightness(.55) saturate(.8); transform:scale(.94) }
.whg-stage-slot[data-active="true"]  { filter:none; transform:scale(1) }
```

- 2 人 → 左右；3 人 → 左中右，中间槽位略大
- 发言者高亮，其余压暗——复用现有 `.whg-mood-*` 的 filter 模式
- 窄屏（< 720px）退化为 2 人，第三人只出现在旁白里
- 立绘 key 直接取各角色既有的 `sprite` 字段，不需要新美术

## 8. 结算层：多角色选项

现状（`src/index.ts:4074-4077`）：

```ts
const delta = prepared.selectedChoice ? (…±1) : (…正则兜底)
c.affection = Math.max(0, before + delta)     // c 只有一个
```

改为遍历 `effects`：

```ts
for (const [id, eff] of Object.entries(choice.effects)) {
  const c = s.characters[id]
  if (!c) continue
  c.affection = Math.max(0, c.affection + clamp(eff, -1, 1))
  leveled ||= checkLevelUp(id, c)
}
```

主线的单角色路径保留不动，支线走新路径。

## 9. 平衡与节流

多角色结算会稀释 `30 + 15×(Lv-1)` 的升级曲线，必须限流：

| 项 | 值 | 理由 |
| --- | --- | --- |
| 单次支线每角色变动 | 最多 ±1 | 防止一次刷三人 |
| 冷却 | 默认 6 小时 | 支线是「事件」不是「刷本」 |
| 单次 token 成本 | 1 次 search + 1 次生成 | 可接受 |
| 升级 CG | 支线触发的升级**不**生成 CG | 避免连锁 3 张图的费用尖峰 |

支线历史保留最近 10 条，用于去重（同一传闻不重复起哄）。

## 10. 数据模型与存档（实现修正）

设计初稿写的是 `v2` → `v3` 版本升级。**实现时放弃了升级**，理由来自代码：
`hydrateGlobalState` 对版本号是严格相等判断，读到不认识的版本会「闩住」存档、拒绝
加载也拒绝覆盖。一旦升到 v3，用户降级回旧版插件就会被自己的存档拒之门外。

改为纯增量字段，沿用仓库已有的 `normalizeX(raw)` 补默认值范式：

```ts
// 全局存档新增（版本仍为 2）
sideStory: {
  lastRunAt: number
  scene: SideStoryScene | null
  history: Array<{ at: number; digest: string; cast: CharId[] }>   // 最近 10 条
}
```

选项的 `effects` 同样是增量的，而且**为空时不写这个字段**——主线选项在存档里保持
字节一致，旧版插件读到新存档只会忽略 `sideStory`，不会闩住。

## 11. 配置项

```yaml
sideStory:
  enabled: true
  seedSource: auto          # auto | web | activity | manual
  recencyDays: 14
  cooldownHours: 6
  castSize: 3               # 2 或 3
```

`seedSource: auto` 即第 4 节的降级链。想完全离线的用户设 `activity`，插件不会发起任何
web 请求。

## 12. 分期实施（已完成）

**v1 — 舞台与结算 · 已完成**
多角色舞台、起承转合三幕、两个插话点、`effects` 跨角色结算、增量存档字段、场景内自由发言、
独立的小剧场档案。

**v2 — 联网取材 · 已完成**
`ctx.web` 以**可选注入**接入（`inject` 里声明会变成硬依赖，缺少 web 服务的 profile 会整个
插件加载失败）。检索词只由角色对应的模型名与题材词构成；按 `publishedAt` 过滤时效；命中
题材黑名单（诉讼/裁员/事故等）即降级回本地活动种子；来源写入 `scene.sources` 并在面板底部
呈现。取材来源在设置 GUI 里可切到「只用本地任务类别」，此时不发起任何请求。

**v3 — 打磨 · 已完成**
开演前可手动指定话题（种子优先级最高，且不触发检索）；传闻对象在 cast 内轮换；情境与转折
各自排除最近两场用过的；合影 CG 由档案卡片手动触发，无 DashScope key 时按钮不出现。

## 12.1 自测中发现并修复的缺陷

| 缺陷 | 根因 |
| --- | --- |
| 台词被 40 字硬截断成残句 | 模型稳定超预算，`slice` 从词中间切断。改为在标点处收口，留 60 字存储余量 |
| 生成偶发失败 | 三幕 schema 比原来大 2–3 倍，`maxTokens: 1200` 让 JSON 中途截断。提到 4000 并加一次重试 |
| 连续两场用同一个转折 | 只排除了最近的**情境**，忘了排除**转折**——而转折才是笑点引擎 |
| 来源标题重复两遍 | 上游 `og:title` 与页面标题重复，需在摘要与溯源条中折叠 |
| 旁白里出现 `grok` 等原始 id | cast brief 用 id 描述角色，模型照抄。按大小写敏感替换回显示名（`Kimi` 这类真实模型名保留） |
| 测试偶发失败 | 临时目录被删时后台保存仍在飞，落到下一个测试。teardown 前加排空间隙 |

## 13. 隐私与文档变更

接入 web 检索后，README 的「数据与隐私」一节必须改。现在的表述是插件只把固定类别提示
发给模型，绝不外发原文——v2 之后要补：

- 支线剧情启用时，插件会向 Harness 的 web seam 发起检索请求，query 由角色名与题材词
  构成，**不包含**玩家的对话内容、工作区内容或 Harness 原文
- 检索结果只在本次生成中使用，摘要与来源 URL 会写入支线历史（存档内），原文不落盘
- `seedSource: activity` 可完全关闭外部请求

四语 README 同步。

## 14. 风险登记

| 风险 | 对策 |
| --- | --- |
| 检索到未经核实的说法被当成剧情事实 | 传闻措辞 + 溯源条 + system 明令禁止断言 |
| 严肃题材被生成成搞笑小品 | 题材路由（5.2），命中即降级到本地种子 |
| 角色被读成真实公司代言 | 世界观锚定在「深海女仆工坊同事」，system 明令 |
| web provider 未配置 | 降级链（第 4 节），功能不 dead |
| 多角色刷好感破坏曲线 | ±1 上限 + 冷却 + 支线升级不出 CG |
| 生成结构不合契约 | 严格 schema 校验，失败重试一次后降级为纯旁白短场景 |
