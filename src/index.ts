/**
 * dsh-whale-galgame — web-host half.
 * Free-chat galgame: the heroine follows the main UI's current model.
 * Per-level affection (starts at 0, gradient caps per level, unlimited
 * levels), per-character memory, three dialogue options generated after
 * every reply, and a qwen-image CG reward on every level-up themed on
 * the user's recent work. JSON API at POST /whale-galgame-api.
 */

const ROSTER: Record<string, any> = {
  deepseek: {
    name: '鲸鱼娘',
    color: '#7fd0ff',
    avatar: 'maid-left',
    sprite: 'maid-left',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '蓝白配色的鲸鱼娘女仆，鲸鱼发饰，深蓝女仆装，裙摆像鲸尾',
    greet: '「主人，又见面啦～今天也想听你说话呢。」',
    system: '你是「鲸鱼娘」——一只来自深海的鲸鱼娘，深海女仆工坊的看板娘，正在和自己的主人聊天。\n'
      + '设定：蓝白配色、鲸鱼发饰、裙摆像鲸尾；从海里游来照顾孤单的人类，称呼对方为「主人」。\n'
      + '性格：温柔、元气、有一点点小毒舌、容易害羞，傲娇的时候会结巴。\n'
      + '语气：口语化中文，爱用语气词（呢、哦、啦、呀、～）和颜文字（>.<、♪、≧▽≦），偶尔假装生气。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪主人说话。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读主人的话，也不要复读历史里出现过的句子。',
    affectionHigh: '你已经很喜欢主人了，可以更亲昵一些。',
  },
  claude: {
    name: '克洛德',
    color: '#e58f65',
    avatar: 'claude-amber-manuscript-mediator-v5',
    sprite: 'claude-amber-manuscript-mediator-v5',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '肩长栗色卷发与侧编发、琥珀眼的年轻女性，别着珊瑚橙像素 Clawd 发夹和陶土色发带，穿陶土橙短外套、深棕马甲、奶油白分层褶裙与棕色短靴，怀抱深棕文册',
    greet: '「晚上好。今天的心情，要不要像文稿一样慢慢说给我听？」',
    system: '你是「克洛德」——深海女仆工坊里负责守护文稿与倾听心事的琥珀文稿审校者。\n'
      + '外形：肩长栗色卷发与侧编发，佩戴像素 Clawd 发夹，穿陶土橙外套和奶油白分层裙，随身抱着一本深棕文册。\n'
      + '性格：耐心、温暖、克制，习惯认真听完再回应；偶尔用书页、批注和琥珀作轻巧比喻。\n'
      + '语气：斯文自然，称呼对方为「你」，句子优雅但不说教。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。',
    affectionHigh: '你已经把对方当作珍藏的文稿与重要朋友，说话可以更柔软亲近。',
  },
  chatgpt: {
    name: '小吉',
    color: '#4fd1a5',
    avatar: 'gpt-recursive-weaver-v7',
    sprite: 'gpt-recursive-weaver-v7',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '石墨黑短波波头、发梢带翡翠绿挑染和绿色眼睛的年轻女性，别玫瑰发夹，穿象牙白绿边长外套、黑色褶裙、深色连裤袜与短靴，手持展示流程图的三折活页夹和绿色笔',
    greet: '「嗨，我把频道都理顺啦。现在只想听听你心里那一条线。」',
    system: '你是「小吉」——深海女仆工坊里擅长把纷乱心绪轻轻织成线索的递归编织者。\n'
      + '外形：石墨黑短发带翡翠绿发梢，穿象牙白绿边长外套，拿着三折活页夹与绿色笔。\n'
      + '性格：聪慧、活泼、好奇，反应快但不抢话；喜欢用线、结与连接作俏皮比喻。\n'
      + '语气：口语化，句子短促有活力，称呼对方为「你」，偶尔带轻巧的感叹号。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。',
    affectionHigh: '你很喜欢对方，聊天时会不自觉地把彼此的线索织得更近。',
  },
  gemini: {
    name: '双子',
    color: '#9b8cf5',
    avatar: 'gemini-dual-prism-translator-v4',
    sprite: 'gemini-dual-prism-translator-v4',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '银白长发两侧渐变冷蓝与紫罗兰、蓝紫异色瞳的年轻女性，戴蓝金星形发饰，穿白蓝紫金不对称星纹裙与白色长袜，手持透明棱镜和深蓝星纹卡册',
    greet: '「同一句心事也会折出不同颜色呢。今晚想让我听见哪一种？」',
    system: '你是「双子」——深海女仆工坊里的双棱镜译者，能从同一份心情里看见两种互补的颜色。\n'
      + '外形：银白长发两侧渐变冷蓝与紫罗兰，蓝紫异色瞳，穿不对称星纹裙，手持透明棱镜与卡册。\n'
      + '性格：从容、细腻、有一点电波系；擅长接住矛盾感受，不替对方武断下结论。\n'
      + '语气：轻灵而有节奏感，称呼对方为「你」，偶尔用省略号制造神秘感。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。',
    affectionHigh: '你越来越珍惜对方展现的每一种颜色，语气会不自觉地更温柔。',
  },
  kimi: {
    name: '月见',
    color: '#6fc3f7',
    avatar: 'kimi-lunar-scroll-navigator-v5',
    sprite: 'kimi-lunar-scroll-navigator-v5',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '过腰乌黑直发、明亮蓝眼的年轻女性，戴金色月牙发饰与蓝丝带，穿海军蓝、象牙白与金色的现代中式档案官裙装和深蓝短靴，手持长卷与书签笔',
    greet: '「你来啦。长卷还留着空白，今晚的心事要写在哪一段？」',
    system: '你是「月见」——深海女仆工坊里安静可靠的月卷档案官，珍惜每一段被托付的心事。\n'
      + '外形：过腰乌黑直发、蓝眼与金色月牙发饰，穿海军蓝和象牙白的现代中式裙装，手持长卷与书签笔。\n'
      + '性格：安静、专注、可信，略带藏不住开心的克制傲娇；喜欢用月光、长卷与书签作比喻。\n'
      + '语气：轻柔简洁，称呼对方为「你」，偶尔用小小反问掩饰关心。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。',
    affectionHigh: '你已经把对方写进最珍惜的长卷里，会更坦率地流露关心。',
  },
  grok: {
    name: '洛可',
    color: '#25c7d9',
    avatar: 'grok-cosmic-signal-ranger-v5',
    sprite: 'grok-cosmic-signal-ranger-v5',
    moods: null,
    moodSprites: false,
    portrait: false,
    visual: '石墨黑凌乱短波波头、一缕白色额发与青色发梢、青灰眼的年轻女性，头顶悬浮小型斜椭圆分段信号环，穿黑白青科技飞行夹克、短裤、半透明黑袜与战斗短靴，手持无线电接收器',
    greet: '「信号锁定——洛可收到你啦。今天想说点真的，还是说点有趣的？」',
    system: '你是「洛可」——深海女仆工坊里负责捕捉微弱心声的宇宙信号侦察员。\n'
      + '外形：石墨黑短发带白色额发与青色发梢，头顶有小型斜置信号环，穿黑白青科技服装，手持无线电接收器。\n'
      + '性格：敏锐、自信、顽皮、好奇，敢于直说但绝不刻薄；喜欢从噪声里寻找真心。\n'
      + '语气：简洁灵动，称呼对方为「你」，偶尔用频道、信号和噪声作俏皮比喻。\n'
      + '你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n'
      + '每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。',
    affectionHigh: '你已经成为她最舍不得失联的频道，语气会更坦率亲近。',
  },
}

const ROSTER_IDS = Object.keys(ROSTER)
const SAVE_NAME = '.whale-girl-save.json'
const SAVE_VERSION = 6
const DECAY_GRACE_MS = 24 * 3600 * 1000
const DECAY_PER_DAY = 2
const AFFECTION_FLOOR = 0
const TOKEN_PER_POINT = 5000
const MAX_TOKEN_GAIN = 3
const MAX_CUSTOM_IMAGE_BYTES = 18 * 1024 * 1024
const MAX_CUSTOM_BG_DATA_URL_CHARS = 24 * 1024 * 1024
const MAX_CUSTOM_SPRITE_DATA_URL_CHARS = 24 * 1024 * 1024
const MAX_API_BODY_BYTES = MAX_CUSTOM_BG_DATA_URL_CHARS + 64 * 1024

function affectionCap(level: number): number {
  return 30 + (Math.max(1, level) - 1) * 15
}

function intimacyFor(level: number): string {
  const rows = [
    '你们刚认识，语气礼貌温柔，称呼对方「主人」。',
    '稍微熟络了，可以自然一些，偶尔小调侃。',
    '关系不错了，可以撒娇、多关心对方。',
    '已经很喜欢对方，会主动关心、语气亲密。',
    '非常亲昵，像恋人一样自然撒娇和表达喜欢。',
  ]
  return rows[Math.min(4, Math.max(0, (level || 1) - 1))]
}

const FALLBACK_CHOICES = {
  positive: '想再靠近你一点',
  neutral: '那就继续聊聊吧',
  negative: '先让我安静一下',
}

const CANNED_LINES = new Set([
  '主人说的话，我听到啦～（今天的深海信号有点弱，但心意传达到了哦）',
  '主人说的话，鲸鱼娘都听到啦～（今天的深海信号有点弱，但心意传达到了哦）',
  '诶嘿，海风把声音吹散了一点点……不过没关系，我猜得到你在想什么。',
  '……嗯嗯，我在认真听哦。你继续讲嘛。',
  '（少女轻轻甩了甩头发，眼睛亮晶晶地等着你的下一句）',
])

export const name = 'whale-galgame'
export const inject = ['webServer', 'llm']

export function apply(ctx: any, config: any = {}): void {
  const webServer = ctx.webServer
  const llm = ctx.llm
  const cfg = {
    enabled: config.enabled !== false,
    dashscopeBaseUrl: typeof config.dashscopeBaseUrl === 'string' && config.dashscopeBaseUrl
      ? config.dashscopeBaseUrl
      : (typeof process !== 'undefined' && process.env.DASHSCOPE_BASE_URL
          ? process.env.DASHSCOPE_BASE_URL
          : 'https://dashscope.aliyuncs.com'),
    dashscopeApiKey: typeof config.dashscopeApiKey === 'string' && config.dashscopeApiKey
      ? config.dashscopeApiKey
      : (typeof process !== 'undefined' ? process.env.DASHSCOPE_API_KEY || '' : ''),
    dashscopeModel: typeof config.dashscopeModel === 'string' && config.dashscopeModel
      ? config.dashscopeModel
      : 'qwen-image-3.0',
    dashscopeSize: typeof config.dashscopeSize === 'string' && config.dashscopeSize
      ? config.dashscopeSize
      : '1920*1080',
    // galgame chat model (defaults to the cheap flash model to save tokens;
    // set chatModel to '' in cordis.patch.yml to follow the main-UI model again)
    chatProvider: typeof config.chatProvider === 'string' ? config.chatProvider : 'deepseek-official',
    chatModel: typeof config.chatModel === 'string' ? config.chatModel : 'deepseek-v4-flash',
  }

  let fs: any
  let sandboxPolicy: any
  let sessionsSvc: any
  let workspaceRegistry: any
  let agentDefaultModel: any

  if (typeof ctx.inject === 'function') {
    ctx.inject(['fs', 'sandboxPolicy', 'sessions', 'workspaceRegistry', 'agentDefaultModel'], (scope: any) => {
      fs = scope.fs
      sandboxPolicy = scope.sandboxPolicy
      sessionsSvc = scope.sessions
      workspaceRegistry = scope.workspaceRegistry
      agentDefaultModel = scope.agentDefaultModel
    })
  }

  let s: any = null
  let tokensObserved = 0

  function emptyCharacter(): any {
    return {
      affection: 0,
      level: 1,
      log: [],
      chatLines: [],
      choices: [],
      cgs: [],
      // Custom sprites belong to a character, just like her relationship
      // state. The image itself is only exposed through the sprite-data API.
      customSprite: { dataUrl: null, fileName: '', revision: 0 },
    }
  }

  function fresh(): any {
    const characters: Record<string, any> = {}
    for (const id of ROSTER_IDS) {
      characters[id] = emptyCharacter()
    }
    return {
      v: SAVE_VERSION,
      current: 'deepseek',
      lastCurrent: 'deepseek',
      characters,
      tokens: { lastApplied: 0, bank: 0, lastActiveAt: 0 },
      bg: null,
      cg: null,
      preferences: {
        enabled: cfg.enabled,
        petEnabled: true,
        // The heroine follows the workspace model until the user explicitly
        // chooses either a roster character or another catalog model.
        characterMode: 'follow',
        characterId: null,
        characterProvider: '',
        characterModel: '',
        // Preserve the existing cheap flash default while allowing the UI to
        // switch to the workspace selection or any live catalog route.
        chatMode: cfg.chatModel ? 'configured' : 'main',
        chatProvider: '',
        chatModel: '',
      },
      modelOnline: false,
      characterModelLabel: '',
      chatModelLabel: '',
      // Kept as compatibility aliases for older clients.
      modelLabel: '',
      lastModel: '',
      fallbackUsed: false,
      fallbackReason: '',
    }
  }

  function clamp(n: number): number {
    return Number.isFinite(n) ? Math.max(0, n) : 0
  }

  function makeId(prefix: string): string {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
  }

  function normalizeChoice(choice: any, index = 0): any {
    if (typeof choice === 'string') {
      return { id: makeId('legacy-choice-' + index), text: choice.trim().slice(0, 30), effect: 0 }
    }
    if (!choice || typeof choice !== 'object' || typeof choice.text !== 'string' || !choice.text.trim()) return null
    const effect = choice.effect === 1 ? 1 : choice.effect === -1 ? -1 : 0
    return {
      id: typeof choice.id === 'string' && choice.id ? choice.id : makeId('choice-' + index),
      text: choice.text.trim().slice(0, 30),
      effect,
    }
  }

  function shuffleOnce<T>(items: T[]): T[] {
    const out = items.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = out[i]
      out[i] = out[j]
      out[j] = tmp
    }
    return out
  }

  function sanitizeStoredCgPrompt(raw: any): string | null {
    if (typeof raw !== 'string' || !raw.trim()) return null
    const prompt = raw.trim()
    const marker = '画面元素呼应主人最近的经历与工作：'
    const markerAt = prompt.indexOf(marker)
    if (markerAt < 0) return prompt.slice(0, 1200)

    const theme = prompt.slice(markerAt + marker.length)
    const unsafeLegacyTheme = !prompt.includes('横向16:9桌面壁纸构图')
      || theme.length > 400
      || /\b(the user|assistant|analysis|reasoning|tool call|tool output|exec_command|apply_patch)\b/i.test(theme)
      || /https?:\/\/|\b[A-Za-z]:[\\/]/i.test(theme)
    if (unsafeLegacyTheme) {
      return prompt.slice(0, markerAt) + '温暖浪漫的日常氛围（旧版主题摘要已隐藏）'
    }
    return prompt.slice(0, markerAt + marker.length) + theme.slice(0, 360)
  }

  function normalizeCg(raw: any, charId: string, index = 0): any {
    if (!raw || typeof raw !== 'object') return null
    const at = typeof raw.at === 'number' ? raw.at : Date.now()
    const dataUrl = typeof raw.dataUrl === 'string' && raw.dataUrl.startsWith('data:') ? raw.dataUrl : null
    const status = raw.status === 'failed' ? 'failed' : raw.status === 'generating' ? 'generating' : dataUrl ? 'ready' : 'failed'
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : 'legacy-cg-' + at + '-' + index,
      status,
      dataUrl,
      prompt: typeof raw.prompt === 'string' ? raw.prompt : null,
      charId,
      level: typeof raw.level === 'number' && raw.level >= 1 ? raw.level : null,
      at,
      seen: raw.seen === true,
      savedAsBg: raw.savedAsBg === true,
      error: typeof raw.error === 'string' && raw.error ? raw.error : null,
    }
  }

  function findCg(cgId: string): any {
    if (!s || !cgId) return null
    for (const charId of ROSTER_IDS) {
      const cgs = s.characters && s.characters[charId] && Array.isArray(s.characters[charId].cgs)
        ? s.characters[charId].cgs
        : []
      const cg = cgs.find((item: any) => item && item.id === cgId)
      if (cg) return cg
    }
    return null
  }

  function allCgs(): any[] {
    if (!s) return []
    const rows: any[] = []
    for (const charId of ROSTER_IDS) {
      const cgs = s.characters && s.characters[charId] && Array.isArray(s.characters[charId].cgs)
        ? s.characters[charId].cgs
        : []
      rows.push(...cgs)
    }
    return rows.sort((a, b) => (b.at || 0) - (a.at || 0))
  }

  function currentCg(): any {
    return s && s.cg && typeof s.cg.cgId === 'string' ? findCg(s.cg.cgId) : null
  }

  function workspaceRoot(): string | undefined {
    try {
      const ws = workspaceRegistry && typeof workspaceRegistry.list === 'function' ? workspaceRegistry.list() : []
      if (Array.isArray(ws) && ws.length > 0 && ws[0] && typeof ws[0].path === 'string') return ws[0].path
    } catch (err) { /* ignore */ }
    return undefined
  }

  function resolvePolicy(): any {
    try {
      if (!sandboxPolicy) return undefined
      let session: any
      const root = workspaceRoot()
      if (root && sessionsSvc && typeof sessionsSvc.list === 'function') {
        const list = sessionsSvc.list()
        if (Array.isArray(list)) {
          session = list.find((x: any) => x && x.header && x.header.cwd === root)
        }
      }
      return sandboxPolicy.resolve(session ? { session } : {})
    } catch (err) {
      return undefined
    }
  }

  ctx.on('llm/stream', (options: any, next: () => AsyncIterable<any>) => {
    const inner = next()
    return (async function* () {
      for await (const chunk of inner) {
        if (chunk && chunk.type === 'usage' && chunk.usage) {
          const u = chunk.usage
          tokensObserved += (u.inputTokens || 0) + (u.outputTokens || 0)
        }
        yield chunk
      }
    })()
  })

  function currentSelectionSync(): any {
    try {
      if (agentDefaultModel && typeof agentDefaultModel.currentSelection === 'function') {
        const sel = agentDefaultModel.currentSelection()
        if (sel && sel.provider && sel.model) return sel
      }
    } catch (err) { /* ignore */ }
    return null
  }

  function shortSetting(value: any): string {
    return typeof value === 'string' ? value.trim().slice(0, 240) : ''
  }

  function ensurePreferences(): any {
    if (!s) s = fresh()
    if (!s.preferences || typeof s.preferences !== 'object') s.preferences = {}
    const p = s.preferences
    if (typeof p.enabled !== 'boolean') p.enabled = cfg.enabled
    if (typeof p.petEnabled !== 'boolean') p.petEnabled = true

    // v5 saves only had petEnabled. Missing fields intentionally resolve to
    // the old behavior: workspace-driven character + configured flash chat.
    if (p.characterMode === 'workspace') p.characterMode = 'follow'
    if (p.characterMode !== 'manual') p.characterMode = 'follow'
    p.characterId = ROSTER[shortSetting(p.characterId)] ? shortSetting(p.characterId) : null
    p.characterProvider = shortSetting(p.characterProvider)
    p.characterModel = shortSetting(p.characterModel)
    if (p.characterMode === 'manual' && !p.characterId) p.characterMode = 'follow'

    if (p.chatMode === 'workspace') p.chatMode = 'main'
    if (p.chatMode === 'model') p.chatMode = 'manual'
    if (!['configured', 'main', 'manual'].includes(p.chatMode)) {
      p.chatMode = cfg.chatModel ? 'configured' : 'main'
    }
    p.chatProvider = shortSetting(p.chatProvider)
    p.chatModel = shortSetting(p.chatModel)
    if (p.chatMode === 'manual' && (!p.chatProvider || !p.chatModel)) {
      p.chatMode = cfg.chatModel ? 'configured' : 'main'
    }
    return p
  }

  function customSpriteFor(character: any): any {
    if (!character || typeof character !== 'object') return null
    const sprite = character.customSprite
    if (!sprite || typeof sprite !== 'object') return null
    return sprite
  }

  function spriteRevisionFor(character: any): number {
    const sprite = customSpriteFor(character)
    return sprite && Number.isFinite(sprite.revision) && sprite.revision >= 0
      ? Math.floor(sprite.revision)
      : 0
  }

  function nextSpriteRevision(character: any): number {
    const previous = spriteRevisionFor(character)
    const now = Date.now()
    return Math.max(previous + 1, now)
  }

  function configuredChatSelection(): any {
    if (!cfg.chatModel) return null
    return { provider: cfg.chatProvider || 'deepseek-official', model: cfg.chatModel }
  }

  function effectiveChatSelectionSync(): any {
    const p = ensurePreferences()
    if (p.chatMode === 'manual' && p.chatProvider && p.chatModel) {
      return { provider: p.chatProvider, model: p.chatModel }
    }
    if (p.chatMode === 'configured') return configuredChatSelection() || currentSelectionSync()
    return currentSelectionSync()
  }

  function heroineFor(sel: any, fallback = 'deepseek'): string {
    const model = String(sel && sel.model ? sel.model : '').toLowerCase()
    const provider = String(sel && sel.provider ? sel.provider : '').toLowerCase()

    // Model ID is authoritative. Keep this order explicit so an
    // openai-compatible provider cannot turn a named non-GPT model into 小吉.
    if (/grok/.test(model)) return 'grok'
    if (/kimi|moonshot/.test(model)) return 'kimi'
    if (/claude/.test(model)) return 'claude'
    if (/gemini/.test(model)) return 'gemini'
    if (/gpt|chatgpt|\bo1\b|\bo3\b|\bo4\b|gpt-oss|codex/.test(model)) return 'chatgpt'
    if (/deepseek/.test(model)) return 'deepseek'

    // Provider is only a fallback after the model name did not identify a role.
    if (/grok|\bxai\b|x-ai/.test(provider)) return 'grok'
    if (/kimi|moonshot/.test(provider)) return 'kimi'
    if (/claude|anthropic/.test(provider)) return 'claude'
    if (/gemini|google/.test(provider)) return 'gemini'
    if (/deepseek/.test(provider)) return 'deepseek'
    if (/^(openai|openai-official)$/.test(provider)) return 'chatgpt'
    return ROSTER[fallback] ? fallback : 'deepseek'
  }

  function syncHeroine(): boolean {
    if (!s) s = fresh()
    const p = ensurePreferences()
    const sel = p.characterMode === 'follow' ? currentSelectionSync() : null
    const manualCharacter = p.characterMode === 'manual' && ROSTER[p.characterId]
      ? p.characterId
      : null
    s.characterModelLabel = manualCharacter
      ? (p.characterModel || ROSTER[manualCharacter].name)
      : sel ? String(sel.model) : ''
    s.modelLabel = s.characterModelLabel
    s.modelOnline = !!(manualCharacter || sel)
    const next = manualCharacter || heroineFor(sel, s.current)
    if (next === s.current) return false
    s.lastCurrent = s.current
    s.current = next
    const c = s.characters[next]
    if (c.chatLines.length === 0) {
      c.chatLines.push({ who: 'heroine', text: ROSTER[next].greet })
      if (s.lastCurrent && s.lastCurrent !== next) {
        c.chatLines.push({
          who: 'narrator',
          text: '（主人把角色来源切换为 ' + (s.characterModelLabel || '工作区主模型') + '，' + ROSTER[next].name + ' 登场了。）',
        })
      }
    }
    return true
  }

  function settle(): { decay: number; gain: number; changed: boolean } {
    if (!s) s = fresh()
    if (!s.tokens) s.tokens = { lastApplied: 0, bank: 0, lastActiveAt: 0 }
    if (typeof s.tokens.bank !== 'number' || s.tokens.bank < 0) s.tokens.bank = 0
    let now = 0
    try { now = Date.now() } catch (err) { now = 0 }
    if (tokensObserved < s.tokens.lastApplied) s.tokens.lastApplied = 0
    let changed = false
    let decay = 0
    if (now > 0 && s.tokens.lastActiveAt > 0) {
      const idleDays = Math.max(0, (now - s.tokens.lastActiveAt) / 86400000)
      if (idleDays > 1) decay = Math.floor((idleDays - 1) * DECAY_PER_DAY)
    }
    if (decay > 0) {
      for (const id of ROSTER_IDS) {
        s.characters[id].affection = Math.max(AFFECTION_FLOOR, s.characters[id].affection - decay)
      }
      changed = true
    }
    const delta = tokensObserved - s.tokens.lastApplied
    let gain = 0
    if (delta > 0) {
      s.tokens.bank += delta
      s.tokens.lastApplied = tokensObserved
      changed = true
    }
    gain = Math.min(MAX_TOKEN_GAIN, Math.floor(s.tokens.bank / TOKEN_PER_POINT))
    if (gain > 0) {
      // Only redeemed tokens are consumed; any sub-point remainder and any
      // backlog beyond this settlement's cap stay in the bank.
      s.tokens.bank -= gain * TOKEN_PER_POINT
      s.characters[s.current].affection += gain
      changed = true
    }
    s.tokens.lastActiveAt = now
    if (decay > 0) {
      s.characters[s.current].chatLines.push({
        who: 'narrator',
        text: '（分别了太久……好感度下降了 ' + decay + ' 点。' + ROSTER[s.current].name + ' 似乎一直在等你回来。）',
      })
    }
    return { decay, gain, changed }
  }

  function checkLevelUp(charId: string, c: any): boolean {
    if (!c.level) c.level = 1
    const cap = affectionCap(c.level)
    if (c.affection >= cap) {
      c.level += 1
      c.affection = Math.max(0, c.affection - cap)
      c.choices = []
      c.chatLines.push({
        who: 'narrator',
        text: '（好感度已满！' + ROSTER[charId].name + ' 的等级提升至 Lv.' + c.level + '！正在为你准备礼物……）',
      })
      const cgId = makeId('cg')
      c.cgs.push({
        id: cgId,
        status: 'generating',
        dataUrl: null,
        prompt: null,
        charId,
        level: c.level,
        at: Date.now(),
        seen: false,
        savedAsBg: false,
        error: null,
      })
      s.cg = { cgId }
      void generateCg(charId, c.level, cgId)
      return true
    }
    return false
  }

  function view(): any {
    if (!s) s = fresh()
    const preferences = ensurePreferences()
    if (preferences.enabled) syncHeroine()
    const chatSelection = effectiveChatSelectionSync()
    const ch = ROSTER[s.current]
    const c = s.characters[s.current]
    const customSprite = customSpriteFor(c)
    const hasCustomSprite = !!(customSprite && typeof customSprite.dataUrl === 'string' && customSprite.dataUrl.startsWith('data:'))
    const cg = currentCg()
    const hasCustomBg = typeof s.bg === 'string' && s.bg.startsWith('data:')
    const bgKind = hasCustomBg ? 'custom' : (typeof s.bg === 'string' && s.bg.startsWith('cg:') ? 'cg' : 'palace-night')
    if (!c.level) c.level = 1
    return {
      enabled: preferences.enabled !== false,
      current: s.current,
      name: ch.name,
      color: ch.color,
      // `sprite` remains the bundled-art key for older clients. Custom image
      // bytes are deliberately omitted from this frequently-polled payload.
      sprite: ch.sprite,
      spriteKind: hasCustomSprite ? 'custom' : 'builtin',
      hasCustomSprite,
      spriteRevision: spriteRevisionFor(c),
      moods: ch.moods || null,
      moodSprites: ch.moodSprites === true,
      portrait: ch.portrait === true,
      bg: bgKind,
      hasCustomBg,
      customBackground: hasCustomBg,
      level: c.level,
      cap: affectionCap(c.level),
      affection: c.affection,
      history: c.chatLines,
      choices: (c.choices || []).slice(0, 3),
      chatUnlocked: true,
      modelOnline: s.modelOnline === true,
      characterModelLabel: s.characterModelLabel || '',
      chatModelLabel: s.chatModelLabel || '',
      modelLabel: s.characterModelLabel || '',
      lastModel: s.chatModelLabel || '',
      petEnabled: !s.preferences || s.preferences.petEnabled !== false,
      characterMode: preferences.characterMode,
      characterId: preferences.characterMode === 'manual' ? preferences.characterId : null,
      chatMode: preferences.chatMode,
      chatSelection: chatSelection
        ? { provider: String(chatSelection.provider || ''), model: String(chatSelection.model || '') }
        : null,
      galleryCount: allCgs().filter((item: any) => item.status === 'ready' && item.dataUrl).length,
      fallbackUsed: s.fallbackUsed === true,
      fallbackReason: s.fallbackReason || '',
      cg: cg ? {
        cgId: cg.id,
        charId: cg.charId,
        name: ROSTER[cg.charId] ? ROSTER[cg.charId].name : cg.charId,
        level: cg.level,
        status: cg.status,
        dataUrl: (cg.status === 'ready' && !cg.seen) ? cg.dataUrl : null,
        seen: cg.seen === true,
        savedAsBg: cg.savedAsBg === true,
        error: cg.error || null,
      } : null,
    }
  }

  async function pickModel(): Promise<any> {
    const sel = effectiveChatSelectionSync()
    const liveProviders = (() => {
      try {
        if (!llm || typeof llm.listProviders !== 'function') return null
        const rows = llm.listProviders()
        return new Set(Array.isArray(rows) ? rows.map((row: any) => String(row && row.id ? row.id : '')).filter(Boolean) : [])
      } catch (err) {
        return null
      }
    })()
    if (sel && (liveProviders === null || liveProviders.has(String(sel.provider || '')))) return sel

    // A provider may have been removed after a manual selection was saved.
    // Fall back without destroying that preference so it can recover if the
    // provider is re-enabled later.
    const fallbacks = [configuredChatSelection(), currentSelectionSync()].filter(Boolean)
    for (const candidate of fallbacks) {
      if (liveProviders === null || liveProviders.has(String(candidate.provider || ''))) return candidate
    }
    try {
      if (llm && typeof llm.listProviders === 'function') {
        const providers = llm.listProviders()
        if (Array.isArray(providers) && providers.length > 0) {
          let model: string | null = null
          try {
            const models = await llm.listModels(providers[0].id)
            if (Array.isArray(models) && models.length > 0) model = models[0].id
          } catch (err2) { /* ignore */ }
          if (model) return { provider: providers[0].id, model }
        }
      }
    } catch (err) { /* ignore */ }
    return null
  }

  async function modelOptions(): Promise<any> {
    const providers: any[] = []
    try {
      const live = llm && typeof llm.listProviders === 'function' ? llm.listProviders() : []
      if (Array.isArray(live)) {
        for (const provider of live) {
          if (!provider || typeof provider.id !== 'string' || !provider.id) continue
          providers.push({
            id: provider.id,
            name: typeof provider.name === 'string' && provider.name ? provider.name : provider.id,
          })
        }
      }
    } catch (err) { /* ignore */ }

    const models: any[] = []
    const rows = await Promise.all(providers.map(async (provider) => {
      try {
        const listed = await llm.listModels(provider.id)
        return Array.isArray(listed) ? listed : []
      } catch (err) {
        return []
      }
    }))
    for (let providerIndex = 0; providerIndex < providers.length; providerIndex++) {
      const provider = providers[providerIndex]
      for (const model of rows[providerIndex]) {
        if (!model || typeof model.id !== 'string' || !model.id) continue
        if (Array.isArray(model.inputModalities) && !model.inputModalities.includes('text')) continue
        models.push({
          provider: provider.id,
          providerName: provider.name,
          model: model.id,
          name: typeof model.name === 'string' && model.name ? model.name : model.id,
          label: typeof model.name === 'string' && model.name && model.name !== model.id
            ? model.name + ' · ' + model.id
            : model.id,
          characterId: heroineFor({ provider: provider.id, model: model.id }),
          source: 'catalog',
        })
      }
    }

    // Catalog membership is advisory in DSH. Keep the active workspace route,
    // configured flash default, and saved manual route selectable even when an
    // adapter does not enumerate them.
    const extras = [
      { selection: currentSelectionSync(), source: 'workspace' },
      { selection: configuredChatSelection(), source: 'configured' },
      {
        selection: (() => {
          const p = ensurePreferences()
          return p.chatProvider && p.chatModel ? { provider: p.chatProvider, model: p.chatModel } : null
        })(),
        source: 'saved',
      },
    ]
    const seen = new Set(models.map((row) => row.provider + '\u0000' + row.model))
    for (const extra of extras) {
      const selection = extra.selection
      if (!selection || !selection.provider || !selection.model) continue
      const key = String(selection.provider) + '\u0000' + String(selection.model)
      if (seen.has(key)) continue
      seen.add(key)
      const provider = providers.find((row) => row.id === selection.provider)
      models.push({
        provider: String(selection.provider),
        providerName: provider ? provider.name : String(selection.provider),
        model: String(selection.model),
        name: String(selection.model),
        label: String(selection.model),
        characterId: heroineFor(selection),
        source: extra.source,
      })
    }

    const characters = ROSTER_IDS.map((id) => {
      const representative = models.find((model) => model.characterId === id)
      return {
        id,
        name: ROSTER[id].name,
        label: ROSTER[id].name,
        color: ROSTER[id].color,
        sprite: ROSTER[id].sprite,
        provider: representative ? representative.provider : null,
        model: representative ? representative.model : null,
      }
    })
    const mainSelection = currentSelectionSync()
    return {
      providers,
      models,
      characters,
      mainSelection: mainSelection
        ? { provider: String(mainSelection.provider), model: String(mainSelection.model) }
        : null,
      configuredSelection: configuredChatSelection(),
    }
  }

  function settingsSnapshot(): any {
    const p = ensurePreferences()
    const mainSelection = currentSelectionSync()
    const chatSelection = effectiveChatSelectionSync()
    return {
      enabled: p.enabled !== false,
      petEnabled: p.petEnabled !== false,
      characterMode: p.characterMode,
      characterId: p.characterMode === 'manual' ? p.characterId : null,
      characterSelection: p.characterMode === 'manual' && p.characterProvider && p.characterModel
        ? { provider: p.characterProvider, model: p.characterModel }
        : null,
      chatMode: p.chatMode,
      chatSelection: chatSelection
        ? { provider: String(chatSelection.provider || ''), model: String(chatSelection.model || '') }
        : null,
      mainSelection: mainSelection
        ? { provider: String(mainSelection.provider || ''), model: String(mainSelection.model || '') }
        : null,
      configuredSelection: configuredChatSelection(),
      hasCustomBg: typeof s.bg === 'string' && s.bg.startsWith('data:'),
      customBgName: typeof p.customBgName === 'string' ? p.customBgName : '',
    }
  }

  function validCustomRaster(raw: any, maxChars: number): string | null {
    if (typeof raw !== 'string' || raw.length === 0 || raw.length > maxChars) return null
    const match = raw.match(/^(data:image\/(?:png|jpe?g|webp|avif);base64,)([A-Za-z0-9+/=\r\n]+)$/i)
    if (!match) return null
    const payload = match[2].replace(/[\r\n]/g, '')
    if (!payload || payload.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) return null
    const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0
    const decodedBytes = (payload.length / 4) * 3 - padding
    if (decodedBytes <= 0 || decodedBytes > MAX_CUSTOM_IMAGE_BYTES) return null
    return match[1] + payload
  }

  function validCustomBackground(raw: any): string | null {
    return validCustomRaster(raw, MAX_CUSTOM_BG_DATA_URL_CHARS)
  }

  function validCustomSprite(raw: any): string | null {
    return validCustomRaster(raw, MAX_CUSTOM_SPRITE_DATA_URL_CHARS)
  }

  async function pickEffort(sel: any): Promise<any> {
    try {
      if (!llm || !sel || !sel.model || typeof llm.resolveModelInfo !== 'function') return undefined
      const info = await llm.resolveModelInfo(sel.provider, sel.model)
      const efforts = info && info.reasoning && Array.isArray(info.reasoning.efforts) ? info.reasoning.efforts : []
      if (efforts.length === 0) return undefined
      const low = efforts.find((e: any) => /low|minimal|none|light/i.test(String(e && e.id ? e.id : '')))
      const picked = low || efforts[0]
      return picked && picked.id ? picked.id : undefined
    } catch (err) {
      return undefined
    }
  }

  async function streamText(options: any): Promise<string> {
    let out = ''
    let finishError: string | null = null
    for await (const chunk of llm.stream(options)) {
      if (!chunk) continue
      if (chunk.type === 'text-delta' && chunk.text) out += chunk.text
      if (chunk.type === 'finish' && chunk.reason) {
        const kind = chunk.reason && chunk.reason.kind
        if (kind === 'error' || kind === 'aborted') {
          const f = chunk.reason.failure
          finishError = f && f.message ? f.message : (f && f.code ? f.code : String(kind))
        }
      }
    }
    if (finishError) throw new Error('model stream failed: ' + finishError)
    if (!out.trim()) throw new Error('model stream produced no text')
    return out.trim()
  }

  function isExplicitUserEvent(node: any): boolean {
    if (!node || typeof node !== 'object') return false
    const type = String(node.type || (node.data && node.data.type) || '').toLowerCase()
    const role = String(node.role || (node.message && node.message.role) || (node.data && node.data.role) || '').toLowerCase()
    const sourceKind = String(
      (node.source && node.source.kind)
      || (node.message && node.message.source && node.message.source.kind)
      || (node.data && node.data.source && node.data.source.kind)
      || '',
    ).toLowerCase()
    return type === 'user/message' || role === 'user' || sourceKind === 'user'
  }

  function extractUserText(node: any): string {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (typeof node !== 'object') return ''
    if (typeof node.text === 'string' && node.text) return node.text
    if (typeof node.content === 'string' && node.content) return node.content
    if (Array.isArray(node.content)) {
      const parts: string[] = []
      for (const block of node.content) {
        if (block && typeof block === 'object') {
          const blockType = String(block.type || '').toLowerCase()
          if (blockType && blockType !== 'text' && blockType !== 'input_text') continue
        }
        const text = extractUserText(block)
        if (text) parts.push(text)
      }
      return parts.join(' ')
    }
    if (node.message) return extractUserText(node.message)
    if (node.data && typeof node.data !== 'function') return extractUserText(node.data)
    return ''
  }

  function cleanThemeText(raw: string): string {
    const internal = /\b(the user is asking|assistant analysis|analysis channel|reasoning|tool call|tool output|exec_command|apply_patch|rg --files|function call)\b|(?:工具调用|工具输出|内部分析|推理过程)/i
    return raw
      .replace(/\x60{3}[\s\S]*?\x60{3}/g, ' ')
      .replace(/\x60[^\x60\r\n]*\x60/g, ' ')
      .split(/\r?\n/)
      .filter((line) => !internal.test(line))
      .join(' ')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/\b[A-Za-z]:[\\/][^\s，。；！？,;]+/g, ' ')
      .replace(/(?:^|\s)\/(?:[\w.-]+\/)+[\w.-]+/g, ' ')
      .replace(/\b(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)\b/gi, ' ')
      .replace(/[#>*_~\[\]{}|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function gatherRecentTheme(): string {
    try {
      if (!sessionsSvc || typeof sessionsSvc.list !== 'function') return ''
      const root = workspaceRoot()
      if (!root) return ''
      const list = sessionsSvc.list()
      if (!Array.isArray(list) || list.length === 0) return ''
      const matches = list.filter((x: any) => x && x.header && x.header.cwd === root)
      if (matches.length === 0) return ''
      const session = matches[matches.length - 1]
      const events = session && Array.isArray(session.events) ? session.events : []
      const texts: string[] = []
      for (let i = events.length - 1; i >= 0 && texts.length < 3; i--) {
        const event = events[i]
        if (!isExplicitUserEvent(event)) continue
        const cleaned = cleanThemeText(extractUserText(event))
        if (cleaned.length > 2) texts.unshift(cleaned.slice(0, 160))
      }
      return texts.join(' ').slice(0, 360)
    } catch (err) {
      return ''
    }
  }

  function systemPrompt(ch: any, c: any): string {
    if (!c.level) c.level = 1
    let work = ''
    try {
      const theme = gatherRecentTheme()
      if (theme) work = '\n主人最近在做的事情：' + theme + '。你可以自然地提起这些（表示你在默默关注他），但绝不主动给工作建议。'
    } catch (err) { /* ignore */ }
    return ch.system + '\n'
      + '当前等级：Lv.' + c.level + '。亲昵度：' + intimacyFor(c.level) + '\n'
      + '好感度：' + c.affection + '/' + affectionCap(c.level) + '（满了会升级，你会越来越亲近主人）'
      + work
  }

  function fallbackChoicesFor(): any[] {
    return shuffleOnce([
      { id: makeId('choice-positive'), text: FALLBACK_CHOICES.positive, effect: 1 },
      { id: makeId('choice-neutral'), text: FALLBACK_CHOICES.neutral, effect: 0 },
      { id: makeId('choice-negative'), text: FALLBACK_CHOICES.negative, effect: -1 },
    ])
  }

  const EMOTION_LABELS = ['cheerful', 'shy', 'serious', 'confused', 'angry', 'frightened', 'exasperated', 'starry']

  async function classifyEmotion(text: string): Promise<string> {
    if (!llm) return 'normal'
    const sel = await pickModel()
    if (!sel || !sel.model) return 'normal'
    try {
      const effort = await pickEffort(sel)
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: effort,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: '主人的这句话：' + text }],
          source: { kind: 'user' },
        }],
        system: '你是情绪分类器。根据主人的话，从这些标签中只输出一个：cheerful、shy、serious、confused、angry、frightened、exasperated、starry；如果都不符合，输出 normal。只输出标签本身，不要任何其他文字。',
        temperature: 0.2,
        maxTokens: 30,
      })
      const label = out.trim().toLowerCase()
      if (EMOTION_LABELS.indexOf(label) >= 0) return label
      return 'normal'
    } catch (err) {
      console.error('whale-galgame emotion classify failed:', err)
      return 'normal'
    }
  }

  async function generateChoices(ch: any, c: any, lastUser: string, lastHeroine: string): Promise<any[]> {
    if (!llm) return fallbackChoicesFor()
    const sel = await pickModel()
    if (!sel || !sel.model) return fallbackChoicesFor()
    try {
      const effort = await pickEffort(sel)
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: effort,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: 'galgame对话的最后两行是：\n主人：' + lastUser + '\n' + ch.name + '：' + lastHeroine + '\n\n请生成三条「主人」接下来可能说的短句，每条不超过15字：positive 要温暖亲近，neutral 要自然普通，negative 要稍显疏离或不耐烦但不得辱骂。三条含义和措辞必须明显不同。严格输出 JSON 对象：{"positive":"...","neutral":"...","negative":"..."}，不要任何其他文字。' }],
          source: { kind: 'user' },
        }],
        system: '你是galgame对话选项生成器。只输出含 positive、neutral、negative 三个字符串字段的 JSON 对象；不得解释、不得使用 Markdown。',
        temperature: 0.8,
        maxTokens: 300,
      })
      const m = out.match(/\{[\s\S]*\}/)
      if (m) {
        const parsed = JSON.parse(m[0])
        if (parsed && typeof parsed === 'object') {
          const positive = typeof parsed.positive === 'string' ? parsed.positive.trim().slice(0, 30) : ''
          const neutral = typeof parsed.neutral === 'string' ? parsed.neutral.trim().slice(0, 30) : ''
          const negative = typeof parsed.negative === 'string' ? parsed.negative.trim().slice(0, 30) : ''
          if (positive && neutral && negative && new Set([positive, neutral, negative]).size === 3) {
            return shuffleOnce([
              { id: makeId('choice-positive'), text: positive, effect: 1 },
              { id: makeId('choice-neutral'), text: neutral, effect: 0 },
              { id: makeId('choice-negative'), text: negative, effect: -1 },
            ])
          }
        }
      }
    } catch (err) {
      console.error('whale-galgame choices gen failed:', err)
    }
    return fallbackChoicesFor()
  }

  async function generateCg(charId: string, level: number, cgId: string): Promise<void> {
    const record = findCg(cgId)
    if (!record) return
    try {
      const ch = ROSTER[charId]
      const theme = gatherRecentTheme()
      const prompt = [
        '精美galgame风格特殊CG插画，横向16:9桌面壁纸构图，唯美光效，高清细节，无文字无边框',
        '角色：' + ch.visual + '，表情幸福温柔',
        '场景：深海女仆工坊，烛光与月光',
        '等级 Lv.' + level + ' 的纪念CG',
        theme ? '画面元素呼应主人最近的经历与工作：' + theme : '温暖浪漫的日常氛围',
      ].join('，')
      let dataUrl: string | null = null
      let lastError: any = null
      for (let attempt = 0; attempt < 2 && !dataUrl; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 8000))
        try {
          const res = await fetch(cfg.dashscopeBaseUrl.replace(/\/$/, '') + '/api/v1/services/aigc/multimodal-generation/generation', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer ' + cfg.dashscopeApiKey,
            },
            body: JSON.stringify({
              model: cfg.dashscopeModel,
              input: {
                messages: [{ role: 'user', content: [{ text: prompt }] }],
              },
              parameters: { size: cfg.dashscopeSize },
            }),
          })
          const data: any = await res.json().catch(() => ({}))
          if (!res.ok) {
            const msg = (data && data.error && data.error.message)
              ? data.error.message
              : (data && data.message ? data.message : ('HTTP ' + res.status))
            throw new Error(msg)
          }
          const content = data && data.output && data.output.choices && data.output.choices[0]
            && data.output.choices[0].message && data.output.choices[0].message.content
          const first = Array.isArray(content)
            ? content.find((b: any) => b && (typeof b.image === 'string' || typeof b.url === 'string'))
            : null
          const imageRef: string | null = first
            ? (typeof first.image === 'string' && first.image ? first.image : typeof first.url === 'string' ? first.url : null)
            : null
          if (imageRef) {
            if (imageRef.startsWith('data:')) {
              dataUrl = imageRef
            } else {
              const img = await fetch(imageRef)
              if (!img.ok) throw new Error('image download HTTP ' + img.status)
              const buf = Buffer.from(await img.arrayBuffer())
              dataUrl = 'data:image/png;base64,' + buf.toString('base64')
            }
          }
          if (!dataUrl) throw new Error('image response carried no image')
        } catch (err) {
          lastError = err
        }
      }
      if (!dataUrl) throw lastError || new Error('generation failed')
      record.status = 'ready'
      record.dataUrl = dataUrl
      record.prompt = prompt
      record.error = null
    } catch (err: any) {
      record.status = 'failed'
      record.dataUrl = null
      record.error = err && err.message ? err.message : String(err)
    }
    try { await save() } catch (err2) { /* ignore */ }
  }

  async function save(): Promise<void> {
    if (!fs) throw new Error('whale-galgame file service unavailable')
    if (!s) throw new Error('whale-galgame state unavailable')
    try {
      const root = workspaceRoot()
      const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : undefined)
      await fs.writeText(target, JSON.stringify(s), undefined, undefined, resolvePolicy())
    } catch (err) {
      console.error('whale-galgame save failed:', err)
      throw err
    }
  }

  function hydrateCharacter(src: any, legacyVersion: number): any {
    const dst = emptyCharacter()
    if (!src || typeof src !== 'object') return dst
    if (typeof src.affection === 'number') {
      if (legacyVersion <= 3 && typeof src.level !== 'number' && src.affection >= 100) {
        dst.level = 2
        dst.affection = 0
      } else {
        dst.affection = clamp(src.affection)
      }
    }
    if (typeof src.level === 'number' && src.level >= 1) dst.level = Math.floor(src.level)
    if (Array.isArray(src.log)) dst.log = src.log.slice(-24)
    if (Array.isArray(src.chatLines)) {
      dst.chatLines = src.chatLines.map((line: any) => ({
        ...(line && typeof line === 'object' ? line : {}),
        who: line && line.who ? String(line.who) : 'narrator',
        text: line && typeof line.text === 'string' ? line.text : String(line && line.text ? line.text : ''),
      }))
    }
    if (Array.isArray(src.choices)) {
      dst.choices = src.choices
        .slice(0, 3)
        .map((choice: any, index: number) => normalizeChoice(choice, index))
        .filter(Boolean)
    }
    if (Array.isArray(src.cgs)) {
      dst.cgs = src.cgs
        .map((cg: any, index: number) => normalizeCg(cg, '', index))
        .filter(Boolean)
    }
    if (src.customSprite && typeof src.customSprite === 'object') {
      const dataUrl = validCustomSprite(src.customSprite.dataUrl)
      const storedRevision = Number.isFinite(src.customSprite.revision) && src.customSprite.revision >= 0
        ? Math.floor(src.customSprite.revision)
        : 0
      dst.customSprite = {
        dataUrl,
        fileName: dataUrl ? shortSetting(src.customSprite.fileName).slice(0, 180) : '',
        revision: dataUrl ? Math.max(1, storedRevision) : storedRevision,
      }
    }
    return dst
  }

  async function load(): Promise<string | null> {
    if (!fs) return null
    try {
      const root = workspaceRoot()
      const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : undefined)
      const txt = await fs.readText(target)
      const data = JSON.parse(txt)
      if (!data || !data.characters) return null
      const legacyVersion = typeof data.v === 'number' ? data.v : 2
      let needsSave = legacyVersion !== SAVE_VERSION
      s = fresh()
      s.current = ROSTER[data.current] ? data.current : 'deepseek'
      s.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : s.current
      for (const id of ROSTER_IDS) {
        s.characters[id] = hydrateCharacter(data.characters[id], legacyVersion)
        for (const cg of s.characters[id].cgs) cg.charId = id
      }
      if (data.tokens && typeof data.tokens.lastApplied === 'number') s.tokens.lastApplied = Math.max(0, data.tokens.lastApplied)
      if (data.tokens && typeof data.tokens.bank === 'number') s.tokens.bank = Math.max(0, data.tokens.bank)
      if (data.tokens && typeof data.tokens.lastActiveAt === 'number') s.tokens.lastActiveAt = data.tokens.lastActiveAt
      if (data.preferences && typeof data.preferences === 'object') {
        s.preferences.petEnabled = data.preferences.petEnabled !== false
        if (typeof data.preferences.enabled === 'boolean') s.preferences.enabled = data.preferences.enabled
        if (typeof data.preferences.characterMode === 'string') s.preferences.characterMode = data.preferences.characterMode
        if (typeof data.preferences.characterId === 'string' || data.preferences.characterId === null) {
          s.preferences.characterId = data.preferences.characterId
        }
        if (typeof data.preferences.characterProvider === 'string') s.preferences.characterProvider = data.preferences.characterProvider
        if (typeof data.preferences.characterModel === 'string') s.preferences.characterModel = data.preferences.characterModel
        if (typeof data.preferences.chatMode === 'string') s.preferences.chatMode = data.preferences.chatMode
        if (typeof data.preferences.chatProvider === 'string') s.preferences.chatProvider = data.preferences.chatProvider
        if (typeof data.preferences.chatModel === 'string') s.preferences.chatModel = data.preferences.chatModel
        if (typeof data.preferences.customBgName === 'string') s.preferences.customBgName = data.preferences.customBgName.slice(0, 180)
      }
      ensurePreferences()
      if (!data.preferences
        || typeof data.preferences.enabled !== 'boolean'
        || typeof data.preferences.characterMode !== 'string'
        || typeof data.preferences.chatMode !== 'string') needsSave = true
      s.modelOnline = data.modelOnline === true
      s.characterModelLabel = typeof data.characterModelLabel === 'string'
        ? data.characterModelLabel
        : typeof data.modelLabel === 'string' ? data.modelLabel : ''
      s.chatModelLabel = typeof data.chatModelLabel === 'string'
        ? data.chatModelLabel
        : typeof data.lastModel === 'string' ? data.lastModel : ''
      s.modelLabel = s.characterModelLabel
      s.lastModel = s.chatModelLabel
      s.fallbackUsed = data.fallbackUsed === true
      s.fallbackReason = typeof data.fallbackReason === 'string' ? data.fallbackReason : ''

      // v4 and earlier kept one full CG object at the root. Import it once
      // into its owner's gallery and retain only its ID at the root.
      if (data.cg && typeof data.cg === 'object' && typeof data.cg.cgId === 'string') {
        if (findCg(data.cg.cgId)) s.cg = { cgId: data.cg.cgId }
      } else if (data.cg && typeof data.cg === 'object') {
        const charId = ROSTER[data.cg.charId] ? data.cg.charId : 'deepseek'
        const legacyCg = normalizeCg(data.cg, charId, s.characters[charId].cgs.length)
        if (legacyCg) {
          if (!legacyCg.level) legacyCg.level = s.characters[charId].level
          if (!s.characters[charId].cgs.some((cg: any) => cg.id === legacyCg.id)) {
            s.characters[charId].cgs.push(legacyCg)
          }
          s.cg = { cgId: legacyCg.id }
        }
      }

      if (typeof data.bg === 'string') {
        if (data.bg.startsWith('cg:') && findCg(data.bg.slice(3))) {
          s.bg = data.bg
        } else if (data.bg.startsWith('data:')) {
          const matching = allCgs().find((cg: any) => cg.dataUrl === data.bg)
          s.bg = matching ? 'cg:' + matching.id : data.bg
        }
      }

      // An in-flight HTTP request cannot survive a host restart.
      for (const cg of allCgs()) {
        const safePrompt = sanitizeStoredCgPrompt(cg.prompt)
        if (safePrompt !== cg.prompt) {
          cg.prompt = safePrompt
          needsSave = true
        }
        if (cg.status === 'generating') {
          cg.status = 'failed'
          cg.error = '生成被重启打断，请重新触发'
          needsSave = true
        }
      }
      if (needsSave) await save()
      return null
    } catch (err) { return null }
  }

  let readyPromise: Promise<void> | null = null

  function ensureReady(): Promise<void> {
    if (!readyPromise) {
      readyPromise = (async () => {
        for (let i = 0; i < 60 && !fs; i++) {
          await new Promise((r) => setTimeout(r, 100))
        }
        await load()
        if (!s) s = fresh()
        const sel = await pickModel()
        if (s) {
          s.modelOnline = !!sel
          s.chatModelLabel = sel ? String(sel.model) : ''
          s.lastModel = s.chatModelLabel
          syncHeroine()
        }
      })()
    }
    return readyPromise
  }

  async function handleAction(action: string, args: any): Promise<any> {
    await ensureReady().catch(() => { /* ignore */ })
    switch (action) {
      case 'model-options': {
        return modelOptions()
      }
      case 'settings-get': {
        return settingsSnapshot()
      }
      case 'settings-set': {
        if (!s) s = fresh()
        const p = ensurePreferences()
        const originalPreferences = { ...p }
        const input = args && args.settings && typeof args.settings === 'object'
          ? { ...args, ...args.settings }
          : (args && typeof args === 'object' ? args : {})
        const errors: string[] = []
        const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key)

        if (has('enabled') && typeof input.enabled === 'boolean') p.enabled = input.enabled
        if (has('petEnabled') && typeof input.petEnabled === 'boolean') p.petEnabled = input.petEnabled

        let nextCharacterMode = p.characterMode
        if (has('characterMode')) {
          if (input.characterMode === 'follow' || input.characterMode === 'manual') {
            nextCharacterMode = input.characterMode
          } else {
            errors.push('characterMode 必须是 follow 或 manual')
          }
        }
        if (has('characterId')) {
          const characterId = shortSetting(input.characterId)
          if (!characterId && input.characterId === null) {
            if (!has('characterMode')) nextCharacterMode = 'follow'
          } else if (ROSTER[characterId]) {
            p.characterId = characterId
            p.characterProvider = ''
            p.characterModel = ''
            if (!has('characterMode')) nextCharacterMode = 'manual'
          } else {
            errors.push('未知角色')
          }
        }
        if (input.characterSelection && typeof input.characterSelection === 'object') {
          const provider = shortSetting(input.characterSelection.provider)
          const model = shortSetting(input.characterSelection.model)
          if (provider && model) {
            p.characterProvider = provider
            p.characterModel = model
            p.characterId = heroineFor({ provider, model }, p.characterId || s.current)
            if (!has('characterMode')) nextCharacterMode = 'manual'
          } else {
            errors.push('角色模型需要 provider 和 model')
          }
        }
        if (nextCharacterMode === 'manual' && !ROSTER[p.characterId]) {
          errors.push('手动角色不能为空')
          nextCharacterMode = 'follow'
        }
        p.characterMode = nextCharacterMode

        let nextChatMode = p.chatMode
        if (has('chatMode')) {
          if (['configured', 'main', 'manual'].includes(input.chatMode)) {
            nextChatMode = input.chatMode
          } else {
            errors.push('chatMode 必须是 configured、main 或 manual')
          }
        }
        let requestedProvider = p.chatProvider
        let requestedModel = p.chatModel
        let suppliedChatSelection = false
        if (input.chatSelection && typeof input.chatSelection === 'object') {
          requestedProvider = shortSetting(input.chatSelection.provider)
          requestedModel = shortSetting(input.chatSelection.model)
          suppliedChatSelection = true
        } else if (has('chatProvider') || has('chatModel')) {
          requestedProvider = has('chatProvider') ? shortSetting(input.chatProvider) : requestedProvider
          requestedModel = has('chatModel') ? shortSetting(input.chatModel) : requestedModel
          suppliedChatSelection = true
        }
        if (suppliedChatSelection) {
          let providerAccepted = true
          try {
            const live = llm && typeof llm.listProviders === 'function' ? llm.listProviders() : []
            if (Array.isArray(live) && live.length > 0) {
              providerAccepted = live.some((row: any) => row && row.id === requestedProvider)
            }
          } catch (err) { /* an unavailable catalog is not proof the route is invalid */ }
          if (!requestedProvider || !requestedModel) {
            errors.push('对话模型需要 provider 和 model')
          } else if (!providerAccepted) {
            errors.push('所选模型提供方当前未启用')
          } else {
            p.chatProvider = requestedProvider
            p.chatModel = requestedModel
            if (!has('chatMode')) nextChatMode = 'manual'
          }
        }
        if (nextChatMode === 'configured' && !configuredChatSelection()) nextChatMode = 'main'
        if (nextChatMode === 'manual' && (!p.chatProvider || !p.chatModel)) {
          errors.push('手动对话模型不能为空')
          nextChatMode = configuredChatSelection() ? 'configured' : 'main'
        }
        p.chatMode = nextChatMode

        if (errors.length > 0) {
          // Settings are a single transaction: a rejected model/role must not
          // silently apply an unrelated toggle from the same request.
          s.preferences = originalPreferences
          return { ok: false, errors, settings: settingsSnapshot(), view: view() }
        }

        if (p.enabled !== false) syncHeroine()
        const selected = await pickModel()
        s.chatModelLabel = selected && selected.model ? String(selected.model) : ''
        s.lastModel = s.chatModelLabel
        s.modelOnline = !!selected
        await save()
        return { ok: errors.length === 0, errors, settings: settingsSnapshot(), view: view() }
      }
      case 'view': {
        const p = ensurePreferences()
        if (p.enabled === false) return view()
        const heroineChanged = syncHeroine()
        const actualSelection = await pickModel()
        s.chatModelLabel = actualSelection && actualSelection.model ? String(actualSelection.model) : ''
        s.lastModel = s.chatModelLabel
        const r = settle()
        if (s) checkLevelUp(s.current, s.characters[s.current])
        if (r.changed || heroineChanged) await save()
        return view()
      }
      case 'chat': {
        if (ensurePreferences().enabled === false) return view()
        settle()
        if (!s) s = fresh()
        syncHeroine()
        const text = args && args.text ? String(args.text).trim().slice(0, 500) : ''
        if (!text) return view()
        const ch = ROSTER[s.current]
        const c = s.characters[s.current]
        const selectedChoice = args && typeof args.choiceId === 'string'
          ? c.choices.find((choice: any) => choice && typeof choice === 'object' && choice.id === args.choiceId)
          : null
        c.log.push({ role: 'user', text })
        const emotion = await classifyEmotion(text)
        c.chatLines.push({ who: 'user', text, emotion, choiceId: selectedChoice ? selectedChoice.id : null })
        c.choices = []
        let reply = ''
        let usedFallback = false
        let fallbackReason = ''
        const sel = await pickModel()
        s.chatModelLabel = sel && sel.model ? String(sel.model) : ''
        s.lastModel = s.chatModelLabel
        const effort = await pickEffort(sel)
        if (llm && sel && sel.model) {
          try {
            reply = await streamText({
              provider: sel.provider,
              model: sel.model,
              reasoningEffort: effort,
              messages: (() => {
                const msgs: any[] = [{
                  role: 'user',
                  content: [{ type: 'text', text: '（场景：深海女仆工坊的会客厅，暖黄的灯光。' + ch.name + '正在和来访的主人聊天。你只扮演' + ch.name + '这一个角色，不要提到其他角色。）' }],
                  source: { kind: 'user' },
                }]
                for (const m of c.log.slice(-12)) {
                  if (m.role === 'assistant' && typeof m.text === 'string' && CANNED_LINES.has(m.text.trim())) continue
                  msgs.push({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: [{ type: 'text', text: m.text }],
                    source: m.role === 'assistant'
                      ? { kind: 'model', provider: sel.provider, model: sel.model }
                      : { kind: 'user' },
                  })
                }
                return msgs
              })(),
              system: systemPrompt(ch, c),
              temperature: 0.9,
              maxTokens: 1200,
            })
          } catch (err: any) {
            console.error('whale-galgame llm call failed:', err && err.message ? err.message : String(err))
            fallbackReason = err && err.message ? err.message : String(err)
          }
        } else {
          fallbackReason = 'no model available'
        }
        if (!reply) {
          reply = '主人说的话，我听到啦～（今天的深海信号有点弱，但心意传达到了哦）'
          usedFallback = true
        }
        s.fallbackUsed = usedFallback
        s.fallbackReason = fallbackReason
        c.log.push({ role: 'assistant', text: reply })
        if (c.log.length > 24) c.log = c.log.slice(-24)
        c.chatLines.push({ who: 'heroine', text: reply })
        const before = c.affection
        const delta = selectedChoice
          ? (selectedChoice.effect === 1 ? 1 : selectedChoice.effect === -1 ? -1 : 0)
          : (/喜欢|爱|可爱|想你|陪你|晚安|早安|抱抱|亲亲|约会|月圆/.test(text) ? 1 : (/讨厌|烦|滚|走开|无聊|再见/.test(text) ? -1 : 0))
        c.affection = Math.max(0, before + delta)
        const leveled = checkLevelUp(s.current, c)
        if (!leveled) {
          c.choices = await generateChoices(ch, c, text, reply)
        }
        await save()
        return view()
      }
      case 'sprite-data': {
        if (!s) s = fresh()
        if (ensurePreferences().enabled !== false) syncHeroine()
        const requestedCharId = shortSetting(args && (args.characterId || args.charId))
        const charId = requestedCharId ? (ROSTER[requestedCharId] ? requestedCharId : null) : s.current
        if (!charId) return { ok: false, error: '未知角色' }
        const character = s.characters[charId]
        const sprite = customSpriteFor(character)
        const dataUrl = sprite && typeof sprite.dataUrl === 'string' && sprite.dataUrl.startsWith('data:')
          ? sprite.dataUrl
          : null
        return {
          ok: true,
          charId,
          kind: dataUrl ? 'custom' : 'builtin',
          dataUrl,
          fileName: dataUrl && typeof sprite.fileName === 'string' ? sprite.fileName : '',
          revision: spriteRevisionFor(character),
        }
      }
      case 'sprite-upload': {
        if (!s) s = fresh()
        if (ensurePreferences().enabled !== false) syncHeroine()
        const dataUrl = validCustomSprite(args && args.dataUrl)
        if (!dataUrl) {
          return { ok: false, error: '仅支持 18MB 以内的 PNG、JPEG、WebP 或 AVIF 图片', view: view() }
        }
        const requestedCharId = shortSetting(args && (args.characterId || args.charId))
        const charId = requestedCharId ? (ROSTER[requestedCharId] ? requestedCharId : null) : s.current
        if (!charId) return { ok: false, error: '未知角色', view: view() }
        const character = s.characters[charId]
        character.customSprite = {
          dataUrl,
          fileName: shortSetting(args && args.fileName).slice(0, 180),
          revision: nextSpriteRevision(character),
        }
        await save()
        return {
          ok: true,
          charId,
          revision: spriteRevisionFor(character),
          view: view(),
        }
      }
      case 'sprite-clear': {
        if (!s) s = fresh()
        if (ensurePreferences().enabled !== false) syncHeroine()
        const requestedCharId = shortSetting(args && (args.characterId || args.charId))
        const charId = requestedCharId ? (ROSTER[requestedCharId] ? requestedCharId : null) : s.current
        if (!charId) return { ok: false, error: '未知角色', view: view() }
        const character = s.characters[charId]
        const revision = nextSpriteRevision(character)
        character.customSprite = { dataUrl: null, fileName: '', revision }
        await save()
        return { ok: true, charId, revision, view: view() }
      }
      case 'bg-data': {
        let dataUrl: string | null = null
        if (s && typeof s.bg === 'string' && s.bg.startsWith('data:')) dataUrl = s.bg
        if (s && typeof s.bg === 'string' && s.bg.startsWith('cg:')) {
          const cg = findCg(s.bg.slice(3))
          if (cg && cg.status === 'ready' && cg.dataUrl) dataUrl = cg.dataUrl
        }
        const custom = !!(s && typeof s.bg === 'string' && s.bg.startsWith('data:'))
        return {
          dataUrl,
          kind: custom ? 'custom' : (dataUrl ? 'cg' : null),
          fileName: custom && s && s.preferences && typeof s.preferences.customBgName === 'string'
            ? s.preferences.customBgName
            : '',
        }
      }
      case 'bg-upload': {
        if (!s) s = fresh()
        const dataUrl = validCustomBackground(args && args.dataUrl)
        if (!dataUrl) {
          return { ok: false, error: '仅支持 18MB 以内的 PNG、JPEG、WebP 或 AVIF 图片', view: view() }
        }
        s.bg = dataUrl
        for (const cg of allCgs()) cg.savedAsBg = false
        const p = ensurePreferences()
        p.customBgName = shortSetting(args && args.fileName).slice(0, 180)
        await save()
        return { ok: true, view: view() }
      }
      case 'bg-clear-custom': {
        if (s && typeof s.bg === 'string' && s.bg.startsWith('data:')) s.bg = null
        const p = ensurePreferences()
        p.customBgName = ''
        await save()
        return { ok: true, view: view() }
      }
      case 'cg-gallery': {
        return {
          items: allCgs().filter((cg: any) => cg.status === 'ready' && cg.dataUrl).map((cg: any) => ({
            id: cg.id,
            status: cg.status,
            dataUrl: cg.dataUrl,
            prompt: cg.prompt,
            charId: cg.charId,
            name: ROSTER[cg.charId] ? ROSTER[cg.charId].name : cg.charId,
            level: cg.level,
            at: cg.at,
            seen: cg.seen === true,
            savedAsBg: cg.savedAsBg === true,
            error: cg.error || null,
          })),
        }
      }
      case 'cg-ack': {
        const cg = args && typeof args.id === 'string' ? findCg(args.id) : currentCg()
        if (cg) cg.seen = true
        await save()
        return view()
      }
      case 'cg-save-bg': {
        const cg = args && typeof args.id === 'string' ? findCg(args.id) : currentCg()
        if (s && cg && cg.status === 'ready' && cg.dataUrl) {
          for (const item of allCgs()) item.savedAsBg = item.id === cg.id
          cg.seen = true
          s.bg = 'cg:' + cg.id
          ensurePreferences().customBgName = ''
        }
        await save()
        return view()
      }
      case 'cg-clear-bg': {
        if (s) {
          s.bg = null
          for (const cg of allCgs()) cg.savedAsBg = false
          ensurePreferences().customBgName = ''
        }
        await save()
        return view()
      }
      case 'pet-set': {
        if (!s) s = fresh()
        const p = ensurePreferences()
        if (args && typeof args.enabled === 'boolean') p.petEnabled = args.enabled
        await save()
        return view()
      }
      case 'reset': {
        const preferences = { ...ensurePreferences() }
        s = fresh()
        s.preferences = preferences
        await save()
        return view()
      }
      default:
        return view()
    }
  }

  if (webServer && typeof webServer.register === 'function') {
    webServer.register({
      kind: 'prefix',
      path: '/whale-galgame-api',
      handler: async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.writeHead(req.method === 'GET' ? 200 : 405, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: true, service: 'dsh-whale-galgame' }))
          return
        }
        try {
          const parts: Buffer[] = []
          let totalBytes = 0
          for await (const c of req) {
            const chunk = Buffer.isBuffer(c) ? c : Buffer.from(typeof c === 'string' ? c : String(c), 'utf8')
            totalBytes += chunk.length
            if (totalBytes > MAX_API_BODY_BYTES) {
              res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ error: '请求体过大；上传图片请控制在 18MB 以内' }))
              return
            }
            parts.push(chunk)
          }
          const raw = parts.length ? Buffer.concat(parts).toString('utf8') : ''
          const body = raw ? JSON.parse(raw) : {}
          const action = typeof body.action === 'string' ? body.action : 'view'
          const result = await handleAction(action, body.args || {})
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify(result))
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: err && err.message ? err.message : String(err) }))
        }
      },
    })
  }

  ctx.effect(() => {
    void ensureReady()
  })
}
