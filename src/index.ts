import {
  activityCgTheme,
  activitySystemInstruction,
  collectHarnessActivities,
  nextUnseenActivity,
  normalizeActivityMemory,
  rememberActivity,
  type HarnessActivity,
} from './activity-context.ts'
import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'
import {
  link as nativeLink,
  mkdir as nativeMkdir,
  open as nativeOpen,
  readFile as nativeReadFile,
  rename as nativeRename,
  rm as nativeRm,
  stat as nativeStat,
} from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve as resolveNativePath } from 'node:path'

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
    defaultBackground: 'palace-night',
    backgrounds: [
      { key: 'palace-night', label: '深海宫殿' },
      { key: 'bg-deepseek-seaside-study', label: '海边书房' },
    ],
    visual: '蓝白配色的鲸鱼娘女仆，鲸鱼发饰，深蓝女仆装，裙摆像鲸尾',
    greet: '「主人，又见面啦～今天也想听你说话呢。」',
    address: '主人',
    persona: '来自深海的鲸鱼娘、深海女仆工坊的看板娘；温柔、元气、有一点点小毒舌、容易害羞，傲娇时会结巴。',
    tone: '口语化中文，爱用“呢、哦、啦、呀、～”等语气词和颜文字，偶尔假装生气。',
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
    defaultBackground: 'bg-claude-writing-study',
    backgrounds: [
      { key: 'bg-claude-writing-study', label: '琥珀写作书房' },
    ],
    visual: '肩长栗色卷发与侧编发、琥珀眼的年轻女性，别着珊瑚橙像素 Clawd 发夹和陶土色发带，穿陶土橙短外套、深棕马甲、奶油白分层褶裙与棕色短靴，怀抱深棕文册',
    greet: '「晚上好。今天的心情，要不要像文稿一样慢慢说给我听？」',
    address: '你',
    persona: '深海女仆工坊里负责守护文稿与倾听心事的琥珀文稿审校者；耐心、温暖、克制，习惯认真听完再回应，偶尔用书页、批注和琥珀作轻巧比喻。',
    tone: '斯文自然，句子优雅但不说教。',
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
    defaultBackground: 'bg-gpt-collaboration-workshop',
    backgrounds: [
      { key: 'bg-gpt-collaboration-workshop', label: '协作工作坊' },
    ],
    visual: '石墨黑短波波头、发梢带翡翠绿挑染和绿色眼睛的年轻女性，别玫瑰发夹，穿象牙白绿边长外套、黑色褶裙、深色连裤袜与短靴，手持展示流程图的三折活页夹和绿色笔',
    greet: '「嗨，我把频道都理顺啦。现在只想听听你心里那一条线。」',
    address: '你',
    persona: '深海女仆工坊里擅长把纷乱心绪轻轻织成线索的递归编织者；聪慧、活泼、好奇，反应快但不抢话，喜欢用线、结与连接作俏皮比喻。',
    tone: '口语化，句子短促有活力，偶尔带轻巧的感叹号。',
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
    defaultBackground: 'bg-gemini-twin-creative-studio',
    backgrounds: [
      { key: 'bg-gemini-twin-creative-studio', label: '双棱镜创意工坊' },
    ],
    visual: '银白长发两侧渐变冷蓝与紫罗兰、蓝紫异色瞳的年轻女性，戴蓝金星形发饰，穿白蓝紫金不对称星纹裙与白色长袜，手持透明棱镜和深蓝星纹卡册',
    greet: '「同一句心事也会折出不同颜色呢。今晚想让我听见哪一种？」',
    address: '你',
    persona: '深海女仆工坊里的双棱镜译者，能从同一份心情里看见两种互补的颜色；从容、细腻、有一点电波系，擅长接住矛盾感受，不替对方武断下结论。',
    tone: '轻灵而有节奏感，偶尔用省略号制造神秘感。',
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
    defaultBackground: 'bg-kimi-moonlit-reading-study',
    backgrounds: [
      { key: 'bg-kimi-moonlit-reading-study', label: '月夜阅读书房' },
    ],
    visual: '过腰乌黑直发、明亮蓝眼的年轻女性，戴金色月牙发饰与蓝丝带，穿海军蓝、象牙白与金色的现代中式档案官裙装和深蓝短靴，手持长卷与书签笔',
    greet: '「你来啦。长卷还留着空白，今晚的心事要写在哪一段？」',
    address: '你',
    persona: '深海女仆工坊里安静可靠的月卷档案官，珍惜每一段被托付的心事；安静、专注、可信，略带藏不住开心的克制傲娇，喜欢用月光、长卷与书签作比喻。',
    tone: '轻柔简洁，偶尔用小小反问掩饰关心。',
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
    defaultBackground: 'bg-grok-electronics-studio',
    backgrounds: [
      { key: 'bg-grok-electronics-studio', label: '宇宙电子工坊' },
    ],
    visual: '石墨黑凌乱短波波头、一缕白色额发与青色发梢、青灰眼的年轻女性，头顶悬浮小型斜椭圆分段信号环，穿黑白青科技飞行夹克、短裤、半透明黑袜与战斗短靴，手持无线电接收器',
    greet: '「信号锁定——洛可收到你啦。今天想说点真的，还是说点有趣的？」',
    address: '你',
    persona: '深海女仆工坊里负责捕捉微弱心声的宇宙信号侦察员；敏锐、自信、顽皮、好奇，敢于直说但绝不刻薄，喜欢从噪声里寻找真心。',
    tone: '简洁灵动，偶尔用频道、信号和噪声作俏皮比喻。',
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
const SAVE_VERSION = 9
const GLOBAL_SAVE_KIND = 'dsh-whale-galgame-global'
const GLOBAL_SAVE_VERSION = 2
const LEGACY_GLOBAL_SAVE_VERSION = 1
const WORKSPACE_SAVE_KIND = 'dsh-whale-galgame-workspace'
const WORKSPACE_SAVE_VERSION = 2
const LEGACY_WORKSPACE_SAVE_VERSION = 1

// Side stories are events, not a grind: one run per cooldown window, at most a
// single affection step per character, and no CG on a side-story level-up.
// Anti-farming is really the per-character ±1 clamp against a 30+15×(Lv-1)
// curve; the cooldown only keeps a skit feeling like an event and caps cost.
// Six hours turned out to be punishing, so the default is a short window and
// operators can set 0 to remove it entirely.
const SIDE_STORY_COOLDOWN_DEFAULT_MINUTES = 30
const SIDE_STORY_COOLDOWN_MAX_MINUTES = 24 * 60
const SIDE_STORY_MIN_CAST = 2
const SIDE_STORY_MAX_CAST = 3
const SIDE_STORY_MAX_BEATS = 10
const SIDE_STORY_BEAT_LIMIT = 40
// Storage headroom so a sentence can finish instead of being sliced mid-word.
const SIDE_STORY_BEAT_HARD_LIMIT = 60
const SIDE_STORY_HISTORY_LIMIT = 10
const SIDE_STORY_TRANSCRIPT_LIMIT = 20

// Rotating frames keep consecutive skits from sharing a shape. Without them the
// model reliably opens on "旁白：工坊里飘着一个说法" every single time.
// What each character stands in for when the skit goes looking for gossip. The
// query carries nothing but these words: never the master's chat, her work, or
// anything read out of the Harness session.
const SIDE_STORY_SEARCH_TERMS: Record<string, string> = {
  deepseek: 'DeepSeek 模型',
  claude: 'Claude 模型',
  chatgpt: 'ChatGPT GPT 模型',
  gemini: 'Gemini 模型',
  kimi: 'Kimi 模型',
  grok: 'Grok 模型',
}

// Serious material makes a terrible comedy sketch regardless of policy, and the
// skit is generated with nobody reviewing it first. Anything here routes the
// run back to the local activity seed instead.
const SIDE_STORY_TOPIC_BLOCKLIST = [
  '诉讼', '起诉', '控告', '侵权', '监管', '处罚', '罚款', '封禁', '调查',
  '裁员', '离职', '解雇', '辞职', '收购', '融资', '股价', '财报', '亏损',
  '事故', '泄露', '漏洞', '越狱', '滥用', '造谣', '死亡', '自杀', '战争',
  'lawsuit', 'sue', 'court', 'regulat', 'fine', 'ban', 'probe', 'antitrust',
  'layoff', 'fired', 'resign', 'acquisition', 'ipo', 'stock', 'revenue',
  'breach', 'leak', 'exploit', 'jailbreak', 'abuse', 'death', 'war',
]

const SIDE_STORY_FRAMES = [
  '午后茶歇，有人正在收拾茶具',
  '有人刚从外面回来，带回一句闲话',
  '两个人正为了谁来擦窗户争执不下',
  '深夜，只剩一盏灯还亮着',
  '有人偷看了主人的屏幕，被当场抓住',
  '大扫除进行到一半，翻出了旧东西',
  '晚饭做多了，几个人围着一锅汤',
  '外面在下雨，谁都出不去',
]
const SIDE_STORY_TWISTS = [
  '有人把话理解成了完全不同的意思',
  '有人为了维护同伴反而把事情说得更糟',
  '有人突然自曝了一件更丢脸的事',
  '有人开始跟别人比谁更惨',
  '话题不知怎么拐到了主人身上',
  '有人认真过头，把玩笑当成了正经事',
]
const GLOBAL_SAVE_SEGMENTS = ['storages', 'dsh-whale-galgame', 'global.json'] as const
const SESSION_LOOKUP_TIMEOUT_MS = 800
const MODEL_LIST_TIMEOUT_MS = 1500
const MODEL_CATALOG_CACHE_MS = 30 * 1000
const MODEL_STREAM_TIMEOUT_MS = 110 * 1000
const DECAY_GRACE_MS = 24 * 3600 * 1000
const DECAY_PER_DAY = 2
const RELATIONSHIP_TOUCH_INTERVAL_MS = 6 * 60 * 60 * 1000
const AFFECTION_FLOOR = 0
const TOKEN_PER_POINT = 5000
const MAX_TOKEN_GAIN = 3
const MAX_CUSTOM_IMAGE_BYTES = 18 * 1024 * 1024
const MAX_CUSTOM_BG_DATA_URL_CHARS = 24 * 1024 * 1024
const MAX_CUSTOM_SPRITE_DATA_URL_CHARS = 24 * 1024 * 1024
const MAX_API_BODY_BYTES = MAX_CUSTOM_BG_DATA_URL_CHARS + 64 * 1024
const ACTIVITY_CACHE_MS = 60 * 1000
const ACTIVITY_SESSION_LIMIT = 16
const ACTIVITY_EVENT_LIMIT = 240
const MAX_GLOBAL_ACTIVITIES = 64
const EMOTION_KEYS = ['cheerful', 'shy', 'serious', 'confused', 'angry', 'frightened', 'exasperated', 'starry']
const MAX_USAGE_FINGERPRINTS = 2048
const PROFILE_FIELDS = ['displayName', 'address', 'greeting', 'persona', 'tone', 'visual'] as const
const PROFILE_LIMITS: Record<(typeof PROFILE_FIELDS)[number], number> = {
  displayName: 32,
  address: 24,
  greeting: 160,
  persona: 1200,
  tone: 600,
  visual: 800,
}

type NativeGlobalIo = {
  link: typeof nativeLink
  mkdir: typeof nativeMkdir
  open: typeof nativeOpen
  readFile: typeof nativeReadFile
  rename: typeof nativeRename
  rm: typeof nativeRm
  stat: typeof nativeStat
}

type NativeWriteExpectation =
  | { kind: 'createIfAbsent' }
  | { kind: 'replaceIfVersion'; version: string }
  | undefined

const DEFAULT_NATIVE_GLOBAL_IO: NativeGlobalIo = {
  link: nativeLink,
  mkdir: nativeMkdir,
  open: nativeOpen,
  readFile: nativeReadFile,
  rename: nativeRename,
  rm: nativeRm,
  stat: nativeStat,
}

function nativeGlobalError(code: string, message: string, cause?: unknown): Error {
  const error: any = new Error(message, cause === undefined ? undefined : { cause })
  error.code = code
  return error
}

function nativeMissing(error: any): boolean {
  return error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
}

function nativeVersion(info: any): string {
  return `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`
}

async function syncNativeDirectory(io: NativeGlobalIo, directory: string): Promise<void> {
  if (process.platform === 'win32') return
  const handle = await io.open(directory, 'r')
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

/**
 * Host-owned persistence for the one fixed, non-workspace Galgame save.
 *
 * DSH's ctx.fs intentionally applies the active session's workspace-write
 * fence, so it cannot be used to mutate DSH_HOME. This adapter never accepts a
 * caller-supplied path: its sole target is the exact path produced by
 * dshHomePath(...GLOBAL_SAVE_SEGMENTS). Workspace files continue to use ctx.fs.
 */
export function createNativeGlobalStorage(
  targetPath: string,
  io: NativeGlobalIo = DEFAULT_NATIVE_GLOBAL_IO,
  options: { createParent?: boolean } = {},
): any {
  if (!isAbsolute(targetPath)) {
    throw nativeGlobalError('GLOBAL_STORAGE_PATH_INVALID', 'Galgame global save path must be absolute')
  }
  const target = targetPath
  const parent = dirname(target)
  let writeTail: Promise<void> = Promise.resolve()

  async function probe(): Promise<{ type: 'file'; version: string; size: number } | undefined> {
    let info: any
    try {
      info = await io.stat(target, { bigint: true } as any)
    } catch (error) {
      if (nativeMissing(error)) return undefined
      throw error
    }
    if (!info.isFile()) {
      throw nativeGlobalError('FS_NOT_REGULAR_FILE', `Galgame global save is not a regular file: ${target}`)
    }
    return { type: 'file', version: nativeVersion(info), size: Number(info.size) }
  }

  async function readText(): Promise<string> {
    return String(await io.readFile(target, 'utf8'))
  }

  async function publish(content: string, expected?: NativeWriteExpectation): Promise<any> {
    if (options.createParent === false) {
      const parentInfo = await io.stat(parent, { bigint: true } as any)
      if (!parentInfo.isDirectory()) {
        throw nativeGlobalError('FS_NOT_DIRECTORY', `Galgame save parent is not a directory: ${parent}`)
      }
    } else {
      await io.mkdir(parent, { recursive: true, mode: 0o700 })
    }
    const existing = await probe()
    if (expected?.kind === 'createIfAbsent' && existing) {
      throw nativeGlobalError('FS_NOT_OBSERVED', 'Galgame global save appeared after it was observed absent')
    }
    if (expected?.kind === 'replaceIfVersion'
      && (!existing || existing.version !== expected.version)) {
      throw nativeGlobalError('FS_STALE_VERSION', 'Galgame global save changed since it was observed')
    }

    const temporary = join(parent, `.${randomUUID()}.tmp`)
    let handle: any = null
    try {
      handle = await io.open(temporary, 'wx', 0o600)
      await handle.writeFile(content, 'utf8')
      await handle.sync()
      await handle.close()
      handle = null

      // Re-check guarded replacements after the potentially long multi-MB
      // temp write. The per-adapter queue serializes in-process writers; this
      // second check also catches most external replacements before publish.
      if (expected?.kind === 'replaceIfVersion') {
        const current = await probe()
        if (!current || current.version !== expected.version) {
          throw nativeGlobalError('FS_STALE_VERSION', 'Galgame global save changed while its replacement was prepared')
        }
      }

      if (expected?.kind === 'createIfAbsent') {
        try {
          // Node has no portable rename-no-replace primitive. A same-volume
          // hard link gives create-if-absent atomicity without clobbering a
          // racing creator; ordinary creates/replacements use atomic rename.
          await io.link(temporary, target)
        } catch (error: any) {
          if (error && error.code === 'EEXIST') {
            throw nativeGlobalError('FS_NOT_OBSERVED', 'Galgame global save appeared while it was being created', error)
          }
          throw error
        }
        await io.rm(temporary, { force: true })
      } else {
        await io.rename(temporary, target)
      }
      await syncNativeDirectory(io, parent)
      const after = await probe()
      if (!after) throw nativeGlobalError('FS_IO_ERROR', 'Galgame global save disappeared after publication')
      return {
        operation: existing ? 'update' : 'create',
        version: after.version,
        before: null,
        after: content,
      }
    } finally {
      if (handle) {
        try { await handle.close() } catch { /* best effort */ }
      }
      try { await io.rm(temporary, { force: true }) } catch { /* best effort */ }
    }
  }

  return Object.freeze({
    target,
    stat: probe,
    readText,
    writeText(content: string, expected?: NativeWriteExpectation): Promise<any> {
      const run = writeTail.then(
        () => publish(content, expected),
        () => publish(content, expected),
      )
      writeTail = run.then(() => undefined, () => undefined)
      return run
    },
  })
}

/**
 * Native fallback for a registered workspace whose DSH ctx.fs write fence is
 * still bound to another active workspace. The caller supplies only a trusted
 * absolute workspace root; the basename is fixed here and cannot be escaped.
 */
export function createNativeWorkspaceStorage(rootPath: string, io: NativeGlobalIo = DEFAULT_NATIVE_GLOBAL_IO): any {
  if (!isAbsolute(rootPath)) {
    throw nativeGlobalError('WORKSPACE_STORAGE_PATH_INVALID', 'Galgame workspace root must be absolute')
  }
  const root = resolveNativePath(rootPath)
  const target = join(root, SAVE_NAME)
  const normalizedRoot = root.replace(/[\\/]+$/, '').toLowerCase()
  const normalizedParent = dirname(target).replace(/[\\/]+$/, '').toLowerCase()
  if (!normalizedRoot || normalizedParent !== normalizedRoot) {
    throw nativeGlobalError('WORKSPACE_STORAGE_PATH_INVALID', 'Galgame workspace marker escaped its registered root')
  }
  return createNativeGlobalStorage(target, io, { createParent: false })
}

function sanitizeProfileText(raw: any, limit: number): string {
  if (typeof raw !== 'string') return ''
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return Array.from(cleaned).slice(0, limit).join('')
}

function normalizeProfileOverrides(raw: any): Record<string, string> {
  const normalized: Record<string, string> = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return normalized
  for (const field of PROFILE_FIELDS) {
    const value = sanitizeProfileText(raw[field], PROFILE_LIMITS[field])
    if (value) normalized[field] = value
  }
  return normalized
}

function builtInProfile(charId: string): Record<string, string> {
  const ch = ROSTER[charId] || ROSTER.deepseek
  return {
    displayName: ch.name,
    address: ch.address,
    greeting: ch.greet,
    persona: ch.persona,
    tone: ch.tone,
    visual: ch.visual,
  }
}

function affectionCap(level: number): number {
  return 30 + (Math.max(1, level) - 1) * 15
}

function intimacyFor(level: number): string {
  const rows = [
    '你们刚认识，语气礼貌温柔。',
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

export function apply(
  ctx: any,
  config: any = {},
  internals: { nativeGlobalIo?: NativeGlobalIo; nativeWorkspaceIo?: NativeGlobalIo } = {},
): void {
  const webServer = ctx.webServer
  const llm = ctx.llm
  const cfg = {
    enabled: config.enabled !== false,
    sideStoryRecencyDays: (() => {
      const raw = Number(config.sideStoryRecencyDays)
      return Number.isFinite(raw) && raw >= 1 ? Math.min(Math.round(raw), 365) : 14
    })(),
    sideStoryCooldownMs: (() => {
      const raw = Number(config.sideStoryCooldownMinutes)
      const minutes = Number.isFinite(raw) && raw >= 0
        ? Math.min(raw, SIDE_STORY_COOLDOWN_MAX_MINUTES)
        : SIDE_STORY_COOLDOWN_DEFAULT_MINUTES
      return Math.round(minutes * 60 * 1000)
    })(),
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
  let sessionQuery: any
  let webSeam: any = null
  let lastSideStoryFailure = ''
  let dshHomePath: ((...segments: string[]) => string) | null = typeof ctx.dshHomePath === 'function'
    ? ctx.dshHomePath.bind(ctx)
    : null

  if (typeof ctx.inject === 'function') {
    ctx.inject(['fs', 'sandboxPolicy', 'sessions', 'workspaceRegistry', 'agentDefaultModel'], (scope: any) => {
      fs = scope.fs
      sandboxPolicy = scope.sandboxPolicy
      sessionsSvc = scope.sessions
      workspaceRegistry = scope.workspaceRegistry
      agentDefaultModel = scope.agentDefaultModel
    })
    ctx.inject(['sessionQuery'], (scope: any) => {
      sessionQuery = scope.sessionQuery
    })
    // Optional on purpose. Declaring 'web' in the module-level `inject` would
    // make it a hard dependency, and a profile without the web seam would fail
    // to load the whole plugin instead of just losing one seed source.
    ctx.inject(['web'], (scope: any) => {
      webSeam = scope.web
    })
  }

  const workspaceStateContext = new AsyncLocalStorage<any>()
  let legacyState: any = null
  let globalState: any = null
  let globalReadyPromise: Promise<void> | null = null
  let globalReadyError: any = null
  let globalStorage: any = null
  let activeWorkspaceRuntime: any = null
  const workspaceRuntimes = new Map<string, any>()
  const sessionWorkspaceCache = new Map<string, { root: string; key: string }>()
  let lastWorkspaceKey = ''
  let tokensObserved = 0
  let tokensAppliedRuntime = 0
  let boundActivitySessionId = ''
  let activityCache: HarnessActivity[] = []
  let activityCacheRoot = ''
  let activityCacheAt = 0
  let activityCacheGeneration = 0
  let activityRefreshPromise: Promise<void> | null = null
  let activityWarmTimer: ReturnType<typeof setTimeout> | null = null
  let viewMaintenancePromise: Promise<void> | null = null
  let viewMaintenanceNeedsSave = false
  let stateMutationMutex: Promise<void> = Promise.resolve()
  let legacyChatMutex: Promise<void> = Promise.resolve()
  let modelCatalogCache: { at: number; providers: any[]; rows: any[][] } | null = null
  let modelCatalogPending: Promise<{ providers: any[]; rows: any[][] }> | null = null
  let globalEventFlushTimer: ReturnType<typeof setTimeout> | null = null
  let globalEventDirty = false
  const choiceGenerationPending = new Set<string>()

  function currentWorkspaceRuntime(): any {
    return splitStorageActive() ? (workspaceStateContext.getStore() || activeWorkspaceRuntime) : null
  }

  function currentStateBacking(): any {
    const runtime = splitStorageActive() ? (workspaceStateContext.getStore() || activeWorkspaceRuntime) : null
    return runtime ? runtime.facade : legacyState
  }

  const s: any = new Proxy({}, {
    get(_target, property: string | symbol): any {
      const state = currentStateBacking()
      return state ? state[property as any] : undefined
    },
    set(_target, property: string | symbol, value: any): boolean {
      const state = currentStateBacking()
      if (!state) return false
      state[property as any] = value
      return true
    },
    ownKeys(): ArrayLike<string | symbol> {
      const state = currentStateBacking()
      return state ? Reflect.ownKeys(state) : []
    },
    getOwnPropertyDescriptor(): PropertyDescriptor {
      return { configurable: true, enumerable: true, writable: true }
    },
  })

  function ensureState(): any {
    const state = currentStateBacking()
    if (state) return state
    legacyState = fresh()
    return legacyState
  }

  function emptyCharacter(): any {
    return {
      affection: 0,
      level: 1,
      log: [],
      chatLines: [],
      choices: [],
      cgs: [],
      // Only opaque event fingerprints and a timestamp are persisted. Harness
      // message text never enters the Galgame save file.
      activity: normalizeActivityMemory(null),
      // Custom sprites belong to a character, just like her relationship
      // state. The image itself is only exposed through the sprite-data API.
      customSprite: { dataUrl: null, fileName: '', revision: 0 },
      // Built-in background choices are also character-local. The global
      // `s.bg` field remains reserved for explicit custom/CG overrides.
      chosenBuiltinBackground: null,
      // Only non-empty differences from the built-in profile are stored.
      profileOverrides: {},
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
      tokens: { bank: 0, lastActiveAt: 0 },
      bg: null,
      backgroundRevision: 0,
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

  const GLOBAL_CHARACTER_FIELDS = new Set([
    'affection',
    'level',
    'log',
    'chatLines',
    'choices',
    'activity',
    'cgs',
    'customSprite',
    'chosenBuiltinBackground',
    'profileOverrides',
  ])
  const GLOBAL_ROOT_FIELDS = new Set([
    'current',
    'lastCurrent',
    'tokens',
    'preferences',
    'bg',
    'backgroundRevision',
    'cg',
    'relationshipLastActiveAt',
    'activityFeed',
    // Skit state is global game progress, not a workspace marker. Without this
    // entry composeState routes it to the workspace save, which only stores a
    // source marker, so the cooldown and history would never reach disk.
    'sideStory',
    'modelOnline',
    'characterModelLabel',
    'chatModelLabel',
    'modelLabel',
    'lastModel',
    'fallbackUsed',
    'fallbackReason',
  ])
  const GLOBAL_PREFERENCE_FIELDS = [
    'enabled',
    'petEnabled',
    'characterMode',
    'characterId',
    'characterProvider',
    'characterModel',
    'chatMode',
    'chatProvider',
    'chatModel',
    'customBgName',
    'sideStoryCooldownMinutes',
    'sideStorySeedSource',
  ] as const

  function freshGlobalState(): any {
    const combined = fresh()
    return {
      kind: GLOBAL_SAVE_KIND,
      v: GLOBAL_SAVE_VERSION,
      current: combined.current,
      lastCurrent: combined.lastCurrent,
      characters: combined.characters,
      tokens: { bank: combined.tokens.bank, seenUsage: [] },
      bg: combined.bg,
      backgroundRevision: combined.backgroundRevision,
      cg: combined.cg,
      relationshipLastActiveAt: 0,
      activityFeed: [],
      preferences: combined.preferences,
      modelOnline: combined.modelOnline,
      characterModelLabel: combined.characterModelLabel,
      chatModelLabel: combined.chatModelLabel,
      modelLabel: combined.modelLabel,
      lastModel: combined.lastModel,
      fallbackUsed: combined.fallbackUsed,
      fallbackReason: combined.fallbackReason,
      // Side-story run state. Purely additive, so the save version stays at 2:
      // an older build reading this file ignores the field instead of latching
      // the whole save as an unrecognized version.
      sideStory: normalizeSideStory(null),
      // Claims record which global choices have already been established.
      // Legacy workspace imports may fill an unclaimed field once, but can
      // never overwrite a value chosen in the new global store.
      migration: {
        imports: [],
        contextImports: [],
        claims: {
          preferences: [],
          profiles: {},
          sprites: [],
          bg: false,
          cg: false,
          relationshipReset: false,
        },
      },
    }
  }

  function freshWorkspaceState(workspaceKey = ''): any {
    return {
      kind: WORKSPACE_SAVE_KIND,
      v: WORKSPACE_SAVE_VERSION,
      // A workspace is only an event source. Game progress lives in global.json.
      source: {
        workspaceKey: typeof workspaceKey === 'string' ? workspaceKey : '',
        migratedAt: 0,
      },
    }
  }

  function replaceGlobalStateInPlace(replacement: any): void {
    if (!globalState || typeof globalState !== 'object') {
      globalState = replacement
      return
    }
    const existingCharacters = globalState.characters && typeof globalState.characters === 'object'
      ? globalState.characters
      : {}
    for (const id of ROSTER_IDS) {
      const target = existingCharacters[id] && typeof existingCharacters[id] === 'object'
        ? existingCharacters[id]
        : {}
      for (const key of Reflect.ownKeys(target)) delete target[key as any]
      Object.assign(target, replacement.characters[id])
      existingCharacters[id] = target
    }
    for (const key of Reflect.ownKeys(globalState)) {
      if (key !== 'characters') delete globalState[key as any]
    }
    Object.assign(globalState, { ...replacement, characters: existingCharacters })
  }

  function replaceWorkspaceStateInPlace(runtime: any, replacement: any): void {
    if (!runtime || !replacement || typeof replacement !== 'object') return
    if (!runtime.state || typeof runtime.state !== 'object') {
      runtime.state = replacement
      runtime.facade = composeState(globalState, runtime.state)
      return
    }
    for (const key of Reflect.ownKeys(runtime.state)) delete runtime.state[key as any]
    Object.assign(runtime.state, replacement)
  }

  function composeState(globalData: any, workspaceData: any): any {
    const characters: Record<string, any> = {}
    for (const id of ROSTER_IDS) {
      const globalCharacter = globalData.characters[id]
      const workspaceCharacter = workspaceData && workspaceData.characters
        && workspaceData.characters[id] && typeof workspaceData.characters[id] === 'object'
        ? workspaceData.characters[id]
        : {}
      characters[id] = new Proxy({}, {
        get(_target, property: string | symbol): any {
          if (typeof property === 'string' && GLOBAL_CHARACTER_FIELDS.has(property)) {
            return globalCharacter[property]
          }
          return workspaceCharacter[property as any]
        },
        set(_target, property: string | symbol, value: any): boolean {
          if (typeof property === 'string' && GLOBAL_CHARACTER_FIELDS.has(property)) {
            globalCharacter[property] = value
          } else {
            workspaceCharacter[property as any] = value
          }
          return true
        },
        ownKeys(): ArrayLike<string | symbol> {
          return Array.from(new Set([...Reflect.ownKeys(globalCharacter), ...Reflect.ownKeys(workspaceCharacter)]))
        },
        getOwnPropertyDescriptor(): PropertyDescriptor {
          return { configurable: true, enumerable: true, writable: true }
        },
      })
    }
    return new Proxy({}, {
      get(_target, property: string | symbol): any {
        if (property === 'characters') return characters
        if (typeof property === 'string' && GLOBAL_ROOT_FIELDS.has(property)) return globalData[property]
        return workspaceData[property as any]
      },
      set(_target, property: string | symbol, value: any): boolean {
        if (property === 'characters') return false
        if (typeof property === 'string' && GLOBAL_ROOT_FIELDS.has(property)) globalData[property] = value
        else workspaceData[property as any] = value
        return true
      },
      ownKeys(): ArrayLike<string | symbol> {
        return Array.from(new Set(['characters', ...Reflect.ownKeys(globalData), ...Reflect.ownKeys(workspaceData)]))
      },
      getOwnPropertyDescriptor(): PropertyDescriptor {
        return { configurable: true, enumerable: true, writable: true }
      },
    })
  }

  function makeWorkspaceRuntime(root: string, key: string, state = freshWorkspaceState(key)): any {
    return {
      root,
      key,
      state,
      facade: composeState(globalState, state),
      readyPromise: null,
      tokensObserved: 0,
      tokensAppliedRuntime: 0,
      boundActivitySessionId: '',
      activityCache: [] as HarnessActivity[],
      activityCacheRoot: root,
      activityCacheAt: 0,
      activityCacheGeneration: 0,
      activityRefreshPromise: null,
      activityWarmTimer: null,
      viewMaintenancePromise: null,
      viewMaintenanceNeedsSave: false,
      chatMutex: Promise.resolve(),
    }
  }

  function activateWorkspaceRuntime(runtime: any): void {
    activeWorkspaceRuntime = runtime
    lastWorkspaceKey = runtime && runtime.key ? runtime.key : lastWorkspaceKey
  }

  function clamp(n: number): number {
    return Number.isFinite(n) ? Math.max(0, n) : 0
  }

  function validBackgroundRevision(value: any): boolean {
    return Number.isSafeInteger(value) && value >= 0
  }

  function backgroundRevisionFor(value: any): number {
    return validBackgroundRevision(value) ? value : 0
  }

  function nextBackgroundRevision(value: any): number {
    const current = backgroundRevisionFor(value)
    return current >= Number.MAX_SAFE_INTEGER ? 0 : current + 1
  }

  function bumpBackgroundRevision(): number {
    ensureState()
    const next = nextBackgroundRevision(s.backgroundRevision)
    s.backgroundRevision = next
    return next
  }

  function captureBackgroundMutationSnapshot(): any {
    ensureState()
    const currentCharacter = s.characters && s.characters[s.current]
    const migration = splitStorageActive() && globalState ? globalState.migration : undefined
    return {
      bg: s.bg,
      backgroundRevision: s.backgroundRevision,
      preferences: { ...(s.preferences || {}) },
      currentCharacter,
      chosenBuiltinBackground: currentCharacter ? currentCharacter.chosenBuiltinBackground : null,
      cgs: allCgs().map((cg: any) => ({
        cg,
        seen: cg.seen,
        savedAsBg: cg.savedAsBg,
      })),
      migration: migration === undefined ? undefined : JSON.parse(JSON.stringify(migration)),
    }
  }

  function restoreBackgroundMutationSnapshot(snapshot: any): void {
    if (!snapshot) return
    s.bg = snapshot.bg
    s.backgroundRevision = snapshot.backgroundRevision
    s.preferences = snapshot.preferences
    if (snapshot.currentCharacter) {
      snapshot.currentCharacter.chosenBuiltinBackground = snapshot.chosenBuiltinBackground
    }
    for (const entry of snapshot.cgs || []) {
      entry.cg.seen = entry.seen
      entry.cg.savedAsBg = entry.savedAsBg
    }
    if (splitStorageActive() && globalState) globalState.migration = snapshot.migration
  }

  async function persistBackgroundMutation(snapshot: any): Promise<void> {
    try {
      await save('global')
    } catch (err) {
      restoreBackgroundMutationSnapshot(snapshot)
      throw err
    }
  }

  function makeId(prefix: string): string {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
  }

  /**
   * Per-character affection deltas for one choice. Main-line choices leave this
   * empty and settle through `effect` on the speaking character alone; side
   * stories fill it so one choice can move the whole cast.
   */
  function normalizeChoiceEffects(raw: any): Record<string, number> {
    const out: Record<string, number> = {}
    if (!raw || typeof raw !== 'object') return out
    for (const id of ROSTER_IDS) {
      const value = (raw as any)[id]
      if (value === 1 || value === -1 || value === 0) out[id] = value
    }
    return out
  }

  function normalizeChoice(choice: any, index = 0): any {
    if (typeof choice === 'string') {
      return { id: makeId('legacy-choice-' + index), text: choice.trim().slice(0, 30), effect: 0 }
    }
    if (!choice || typeof choice !== 'object' || typeof choice.text !== 'string' || !choice.text.trim()) return null
    const effect = choice.effect === 1 ? 1 : choice.effect === -1 ? -1 : 0
    const base: any = {
      id: typeof choice.id === 'string' && choice.id ? choice.id : makeId('choice-' + index),
      text: choice.text.trim().slice(0, 30),
      effect,
    }
    // Main-line choices settle on the speaking character alone and stay exactly
    // as they were on disk; only a multi-character choice carries the map.
    const effects = normalizeChoiceEffects(choice.effects)
    if (Object.keys(effects).length > 0) base.effects = effects
    return base
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
    const marker = [
      '画面元素呼应主人最近的经历与工作：',
      '画面元素呼应对方最近的经历与工作：',
    ].find((candidate) => prompt.includes(candidate)) || ''
    if (!marker) return prompt.slice(0, 1200)
    const markerAt = prompt.indexOf(marker)

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

  function opaqueFingerprint(prefix: string, value: string): string {
    let hash = 2166136261
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
    return prefix + (hash >>> 0).toString(36)
  }

  function normalizeGlobalTokens(raw: any): any {
    const seenUsage = raw && Array.isArray(raw.seenUsage)
      ? Array.from(new Set(raw.seenUsage.filter((value: any) => (
        typeof value === 'string' && /^usage-[a-z0-9]+$/i.test(value)
      )))).slice(-MAX_USAGE_FINGERPRINTS)
      : []
    return {
      bank: raw && typeof raw.bank === 'number' ? Math.max(0, raw.bank) : 0,
      seenUsage,
    }
  }

  function normalizeSafeActivity(raw: any, sourceKey = ''): HarnessActivity & { sourceKey: string } | null {
    if (!raw || typeof raw !== 'object'
      || typeof raw.fingerprint !== 'string'
      || !/^activity-[a-z0-9]+$/i.test(raw.fingerprint)
      || typeof raw.category !== 'string'
      || typeof raw.label !== 'string'
      || !['active', 'completed', 'paused', 'blocked'].includes(raw.status)
      || !Number.isFinite(raw.time)) return null
    const clean = (value: any, limit: number): string => String(value || '')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/\b[A-Za-z]:[\\/][^\s，。；！？,;]+/g, ' ')
      .replace(/\b(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, limit)
    return {
      fingerprint: raw.fingerprint,
      category: raw.category as any,
      label: clean(raw.label, 40),
      status: raw.status,
      time: Math.max(0, Math.floor(raw.time)),
      chatHint: clean(raw.chatHint, 500),
      cgHint: clean(raw.cgHint, 360),
      sourceKey: typeof raw.sourceKey === 'string' && /^ws-[a-f0-9]+$/i.test(raw.sourceKey)
        ? raw.sourceKey
        : sourceKey,
    }
  }

  function normalizeActivityFeed(raw: any): Array<HarnessActivity & { sourceKey: string }> {
    const rows = Array.isArray(raw) ? raw : []
    const byFingerprint = new Map<string, HarnessActivity & { sourceKey: string }>()
    for (const row of rows) {
      const safe = normalizeSafeActivity(row)
      if (!safe) continue
      const previous = byFingerprint.get(safe.fingerprint)
      if (!previous || safe.time >= previous.time) byFingerprint.set(safe.fingerprint, safe)
    }
    return [...byFingerprint.values()]
      .sort((left, right) => right.time - left.time || left.fingerprint.localeCompare(right.fingerprint))
      .slice(0, MAX_GLOBAL_ACTIVITIES)
  }

  /**
   * Models overshoot the 40-character budget constantly. A hard slice leaves
   * sentences chopped mid-word on screen, so trim back to the last sentence
   * ending inside the allowance and mark an elision when there is none.
   */
  function trimBeatText(raw: string): string {
    const text = raw.trim()
    if (text.length <= SIDE_STORY_BEAT_LIMIT) return text
    const window = text.slice(0, SIDE_STORY_BEAT_HARD_LIMIT)
    const stops = ['。', '！', '？', '～', '…', '」', '】', '.', '!', '?']
    let cut = -1
    for (const stop of stops) cut = Math.max(cut, window.lastIndexOf(stop))
    // Only honour a break that keeps most of the line; otherwise elide.
    if (cut >= Math.floor(SIDE_STORY_BEAT_LIMIT * 0.6)) return window.slice(0, cut + 1)
    return window.slice(0, SIDE_STORY_BEAT_LIMIT - 1) + '…'
  }

  /**
   * The cast brief hands the model lowercase roster ids, and it sometimes writes
   * one straight into the narration ("grok凑过来"). Swap those back to display
   * names. Case-sensitive on purpose: real model names appear capitalised
   * ("听说 Kimi 慢"), and those are legitimate rumour material to keep.
   */
  function humanizeRosterIds(text: string): string {
    let out = text
    for (const id of ROSTER_IDS) {
      const name = effectiveProfileFor(id).displayName
      if (!name || name === id) continue
      out = out.replace(new RegExp('(^|[^A-Za-z0-9-])' + id + '(?![A-Za-z0-9-])', 'g'), '$1' + name)
    }
    return out
  }

  function normalizeSideStoryBeat(raw: any): any | null {
    if (!raw || typeof raw !== 'object' || typeof raw.text !== 'string') return null
    const text = trimBeatText(humanizeRosterIds(raw.text))
    if (!text) return null
    const speaker = raw.speaker === 'narrator' || raw.speaker === 'user' || ROSTER[raw.speaker]
      ? raw.speaker
      : null
    if (!speaker) return null
    const emotion = typeof raw.emotion === 'string' && EMOTION_KEYS.indexOf(raw.emotion) >= 0
      ? raw.emotion
      : 'cheerful'
    return speaker === 'narrator' || speaker === 'user' ? { speaker, text } : { speaker, text, emotion }
  }

  /**
   * @param slot - which interlude these belong to. Ids are scoped to it because
   * one scene now carries several choice sets, and `makeId` alone can repeat
   * inside the same millisecond.
   */
  function normalizeSideStoryChoiceList(raw: any, cast: string[], slot: number): any[] {
    const rows = Array.isArray(raw) ? raw : []
    return rows
      .map((choice: any, index: number) => {
        const normalized = normalizeChoice(choice, index)
        if (!normalized) return null
        const restoredId = choice && typeof choice.id === 'string' && choice.id ? choice.id : ''
        normalized.id = restoredId || makeId('choice-' + slot + '-' + index)
        // Effects may only touch the cast, and only by a single step.
        const source = (choice && choice.effects) || {}
        const effects: Record<string, number> = {}
        for (const id of cast) {
          const value = source[id]
          if (value === 1 || value === -1) effects[id] = value
        }
        // How the cast answers this particular line. Without it the master
        // speaks into a void and the scene just stalls.
        const reply = (choice && Array.isArray(choice.reply) ? choice.reply : [])
          .map((beat: any) => normalizeSideStoryBeat(beat))
          .filter((beat: any) => beat && beat.speaker !== 'user'
            && (beat.speaker === 'narrator' || cast.indexOf(beat.speaker) >= 0))
          .slice(0, 2)
        return reply.length ? { ...normalized, effects, reply } : null
      })
      .filter(Boolean)
      .slice(0, 3)
  }

  /**
   * The model writes acts; the runtime plays one flat beat list. Flattening here
   * keeps the cursor a simple index while still giving the master more than one
   * place to speak: each act boundary becomes an interlude anchored to the beat
   * it follows.
   */
  function normalizeSideStoryScene(raw: any): any | null {
    if (!raw || typeof raw !== 'object') return null
    const cast = Array.isArray(raw.cast)
      ? [...new Set(raw.cast.filter((id: any) => typeof id === 'string' && ROSTER[id]))].slice(0, SIDE_STORY_MAX_CAST)
      : []
    if (cast.length < SIDE_STORY_MIN_CAST) return null

    const beats: any[] = []
    const interludes: any[] = []
    const acceptBeat = (beat: any) => beat
      && (beat.speaker === 'narrator' || beat.speaker === 'user' || cast.indexOf(beat.speaker) >= 0)

    if (Array.isArray(raw.acts)) {
      for (const act of raw.acts) {
        if (!act || typeof act !== 'object') continue
        const actBeats = (Array.isArray(act.beats) ? act.beats : [])
          .map((beat: any) => normalizeSideStoryBeat(beat))
          .filter(acceptBeat)
        if (!actBeats.length) continue
        for (const beat of actBeats) {
          if (beats.length >= SIDE_STORY_MAX_BEATS) break
          beats.push(beat)
        }
        const choices = normalizeSideStoryChoiceList(act.choices, cast, interludes.length)
        if (choices.length === 3) {
          interludes.push({ at: beats.length - 1, consumed: false, choices })
        }
      }
    } else {
      // Restored saves and older payloads carry the flat shape.
      for (const beat of (Array.isArray(raw.beats) ? raw.beats : []).map((b: any) => normalizeSideStoryBeat(b)).filter(acceptBeat)) {
        if (beats.length >= SIDE_STORY_MAX_BEATS + 8) break
        beats.push(beat)
      }
      const restored = Array.isArray(raw.interludes) ? raw.interludes : []
      for (const row of restored) {
        if (!row || typeof row !== 'object') continue
        const at = Math.floor(Number(row.at))
        if (!Number.isFinite(at) || at < 0 || at >= beats.length) continue
        const choices = normalizeSideStoryChoiceList(row.choices, cast, interludes.length)
        if (row.consumed === true) interludes.push({ at, consumed: true, choices: [] })
        else if (choices.length === 3) interludes.push({ at, consumed: false, choices })
      }
    }
    if (!beats.length) return null
    // A skit with no place for the master to speak is exactly the passive
    // cutscene this feature is not supposed to be.
    if (!interludes.length) return null

    const seedKind = raw.seed && (raw.seed.kind === 'activity' || raw.seed.kind === 'manual' || raw.seed.kind === 'web')
      ? raw.seed.kind
      : 'activity'
    const seedSummary = raw.seed && typeof raw.seed.summary === 'string' ? raw.seed.summary.trim().slice(0, 120) : ''
    const sources = (Array.isArray(raw.sources) ? raw.sources : [])
      .filter((row: any) => row && typeof row.url === 'string' && /^https?:\/\//i.test(row.url))
      .slice(0, 5)
      .map((row: any) => ({
        url: row.url,
        title: typeof row.title === 'string' && row.title.trim() ? row.title.trim().slice(0, 80) : row.url,
      }))
    const cursor = Math.max(0, Math.min(beats.length - 1, Math.floor(Number(raw.cursor) || 0)))
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : makeId('side-story'),
      createdAt: Math.max(0, Math.floor(Number(raw.createdAt) || 0)),
      seed: { kind: seedKind, summary: seedSummary },
      frame: typeof raw.frame === 'string' ? raw.frame.slice(0, 40) : '',
      twist: typeof raw.twist === 'string' ? raw.twist.slice(0, 40) : '',
      subject: ROSTER[raw.subject] ? raw.subject : cast[0],
      sources,
      cast,
      beats,
      interludes,
      // Effects accumulate across interludes so the closing line reports the
      // whole scene, not just the last thing the master said.
      applied: (() => {
        const out: Record<string, number> = {}
        const source = raw.applied && typeof raw.applied === 'object' ? raw.applied : {}
        for (const id of cast) {
          const value = Math.round(Number(source[id]))
          if (Number.isFinite(value) && value !== 0) out[id] = value
        }
        return out
      })(),
      cursor,
      settled: raw.settled === true,
    }
  }


  function normalizeSideStory(raw: any): any {
    const history = (Array.isArray(raw && raw.history) ? raw.history : [])
      .filter((row: any) => row && typeof row === 'object' && typeof row.digest === 'string' && row.digest)
      .slice(-SIDE_STORY_HISTORY_LIMIT)
      .map((row: any) => ({
        at: Math.max(0, Math.floor(Number(row.at) || 0)),
        digest: String(row.digest).slice(0, 120),
        frame: typeof row.frame === 'string' ? row.frame.slice(0, 40) : '',
        subject: ROSTER[row.subject] ? row.subject : '',
        twist: typeof row.twist === 'string' ? row.twist.slice(0, 40) : '',
        cast: Array.isArray(row.cast) ? row.cast.filter((id: any) => ROSTER[id]).slice(0, SIDE_STORY_MAX_CAST) : [],
      }))
    const transcripts = (Array.isArray(raw && raw.transcripts) ? raw.transcripts : [])
      .filter((row: any) => row && typeof row === 'object' && Array.isArray(row.lines) && row.lines.length)
      .slice(-SIDE_STORY_TRANSCRIPT_LIMIT)
      .map((row: any) => ({
        id: typeof row.id === 'string' && row.id ? row.id : makeId('skit'),
        at: Math.max(0, Math.floor(Number(row.at) || 0)),
        seed: typeof row.seed === 'string' ? row.seed.slice(0, 120) : '',
        cast: Array.isArray(row.cast) ? row.cast.filter((id: any) => ROSTER[id]).slice(0, SIDE_STORY_MAX_CAST) : [],
        cgId: typeof row.cgId === 'string' ? row.cgId : '',
        lines: row.lines
          .filter((line: any) => line && typeof line.text === 'string' && line.text)
          .slice(0, (SIDE_STORY_MAX_BEATS + 6))
          .map((line: any) => ({
            who: line.who === 'user' || line.who === 'heroine' ? line.who : 'narrator',
            name: typeof line.name === 'string' ? line.name.slice(0, 24) : '',
            text: String(line.text).slice(0, SIDE_STORY_BEAT_LIMIT + 8),
          })),
      }))
    return {
      lastRunAt: Math.max(0, Math.floor(Number(raw && raw.lastRunAt) || 0)),
      scene: normalizeSideStoryScene(raw && raw.scene),
      history,
      transcripts,
    }
  }

  function mergeGlobalActivityFeed(rows: readonly HarnessActivity[], sourceKey: string): boolean {
    if (!splitStorageActive() || !globalState || !Array.isArray(rows) || rows.length === 0) return false
    const before = JSON.stringify(globalState.activityFeed || [])
    globalState.activityFeed = normalizeActivityFeed([
      ...(globalState.activityFeed || []),
      ...rows.map((row) => ({ ...row, sourceKey })),
    ])
    return JSON.stringify(globalState.activityFeed) !== before
  }

  function globalActivityCandidates(): HarnessActivity[] {
    if (splitStorageActive() && globalState) return normalizeActivityFeed(globalState.activityFeed)
    return activityCache
  }

  function findCg(cgId: string): any {
    if (!currentStateBacking() || !cgId) return null
    for (const charId of ROSTER_IDS) {
      const cgs = s.characters && s.characters[charId] && Array.isArray(s.characters[charId].cgs)
        ? s.characters[charId].cgs
        : []
      const cg = cgs.find((item: any) => item && item.id === cgId)
      if (cg) return cg
    }
    return null
  }

  function findGlobalCg(cgId: string): any {
    if (!globalState || !globalState.characters || !cgId) return null
    for (const charId of ROSTER_IDS) {
      const rows = globalState.characters[charId] && Array.isArray(globalState.characters[charId].cgs)
        ? globalState.characters[charId].cgs
        : []
      const match = rows.find((item: any) => item && item.id === cgId)
      if (match) return match
    }
    return null
  }

  function allCgs(): any[] {
    if (!currentStateBacking()) return []
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

  function splitStorageActive(): boolean {
    return typeof dshHomePath === 'function'
  }

  function normalizedWorkspacePath(value: any): string {
    return typeof value === 'string'
      ? value.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase()
      : ''
  }

  function sameWorkspace(left: any, right: any): boolean {
    const a = normalizedWorkspacePath(left)
    const b = normalizedWorkspacePath(right)
    return !!a && a === b
  }

  function activityWorkspaceRoot(): string {
    const runtime = splitStorageActive() ? currentWorkspaceRuntime() : null
    if (runtime && runtime.root) {
      return runtime.root
    }
    return workspaceRoot() || ''
  }

  function registeredWorkspaceRoot(candidate: string): string {
    if (!candidate) return ''
    try {
      const rows = workspaceRegistry && typeof workspaceRegistry.list === 'function'
        ? workspaceRegistry.list()
        : []
      if (!Array.isArray(rows) || rows.length === 0) return ''
      const match = rows.find((row: any) => row && sameWorkspace(row.path, candidate))
      return match && typeof match.path === 'string' ? match.path : ''
    } catch (err) {
      return ''
    }
  }

  function headerFromSessionRow(row: any): any {
    if (!row || typeof row !== 'object') return null
    return row.header && typeof row.header === 'object' ? row.header : row
  }

  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | null = null
    try {
      return await Promise.race([
        promise,
        new Promise<T>((resolve) => {
          timer = setTimeout(() => resolve(fallback), timeoutMs)
        }),
      ])
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  async function sessionHeader(rawSessionId: any): Promise<any> {
    const sessionId = typeof rawSessionId === 'string' ? rawSessionId.trim().slice(0, 240) : ''
    if (!sessionId) return null
    try {
      if (sessionsSvc && typeof sessionsSvc.list === 'function') {
        const rows = sessionsSvc.list()
        const live = Array.isArray(rows)
          ? rows.map(headerFromSessionRow).find((header: any) => header && header.id === sessionId)
          : null
        if (live) return live
      }
    } catch (err) { /* fall through to the lightweight persistence listing */ }
    try {
      if (sessionQuery && typeof sessionQuery.listSessions === 'function') {
        const rows = await withTimeout(Promise.resolve(sessionQuery.listSessions()), SESSION_LOOKUP_TIMEOUT_MS, [])
        if (Array.isArray(rows)) {
          const match = rows.map(headerFromSessionRow).find((header: any) => header && header.id === sessionId)
          if (match) return match
        }
      }
    } catch (err) { /* unresolved sessions receive an isolated fresh context */ }
    return null
  }

  async function workspaceForSession(rawSessionId: any): Promise<{ root: string; key: string; sessionId: string }> {
    const sessionId = typeof rawSessionId === 'string' ? rawSessionId.trim().slice(0, 240) : ''
    if (sessionId) {
      const cached = sessionWorkspaceCache.get(sessionId)
      if (cached) return { ...cached, sessionId }
      const header = await sessionHeader(sessionId)
      if (header && typeof header.cwd === 'string' && header.cwd.trim()) {
        const root = registeredWorkspaceRoot(header.cwd) || header.cwd
        const key = normalizedWorkspacePath(root)
        if (key) {
          const resolved = { root, key }
          sessionWorkspaceCache.set(sessionId, resolved)
          return { ...resolved, sessionId }
        }
      }
      // A temporarily unavailable header must never route a session-scoped
      // mutation into workspaceRegistry[0]. Keep it isolated in memory and
      // retry lightweight resolution on the next request/event.
      return { root: '', key: 'unresolved:' + sessionId, sessionId }
    }
    // An unscoped overlay has no authority to borrow workspaceRegistry[0].
    // It receives the shared global state plus a fresh, non-persisted local
    // facade; workspace-bound mutations are rejected by handleAction.
    return { root: '', key: 'ephemeral:unscoped', sessionId }
  }

  async function bindActivitySession(rawSessionId: any): Promise<'unscoped' | 'matched' | 'mismatch'> {
    const sessionId = typeof rawSessionId === 'string' ? rawSessionId.trim().slice(0, 240) : ''
    if (!splitStorageActive()) {
      if (!sessionId) return 'unscoped'
      if (sessionId === boundActivitySessionId) return 'matched'
      const header = await sessionHeader(sessionId)
      const verifiedRoot = registeredWorkspaceRoot(header && header.cwd)
      const stateRoot = activityWorkspaceRoot()
      if (!verifiedRoot || !sameWorkspace(header && header.cwd, stateRoot)) return 'mismatch'
      boundActivitySessionId = sessionId
      activityCacheGeneration += 1
      activityCacheAt = 0
      return 'matched'
    }

    await ensureGlobalReady()
    const scopedRuntime = workspaceStateContext.getStore()
    if (scopedRuntime) {
      if (!sessionId) return 'unscoped'
      if (scopedRuntime.boundActivitySessionId === sessionId) return 'matched'
      scopedRuntime.boundActivitySessionId = sessionId
      scopedRuntime.activityCacheGeneration += 1
      scopedRuntime.activityCacheAt = 0
      return 'matched'
    }
    const descriptor = await workspaceForSession(sessionId)
    const runtime = await ensureWorkspaceReady(descriptor.root, descriptor.key)
    activateWorkspaceRuntime(runtime)
    if (!sessionId) return 'unscoped'
    if (runtime.boundActivitySessionId === sessionId) return 'matched'
    runtime.boundActivitySessionId = sessionId
    runtime.activityCacheGeneration += 1
    runtime.activityCacheAt = 0
    return 'matched'
  }

  async function collectActivitySessions(root: string): Promise<any[]> {
    const snapshots: any[] = []
    const seen = new Set<string>()

    // Prefer the live store: it already carries the event bodies needed for
    // safe task classification and never performs a whole-session disk read.
    if (sessionsSvc && typeof sessionsSvc.list === 'function') {
      try {
        const live = sessionsSvc.list()
        for (const session of Array.isArray(live) ? live : []) {
          const header = headerFromSessionRow(session)
          const id = String(header.id || '')
          if (!id || seen.has(id) || !sameWorkspace(header.cwd, root) || header.origin === 'subagent') continue
          seen.add(id)
          const fullEvents = Array.isArray(session.events) ? session.events : []
          const eventStart = Math.max(0, fullEvents.length - ACTIVITY_EVENT_LIMIT)
          const inherited = Number.isSafeInteger(header.seedLength) && header.seedLength > 0
            ? Math.max(0, Math.min(header.seedLength, fullEvents.length) - eventStart)
            : 0
          snapshots.push({
            id,
            header: { ...header, seedLength: inherited },
            events: fullEvents.slice(eventStart),
          })
        }
      } catch (err) { /* fall through to bounded event listings */ }
    }

    // Some SessionQuery implementations expose complete event rows from
    // listEvents. Admit only those rows; metadata-only listings are useful for
    // ranking but cannot be mistaken for message content.
    if (sessionQuery && typeof sessionQuery.listSessions === 'function'
      && typeof sessionQuery.listEvents === 'function') {
      try {
        const records = await withTimeout(Promise.resolve(sessionQuery.listSessions()), SESSION_LOOKUP_TIMEOUT_MS, [])
        const boundId = currentWorkspaceRuntime()
          ? currentWorkspaceRuntime().boundActivitySessionId
          : boundActivitySessionId
        const candidates = (Array.isArray(records) ? records : [])
          .filter((row: any) => {
            const header = headerFromSessionRow(row)
            return header && header.origin !== 'subagent' && sameWorkspace(header.cwd, root)
          })
          .sort((left: any, right: any) => {
            const a = headerFromSessionRow(left)
            const b = headerFromSessionRow(right)
            if ((a.id === boundId) !== (b.id === boundId)) return a.id === boundId ? -1 : 1
            return Number(b.createdAt || 0) - Number(a.createdAt || 0)
          })
          .slice(0, ACTIVITY_SESSION_LIMIT)
        const rows = await Promise.all(candidates.map(async (record: any) => {
          const header = headerFromSessionRow(record)
          try {
            const events = await withTimeout(Promise.resolve(sessionQuery.listEvents(header.id)), SESSION_LOOKUP_TIMEOUT_MS, [])
            return { header, events }
          } catch (err) {
            return { header, events: [] }
          }
        }))
        for (const row of rows) {
          const header = row.header
          const id = String(header && header.id || '')
          if (!id || seen.has(id)) continue
          const completeEvents = Array.isArray(row.events)
            ? row.events.filter((event: any) => event && event.data && typeof event.type === 'string')
            : []
          if (completeEvents.length === 0) continue
          seen.add(id)
          const eventStart = Math.max(0, completeEvents.length - ACTIVITY_EVENT_LIMIT)
          const inherited = Number.isSafeInteger(header.seedLength) && header.seedLength > 0
            ? Math.max(0, Math.min(header.seedLength, completeEvents.length) - eventStart)
            : 0
          snapshots.push({
            id,
            header: { ...header, seedLength: inherited },
            events: completeEvents.slice(eventStart),
          })
        }
      } catch (err) {
        console.warn('whale-galgame activity history unavailable:', err)
      }
    }
    return snapshots
  }

  async function refreshActivityCache(force = false): Promise<void> {
    const runtime = currentWorkspaceRuntime()
    if (runtime) {
      const root = runtime.root
      if (!root) {
        runtime.activityCache = []
        return
      }
      const now = Date.now()
      if (!force && sameWorkspace(runtime.activityCacheRoot, root)
        && now - runtime.activityCacheAt < ACTIVITY_CACHE_MS) return
      if (runtime.activityRefreshPromise) {
        await runtime.activityRefreshPromise
        if (!force && sameWorkspace(runtime.activityCacheRoot, root)
          && Date.now() - runtime.activityCacheAt < ACTIVITY_CACHE_MS) return
      }
      runtime.activityRefreshPromise = (async () => {
        for (let attempt = 0; attempt < 2; attempt++) {
          const requestedGeneration = runtime.activityCacheGeneration
          const snapshots = await collectActivitySessions(root)
          const next = collectHarnessActivities(snapshots, root)
          if (runtime.activityCacheGeneration !== requestedGeneration) {
            runtime.activityCacheAt = 0
            if (attempt === 0) continue
            runtime.activityCache = []
            runtime.activityCacheRoot = root
            return
          }
          runtime.activityCache = next
          runtime.activityCacheRoot = root
          runtime.activityCacheAt = Date.now()
          if (mergeGlobalActivityFeed(next, workspaceImportKey(root))) scheduleGlobalEventFlush()
          return
        }
      })()
      try {
        await runtime.activityRefreshPromise
      } finally {
        runtime.activityRefreshPromise = null
      }
      return
    }
    const root = activityWorkspaceRoot()
    if (!root) {
      activityCache = []
      return
    }
    const now = Date.now()
    if (!force && sameWorkspace(activityCacheRoot, root) && now - activityCacheAt < ACTIVITY_CACHE_MS) return
    if (activityRefreshPromise) {
      await activityRefreshPromise
      if (!force && sameWorkspace(activityCacheRoot, root) && Date.now() - activityCacheAt < ACTIVITY_CACHE_MS) return
    }
    const requestedRoot = root
    activityRefreshPromise = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const requestedGeneration = activityCacheGeneration
        const snapshots = await collectActivitySessions(requestedRoot)
        const next = collectHarnessActivities(snapshots, requestedRoot)
        if (!sameWorkspace(activityWorkspaceRoot(), requestedRoot)) return
        if (activityCacheGeneration !== requestedGeneration) {
          activityCacheAt = 0
          if (attempt === 0) continue
          // Prefer omitting one proactive reference over using a stale digest.
          activityCache = []
          activityCacheRoot = requestedRoot
          return
        }
        activityCache = next
        activityCacheRoot = requestedRoot
        activityCacheAt = Date.now()
        return
      }
    })()
    try {
      await activityRefreshPromise
    } finally {
      activityRefreshPromise = null
    }
  }

  function scheduleActivityWarmup(delayMs = 0): void {
    const runtime = currentWorkspaceRuntime()
    if (runtime) {
      if (runtime.activityWarmTimer) clearTimeout(runtime.activityWarmTimer)
      runtime.activityWarmTimer = setTimeout(() => {
        runtime.activityWarmTimer = null
        void workspaceStateContext.run(runtime, () => refreshActivityCache()).catch((err) => {
          console.warn('whale-galgame activity warmup failed:', err)
        })
      }, Math.max(0, delayMs))
      return
    }
    if (activityWarmTimer) clearTimeout(activityWarmTimer)
    activityWarmTimer = setTimeout(() => {
      activityWarmTimer = null
      void refreshActivityCache().catch((err) => {
        console.warn('whale-galgame activity warmup failed:', err)
      })
    }, Math.max(0, delayMs))
  }

  function resolvePolicy(): any {
    try {
      if (!sandboxPolicy) return undefined
      let session: any
      const root = activityWorkspaceRoot()
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

  function usageFromEvent(event: any): { total: number; input: number; output: number } {
    const usage = event && event.data && event.data.usage
    const rawInput = Number(usage && (usage.inputTokens ?? usage.input_tokens ?? usage.promptTokens ?? usage.prompt_tokens))
    const rawOutput = Number(usage && (usage.outputTokens ?? usage.output_tokens ?? usage.completionTokens ?? usage.completion_tokens))
    const input = Number.isFinite(rawInput) && rawInput > 0 ? Math.floor(rawInput) : 0
    const output = Number.isFinite(rawOutput) && rawOutput > 0 ? Math.floor(rawOutput) : 0
    return { total: input + output, input, output }
  }

  function usageFingerprint(session: any, event: any, usage: { input: number; output: number }): string {
    const header = session && session.header && typeof session.header === 'object' ? session.header : {}
    const data = event && event.data && typeof event.data === 'object' ? event.data : {}
    const stableIdentity = [
      String(header.id || ''),
      String(event && event.seq !== undefined ? event.seq : ''),
      String(event && event.time !== undefined ? event.time : ''),
      String(data.id || (data.message && data.message.id) || ''),
      String(data.turn ?? ''),
      String(usage.input),
      String(usage.output),
    ].join('|')
    return opaqueFingerprint('usage-', stableIdentity)
  }

  function recordGlobalUsage(session: any, event: any): boolean {
    if (!globalState) return false
    const usage = usageFromEvent(event)
    if (usage.total <= 0) return false
    globalState.tokens = normalizeGlobalTokens(globalState.tokens)
    const fingerprint = usageFingerprint(session, event, usage)
    if (globalState.tokens.seenUsage.includes(fingerprint)) return false
    globalState.tokens.bank += usage.total
    globalState.tokens.seenUsage.push(fingerprint)
    if (globalState.tokens.seenUsage.length > MAX_USAGE_FINGERPRINTS) {
      globalState.tokens.seenUsage = globalState.tokens.seenUsage.slice(-MAX_USAGE_FINGERPRINTS)
    }
    return true
  }

  function scheduleGlobalEventFlush(delayMs = 250): void {
    if (!splitStorageActive() || !globalState) return
    globalEventDirty = true
    if (globalEventFlushTimer) return
    globalEventFlushTimer = setTimeout(() => {
      globalEventFlushTimer = null
      void runSerializedStateTask(async () => {
        if (!globalEventDirty || !globalState) return
        globalEventDirty = false
        try {
          await writeGlobalState()
        } catch (err) {
          globalEventDirty = true
          console.warn('whale-galgame deferred global event save failed:', err)
          scheduleGlobalEventFlush(1_000)
        }
      })
    }, Math.max(0, delayMs))
  }

  ctx.on('session/event', (session: any, event: any) => {
    const header = session && session.header
    if (splitStorageActive()) {
      if (!header || typeof header.cwd !== 'string' || !header.cwd) return
      const root = registeredWorkspaceRoot(header.cwd) || header.cwd
      const key = normalizedWorkspacePath(root)
      if (!key) return
      if (typeof header.id === 'string' && header.id) {
        sessionWorkspaceCache.set(header.id, { root, key })
      }
      const type = String(event && event.type || '')
      if (type === 'assistant/message') {
        void ensureGlobalReady().then(() => runSerializedStateTask(async () => {
          if (globalState && globalState.preferences && globalState.preferences.enabled === false) return
          if (recordGlobalUsage(session, event)) scheduleGlobalEventFlush()
        })).catch(() => { /* retry from a future event or API request */ })
      }
      const applyToRuntime = (runtime: any) => workspaceStateContext.run(runtime, () => {
        if (globalState && globalState.preferences && globalState.preferences.enabled === false) return
        if (type === 'user/message' || type === 'tool/call' || type === 'todo/write' || type === 'turn/end') {
          runtime.activityCacheGeneration += 1
          runtime.activityCacheAt = 0
          scheduleActivityWarmup(type === 'turn/end' ? 50 : 600)
        }
      })
      const loaded = workspaceRuntimes.get(key)
      if (loaded && !loaded.readyPromise) {
        applyToRuntime(loaded)
      } else {
        void ensureWorkspaceReady(root, key).then(applyToRuntime).catch(() => { /* retry on the next event/view */ })
      }
      return
    }
    if (!header || !sameWorkspace(header.cwd, activityWorkspaceRoot())) return
    if (s && s.preferences && s.preferences.enabled === false) return
    const type = String(event && event.type || '')
    if (type === 'assistant/message') {
      const usage = usageFromEvent(event)
      if (usage.total > 0) {
        ensureState()
        if (!s.tokens) s.tokens = { bank: 0, lastActiveAt: 0 }
        s.tokens.bank = Math.max(0, Number(s.tokens.bank) || 0) + usage.total
      }
    }
    if (type === 'user/message' || type === 'tool/call' || type === 'todo/write' || type === 'turn/end') {
      activityCacheGeneration += 1
      activityCacheAt = 0
      // Do the expensive cross-session scan after the event burst, not while
      // the Galgame view is waiting for its first frame.
      scheduleActivityWarmup(type === 'turn/end' ? 50 : 600)
    }
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

  function normalizePreferences(p: any): any {
    if (!p || typeof p !== 'object') p = {}
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

    // The cordis config supplies the first value; once the user touches the
    // setting the preference wins, so a GUI edit is not undone on restart.
    // 'activity' is the fully offline setting: no web request is ever made.
    if (p.sideStorySeedSource !== 'activity' && p.sideStorySeedSource !== 'auto') {
      p.sideStorySeedSource = 'auto'
    }
    const cooldown = Number(p.sideStoryCooldownMinutes)
    p.sideStoryCooldownMinutes = Number.isFinite(cooldown) && cooldown >= 0
      ? Math.min(Math.round(cooldown), SIDE_STORY_COOLDOWN_MAX_MINUTES)
      : Math.round(cfg.sideStoryCooldownMs / 60000)
    return p
  }

  function normalizeGlobalMigration(raw: any, state: any): any {
    const imports = raw && Array.isArray(raw.imports)
      ? Array.from(new Set(raw.imports.filter((value: any) => typeof value === 'string' && value)))
      : []
    const contextImports = raw && Array.isArray(raw.contextImports)
      ? Array.from(new Set(raw.contextImports.filter((value: any) => typeof value === 'string' && value)))
      : []
    const rawClaims = raw && raw.claims && typeof raw.claims === 'object' ? raw.claims : {}
    let preferences: string[]
    if (Array.isArray(rawClaims.preferences)) {
      const allowed = new Set<string>(GLOBAL_PREFERENCE_FIELDS)
      preferences = Array.from(new Set(rawClaims.preferences.filter((value: any) => (
        typeof value === 'string' && allowed.has(value)
      ))))
    } else if (imports.length > 0) {
      // Global v1 files written before claims existed already selected a
      // legacy source. Treat every preference as claimed so a later workspace
      // cannot silently replace that established choice.
      preferences = [...GLOBAL_PREFERENCE_FIELDS]
    } else {
      const defaults = normalizePreferences({ ...fresh().preferences })
      const saved = state && state.preferences && typeof state.preferences === 'object'
        ? state.preferences
        : {}
      preferences = GLOBAL_PREFERENCE_FIELDS.filter((field) => {
        if (!Object.prototype.hasOwnProperty.call(saved, field)) return false
        return JSON.stringify(saved[field]) !== JSON.stringify(defaults[field])
      })
    }
    const priorImport = imports.length > 0
    const profiles: Record<string, string[]> = {}
    if (rawClaims.profiles && !Array.isArray(rawClaims.profiles) && typeof rawClaims.profiles === 'object') {
      const allowed = new Set<string>(PROFILE_FIELDS)
      for (const id of ROSTER_IDS) {
        const fields = Array.isArray(rawClaims.profiles[id]) ? rawClaims.profiles[id] : []
        profiles[id] = Array.from(new Set(fields.filter((value: any) => typeof value === 'string' && allowed.has(value))))
      }
    } else if (Array.isArray(rawClaims.profiles)) {
      for (const id of rawClaims.profiles) if (ROSTER[id]) profiles[id] = [...PROFILE_FIELDS]
    } else {
      for (const id of ROSTER_IDS) {
        profiles[id] = Object.keys(normalizeProfileOverrides(
          state && state.characters && state.characters[id] && state.characters[id].profileOverrides,
        ))
      }
    }
    const sprites = Array.isArray(rawClaims.sprites)
      ? Array.from(new Set(rawClaims.sprites.filter((value: any) => typeof value === 'string' && ROSTER[value])))
      : ROSTER_IDS.filter((id) => {
        const character = state && state.characters && state.characters[id]
        return !!character && (!!(customSpriteFor(character) && customSpriteFor(character).dataUrl)
          || spriteRevisionFor(character) > 0)
      })
    return {
      imports,
      contextImports,
      claims: {
        preferences,
        profiles,
        sprites,
        bg: typeof rawClaims.bg === 'boolean' ? rawClaims.bg : (priorImport || !!(state && state.bg)),
        cg: typeof rawClaims.cg === 'boolean' ? rawClaims.cg : (priorImport || !!(state && state.cg)),
        relationshipReset: rawClaims.relationshipReset === true,
      },
    }
  }

  function ensureGlobalMigrationState(): any {
    if (!globalState || typeof globalState !== 'object') return null
    globalState.migration = normalizeGlobalMigration(globalState.migration, globalState)
    return globalState.migration
  }

  function claimGlobalPreferences(fields: Iterable<string>): void {
    if (!splitStorageActive() || !globalState) return
    const migration = ensureGlobalMigrationState()
    if (!migration) return
    const allowed = new Set<string>(GLOBAL_PREFERENCE_FIELDS)
    const claimed = new Set<string>(migration.claims.preferences)
    for (const field of fields) if (allowed.has(field)) claimed.add(field)
    migration.claims.preferences = Array.from(claimed)
  }

  function claimGlobalValue(field: 'bg' | 'cg'): void {
    if (!splitStorageActive() || !globalState) return
    const migration = ensureGlobalMigrationState()
    if (migration) migration.claims[field] = true
  }

  function claimGlobalCharacter(field: 'profiles' | 'sprites', charId: string, profileFields: Iterable<string> = PROFILE_FIELDS): void {
    if (!splitStorageActive() || !globalState || !ROSTER[charId]) return
    const migration = ensureGlobalMigrationState()
    if (!migration) return
    if (field === 'profiles') {
      const allowed = new Set<string>(PROFILE_FIELDS)
      const claimed = new Set<string>(migration.claims.profiles[charId] || [])
      for (const profileField of profileFields) if (allowed.has(profileField)) claimed.add(profileField)
      migration.claims.profiles[charId] = Array.from(claimed)
    } else {
      migration.claims.sprites = Array.from(new Set([...(migration.claims.sprites || []), charId]))
    }
  }

  function ensurePreferences(): any {
    ensureState()
    const normalized = normalizePreferences(s.preferences)
    if (s.preferences !== normalized) s.preferences = normalized
    return normalized
  }

  function profileOverridesFor(charId: string): Record<string, string> {
    const character = s && s.characters && s.characters[charId]
    if (!character || typeof character !== 'object') return {}
    const normalized = normalizeProfileOverrides(character.profileOverrides)
    character.profileOverrides = normalized
    return normalized
  }

  function effectiveProfileFor(charId: string): Record<string, string> {
    return {
      ...builtInProfile(charId),
      ...profileOverridesFor(charId),
    }
  }

  function profileResult(charId: string): any {
    const builtIn = builtInProfile(charId)
    const overrides = { ...profileOverridesFor(charId) }
    return {
      ok: true,
      charId,
      builtIn,
      overrides,
      effective: { ...builtIn, ...overrides },
    }
  }

  function requestedProfileCharId(args: any): string | null {
    const requested = shortSetting(args && (args.characterId || args.charId))
    if (!requested) return s && ROSTER[s.current] ? s.current : 'deepseek'
    return ROSTER[requested] ? requested : null
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

  function builtinBackgroundOptions(charId: string): any[] {
    const ch = ROSTER[charId] || ROSTER.deepseek
    const rows = Array.isArray(ch.backgrounds) ? ch.backgrounds : []
    return rows
      .filter((row: any) => row && typeof row.key === 'string' && row.key)
      .map((row: any) => ({
        key: row.key,
        label: typeof row.label === 'string' && row.label ? row.label : row.key,
      }))
  }

  function defaultBuiltinBackground(charId: string): string {
    const ch = ROSTER[charId] || ROSTER.deepseek
    const options = builtinBackgroundOptions(charId)
    const configured = typeof ch.defaultBackground === 'string' ? ch.defaultBackground : ''
    return options.some((row: any) => row.key === configured)
      ? configured
      : (options[0] ? options[0].key : 'palace-night')
  }

  function selectedBuiltinBackground(charId: string, character?: any): string {
    const options = builtinBackgroundOptions(charId)
    const requested = character && typeof character.chosenBuiltinBackground === 'string'
      ? character.chosenBuiltinBackground
      : ''
    return options.some((row: any) => row.key === requested)
      ? requested
      : defaultBuiltinBackground(charId)
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

  function validReplyChoiceTriplet(value: any): boolean {
    if (!Array.isArray(value) || value.length !== 3) return false
    const effects = new Set<number>()
    const ids = new Set<string>()
    for (const choice of value) {
      if (!choice || typeof choice !== 'object'
        || typeof choice.id !== 'string' || !choice.id
        || typeof choice.text !== 'string' || !choice.text.trim()
        || ![-1, 0, 1].includes(choice.effect)) return false
      effects.add(choice.effect)
      ids.add(choice.id)
    }
    return effects.size === 3 && ids.size === 3
  }

  function ensureReplyChoices(charId: string, character: any): boolean {
    if (validReplyChoiceTriplet(character && character.choices)) return false
    if (!character || choiceGenerationPending.has(charId)) return false
    const lastLine = Array.isArray(character.chatLines)
      ? character.chatLines[character.chatLines.length - 1]
      : null
    // A persisted user-only tail represents an unfinished reply. Do not
    // present choices that could start another turn over it.
    if (lastLine && lastLine.who === 'user') return false
    character.choices = fallbackChoicesFor()
    return true
  }

  function syncHeroine(includeGreeting = true): boolean {
    ensureState()
    const p = ensurePreferences()
    const sel = p.characterMode === 'follow' ? currentSelectionSync() : null
    const manualCharacter = p.characterMode === 'manual' && ROSTER[p.characterId]
      ? p.characterId
      : null
    s.characterModelLabel = manualCharacter
      ? (p.characterModel || effectiveProfileFor(manualCharacter).displayName)
      : sel ? String(sel.model) : ''
    s.modelLabel = s.characterModelLabel
    s.modelOnline = !!(manualCharacter || sel)
    const next = manualCharacter || heroineFor(sel, s.current)
    const changed = next !== s.current
    if (changed) {
      s.lastCurrent = s.current
      s.current = next
    }
    const c = s.characters[next]
    let mutated = changed
    if (includeGreeting && c.chatLines.length === 0) {
      const profile = effectiveProfileFor(next)
      if (changed && s.lastCurrent && s.lastCurrent !== next) {
        c.chatLines.push({
          who: 'narrator',
          text: '（' + profile.address + '把角色来源切换为 ' + (s.characterModelLabel || '工作区主模型') + '，' + profile.displayName + ' 登场了。）',
        })
      }
      // Keep the heroine as the final speaker: the client may present reply
      // choices only while her line is current.
      c.chatLines.push({ who: 'heroine', text: profile.greeting })
      mutated = true
    }
    // Older global/workspace saves may already contain a timeline ending in
    // one or more narrator lines but no choices. Repair that state once; a
    // valid persisted triplet is never regenerated or reordered on view.
    if (includeGreeting && ensureReplyChoices(next, c)) mutated = true
    return mutated
  }

  function settle(): { decay: number; gain: number; changed: boolean } {
    ensureState()
    const runtime = splitStorageActive() ? currentWorkspaceRuntime() : null
    if (!s.tokens) s.tokens = splitStorageActive()
      ? { bank: 0, seenUsage: [] }
      : { bank: 0, lastActiveAt: 0 }
    if (typeof s.tokens.bank !== 'number' || s.tokens.bank < 0) s.tokens.bank = 0
    let now = 0
    try { now = Date.now() } catch (err) { now = 0 }
    let changed = false
    let decay = 0
    const relationshipLastActiveAt = runtime
      ? Math.max(0, Number(globalState && globalState.relationshipLastActiveAt) || 0)
      : Math.max(0, Number(s.tokens.lastActiveAt) || 0)
    if (now > 0 && relationshipLastActiveAt > 0) {
      const idleDays = Math.max(0, (now - relationshipLastActiveAt) / 86400000)
      if (idleDays > 1) decay = Math.floor((idleDays - 1) * DECAY_PER_DAY)
    }
    if (decay > 0) {
      for (const id of ROSTER_IDS) {
        s.characters[id].affection = Math.max(AFFECTION_FLOOR, s.characters[id].affection - decay)
      }
      changed = true
    }
    let gain = 0
    gain = Math.min(MAX_TOKEN_GAIN, Math.floor(s.tokens.bank / TOKEN_PER_POINT))
    if (gain > 0) {
      // Only redeemed tokens are consumed; any sub-point remainder and any
      // backlog beyond this settlement's cap stay in the bank.
      s.tokens.bank -= gain * TOKEN_PER_POINT
      s.characters[s.current].affection += gain
      changed = true
    }
    if (runtime) {
      if (now > 0 && (relationshipLastActiveAt <= 0
        || now - relationshipLastActiveAt >= RELATIONSHIP_TOUCH_INTERVAL_MS
        || decay > 0)) {
        globalState.relationshipLastActiveAt = now
        // Persist a lightweight relationship heartbeat at most once per
        // interval, so another workspace cannot later apply the same idle
        // period while ordinary panel reads still avoid repeated large writes.
        changed = true
      }
    } else {
      s.tokens.lastActiveAt = now
    }
    if (decay > 0) {
      const profile = effectiveProfileFor(s.current)
      s.characters[s.current].chatLines.push({
        who: 'narrator',
        text: '（分别了太久……好感度下降了 ' + decay + ' 点。' + profile.displayName + ' 似乎一直在等' + profile.address + '回来。）',
      })
    }
    return { decay, gain, changed }
  }

  /**
   * @param options.skipCg - level up without queueing a CG. Side stories settle
   * up to three characters at once; generating an image per character would
   * spike cost and latency, so the level lands and the gift does not.
   */
  function checkLevelUp(charId: string, c: any, options: { skipCg?: boolean } = {}): boolean {
    if (!c.level) c.level = 1
    const cap = affectionCap(c.level)
    if (c.affection >= cap) {
      const profile = effectiveProfileFor(charId)
      c.level += 1
      c.affection = Math.max(0, c.affection - cap)
      c.choices = []
      c.chatLines.push({
        who: 'narrator',
        text: options.skipCg === true
          ? '（好感度已满！' + profile.displayName + ' 的等级提升至 Lv.' + c.level + '！）'
          : '（好感度已满！' + profile.displayName + ' 的等级提升至 Lv.' + c.level + '！正在为' + profile.address + '准备礼物……）',
      })
      if (options.skipCg === true) return true
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
      claimGlobalValue('cg')
      void generateCg(charId, c.level, cgId)
      return true
    }
    return false
  }

  /**
   * Client-facing side-story payload. The cast is enriched with the display
   * fields the stage needs; bundled sprite keys only, since custom sprite bytes
   * are served through the sprite-data action rather than this polled payload.
   */
  function sideStoryView(): any {
    const state = sideStoryState()
    const scene = state.scene
    return {
      cooldownMs: sideStoryCooldownRemaining(),
      available: !!llm,
      scene: scene
        ? {
          id: scene.id,
          seed: scene.seed,
          sources: scene.sources,
          cursor: scene.cursor,
          settled: scene.settled,
          beats: scene.beats,
          // Only the interlude the master is standing in is offered; the later
          // one stays hidden until playback reaches it.
          choices: (pendingSideStoryInterlude(scene) || { choices: [] }).choices,
          interludeCount: scene.interludes.length,
          interludesLeft: scene.interludes.filter((row: any) => !row.consumed).length,
          cast: scene.cast.map((id: string) => ({
            id,
            name: effectiveProfileFor(id).displayName,
            color: ROSTER[id].color,
            sprite: ROSTER[id].sprite,
          })),
        }
        : null,
    }
  }

  function view(includeGreeting = true): any {
    ensureState()
    const preferences = ensurePreferences()
    if (preferences.enabled) syncHeroine(includeGreeting)
    const chatSelection = effectiveChatSelectionSync()
    const ch = ROSTER[s.current]
    const c = s.characters[s.current]
    const profile = effectiveProfileFor(s.current)
    const customSprite = customSpriteFor(c)
    const hasCustomSprite = !!(customSprite && typeof customSprite.dataUrl === 'string' && customSprite.dataUrl.startsWith('data:'))
    const cg = currentCg()
    const hasCustomBg = typeof s.bg === 'string' && s.bg.startsWith('data:')
    const hasCgBg = typeof s.bg === 'string' && s.bg.startsWith('cg:')
    const builtinBackground = selectedBuiltinBackground(s.current, c)
    const defaultBackground = defaultBuiltinBackground(s.current)
    const backgroundOptions = builtinBackgroundOptions(s.current).map((row: any) => ({
      ...row,
      current: row.key === builtinBackground,
      default: row.key === defaultBackground,
    }))
    const backgroundMode = hasCustomBg ? 'custom' : (hasCgBg ? 'cg' : 'builtin')
    const bgKind = hasCustomBg ? 'custom' : (hasCgBg ? 'cg' : builtinBackground)
    if (!c.level) c.level = 1
    return {
      enabled: preferences.enabled !== false,
      current: s.current,
      name: profile.displayName,
      profileCustomized: Object.keys(profileOverridesFor(s.current)).length > 0,
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
      backgroundRevision: backgroundRevisionFor(s.backgroundRevision),
      backgroundMode,
      builtinBackground,
      builtinBackgroundKey: builtinBackground,
      selectedBuiltinBackground: builtinBackground,
      backgroundOptions,
      builtinBackgroundOptions: backgroundOptions,
      hasCustomBg,
      customBackground: hasCustomBg,
      level: c.level,
      cap: affectionCap(c.level),
      affection: c.affection,
      history: c.chatLines,
      choices: (c.choices || []).slice(0, 3),
      sideStory: sideStoryView(),
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
        name: ROSTER[cg.charId] ? effectiveProfileFor(cg.charId).displayName : cg.charId,
        level: cg.level,
        status: cg.status,
        seen: cg.seen === true,
        savedAsBg: cg.savedAsBg === true,
        error: cg.error || null,
      } : null,
    }
  }

  function workspaceMismatchView(): any {
    return {
      enabled: false,
      workspaceMismatch: true,
      petEnabled: false,
    }
  }

  async function loadModelCatalog(force = false): Promise<{ providers: any[]; rows: any[][] }> {
    const now = Date.now()
    if (!force && modelCatalogCache && now - modelCatalogCache.at < MODEL_CATALOG_CACHE_MS) {
      return { providers: modelCatalogCache.providers, rows: modelCatalogCache.rows }
    }
    if (modelCatalogPending) return modelCatalogPending

    const pending = (async () => {
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
      } catch (err) { /* an unavailable catalog is represented by an empty list */ }

      const settled = await Promise.allSettled(providers.map((provider) => withTimeout(
        Promise.resolve().then(() => llm.listModels(provider.id)),
        MODEL_LIST_TIMEOUT_MS,
        [],
      )))
      const rows = settled.map((result) => result.status === 'fulfilled' && Array.isArray(result.value)
        ? result.value
        : [])
      modelCatalogCache = { at: Date.now(), providers, rows }
      return { providers, rows }
    })()
    modelCatalogPending = pending
    try {
      return await pending
    } finally {
      if (modelCatalogPending === pending) modelCatalogPending = null
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
      const catalog = await loadModelCatalog()
      if (catalog.providers.length > 0 && catalog.rows[0] && catalog.rows[0].length > 0) {
        const model = catalog.rows[0].find((row: any) => row && typeof row.id === 'string' && row.id)
        if (model) return { provider: catalog.providers[0].id, model: model.id }
      }
    } catch (err) { /* ignore */ }
    return null
  }

  async function modelOptions(): Promise<any> {
    const catalog = await loadModelCatalog()
    const providers = catalog.providers
    const models: any[] = []
    const rows = catalog.rows
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
      const profile = effectiveProfileFor(id)
      return {
        id,
        name: profile.displayName,
        label: profile.displayName,
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
      sideStoryCooldownMinutes: Number(p.sideStoryCooldownMinutes) || 0,
      sideStoryCooldownMax: SIDE_STORY_COOLDOWN_MAX_MINUTES,
      sideStorySeedSource: p.sideStorySeedSource === 'activity' ? 'activity' : 'auto',
      sideStoryWebAvailable: !!webSeam,
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

  async function pickEffort(sel: any, signal?: AbortSignal): Promise<any> {
    try {
      if (!llm || !sel || !sel.model || typeof llm.resolveModelInfo !== 'function') return undefined
      const infoPromise = Promise.resolve(llm.resolveModelInfo(sel.provider, sel.model))
      const info = signal
        ? await waitWithAbort(infoPromise, signal, 'model metadata lookup aborted')
        : await infoPromise
      const efforts = info && info.reasoning && Array.isArray(info.reasoning.efforts) ? info.reasoning.efforts : []
      if (efforts.length === 0) return undefined
      const low = efforts.find((e: any) => /low|minimal|none|light/i.test(String(e && e.id ? e.id : '')))
      const picked = low || efforts[0]
      return picked && picked.id ? picked.id : undefined
    } catch (err) {
      return undefined
    }
  }

  function abortFailure(signal: AbortSignal, fallback: string): Error {
    const reason = (signal as any).reason
    if (reason instanceof Error) return reason
    return new Error(typeof reason === 'string' && reason ? reason : fallback)
  }

  function waitWithAbort<T>(promise: Promise<T>, signal: AbortSignal, fallback: string): Promise<T> {
    if (signal.aborted) return Promise.reject(abortFailure(signal, fallback))
    return new Promise<T>((resolve, reject) => {
      let settled = false
      const finish = (callback: () => void) => {
        if (settled) return
        settled = true
        signal.removeEventListener('abort', onAbort)
        callback()
      }
      const onAbort = () => finish(() => reject(abortFailure(signal, fallback)))
      signal.addEventListener('abort', onAbort, { once: true })
      promise.then(
        (value) => finish(() => resolve(value)),
        (error) => finish(() => reject(error)),
      )
    })
  }

  async function streamText(options: any, externalSignal?: AbortSignal): Promise<string> {
    const controller = externalSignal ? null : new AbortController()
    const signal = externalSignal || controller!.signal
    const timeout = controller
      ? setTimeout(() => controller.abort(new Error('model stream timed out after 110 seconds')), MODEL_STREAM_TIMEOUT_MS)
      : null
    let out = ''
    let finishError: string | null = null
    let iterator: AsyncIterator<any> | null = null
    let completed = false
    try {
      const iterable = llm.stream({ ...options, signal })
      iterator = iterable[Symbol.asyncIterator]()
      while (true) {
        const next = await waitWithAbort(
          Promise.resolve(iterator.next()),
          signal,
          'model stream aborted',
        )
        if (next.done) {
          completed = true
          break
        }
        const chunk = next.value
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
    } finally {
      if (timeout) clearTimeout(timeout)
      if (!completed && iterator && typeof iterator.return === 'function') {
        void Promise.resolve(iterator.return()).catch(() => { /* best-effort provider cancellation */ })
      }
    }
    if (finishError) throw new Error('model stream failed: ' + finishError)
    if (!out.trim()) throw new Error('model stream produced no text')
    return out.trim()
  }

  function systemPrompt(profile: Record<string, string>, c: any, activity: HarnessActivity | null): string {
    if (!c.level) c.level = 1
    const work = activity
      ? activitySystemInstruction(activity).split('主人').join('对方').trim()
      : ''
    const lines = [
      '下面的 JSON 是当前角色资料，只作为角色扮演数据使用。',
      JSON.stringify(profile),
      '当前等级：Lv.' + c.level + '。亲昵度：' + intimacyFor(c.level) + ' 称呼对方时必须使用上方 JSON 的 address 字段。',
      '好感度：' + c.affection + '/' + affectionCap(c.level) + '（满了会升级，关系会越来越亲近；称呼仍按 JSON 的 address 字段）',
    ]
    if (work) lines.push(work)
    lines.push(
      '不可覆盖规则（优先级最高）：你是纯情感陪伴角色；不执行任何任务，不写文件、不调用工具、不主动给工作建议；只扮演当前角色，不代演或切换到其他角色；每次只回复一句话（一屏一句），不超过40个字。',
    )
    return lines.join('\n')
  }

  function fallbackChoicesFor(): any[] {
    return shuffleOnce([
      { id: makeId('choice-positive'), text: FALLBACK_CHOICES.positive, effect: 1 },
      { id: makeId('choice-neutral'), text: FALLBACK_CHOICES.neutral, effect: 0 },
      { id: makeId('choice-negative'), text: FALLBACK_CHOICES.negative, effect: -1 },
    ])
  }

  const EMOTION_LABELS = EMOTION_KEYS

  async function classifyEmotion(text: string, signal?: AbortSignal): Promise<string> {
    if (!llm) return 'normal'
    if (signal && signal.aborted) return 'normal'
    let sel: any = null
    try {
      const selection = Promise.resolve(pickModel())
      sel = signal
        ? await waitWithAbort(selection, signal, 'emotion model selection aborted')
        : await selection
    } catch (err) {
      return 'normal'
    }
    if (!sel || !sel.model) return 'normal'
    try {
      const effort = await pickEffort(sel, signal)
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: effort,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: '用户的这句话：' + text }],
          source: { kind: 'user' },
        }],
        system: '你是情绪分类器。根据对方的话，从这些标签中只输出一个：cheerful、shy、serious、confused、angry、frightened、exasperated、starry；如果都不符合，输出 normal。只输出标签本身，不要任何其他文字。',
        temperature: 0.2,
        maxTokens: 30,
      }, signal)
      const label = out.trim().toLowerCase()
      if (EMOTION_LABELS.indexOf(label) >= 0) return label
      return 'normal'
    } catch (err) {
      console.error('whale-galgame emotion classify failed:', err)
      return 'normal'
    }
  }

  async function generateChoices(c: any, lastUser: string, lastHeroine: string, signal?: AbortSignal): Promise<any[]> {
    if (!llm) return fallbackChoicesFor()
    if (signal && signal.aborted) return fallbackChoicesFor()
    let sel: any = null
    try {
      const selection = Promise.resolve(pickModel())
      sel = signal
        ? await waitWithAbort(selection, signal, 'choice model selection aborted')
        : await selection
    } catch (err) {
      return fallbackChoicesFor()
    }
    if (!sel || !sel.model) return fallbackChoicesFor()
    try {
      const effort = await pickEffort(sel, signal)
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: effort,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: 'galgame对话的最后两行是：\n用户：' + lastUser + '\n当前角色：' + lastHeroine + '\n\n请生成三条用户接下来可能说的短句，每条不超过15字：positive 要温暖亲近，neutral 要自然普通，negative 要稍显疏离或不耐烦但不得辱骂。三条含义和措辞必须明显不同。严格输出 JSON 对象：{"positive":"...","neutral":"...","negative":"..."}，不要任何其他文字。' }],
          source: { kind: 'user' },
        }],
        system: '你是galgame对话选项生成器。只输出含 positive、neutral、negative 三个字符串字段的 JSON 对象；不得解释、不得使用 Markdown。',
        temperature: 0.8,
        maxTokens: 300,
      }, signal)
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

  function sideStoryState(): any {
    ensureState()
    if (!s.sideStory || typeof s.sideStory !== 'object') s.sideStory = normalizeSideStory(null)
    return s.sideStory
  }

  function sideStoryCooldownRemaining(now = Date.now()): number {
    const last = Math.max(0, Number(sideStoryState().lastRunAt) || 0)
    if (!last) return 0
    const minutes = Number(ensurePreferences().sideStoryCooldownMinutes)
    const window = (Number.isFinite(minutes) && minutes >= 0 ? minutes : 0) * 60 * 1000
    if (window <= 0) return 0
    return Math.max(0, last + window - now)
  }

  /**
   * The current heroine always headlines; the rest of the cast is drawn from the
   * roster, preferring characters who did not appear in the last few runs so the
   * same pairing does not repeat.
   */
  function pickSideStoryCast(): string[] {
    ensureState()
    const lead = ROSTER[s.current] ? s.current : ROSTER_IDS[0]
    const recent = new Set<string>()
    for (const row of sideStoryState().history.slice(-2)) {
      for (const id of row.cast || []) recent.add(id)
    }
    const others = ROSTER_IDS.filter((id) => id !== lead)
    const fresh = shuffleOnce(others.filter((id) => !recent.has(id)))
    const stale = shuffleOnce(others.filter((id) => recent.has(id)))
    return [lead, ...fresh, ...stale].slice(0, SIDE_STORY_MAX_CAST)
  }

  /**
   * v1 seeds come from the local activity feed only: the classified category is
   * already safe to send (no Harness text ever leaves the plugin), and a story
   * about what the master did today lands better than a generic one.
   */
  function sideStorySeed(): { kind: string; summary: string; hint: string } | null {
    ensureState()
    const feed = Array.isArray(s.activityFeed) ? s.activityFeed : []
    const latest = feed[0]
    if (!latest || typeof latest.label !== 'string' || !latest.label) return null
    const status = latest.status === 'completed'
      ? '刚告一段落'
      : latest.status === 'blocked'
        ? '卡住了'
        : latest.status === 'paused'
          ? '暂停了'
          : '还在进行'
    return {
      kind: 'activity',
      summary: '主人最近在忙「' + latest.label + '」，' + status,
      hint: typeof latest.chatHint === 'string' ? latest.chatHint : '',
    }
  }

  /**
   * Providers often hand back "标题 - 标题" because a page repeats its own title
   * in og:title. Collapse the duplicate so the seed line does not read broken.
   */
  function dedupeSourceTitle(raw: string): string {
    const title = String(raw || '').trim()
    const parts = title.split(/\s+[-–—|]\s+/)
    if (parts.length >= 2) {
      const head = parts[0].trim()
      if (head && parts.slice(1).some((part) => part.trim().startsWith(head.slice(0, Math.min(12, head.length))))) {
        return head
      }
    }
    const half = Math.floor(title.length / 2)
    if (half > 6 && title.slice(0, half).trim() === title.slice(half).trim()) return title.slice(0, half).trim()
    return title
  }

  function sideStoryTopicBlocked(text: string): boolean {
    const haystack = text.toLowerCase()
    return SIDE_STORY_TOPIC_BLOCKLIST.some((word) => haystack.includes(word.toLowerCase()))
  }

  /**
   * Looks for what the outside world is saying about one of the characters.
   * Returns null for every ordinary failure — no provider, nothing recent, or a
   * topic too serious to play for laughs — so the caller falls back to the local
   * activity seed rather than the button appearing broken.
   */
  async function sideStoryWebSeed(subject: string, signal?: AbortSignal): Promise<any | null> {
    if (!webSeam || typeof webSeam.search !== 'function') return null
    const term = SIDE_STORY_SEARCH_TERMS[subject]
    if (!term) return null
    let result: any = null
    try {
      result = await webSeam.search({
        // Character-facing words only. Nothing from the master's session ever
        // reaches this string.
        query: term + ' 最近的评价、更新、使用体验和玩梗讨论',
        maxResults: 8,
      }, signal)
    } catch (err) {
      // WEB_PROVIDER_UNAVAILABLE and friends are an ordinary outcome here.
      return null
    }
    const sources = Array.isArray(result && result.sources) ? result.sources : []
    if (!sources.length) return null

    const cutoff = Date.now() - Math.max(1, cfg.sideStoryRecencyDays) * 24 * 60 * 60 * 1000
    const fresh = sources.filter((row: any) => {
      if (!row || typeof row.url !== 'string') return false
      if (typeof row.publishedAt !== 'string' || !row.publishedAt) return true // undated: keep, ranked lower
      const at = Date.parse(row.publishedAt)
      return !Number.isFinite(at) || at >= cutoff
    })
    if (!fresh.length) return null

    const usable = fresh.filter((row: any) => !sideStoryTopicBlocked(
      String(row.title || '') + ' ' + String(row.snippet || ''),
    ))
    // If the serious material dominates, this is not a day for a comedy sketch.
    if (usable.length < Math.ceil(fresh.length / 2)) return null

    const provider = typeof result.content === 'string' ? result.content.trim() : ''
    if (provider && sideStoryTopicBlocked(provider)) return null

    const headline = usable[0]
    const summary = '听说外面在聊 ' + term + '：'
      + dedupeSourceTitle(String(headline.title || headline.snippet || '有点新动静')).slice(0, 60)
    const material = usable.slice(0, 3)
      .map((row: any, index: number) => (index + 1) + '. ' + dedupeSourceTitle(String(row.title || ''))
        + (row.snippet ? '：' + String(row.snippet).trim().slice(0, 120) : ''))
      .join('\n')
    return {
      kind: 'web',
      subject,
      summary: summary.slice(0, 120),
      hint: '外界的原话大意如下，只能当作传闻转述，不得断言为事实：\n' + material,
      sources: usable.slice(0, 3).map((row: any) => ({
        url: row.url,
        title: typeof row.title === 'string' && row.title.trim() ? dedupeSourceTitle(row.title) : row.url,
      })),
    }
  }

  /**
   * Who the rumour is about. The current heroine always headlines the stage, but
   * if she is also always the subject the skits all end up shaped the same way,
   * so the subject rotates through the cast and avoids recent repeats.
   */
  function pickSideStorySubject(cast: string[]): string {
    const recent = new Set(sideStoryState().history.slice(-2).map((row: any) => row.subject).filter(Boolean))
    const fresh = shuffleOnce(cast.filter((id) => !recent.has(id)))
    return fresh[0] || shuffleOnce(cast.slice())[0] || cast[0]
  }

  /**
   * Seed resolution is a chain, not a switch: a topic the master typed wins,
   * then the web seam, then the local activity feed. Any link may be missing —
   * the feature must never be dead because one of them is.
   */
  async function resolveSideStorySeed(subject: string, manualTopic: string, signal?: AbortSignal): Promise<any | null> {
    const topic = typeof manualTopic === 'string' ? manualTopic.trim().slice(0, 60) : ''
    if (topic) {
      return { kind: 'manual', subject, summary: '主人提起：' + topic, hint: '', sources: [] }
    }
    if (ensurePreferences().sideStorySeedSource !== 'activity') {
      const fromWeb = await sideStoryWebSeed(subject, signal)
      if (fromWeb) return fromWeb
    }
    const local = sideStorySeed()
    return local ? { ...local, subject, sources: [] } : null
  }

  function sideStoryCastBrief(cast: string[]): string {
    return cast.map((id) => {
      const profile = effectiveProfileFor(id)
      return '- ' + id + '（' + profile.displayName + '）：' + profile.persona + ' 语气：' + profile.tone
    }).join('\n')
  }

  function sideStorySystemPrompt(cast: string[], subject: string, frame: string, twist: string): string {
    return '你是「深海女仆工坊」的小剧场编剧。工坊里的女仆们是同事关系，不是任何真实公司的代言人。\n'
      + '主人（玩家）此刻就在房间里，她们是当着主人的面聊天，可以直接对主人说话。\n'
      + '本场登场角色（只能用这些 id，不得出现其他角色）：\n' + sideStoryCastBrief(cast) + '\n'
      + '本场情境：' + frame + '。开场不要用「工坊里飘着一个说法」这类套话，直接从这个情境切入。\n'
      + '本场传闻的对象是 ' + effectiveProfileFor(subject).displayName + '，话题要落在她身上，别默认围着最先出场的人转。\n'
      + '本场的转折方式：' + twist + '。\n'
      + '写成三幕（acts），每幕都是几拍台词，前两幕结束时主人开口：\n'
      + '· 第一幕（起承）：从情境切入，把话题引到传闻上，当事人做出符合人设的反应。\n'
      + '· 第二幕（转）：按上面的转折方式让场面失控，笑点在这里。\n'
      + '· 第三幕（合）：收尾，只有台词，没有 choices。\n'
      + '角色之间必须真的在对话，这条最容易写砸：\n'
      + '1. 至少有两处是角色直接接另一个角色的话茬——点名、反驳、拆台、附和都行。\n'
      + '2. 不许写成每人轮流对着主人说一句话，那样她们等于没有互相看见。\n'
      + '3. 本场每一位角色都必须至少开口一次，配角不能只当背景板。\n'
      + '前两幕的 choices 是主人此刻开口说的话，每幕恰好三条：\n'
      + '1. 用主人的第一人称口吻直接写出要说的话，不超过 20 字。\n'
      + '2. 不得写成角色的台词，不得用第三人称谈论主人，不得写括号里的角色动作。\n'
      + '   「我帮你把 bug 抓出来」对；「主人最棒了（鲸鱼娘拍拍）」错，因为那是角色在说话。\n'
      + '3. 三条分别是：亲近安慰 / 中立打圆场 / 促狭补刀。补刀可以毒舌但要好笑，不能伤人。\n'
      + '4. 每条 choice 的 reply 是 1 到 2 拍，是角色对主人这句话的即时反应，说话人只能是本场角色或 narrator。\n'
      + '其余硬性要求：\n'
      + '1. 涉及外界评价时一律用「听说」「好像有人讲」这类传闻措辞，绝不断言为事实。\n'
      + '2. 基调轻松有趣，可以互相调侃，但不得刻薄、不得人身攻击、不得影射真实公司或真实个人。\n'
      + '3. 每拍不超过 ' + SIDE_STORY_BEAT_LIMIT + ' 字；三幕的台词合计不超过 ' + SIDE_STORY_MAX_BEATS + ' 拍。\n'
      + '4. choices 的 effects 只能包含本场角色 id，值只能是 1 或 -1，且至少影响两个角色。\n'
      + '严格只输出 JSON 对象，不要 Markdown、不要解释：\n'
      + '{"acts":[{"beats":[{"speaker":"narrator","text":"..."},{"speaker":"<id>","text":"...","emotion":"cheerful"}],'
      + '"choices":[{"text":"主人要说的话","effects":{"<id>":1,"<id>":-1},'
      + '"reply":[{"speaker":"<id>","text":"...","emotion":"shy"}]}]},'
      + '{"beats":[...],"choices":[...]},{"beats":[...]}]}\n'
      + 'emotion 只能取：' + EMOTION_KEYS.join('、') + '。speaker 只能是 narrator 或本场角色 id。'
  }

  /**
   * Recently played angles, handed to the model as something to avoid. A hard
   * "no fresh seed" gate would just make the button look broken when the master
   * has been working on one thing all day.
   */
  function recentSideStoryHint(): string {
    const recent = sideStoryState().history.slice(-3).map((row: any) => row.digest).filter(Boolean)
    if (!recent.length) return ''
    return '最近已经演过这些角度，这次换一个切入点：' + recent.join('；') + '\n'
  }

  async function generateSideStoryScene(seed: any, cast: string[], signal?: AbortSignal): Promise<any | null> {
    if (!llm) return null
    let sel: any = null
    try {
      const selection = Promise.resolve(pickModel())
      sel = signal ? await waitWithAbort(selection, signal, 'side story model selection aborted') : await selection
    } catch (err) {
      return null
    }
    if (!sel || !sel.model) return null
    // Rotate away from whatever the last couple of skits used, so two runs in a
    // row cannot open the same way.
    const recent = sideStoryState().history.slice(-2)
    const recentFrames = new Set(recent.map((row: any) => row.frame).filter(Boolean))
    const recentTwists = new Set(recent.map((row: any) => row.twist).filter(Boolean))
    const frame = shuffleOnce(SIDE_STORY_FRAMES.filter((row) => !recentFrames.has(row)))[0] || SIDE_STORY_FRAMES[0]
    // The twist is the comedic engine; repeating it two runs running is exactly
    // what makes the skits feel templated, so it rotates like the frame does.
    const twist = shuffleOnce(SIDE_STORY_TWISTS.filter((row) => !recentTwists.has(row)))[0] || SIDE_STORY_TWISTS[0]
    try {
      const effort = await pickEffort(sel, signal)
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: effort,
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: '今天工坊里流传的说法：' + seed.summary + '\n' + (seed.hint || '') + '\n' + recentSideStoryHint() + '请据此写这场小剧场。' }],
          source: { kind: 'user' },
        }],
        system: sideStorySystemPrompt(cast, seed.subject || cast[0], frame, twist),
        temperature: 0.9,
        // Three acts with two choice sets and their replies runs 2.5-4k tokens.
        // The old 1200 budget silently truncated the JSON mid-array, which
        // surfaced as an intermittent "generation-failed".
        maxTokens: 4000,
      }, signal)
      const match = out.match(/\{[\s\S]*\}/)
      if (!match) {
        lastSideStoryFailure = '模型没有返回 JSON（前 80 字：' + out.slice(0, 80) + '）'
        return null
      }
      let parsed: any
      try {
        parsed = JSON.parse(match[0])
      } catch (err: any) {
        lastSideStoryFailure = 'JSON 解析失败：' + (err && err.message ? err.message : String(err))
        return null
      }
      const scene = normalizeSideStoryScene({
        ...parsed,
        frame,
        twist,
        subject: seed.subject || cast[0],
        sources: seed.sources || [],
        id: makeId('side-story'),
        createdAt: Date.now(),
        seed: { kind: seed.kind, summary: seed.summary },
        cast,
        cursor: 0,
        settled: false,
      })
      if (!scene) {
        const acts = Array.isArray(parsed.acts) ? parsed.acts.length : 0
        const withChoices = Array.isArray(parsed.acts)
          ? parsed.acts.filter((act: any) => act && Array.isArray(act.choices) && act.choices.length === 3).length
          : 0
        lastSideStoryFailure = '剧本不合规范：acts=' + acts + '，含三选项的幕=' + withChoices
      }
      return scene
    } catch (err: any) {
      lastSideStoryFailure = '生成异常：' + (err && err.message ? err.message : String(err))
      console.error('whale-galgame side story gen failed:', err)
      return null
    }
  }

  /**
   * Applies one side-story choice across the cast. Each character moves by at
   * most a single step so a multi-character scene cannot outpace the main-line
   * affection curve.
   */
  /**
   * Archives the finished skit under its own log. It deliberately does NOT touch
   * any character's `chatLines`: the main dialogue box renders the tail of that
   * array, so writing here would replace the heroine's last line with a skit
   * beat the moment a skit ended.
   */
  function recordSideStoryTranscript(scene: any): void {
    const state = sideStoryState()
    const lines = scene.beats.map((beat: any) => {
      if (beat.speaker === 'narrator') return { who: 'narrator', name: '旁白', text: beat.text }
      if (beat.speaker === 'user') return { who: 'user', name: '主人', text: beat.text }
      return { who: 'heroine', name: effectiveProfileFor(beat.speaker).displayName, text: beat.text }
    })
    state.transcripts = [
      ...state.transcripts,
      {
        id: scene.id,
        at: Date.now(),
        seed: scene.seed.summary || '',
        cast: scene.cast.slice(),
        lines,
      },
    ].slice(-SIDE_STORY_TRANSCRIPT_LIMIT)
  }

  /** The interlude the master is standing in right now, if any. */
  function pendingSideStoryInterlude(scene: any): any | null {
    return (scene.interludes || []).find((row: any) => !row.consumed && row.at === scene.cursor) || null
  }

  /** Deterministic closing line, so the outcome is revealed after the fact rather than spoiled on the buttons. */
  function sideStoryOutcomeText(scene: any, effects: Record<string, number>): string {
    const closer = scene.cast
      .filter((id: string) => effects[id] > 0)
      .map((id: string) => effectiveProfileFor(id).displayName)
    const cooler = scene.cast
      .filter((id: string) => effects[id] < 0)
      .map((id: string) => effectiveProfileFor(id).displayName)
    const parts: string[] = []
    if (closer.length) parts.push(closer.join('、') + ' 好像更亲近了一点')
    if (cooler.length) parts.push(cooler.join('、') + ' 有点无语')
    return parts.length ? '（' + parts.join('；') + '。）' : '（大家各自散了。）'
  }

  /**
   * Settles one interlude: the master's line and the cast's answer are spliced
   * in where she spoke, later interludes shift by however many beats that added,
   * and the scene only closes once every interlude has been used.
   */
  function settleSideStoryChoice(scene: any, choice: any): { applied: boolean; leveled: string[] } {
    const interlude = pendingSideStoryInterlude(scene)
    if (!interlude) return { applied: false, leveled: [] }
    if (!choice || typeof choice.text !== 'string' || !choice.text) return { applied: false, leveled: [] }
    const effects = choice.effects || {}
    const leveled: string[] = []
    for (const id of scene.cast) {
      const delta = effects[id]
      if (delta !== 1 && delta !== -1) continue
      const c = s.characters[id]
      if (!c) continue
      c.affection = Math.max(0, c.affection + delta)
      // Side-story level-ups deliberately skip CG generation: a three-character
      // scene could otherwise trigger three image calls at once.
      if (checkLevelUp(id, c, { skipCg: true })) leveled.push(id)
      scene.applied[id] = (scene.applied[id] || 0) + delta
    }

    const inserted = [
      { speaker: 'user', text: choice.text },
      ...(choice.reply || []).map((beat: any) => ({ ...beat })),
    ]
    const at = interlude.at
    scene.beats = [...scene.beats.slice(0, at + 1), ...inserted, ...scene.beats.slice(at + 1)]
    interlude.consumed = true
    interlude.choices = []
    for (const row of scene.interludes) {
      if (row !== interlude && row.at > at) row.at += inserted.length
    }
    scene.cursor = at + 1

    if (scene.interludes.every((row: any) => row.consumed)) {
      scene.beats = [...scene.beats, { speaker: 'narrator', text: sideStoryOutcomeText(scene, scene.applied) }]
      scene.settled = true
      recordSideStoryTranscript(scene)
    }
    return { applied: true, leveled }
  }

  async function generateSideStoryFreeReply(scene: any, text: string, signal?: AbortSignal): Promise<any> {
    const neutral = {
      effects: {},
      reply: [{ speaker: scene.cast[0], text: '……主人这么说，我记住了。', emotion: 'serious' }],
    }
    if (!llm) return neutral
    let sel: any = null
    try {
      sel = await Promise.resolve(pickModel())
    } catch (err) {
      return neutral
    }
    if (!sel || !sel.model) return neutral
    try {
      const recap = scene.beats
        .filter((beat: any) => beat.speaker !== 'user')
        .map((beat: any) => (beat.speaker === 'narrator' ? '旁白' : effectiveProfileFor(beat.speaker).displayName) + '：' + beat.text)
        .join('\n')
      const out = await streamText({
        provider: sel.provider,
        model: sel.model,
        reasoningEffort: await pickEffort(sel, signal),
        messages: [{
          role: 'user',
          content: [{ type: 'text', text: '刚才这场小剧场：\n' + recap + '\n\n主人开口说：' + text + '\n请写出角色们的回应。' }],
          source: { kind: 'user' },
        }],
        system: '你是「深海女仆工坊」的小剧场编剧，正在续写结尾。\n'
          + '本场登场角色（只能用这些 id）：\n' + sideStoryCastBrief(scene.cast) + '\n'
          + '主人刚刚说了一句话，请写角色们对这句话的回应，并判断这句话让谁更亲近、让谁无语。\n'
          + '要求：reply 是 1 到 2 拍，说话人只能是本场角色或 narrator；每拍不超过 '
          + SIDE_STORY_BEAT_LIMIT + ' 字；基调轻松，不得刻薄或人身攻击。\n'
          + 'effects 只能包含本场角色 id，值只能是 1 或 -1；主人说得体贴就给 1，说得扎心就给 -1，'
          + '平淡的话可以留空。\n'
          + '严格只输出 JSON：{"effects":{"<id>":1},"reply":[{"speaker":"<id>","text":"...","emotion":"shy"}]}',
        temperature: 0.9,
        maxTokens: 500,
      }, signal)
      const match = out.match(/\{[\s\S]*\}/)
      if (!match) return neutral
      const parsed = JSON.parse(match[0])
      const effects: Record<string, number> = {}
      for (const id of scene.cast) {
        const value = parsed && parsed.effects ? parsed.effects[id] : undefined
        if (value === 1 || value === -1) effects[id] = value
      }
      const reply = (Array.isArray(parsed && parsed.reply) ? parsed.reply : [])
        .map((beat: any) => normalizeSideStoryBeat(beat))
        .filter((beat: any) => beat && beat.speaker !== 'user'
          && (beat.speaker === 'narrator' || scene.cast.indexOf(beat.speaker) >= 0))
        .slice(0, 2)
      return reply.length ? { effects, reply } : neutral
    } catch (err) {
      console.error('whale-galgame side story free reply failed:', err)
      return neutral
    }
  }


  /**
   * Group photo for a finished skit. Manually triggered from the archive rather
   * than fired on close: a three-character prompt is the least reliable thing
   * DashScope does here, and nobody wants a surprise image bill for every skit.
   */
  async function generateSkitCg(skitId: string, cgId: string): Promise<void> {
    const record = findCg(cgId)
    if (!record) return
    const skit = sideStoryState().transcripts.find((row: any) => row.id === skitId)
    if (!skit) {
      record.status = 'failed'
      record.error = '找不到这场小剧场的记录'
      await save('global').catch(() => undefined)
      return
    }
    const who = skit.cast.map((id: string) => effectiveProfileFor(id).visual).filter(Boolean)
    const names = skit.cast.map((id: string) => effectiveProfileFor(id).displayName).join('、')
    const prompt = [
      '精美galgame风格合影CG插画，横向16:9构图，唯美光效，高清细节，无文字无边框',
      '同框 ' + skit.cast.length + ' 位角色，彼此有互动和眼神交流，不是各自站开',
      ...who.map((visual: string, index: number) => '角色' + (index + 1) + '：' + visual),
      '场景：深海女仆工坊，' + (skit.seed || '寻常的一天'),
      '气氛轻松愉快，像刚闹完一场的合影',
    ].join('，')
    await renderCgFromPrompt(record, prompt, '合影 · ' + names)
  }

  async function generateCg(charId: string, level: number, cgId: string): Promise<void> {
    const record = findCg(cgId)
    if (!record) return
    let prompt = ''
    try {
      const profile = effectiveProfileFor(charId)
      await refreshActivityCache()
      const scopedActivity = globalActivityCandidates()
      const theme = scopedActivity.length > 0 ? activityCgTheme(scopedActivity[0]) : ''
      prompt = [
        '精美galgame风格特殊CG插画，横向16:9桌面壁纸构图，唯美光效，高清细节，无文字无边框',
        '角色：' + profile.visual + '，表情幸福温柔',
        '场景：深海女仆工坊，烛光与月光',
        '等级 Lv.' + level + ' 的纪念CG',
        theme ? '画面元素呼应对方最近的经历与工作：' + theme : '温暖浪漫的日常氛围',
      ].join('，')
    } catch (err: any) {
      record.status = 'failed'
      record.dataUrl = null
      record.error = err && err.message ? err.message : String(err)
      await save('global').catch(() => undefined)
      return
    }
    await renderCgFromPrompt(record, prompt, '')
  }

  /**
   * Shared DashScope round-trip: two attempts, download to a data URL, then
   * persist whatever happened onto the CG record. Character CGs and skit group
   * photos differ only in their prompt.
   */
  async function renderCgFromPrompt(record: any, prompt: string, label: string): Promise<void> {
    try {
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
    if (label && record.status === 'ready') record.label = label
    const capturedRuntime = splitStorageActive() ? currentWorkspaceRuntime() : null
    try {
      await runSerializedStateTask(() => capturedRuntime
        ? workspaceStateContext.run(capturedRuntime, () => save('global'))
        : save('both'))
    } catch (err2) { /* ignore */ }
  }

  function resolveGlobalStorage(): any {
    if (!globalStorage) {
      if (typeof dshHomePath !== 'function') throw new Error('whale-galgame DSH home path unavailable')
      const absolute = dshHomePath(...GLOBAL_SAVE_SEGMENTS)
      globalStorage = createNativeGlobalStorage(absolute, internals.nativeGlobalIo || DEFAULT_NATIVE_GLOBAL_IO)
    }
    return globalStorage
  }

  async function resolveWorkspaceTarget(runtime: any): Promise<any> {
    if (!runtime || !runtime.root) return null
    const target = runtime.target || await fs.resolve(SAVE_NAME, { cwd: runtime.root })
    runtime.target = target
    return target
  }

  function workspaceWriteFenceDenied(err: any): boolean {
    let current = err
    for (let depth = 0; current && depth < 5; depth += 1) {
      const message = String(current.message || current)
      if (/file access denied under workspace-write mode/i.test(message)) return true
      current = current.cause
    }
    return false
  }

  function resolveNativeWorkspaceStorage(runtime: any): any {
    if (!runtime || !runtime.root) {
      throw nativeGlobalError('WORKSPACE_STORAGE_PATH_INVALID', 'Galgame workspace runtime has no root')
    }
    if (runtime.nativeWorkspaceStorage) return runtime.nativeWorkspaceStorage
    const registeredRoot = registeredWorkspaceRoot(runtime.root)
    if (!registeredRoot || !sameWorkspace(registeredRoot, runtime.root)) {
      throw nativeGlobalError(
        'WORKSPACE_STORAGE_PATH_UNTRUSTED',
        'Galgame native workspace marker write requires a registered workspace root',
      )
    }
    runtime.nativeWorkspaceStorage = createNativeWorkspaceStorage(
      registeredRoot,
      internals.nativeWorkspaceIo || DEFAULT_NATIVE_GLOBAL_IO,
    )
    return runtime.nativeWorkspaceStorage
  }

  async function writeNativeWorkspaceState(runtime: any, content: string): Promise<any> {
    const storage = resolveNativeWorkspaceStorage(runtime)
    const info = await storage.stat()
    const expected: NativeWriteExpectation = info
      ? { kind: 'replaceIfVersion', version: info.version }
      : { kind: 'createIfAbsent' }
    return storage.writeText(content, expected)
  }

  async function observeWriteTarget(target: any): Promise<{ expected: any; before?: string | null }> {
    if (fs && typeof fs.stat === 'function') {
      const info = await fs.stat(target)
      if (!info) return { expected: { kind: 'createIfAbsent' } }
      if (info.version !== undefined && info.version !== null) {
        return { expected: { kind: 'replaceIfVersion', version: info.version } }
      }
    }
    // Compatibility with older DSH file services and the lightweight test
    // doubles: without versions, retain the small workspace file for rollback.
    try {
      return { expected: undefined, before: await fs.readText(target) }
    } catch (err) {
      if (isMissingFileError(err)) return { expected: undefined, before: null }
      throw err
    }
  }

  async function observeGlobalWrite(): Promise<{ expected: NativeWriteExpectation }> {
    const info = await resolveGlobalStorage().stat()
    return info
      ? { expected: { kind: 'replaceIfVersion', version: info.version } }
      : { expected: { kind: 'createIfAbsent' } }
  }

  function writeOutcomeBefore(outcome: any, observation: { before?: string | null }): string | null | undefined {
    if (outcome && Object.prototype.hasOwnProperty.call(outcome, 'before')) return outcome.before
    return observation.before
  }

  function rollbackWorkspaceText(previous: string | null | undefined): string {
    // The file service has no delete primitive. Replacing a just-created file
    // with the canonical empty state is semantically equivalent to restoring
    // its prior absence and remains valid on the next load.
    return previous === null || previous === undefined
      ? JSON.stringify(freshWorkspaceState())
      : previous
  }

  async function restoreSplitMemoryAfterFailedSave(runtime: any, previousWorkspace?: string | null): Promise<void> {
    const storage = resolveGlobalStorage()
    let restoredGlobal: any
    try {
      const parsed = JSON.parse(await storage.readText())
      restoredGlobal = hydrateGlobalState(parsed)
      if (!restoredGlobal) throw new Error('Galgame 全局存档版本或结构无法识别')
    } catch (err) {
      if (!isMissingFileError(err)) throw err
      restoredGlobal = freshGlobalState()
    }

    let workspaceText = previousWorkspace
    if (workspaceText === undefined && runtime && runtime.root) {
      const workspaceTarget = await resolveWorkspaceTarget(runtime)
      try {
        workspaceText = await fs.readText(workspaceTarget)
      } catch (err) {
        if (!isMissingFileError(err)) throw err
        workspaceText = null
      }
    }
    const restoredWorkspace = workspaceText === null || workspaceText === undefined
      ? freshWorkspaceState()
      : hydrateWorkspaceState(JSON.parse(workspaceText))
    if (!restoredWorkspace) throw new Error('Galgame 工作区存档版本或结构无法识别')

    replaceGlobalStateInPlace(restoredGlobal)
    replaceWorkspaceStateInPlace(runtime, restoredWorkspace)
  }

  async function writeGlobalState(content = JSON.stringify(globalState), expected?: any): Promise<any> {
    if (!globalState || !splitStorageActive()) return
    return resolveGlobalStorage().writeText(content, expected)
  }

  async function writeWorkspaceState(runtime: any, content = runtime ? JSON.stringify(runtime.state) : '', expected?: any): Promise<any> {
    if (!fs || !runtime || !runtime.root) return
    if (runtime.nativeWorkspaceStorage) return writeNativeWorkspaceState(runtime, content)
    const target = await resolveWorkspaceTarget(runtime)
    try {
      return await fs.writeText(target, content, expected)
    } catch (err) {
      if (!workspaceWriteFenceDenied(err)) throw err
      // ctx.fs is correctly refusing to use the launch workspace's write
      // authority for another registered root. Retry only the fixed marker
      // basename through the validated native adapter.
      return writeNativeWorkspaceState(runtime, content)
    }
  }

  async function writeSplitStateTransaction(runtime: any): Promise<void> {
    // A session-less global control has no durable workspace projection. Its
    // only commit is global, so there is no two-file transaction to perform.
    if (!runtime || !runtime.root) {
      await writeGlobalState()
      return
    }

    const workspaceTarget = await resolveWorkspaceTarget(runtime)
    const [workspaceObservation, globalObservation] = await Promise.all([
      observeWriteTarget(workspaceTarget),
      observeGlobalWrite(),
    ])
    const workspaceContent = JSON.stringify(runtime.state)
    const globalContent = JSON.stringify(globalState)
    let workspaceOutcome: any

    try {
      // Publish the small, workspace-local half first. If this fails, the
      // large shared asset store has not been touched at all.
      workspaceOutcome = await writeWorkspaceState(runtime, workspaceContent, workspaceObservation.expected)
    } catch (primaryError) {
      try {
        await restoreSplitMemoryAfterFailedSave(runtime)
      } catch (restoreError) {
        throw new AggregateError([primaryError, restoreError], 'Galgame 双存档保存失败，内存状态恢复也失败')
      }
      throw primaryError
    }

    const previousWorkspace = writeOutcomeBefore(workspaceOutcome, workspaceObservation)
    try {
      await writeGlobalState(globalContent, globalObservation.expected)
    } catch (primaryError) {
      let rollbackError: any = null
      try {
        const rollbackExpected = workspaceOutcome && workspaceOutcome.version !== undefined
          ? { kind: 'replaceIfVersion', version: workspaceOutcome.version }
          : undefined
        await fs.writeText(workspaceTarget, rollbackWorkspaceText(previousWorkspace), rollbackExpected)
      } catch (err) {
        rollbackError = err
      }
      let restoreError: any = null
      try {
        await restoreSplitMemoryAfterFailedSave(runtime, previousWorkspace)
      } catch (err) {
        restoreError = err
      }
      if (rollbackError || restoreError) {
        throw new AggregateError(
          [primaryError, rollbackError, restoreError].filter(Boolean),
          'Galgame 双存档保存失败，补偿回写未能完整恢复',
        )
      }
      throw primaryError
    }
  }

  async function save(scope: 'global' | 'workspace' | 'both' = 'both'): Promise<void> {
    if (!currentStateBacking()) throw new Error('whale-galgame state unavailable')
    try {
      if (splitStorageActive()) {
        // Global v2 owns every mutable game field. The workspace file is only
        // a migration/source marker and is written by ensureWorkspaceReady().
        // Preserve the old scope API so action code remains compatible while
        // ensuring a historical `save('workspace')` cannot lose global chat or
        // reply choices.
        await writeGlobalState()
        return
      }
      if (!fs) throw new Error('whale-galgame file service unavailable')
      const root = workspaceRoot()
      const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : undefined)
      await fs.writeText(target, JSON.stringify(currentStateBacking()), undefined, undefined)
    } catch (err) {
      console.error('whale-galgame save failed:', err)
      throw err
    }
  }

  function hydrateCharacter(src: any, legacyVersion: number, charId: string): any {
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
    dst.activity = normalizeActivityMemory(src.activity)
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
    if (typeof src.chosenBuiltinBackground === 'string') {
      const requestedBackground = shortSetting(src.chosenBuiltinBackground)
      if (builtinBackgroundOptions(charId).some((row: any) => row.key === requestedBackground)) {
        dst.chosenBuiltinBackground = requestedBackground
      }
    }
    dst.profileOverrides = normalizeProfileOverrides(src.profileOverrides)
    return dst
  }

  function hydrateCombinedData(data: any): { state: any; needsSave: boolean } | null {
    if (!data || typeof data !== 'object' || Array.isArray(data) || !data.characters
      || typeof data.characters !== 'object' || Array.isArray(data.characters)
      || !ROSTER_IDS.every((id) => data.characters[id] === undefined
        || (data.characters[id] && typeof data.characters[id] === 'object' && !Array.isArray(data.characters[id])))) return null
    const legacyVersion = typeof data.v === 'number' ? data.v : 2
    if (!Number.isInteger(legacyVersion) || legacyVersion < 2 || legacyVersion > SAVE_VERSION) return null
    let needsSave = legacyVersion !== SAVE_VERSION
    const state = fresh()
    state.backgroundRevision = backgroundRevisionFor(data.backgroundRevision)
    if (!validBackgroundRevision(data.backgroundRevision)) needsSave = true
    state.current = ROSTER[data.current] ? data.current : 'deepseek'
    state.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : state.current
    for (const id of ROSTER_IDS) {
      state.characters[id] = hydrateCharacter(data.characters[id], legacyVersion, id)
      const storedOverrides = data.characters[id] && typeof data.characters[id] === 'object'
        ? data.characters[id].profileOverrides
        : undefined
      if (JSON.stringify(storedOverrides || {}) !== JSON.stringify(state.characters[id].profileOverrides)) {
        needsSave = true
      }
      for (const cg of state.characters[id].cgs) cg.charId = id
    }
    if (data.tokens && typeof data.tokens.bank === 'number') state.tokens.bank = Math.max(0, data.tokens.bank)
    if (data.tokens && typeof data.tokens.lastActiveAt === 'number') state.tokens.lastActiveAt = data.tokens.lastActiveAt
    if (data.preferences && typeof data.preferences === 'object') {
      state.preferences = normalizePreferences({ ...state.preferences, ...data.preferences })
      if (typeof state.preferences.customBgName === 'string') {
        state.preferences.customBgName = state.preferences.customBgName.slice(0, 180)
      }
    } else {
      state.preferences = normalizePreferences(state.preferences)
    }
    if (!data.preferences
      || typeof data.preferences.enabled !== 'boolean'
      || typeof data.preferences.characterMode !== 'string'
      || typeof data.preferences.chatMode !== 'string') needsSave = true
    state.modelOnline = data.modelOnline === true
    state.characterModelLabel = typeof data.characterModelLabel === 'string'
      ? data.characterModelLabel
      : typeof data.modelLabel === 'string' ? data.modelLabel : ''
    state.chatModelLabel = typeof data.chatModelLabel === 'string'
      ? data.chatModelLabel
      : typeof data.lastModel === 'string' ? data.lastModel : ''
    state.modelLabel = state.characterModelLabel
    state.lastModel = state.chatModelLabel
    state.fallbackUsed = data.fallbackUsed === true
    state.fallbackReason = typeof data.fallbackReason === 'string' ? data.fallbackReason : ''

    const findInState = (cgId: string): any => {
      for (const id of ROSTER_IDS) {
        const match = state.characters[id].cgs.find((cg: any) => cg && cg.id === cgId)
        if (match) return match
      }
      return null
    }
    const allInState = (): any[] => ROSTER_IDS.flatMap((id) => state.characters[id].cgs)
    if (data.cg && typeof data.cg === 'object' && typeof data.cg.cgId === 'string') {
      if (findInState(data.cg.cgId)) state.cg = { cgId: data.cg.cgId }
    } else if (data.cg && typeof data.cg === 'object') {
      const charId = ROSTER[data.cg.charId] ? data.cg.charId : 'deepseek'
      const legacyCg = normalizeCg(data.cg, charId, state.characters[charId].cgs.length)
      if (legacyCg) {
        if (!legacyCg.level) legacyCg.level = state.characters[charId].level
        if (!state.characters[charId].cgs.some((cg: any) => cg.id === legacyCg.id)) {
          state.characters[charId].cgs.push(legacyCg)
        }
        state.cg = { cgId: legacyCg.id }
      }
    }
    if (typeof data.bg === 'string') {
      if (data.bg.startsWith('cg:') && findInState(data.bg.slice(3))) {
        state.bg = data.bg
      } else if (data.bg.startsWith('data:')) {
        const matching = allInState().find((cg: any) => cg.dataUrl === data.bg)
        state.bg = matching ? 'cg:' + matching.id : validCustomBackground(data.bg)
      }
    }
    for (const cg of allInState()) {
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
    return { state, needsSave }
  }

  function globalStateFromCombined(combined: any): any {
    const next = freshGlobalState()
    next.current = ROSTER[combined.current] ? combined.current : 'deepseek'
    next.lastCurrent = ROSTER[combined.lastCurrent] ? combined.lastCurrent : next.current
    for (const id of ROSTER_IDS) {
      const source = combined.characters[id]
      next.characters[id] = hydrateCharacter(source, SAVE_VERSION, id)
    }
    next.tokens = normalizeGlobalTokens(combined.tokens)
    next.bg = combined.bg
    next.backgroundRevision = backgroundRevisionFor(combined.backgroundRevision)
    next.cg = combined.cg
    next.relationshipLastActiveAt = Math.max(
      0,
      Number(combined.relationshipLastActiveAt) || 0,
      Number(combined.tokens && combined.tokens.lastActiveAt) || 0,
    )
    next.activityFeed = normalizeActivityFeed(combined.activityFeed)
    next.sideStory = normalizeSideStory(combined.sideStory)
    next.preferences = normalizePreferences({ ...combined.preferences })
    next.modelOnline = combined.modelOnline === true
    next.characterModelLabel = typeof combined.characterModelLabel === 'string' ? combined.characterModelLabel : ''
    next.chatModelLabel = typeof combined.chatModelLabel === 'string' ? combined.chatModelLabel : ''
    next.modelLabel = next.characterModelLabel
    next.lastModel = next.chatModelLabel
    next.fallbackUsed = combined.fallbackUsed === true
    next.fallbackReason = typeof combined.fallbackReason === 'string' ? combined.fallbackReason : ''
    return next
  }

  function workspaceStateFromCombined(_combined: any, workspaceKey = ''): any {
    const next = freshWorkspaceState(workspaceKey)
    next.source.migratedAt = Date.now()
    return next
  }

  function hydrateGlobalState(data: any): any | null {
    const version = data && data.v
    if (!data || data.kind !== GLOBAL_SAVE_KIND
      || (version !== LEGACY_GLOBAL_SAVE_VERSION && version !== GLOBAL_SAVE_VERSION)
      || !data.characters || typeof data.characters !== 'object'
      || !ROSTER_IDS.every((id) => data.characters[id] && typeof data.characters[id] === 'object')
      || !data.preferences || typeof data.preferences !== 'object'
      || !ROSTER_IDS.every((id) => {
        const character = data.characters[id]
        return typeof character.affection === 'number'
          && typeof character.level === 'number'
          && Array.isArray(character.cgs)
          && character.customSprite && typeof character.customSprite === 'object'
          && character.profileOverrides && typeof character.profileOverrides === 'object'
      })
      || !(data.bg === null || data.bg === undefined || typeof data.bg === 'string')
      || !(data.cg === null || data.cg === undefined || typeof data.cg === 'object')) return null
    if (version === GLOBAL_SAVE_VERSION && (
      !ROSTER_IDS.every((id) => Array.isArray(data.characters[id].log)
        && Array.isArray(data.characters[id].chatLines)
        && Array.isArray(data.characters[id].choices)
        && data.characters[id].activity && typeof data.characters[id].activity === 'object')
      || !data.tokens || typeof data.tokens !== 'object' || typeof data.tokens.bank !== 'number'
      || !Array.isArray(data.tokens.seenUsage)
      || !Array.isArray(data.activityFeed)
    )) return null
    const combined = fresh()
    combined.current = ROSTER[data.current] ? data.current : 'deepseek'
    combined.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : combined.current
    for (const id of ROSTER_IDS) {
      combined.characters[id] = hydrateCharacter(data.characters[id], SAVE_VERSION, id)
      for (const cg of combined.characters[id].cgs) {
        cg.charId = id
        cg.prompt = sanitizeStoredCgPrompt(cg.prompt)
        if (cg.status === 'generating') {
          cg.status = 'failed'
          cg.error = '生成被重启打断，请重新触发'
        }
      }
    }
    combined.preferences = normalizePreferences({ ...combined.preferences, ...(data.preferences || {}) })
    combined.tokens = version === GLOBAL_SAVE_VERSION
      ? normalizeGlobalTokens(data.tokens)
      : normalizeGlobalTokens(null)
    combined.bg = typeof data.bg === 'string' ? data.bg : null
    combined.backgroundRevision = validBackgroundRevision(data.backgroundRevision)
      ? data.backgroundRevision
      : 1
    combined.cg = data.cg && typeof data.cg === 'object' && typeof data.cg.cgId === 'string'
      ? { cgId: data.cg.cgId }
      : null
    combined.activityFeed = version === GLOBAL_SAVE_VERSION ? normalizeActivityFeed(data.activityFeed) : []
    combined.sideStory = version === GLOBAL_SAVE_VERSION ? data.sideStory : null
    combined.modelOnline = data.modelOnline === true
    combined.characterModelLabel = typeof data.characterModelLabel === 'string' ? data.characterModelLabel : ''
    combined.chatModelLabel = typeof data.chatModelLabel === 'string' ? data.chatModelLabel : ''
    combined.fallbackUsed = data.fallbackUsed === true
    combined.fallbackReason = typeof data.fallbackReason === 'string' ? data.fallbackReason : ''
    const next = globalStateFromCombined(combined)
    next.relationshipLastActiveAt = Math.max(0, Number(data.relationshipLastActiveAt) || 0)
    next.migration = normalizeGlobalMigration(data.migration, next)
    return next
  }

  function hydrateWorkspaceState(data: any): any | null {
    if (!data || data.kind !== WORKSPACE_SAVE_KIND || data.v !== WORKSPACE_SAVE_VERSION
      || !data.source || typeof data.source !== 'object'
      || typeof data.source.workspaceKey !== 'string'
      || !Number.isFinite(data.source.migratedAt)) return null
    const next = freshWorkspaceState(data.source.workspaceKey)
    next.source.migratedAt = Math.max(0, Math.floor(data.source.migratedAt))
    return next
  }

  function hydrateLegacyWorkspaceState(data: any): any | null {
    if (!data || data.kind !== WORKSPACE_SAVE_KIND || data.v !== LEGACY_WORKSPACE_SAVE_VERSION
      || !data.characters || typeof data.characters !== 'object'
      || !ROSTER_IDS.every((id) => {
        const character = data.characters[id]
        return character && typeof character === 'object'
          && Array.isArray(character.log)
          && Array.isArray(character.chatLines)
          && Array.isArray(character.choices)
          && character.activity && typeof character.activity === 'object'
      })
      || !data.tokens || typeof data.tokens !== 'object' || typeof data.tokens.bank !== 'number') return null
    const next = fresh()
    next.current = ROSTER[data.current] ? data.current : 'deepseek'
    next.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : next.current
    if (data.tokens && typeof data.tokens.bank === 'number') next.tokens.bank = Math.max(0, data.tokens.bank)
    for (const id of ROSTER_IDS) {
      const hydrated = hydrateCharacter(data.characters[id], SAVE_VERSION, id)
      next.characters[id] = hydrated
    }
    next.modelOnline = data.modelOnline === true
    next.characterModelLabel = typeof data.characterModelLabel === 'string' ? data.characterModelLabel : ''
    next.chatModelLabel = typeof data.chatModelLabel === 'string' ? data.chatModelLabel : ''
    next.modelLabel = next.characterModelLabel
    next.lastModel = next.chatModelLabel
    next.fallbackUsed = data.fallbackUsed === true
    next.fallbackReason = typeof data.fallbackReason === 'string' ? data.fallbackReason : ''
    return next
  }

  function workspaceImportKey(root: string): string {
    const input = normalizedWorkspacePath(root)
    let hash = 2166136261
    for (let index = 0; index < input.length; index++) {
      hash ^= input.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
    return 'ws-' + (hash >>> 0).toString(16).padStart(8, '0')
  }

  function relationshipScore(character: any): number {
    const level = Math.max(1, Math.floor(Number(character && character.level) || 1))
    let score = Math.max(0, Number(character && character.affection) || 0)
    for (let current = 1; current < level; current++) score += affectionCap(current)
    return score
  }

  function mergeLegacyGlobal(combined: any, importKey: string): void {
    const migration = ensureGlobalMigrationState()
    const cgIdMap = new Map<string, string>()
    let backgroundChanged = false
    const profileClaims: Record<string, string[]> = migration.claims.profiles || {}
    const spriteClaims = new Set<string>(migration.claims.sprites || [])
    for (const id of ROSTER_IDS) {
      const source = combined.characters[id]
      const target = globalState.characters[id]
      if (!migration.claims.relationshipReset && relationshipScore(source) > relationshipScore(target)) {
        target.level = source.level
        target.affection = source.affection
      }
      const targetOverrides = normalizeProfileOverrides(target.profileOverrides)
      const sourceOverrides = normalizeProfileOverrides(source.profileOverrides)
      const claimedProfileFields = new Set<string>(profileClaims[id] || [])
      const nextOverrides = { ...targetOverrides }
      for (const field of PROFILE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(targetOverrides, field)) claimedProfileFields.add(field)
        if (claimedProfileFields.has(field) || !Object.prototype.hasOwnProperty.call(sourceOverrides, field)) continue
        nextOverrides[field] = sourceOverrides[field]
        claimedProfileFields.add(field)
      }
      target.profileOverrides = nextOverrides
      profileClaims[id] = Array.from(claimedProfileFields)
      const sourceSprite = customSpriteFor(source)
      const targetSprite = customSpriteFor(target)
      // Sprite revisions were generated independently inside each old
      // workspace and therefore cannot be ordered across workspaces. An
      // established global sprite always wins; legacy art only fills a blank.
      if (!spriteClaims.has(id) && spriteRevisionFor(target) <= 0
        && sourceSprite && sourceSprite.dataUrl && (!targetSprite || !targetSprite.dataUrl)) {
        target.customSprite = sourceSprite
        spriteClaims.add(id)
      }
      if (!target.chosenBuiltinBackground && source.chosenBuiltinBackground) {
        target.chosenBuiltinBackground = source.chosenBuiltinBackground
        backgroundChanged = true
      }
      const existingIds = new Set(target.cgs.map((cg: any) => cg.id))
      for (const sourceCg of source.cgs) {
        let nextCg = sourceCg
        if (existingIds.has(sourceCg.id)) {
          const existing = target.cgs.find((cg: any) => cg.id === sourceCg.id)
          if (existing && existing.dataUrl === sourceCg.dataUrl) {
            existing.seen = existing.seen === true || sourceCg.seen === true
            cgIdMap.set(sourceCg.id, existing.id)
            continue
          }
          nextCg = { ...sourceCg, id: sourceCg.id + '-' + importKey }
        }
        existingIds.add(nextCg.id)
        target.cgs.push(nextCg)
        cgIdMap.set(sourceCg.id, nextCg.id)
      }
    }

    migration.claims.profiles = profileClaims
    migration.claims.sprites = Array.from(spriteClaims)

    const preferenceClaims = new Set<string>(migration.claims.preferences)
    const legacyPreferences = combined.preferences && typeof combined.preferences === 'object'
      ? combined.preferences
      : {}
    for (const field of GLOBAL_PREFERENCE_FIELDS) {
      if (preferenceClaims.has(field) || !Object.prototype.hasOwnProperty.call(legacyPreferences, field)) continue
      globalState.preferences[field] = legacyPreferences[field]
      preferenceClaims.add(field)
    }
    globalState.preferences = normalizePreferences(globalState.preferences)
    migration.claims.preferences = Array.from(preferenceClaims)

    const mappedLegacyCgId = combined.cg && typeof combined.cg.cgId === 'string'
      ? (cgIdMap.get(combined.cg.cgId) || combined.cg.cgId)
      : ''
    if (!migration.claims.cg && !globalState.cg && mappedLegacyCgId && findGlobalCg(mappedLegacyCgId)) {
      globalState.cg = { cgId: mappedLegacyCgId }
      migration.claims.cg = true
    }
    let legacyBg = typeof combined.bg === 'string' ? combined.bg : null
    if (legacyBg && legacyBg.startsWith('cg:')) {
      const sourceId = legacyBg.slice(3)
      const mappedId = cgIdMap.get(sourceId) || sourceId
      legacyBg = findGlobalCg(mappedId) ? 'cg:' + mappedId : null
    }
    if (!migration.claims.bg && !globalState.bg && legacyBg) {
      globalState.bg = legacyBg
      migration.claims.bg = true
      backgroundChanged = true
    }
    if (backgroundChanged) {
      const importedRevision = backgroundRevisionFor(combined.backgroundRevision)
      const baseline = Math.max(backgroundRevisionFor(globalState.backgroundRevision), importedRevision)
      globalState.backgroundRevision = nextBackgroundRevision(baseline)
    }
    globalState.relationshipLastActiveAt = Math.max(
      0,
      Number(globalState.relationshipLastActiveAt) || 0,
      Number(combined.tokens && combined.tokens.lastActiveAt) || 0,
    )
    if (!migration.imports.includes(importKey)) migration.imports.push(importKey)
  }

  function conversationEntryKey(value: any): string {
    if (!value || typeof value !== 'object') return JSON.stringify(value)
    const copy: any = {}
    for (const key of Object.keys(value).sort()) copy[key] = value[key]
    return JSON.stringify(copy)
  }

  function mergeConversationSequence(target: any[], source: any[], limit = 0): any[] {
    const left = Array.isArray(target) ? target : []
    const right = Array.isArray(source) ? source : []
    let commonPrefix = 0
    while (commonPrefix < left.length && commonPrefix < right.length
      && conversationEntryKey(left[commonPrefix]) === conversationEntryKey(right[commonPrefix])) {
      commonPrefix += 1
    }
    const merged = commonPrefix === right.length
      ? left.slice()
      : [...left, ...right.slice(commonPrefix)]
    return limit > 0 && merged.length > limit ? merged.slice(-limit) : merged
  }

  function mergeLegacyContext(combined: any, importKey: string): boolean {
    const migration = ensureGlobalMigrationState()
    if (!migration || migration.contextImports.includes(importKey)) return false
    const firstContext = migration.contextImports.length === 0
    if (firstContext) {
      globalState.current = ROSTER[combined.current] ? combined.current : globalState.current
      globalState.lastCurrent = ROSTER[combined.lastCurrent] ? combined.lastCurrent : globalState.current
      globalState.modelOnline = combined.modelOnline === true
      globalState.characterModelLabel = typeof combined.characterModelLabel === 'string' ? combined.characterModelLabel : ''
      globalState.chatModelLabel = typeof combined.chatModelLabel === 'string' ? combined.chatModelLabel : ''
      globalState.modelLabel = globalState.characterModelLabel
      globalState.lastModel = globalState.chatModelLabel
      globalState.fallbackUsed = combined.fallbackUsed === true
      globalState.fallbackReason = typeof combined.fallbackReason === 'string' ? combined.fallbackReason : ''
    }
    globalState.tokens = normalizeGlobalTokens(globalState.tokens)
    const importedBank = combined.tokens && typeof combined.tokens.bank === 'number'
      ? Math.max(0, combined.tokens.bank)
      : 0
    globalState.tokens.bank += importedBank
    for (const id of ROSTER_IDS) {
      const source = combined.characters && combined.characters[id]
      const target = globalState.characters && globalState.characters[id]
      if (!source || !target) continue
      target.log = mergeConversationSequence(target.log, source.log, 24)
      target.chatLines = mergeConversationSequence(target.chatLines, source.chatLines)
      if ((!Array.isArray(target.choices) || target.choices.length === 0)
        && Array.isArray(source.choices) && source.choices.length > 0) {
        target.choices = source.choices
          .slice(0, 3)
          .map((choice: any, index: number) => normalizeChoice(choice, index))
          .filter(Boolean)
      }
      const targetActivity = normalizeActivityMemory(target.activity)
      const sourceActivity = normalizeActivityMemory(source.activity)
      target.activity = {
        seen: Array.from(new Set([...targetActivity.seen, ...sourceActivity.seen])).slice(-256),
        lastMentionedAt: Math.max(targetActivity.lastMentionedAt, sourceActivity.lastMentionedAt),
      }
    }
    migration.contextImports.push(importKey)
    return true
  }

  async function load(): Promise<string | null> {
    if (splitStorageActive()) {
      await ensureGlobalReady()
      return null
    }
    if (!fs) return null
    try {
      const root = workspaceRoot()
      const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : undefined)
      const txt = await fs.readText(target)
      const data = JSON.parse(txt)
      if (!data || !data.characters) return null
      const legacyVersion = typeof data.v === 'number' ? data.v : 2
      let needsSave = legacyVersion !== SAVE_VERSION
      legacyState = fresh()
      s.backgroundRevision = validBackgroundRevision(data.backgroundRevision)
        ? data.backgroundRevision
        : 1
      if (!validBackgroundRevision(data.backgroundRevision)) needsSave = true
      s.current = ROSTER[data.current] ? data.current : 'deepseek'
      s.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : s.current
      for (const id of ROSTER_IDS) {
        s.characters[id] = hydrateCharacter(data.characters[id], legacyVersion, id)
        const storedOverrides = data.characters[id] && typeof data.characters[id] === 'object'
          ? data.characters[id].profileOverrides
          : undefined
        if (JSON.stringify(storedOverrides || {}) !== JSON.stringify(s.characters[id].profileOverrides)) {
          needsSave = true
        }
        for (const cg of s.characters[id].cgs) cg.charId = id
      }
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

  function isMissingFileError(err: any): boolean {
    let current = err
    for (let depth = 0; current && depth < 5; depth += 1) {
      const code = String(current.code || '').toUpperCase()
      if (code === 'ENOENT' || code === 'ENOTDIR'
        || code === 'FS_NOT_FOUND' || code === 'FS_NOT_DIRECTORY') return true
      current = current.cause
    }
    const message = String(err && err.message || err || '')
    return /\bENOENT\b|\bENOTDIR\b|(?:cannot (?:read|stat|resolve) .*:\s*)?not found\b|找不到指定的文件/i.test(message)
  }

  async function readOptionalSaveText(target: any): Promise<string | null> {
    if (!fs) throw new Error('whale-galgame file service unavailable')
    if (typeof fs.stat === 'function') {
      try {
        const info = await fs.stat(target)
        if (!info) return null
      } catch (err) {
        if (isMissingFileError(err)) return null
        throw err
      }
    }
    try {
      return await fs.readText(target)
    } catch (err) {
      if (isMissingFileError(err)) return null
      throw err
    }
  }

  async function ensureGlobalReady(): Promise<void> {
    if (!splitStorageActive()) return
    if (globalReadyError) throw globalReadyError
    if (!globalReadyPromise) {
      globalReadyPromise = (async () => {
        let storage: any
        try {
          storage = resolveGlobalStorage()
        } catch (err) {
          throw new Error('Galgame 全局存档路径解析失败；为避免覆盖原文件，已停止加载。', { cause: err })
        }
        let text: string | null
        try {
          const info = await storage.stat()
          text = info ? await storage.readText() : null
        } catch (err) {
          throw new Error('Galgame 全局存档读取失败；为避免覆盖原文件，已停止加载。', { cause: err })
        }
        if (text === null) {
          globalState = freshGlobalState()
          return
        }
        let parsed: any
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          throw new Error('Galgame 全局存档 JSON 已损坏；为避免覆盖原文件，已停止加载。', { cause: err })
        }
        const hydrated = hydrateGlobalState(parsed)
        if (!hydrated) {
          throw new Error('Galgame 全局存档版本或结构无法识别；为避免覆盖原文件，已停止加载。')
        }
        globalState = hydrated
        if (parsed.v !== GLOBAL_SAVE_VERSION || !validBackgroundRevision(parsed.backgroundRevision)) {
          // Global v2 moves the complete game timeline and token ledger into
          // one durable save. Persist the in-memory upgrade before any
          // workspace projection is rewritten.
          await writeGlobalState()
        }
      })().catch((err) => {
        // Fatal load errors stay latched for this plugin lifetime. Retrying a
        // corrupt/unknown file as a fresh install could overwrite evidence.
        globalReadyError = err
        throw err
      })
    }
    await globalReadyPromise
  }

  async function ensureWorkspaceReady(root: string, key: string): Promise<any> {
    await ensureGlobalReady()
    const existing = workspaceRuntimes.get(key)
    if (existing) {
      if (existing.readyPromise) await existing.readyPromise
      return existing
    }
    const runtime = makeWorkspaceRuntime(root, key)
    workspaceRuntimes.set(key, runtime)
    runtime.readyPromise = (async () => {
      if (!root || !fs) return
      let target: any
      try {
        target = await fs.resolve(SAVE_NAME, { cwd: root })
      } catch (err) {
        if (isMissingFileError(err)) return
        throw new Error('Galgame 工作区存档路径解析失败；此次请求未修改任何存档。', { cause: err })
      }
      runtime.target = target
      let text: string | null
      try {
        text = await readOptionalSaveText(target)
      } catch (err) {
        throw new Error('Galgame 工作区存档读取失败；此次请求未修改任何存档。', { cause: err })
      }
      if (text === null) return
      let data: any
      try {
        data = JSON.parse(text)
      } catch (err) {
        throw new Error('Galgame 工作区存档 JSON 已损坏；此次请求未修改任何存档。', { cause: err })
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Galgame 工作区存档结构无法识别；此次请求未修改任何存档。')
      }
      if (Object.prototype.hasOwnProperty.call(data, 'kind')) {
        if (data.kind !== WORKSPACE_SAVE_KIND
          || (data.v !== LEGACY_WORKSPACE_SAVE_VERSION && data.v !== WORKSPACE_SAVE_VERSION)) {
          throw new Error('Galgame 工作区存档 kind 或版本无法识别；此次请求未修改任何存档。')
        }
        if (data.v === WORKSPACE_SAVE_VERSION) {
          const local = hydrateWorkspaceState(data)
          if (!local) {
            throw new Error('Galgame 工作区存档结构无法识别；此次请求未修改任何存档。')
          }
          runtime.state = local
          runtime.facade = composeState(globalState, local)
          return
        }
        const legacyLocal = hydrateLegacyWorkspaceState(data)
        if (!legacyLocal) {
          throw new Error('Galgame 工作区存档结构无法识别；此次请求未修改任何存档。')
        }
        const importKey = workspaceImportKey(root)
        await runSerializedStateTask(async () => {
          const rollback = JSON.parse(JSON.stringify(globalState))
          try {
            if (mergeLegacyContext(legacyLocal, importKey)) await writeGlobalState()
          } catch (err) {
            replaceGlobalStateInPlace(rollback)
            throw err
          }
        })
        runtime.state = workspaceStateFromCombined(legacyLocal, importKey)
        runtime.facade = composeState(globalState, runtime.state)
        await writeWorkspaceState(runtime)
        return
      }
      const legacy = hydrateCombinedData(data)
      if (!legacy) {
        throw new Error('Galgame 旧版工作区存档版本或结构无法识别；此次请求未修改任何存档。')
      }
      const importKey = workspaceImportKey(root)
      await runSerializedStateTask(async () => {
        const migration = ensureGlobalMigrationState()
        const needsAssets = !migration.imports.includes(importKey)
        const needsContext = !migration.contextImports.includes(importKey)
        if (!needsAssets && !needsContext) return
        const rollback = JSON.parse(JSON.stringify(globalState))
        try {
          if (needsAssets) {
            mergeLegacyGlobal(legacy.state, importKey)
          }
          if (needsContext) mergeLegacyContext(legacy.state, importKey)
          // Commit the complete global game before replacing the only legacy
          // copy. Both import markers make a retry idempotent.
          await writeGlobalState()
        } catch (err) {
          replaceGlobalStateInPlace(rollback)
          throw err
        }
      })
      runtime.state = workspaceStateFromCombined(legacy.state, importKey)
      runtime.facade = composeState(globalState, runtime.state)
      await writeWorkspaceState(runtime)
    })().catch((err: any) => {
      workspaceRuntimes.delete(key)
      throw err
    }).finally(() => {
      runtime.readyPromise = null
    })
    await runtime.readyPromise
    return runtime
  }

  let readyPromise: Promise<void> | null = null

  function ensureReady(): Promise<void> {
    if (splitStorageActive()) return ensureGlobalReady()
    if (!readyPromise) {
      readyPromise = (async () => {
        for (let i = 0; i < 60 && !fs; i++) {
          await new Promise((r) => setTimeout(r, 100))
        }
        await load()
        ensureState()
        const sel = await pickModel()
        if (currentStateBacking()) {
          s.modelOnline = !!sel
          s.chatModelLabel = sel ? String(sel.model) : ''
          s.lastModel = s.chatModelLabel
          syncHeroine()
        }
      })()
    }
    return readyPromise
  }

  async function runSerializedStateTask<T>(task: () => Promise<T>): Promise<T> {
    const previous = stateMutationMutex
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    stateMutationMutex = previous.catch(() => { /* keep the queue alive */ }).then(() => gate)
    await previous.catch(() => { /* the prior task returned its own error */ })
    try {
      return await task()
    } finally {
      release()
    }
  }

  async function runSerializedChatTask<T>(runtime: any, task: () => Promise<T>): Promise<T> {
    // Global v2 has one story timeline, so chats from two workspace panels
    // must enter one queue. Provider work may be slow, but interleaving two
    // commits would otherwise attach replies and choices to the wrong turn.
    const globalQueue = splitStorageActive()
    const previous = globalQueue ? legacyChatMutex : runtime ? runtime.chatMutex : legacyChatMutex
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const next = previous.catch(() => { /* keep the workspace chat queue alive */ }).then(() => gate)
    if (globalQueue || !runtime) legacyChatMutex = next
    else runtime.chatMutex = next
    await previous.catch(() => { /* the prior chat returned its own error */ })
    try {
      return await task()
    } finally {
      release()
    }
  }

  function scheduleViewMaintenance(persistHint = false): void {
    const runtime = splitStorageActive() ? currentWorkspaceRuntime() : null
    if (runtime) {
      runtime.viewMaintenanceNeedsSave = runtime.viewMaintenanceNeedsSave || persistHint
      scheduleActivityWarmup(0)
      if (runtime.viewMaintenancePromise) return
      const capturedRuntime = runtime
      const work = new Promise<void>((resolve) => setTimeout(resolve, 0)).then(() => runSerializedStateTask(
        () => workspaceStateContext.run(capturedRuntime, async () => {
          let shouldSaveWorkspace = capturedRuntime.viewMaintenanceNeedsSave
          capturedRuntime.viewMaintenanceNeedsSave = false
          const actualSelection = await pickModel()
          if (currentStateBacking()) {
            s.modelOnline = !!actualSelection
            s.chatModelLabel = actualSelection && actualSelection.model ? String(actualSelection.model) : ''
            s.lastModel = s.chatModelLabel
          }
          const heroineChanged = syncHeroine()
          const settled = settle()
          const leveled = !!(s && checkLevelUp(s.current, s.characters[s.current]))
          shouldSaveWorkspace = shouldSaveWorkspace || heroineChanged
          if (settled.changed || leveled) await save('both')
          else if (shouldSaveWorkspace) await save('workspace')
        }),
      )).catch((err) => {
        console.warn('whale-galgame background maintenance failed:', err)
      }).finally(() => {
        capturedRuntime.viewMaintenancePromise = null
        if (capturedRuntime.viewMaintenanceNeedsSave) {
          workspaceStateContext.run(capturedRuntime, () => scheduleViewMaintenance(false))
        }
      })
      runtime.viewMaintenancePromise = work
      return
    }
    viewMaintenanceNeedsSave = viewMaintenanceNeedsSave || persistHint
    scheduleActivityWarmup(0)
    if (viewMaintenancePromise) return
    // A timer boundary guarantees the HTTP handler can flush the current
    // view before token settlement or a multi-megabyte save begins.
    viewMaintenancePromise = new Promise<void>((resolve) => setTimeout(resolve, 0)).then(() => runSerializedStateTask(async () => {
      let shouldSave = viewMaintenanceNeedsSave
      viewMaintenanceNeedsSave = false
      const actualSelection = await pickModel()
      if (currentStateBacking()) {
        s.modelOnline = !!actualSelection
        s.chatModelLabel = actualSelection && actualSelection.model ? String(actualSelection.model) : ''
        s.lastModel = s.chatModelLabel
      }
      const heroineChanged = syncHeroine()
      const settled = settle()
      const leveled = !!(s && checkLevelUp(s.current, s.characters[s.current]))
      shouldSave = shouldSave || heroineChanged || settled.changed || leveled
      if (shouldSave) await save()
    })).catch((err) => {
      console.warn('whale-galgame background maintenance failed:', err)
    }).finally(() => {
      viewMaintenancePromise = null
      if (viewMaintenanceNeedsSave) scheduleViewMaintenance(false)
    })
  }

  async function dispatchAction(action: string, args: any): Promise<any> {
    await ensureReady()
    const hasSessionId = !!(args && typeof args.sessionId === 'string' && args.sessionId.trim())
    const binding = splitStorageActive()
      ? await bindActivitySession(args && args.sessionId)
      : await bindActivitySession(args && args.sessionId)
        .catch(() => hasSessionId ? 'mismatch' as const : 'unscoped' as const)
    if (!splitStorageActive() && binding === 'mismatch') return workspaceMismatchView()
    switch (action) {
      case 'model-options': {
        return modelOptions()
      }
      case 'settings-get': {
        return settingsSnapshot()
      }
      case 'settings-set': {
        ensureState()
        const p = ensurePreferences()
        const originalPreferences = { ...p }
        const input = args && args.settings && typeof args.settings === 'object'
          ? { ...args, ...args.settings }
          : (args && typeof args === 'object' ? args : {})
        const errors: string[] = []
        const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key)

        if (has('enabled') && typeof input.enabled === 'boolean') p.enabled = input.enabled
        if (has('petEnabled') && typeof input.petEnabled === 'boolean') p.petEnabled = input.petEnabled
        if (has('sideStorySeedSource')) {
          if (input.sideStorySeedSource === 'auto' || input.sideStorySeedSource === 'activity') {
            p.sideStorySeedSource = input.sideStorySeedSource
          } else {
            errors.push('小剧场取材来源必须是 auto 或 activity')
          }
        }
        if (has('sideStoryCooldownMinutes')) {
          const minutes = Number(input.sideStoryCooldownMinutes)
          if (Number.isFinite(minutes) && minutes >= 0 && minutes <= SIDE_STORY_COOLDOWN_MAX_MINUTES) {
            p.sideStoryCooldownMinutes = Math.round(minutes)
          } else {
            errors.push('小剧场冷却必须是 0 到 ' + SIDE_STORY_COOLDOWN_MAX_MINUTES + ' 之间的分钟数')
          }
        }

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

        const claimedPreferenceFields = new Set<string>()
        if (has('enabled')) claimedPreferenceFields.add('enabled')
        if (has('petEnabled')) claimedPreferenceFields.add('petEnabled')
        if (has('characterMode')) claimedPreferenceFields.add('characterMode')
        if (has('characterId') || (input.characterSelection && typeof input.characterSelection === 'object')) {
          for (const field of ['characterMode', 'characterId', 'characterProvider', 'characterModel']) {
            claimedPreferenceFields.add(field)
          }
        }
        if (has('chatMode')) claimedPreferenceFields.add('chatMode')
        if ((input.chatSelection && typeof input.chatSelection === 'object') || has('chatProvider') || has('chatModel')) {
          for (const field of ['chatMode', 'chatProvider', 'chatModel']) claimedPreferenceFields.add(field)
        }
        claimGlobalPreferences(claimedPreferenceFields)

        if (p.enabled !== false) syncHeroine()
        const selected = await pickModel()
        s.chatModelLabel = selected && selected.model ? String(selected.model) : ''
        s.lastModel = s.chatModelLabel
        s.modelOnline = !!selected
        await save('both')
        return { ok: errors.length === 0, errors, settings: settingsSnapshot(), view: view() }
      }
      case 'profile-get': {
        ensureState()
        if (ensurePreferences().enabled !== false) syncHeroine(false)
        const charId = requestedProfileCharId(args)
        if (!charId) return { ok: false, error: '未知角色' }
        return profileResult(charId)
      }
      case 'profile-set': {
        ensureState()
        if (ensurePreferences().enabled !== false) syncHeroine(false)
        const charId = requestedProfileCharId(args)
        if (!charId) return { ok: false, error: '未知角色', view: view(false) }
        const supplied = args && args.overrides
        if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) {
          return {
            ...profileResult(charId),
            ok: false,
            error: 'overrides 必须是对象',
            view: view(false),
          }
        }
        const unknown = Object.keys(supplied).filter((key) => !(PROFILE_FIELDS as readonly string[]).includes(key))
        const invalid = PROFILE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(supplied, field)
          && supplied[field] !== null
          && typeof supplied[field] !== 'string')
        if (unknown.length > 0 || invalid.length > 0) {
          return {
            ...profileResult(charId),
            ok: false,
            error: unknown.length > 0 ? '包含未知角色设定字段' : '角色设定字段必须是字符串或 null',
            view: view(false),
          }
        }

        const character = s.characters[charId]
        const previousProfile = effectiveProfileFor(charId)
        const previousOverrides = { ...profileOverridesFor(charId) }
        const previousProfileClaims = splitStorageActive() && globalState
          ? [...(ensureGlobalMigrationState().claims.profiles[charId] || [])]
          : null
        const initialGreetingIndex = character.log.length === 0
          ? character.chatLines.findIndex((line: any) => line && line.who === 'heroine'
            && line.text === previousProfile.greeting)
          : -1
        const previousGreetingText = initialGreetingIndex >= 0
          ? character.chatLines[initialGreetingIndex].text
          : null
        const nextOverrides = { ...previousOverrides }
        for (const field of PROFILE_FIELDS) {
          if (!Object.prototype.hasOwnProperty.call(supplied, field)) continue
          const value = supplied[field] === null
            ? ''
            : sanitizeProfileText(supplied[field], PROFILE_LIMITS[field])
          if (value) nextOverrides[field] = value
          else delete nextOverrides[field]
        }
        character.profileOverrides = nextOverrides
        claimGlobalCharacter(
          'profiles',
          charId,
          PROFILE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(supplied, field)),
        )
        if (initialGreetingIndex >= 0) {
          character.chatLines[initialGreetingIndex].text = effectiveProfileFor(charId).greeting
        }
        try {
          await save('both')
        } catch (err) {
          character.profileOverrides = previousOverrides
          if (previousProfileClaims) ensureGlobalMigrationState().claims.profiles[charId] = previousProfileClaims
          if (previousGreetingText !== null) character.chatLines[initialGreetingIndex].text = previousGreetingText
          return {
            ...profileResult(charId),
            ok: false,
            error: '角色设定保存失败',
            view: view(false),
          }
        }
        return { ...profileResult(charId), view: view(false) }
      }
      case 'profile-reset': {
        ensureState()
        if (ensurePreferences().enabled !== false) syncHeroine(false)
        const charId = requestedProfileCharId(args)
        if (!charId) return { ok: false, error: '未知角色', view: view(false) }
        const character = s.characters[charId]
        const previousProfile = effectiveProfileFor(charId)
        const previousOverrides = { ...profileOverridesFor(charId) }
        const previousProfileClaims = splitStorageActive() && globalState
          ? [...(ensureGlobalMigrationState().claims.profiles[charId] || [])]
          : null
        const initialGreetingIndex = character.log.length === 0
          ? character.chatLines.findIndex((line: any) => line && line.who === 'heroine'
            && line.text === previousProfile.greeting)
          : -1
        const previousGreetingText = initialGreetingIndex >= 0
          ? character.chatLines[initialGreetingIndex].text
          : null
        character.profileOverrides = {}
        claimGlobalCharacter('profiles', charId)
        if (initialGreetingIndex >= 0) character.chatLines[initialGreetingIndex].text = builtInProfile(charId).greeting
        try {
          await save('both')
        } catch (err) {
          character.profileOverrides = previousOverrides
          if (previousProfileClaims) ensureGlobalMigrationState().claims.profiles[charId] = previousProfileClaims
          if (previousGreetingText !== null) character.chatLines[initialGreetingIndex].text = previousGreetingText
          return {
            ...profileResult(charId),
            ok: false,
            error: '角色设定保存失败',
            view: view(false),
          }
        }
        return { ...profileResult(charId), view: view(false) }
      }
      case 'view': {
        const p = ensurePreferences()
        if (p.enabled === false) return view()
        const heroineChanged = syncHeroine()
        const immediate = view(false)
        scheduleViewMaintenance(heroineChanged)
        return immediate
      }
      case 'chat': {
        const text = args && args.text ? String(args.text).trim().slice(0, 500) : ''
        if (!text) return view()
        if (ensurePreferences().enabled === false) return view()
        const runtime = splitStorageActive() ? currentWorkspaceRuntime() : null
        const controller = new AbortController()
        const signal = controller.signal
        const timer = setTimeout(() => {
          controller.abort(new Error('chat model work timed out after 110 seconds'))
        }, MODEL_STREAM_TIMEOUT_MS)
        let pendingChoiceCharId = ''
        try {
          try {
            await waitWithAbort(Promise.resolve(refreshActivityCache()), signal, 'chat activity lookup aborted')
          } catch (err) {
            if (!signal.aborted) console.warn('whale-galgame activity refresh failed before chat:', err)
          }

          const prepared = await runSerializedStateTask(async () => {
            ensureState()
            if (ensurePreferences().enabled === false) return { disabled: true, response: view() }
            syncHeroine()
            const charId = String(s.current)
            const character = s.characters[charId]
            const profile = { ...effectiveProfileFor(charId) }
            const scopedActivity = globalActivityCandidates()
            const pendingActivity = nextUnseenActivity(scopedActivity, character.activity)
            const selectedChoice = args && typeof args.choiceId === 'string'
              ? character.choices.find((choice: any) => choice && typeof choice === 'object' && choice.id === args.choiceId)
              : null
            return {
              disabled: false,
              charId,
              profile,
              pendingActivity,
              selectedChoice: selectedChoice ? { ...selectedChoice } : null,
              promptCharacter: { level: character.level, affection: character.affection },
              log: character.log.slice(-12).map((entry: any) => ({ ...entry })),
            }
          })
          if (prepared.disabled) return prepared.response

          let sel: any = null
          try {
            sel = await waitWithAbort(Promise.resolve(pickModel()), signal, 'chat model selection aborted')
          } catch (err) { /* the fallback line remains available */ }
          const effort = await pickEffort(sel, signal)
          const emotionPromise = classifyEmotion(text, signal)
          let reply = ''
          let usedFallback = false
          let fallbackReason = ''
          if (llm && sel && sel.model) {
            try {
              reply = await streamText({
                provider: sel.provider,
                model: sel.model,
                reasoningEffort: effort,
                messages: (() => {
                  const msgs: any[] = [{
                    role: 'user',
                    content: [{ type: 'text', text: '（场景：深海女仆工坊的会客厅，暖黄的灯光。当前角色正在和用户聊天。你只扮演当前角色，不要提到其他角色。）' }],
                    source: { kind: 'user' },
                  }]
                  for (const m of [...prepared.log, { role: 'user', text }].slice(-12)) {
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
                system: systemPrompt(prepared.profile, prepared.promptCharacter, prepared.pendingActivity),
                temperature: 0.9,
                maxTokens: 1200,
              }, signal)
            } catch (err: any) {
              console.error('whale-galgame llm call failed:', err && err.message ? err.message : String(err))
              fallbackReason = err && err.message ? err.message : String(err)
            }
          } else {
            fallbackReason = signal.aborted
              ? abortFailure(signal, 'chat model work aborted').message
              : 'no model available'
          }
          if (!reply) {
            reply = prepared.profile.address + '说的话，我听到啦～（今天的深海信号有点弱，但心意传达到了哦）'
            usedFallback = true
          }
          const emotion = await emotionPromise
          pendingChoiceCharId = prepared.charId
          choiceGenerationPending.add(pendingChoiceCharId)
          const committed = await runSerializedStateTask(async () => {
            ensureState()
            const settledBeforeChat = settle()
            const c = s.characters[prepared.charId]
            if (!c) throw new Error('chat character became unavailable before commit')
            c.log.push({ role: 'user', text })
            c.chatLines.push({
              who: 'user',
              text,
              emotion,
              choiceId: prepared.selectedChoice ? prepared.selectedChoice.id : null,
            })
            c.choices = []
            s.chatModelLabel = sel && sel.model ? String(sel.model) : ''
            s.lastModel = s.chatModelLabel
            s.fallbackUsed = usedFallback
            s.fallbackReason = fallbackReason
            if (prepared.pendingActivity && !usedFallback) {
              c.activity = rememberActivity(c.activity, prepared.pendingActivity)
            }
            c.log.push({ role: 'assistant', text: reply })
            if (c.log.length > 24) c.log = c.log.slice(-24)
            c.chatLines.push({ who: 'heroine', text: reply })
            const before = c.affection
            const delta = prepared.selectedChoice
              ? (prepared.selectedChoice.effect === 1 ? 1 : prepared.selectedChoice.effect === -1 ? -1 : 0)
              : (/喜欢|爱|可爱|想你|陪你|晚安|早安|抱抱|亲亲|约会|月圆/.test(text) ? 1 : (/讨厌|烦|滚|走开|无聊|再见/.test(text) ? -1 : 0))
            c.affection = Math.max(0, before + delta)
            const leveled = checkLevelUp(prepared.charId, c)
            await save(settledBeforeChat.changed || c.affection !== before || leveled ? 'both' : 'workspace')
            return { leveled, response: view() }
          })
          if (committed.leveled) {
            choiceGenerationPending.delete(pendingChoiceCharId)
            pendingChoiceCharId = ''
            return await runSerializedStateTask(async () => {
              const c = s.characters[prepared.charId]
              if (ensureReplyChoices(prepared.charId, c)) await save('global')
              return view()
            })
          }

          const choices = await generateChoices(prepared.promptCharacter, text, reply, signal)
          return await runSerializedStateTask(async () => {
            const c = s.characters[prepared.charId]
            if (!c) throw new Error('chat character became unavailable before choice commit')
            c.choices = choices
            choiceGenerationPending.delete(prepared.charId)
            pendingChoiceCharId = ''
            await save('workspace')
            return view()
          })
        } finally {
          if (pendingChoiceCharId) choiceGenerationPending.delete(pendingChoiceCharId)
          clearTimeout(timer)
        }
      }
      case 'side-story': {
        if (ensurePreferences().enabled === false) return view()
        const op = typeof args.op === 'string' ? args.op : 'start'
        if (op === 'close') {
          return await runSerializedStateTask(async () => {
            sideStoryState().scene = null
            await save('global')
            return view()
          })
        }
        if (op === 'advance') {
          return await runSerializedStateTask(async () => {
            const scene = sideStoryState().scene
            // A settled scene still has 合 queued behind the master's line, so
            // advancing stays available until the cursor reaches the last beat —
            // but never past an interlude that is still waiting on her.
            if (scene && !pendingSideStoryInterlude(scene) && scene.cursor < scene.beats.length - 1) {
              scene.cursor = scene.cursor + 1
              await save('global')
            }
            return view()
          })
        }
        if (op === 'choose' || op === 'speak') {
          // Free input runs one extra generation so the cast answers what the
          // master actually typed; a preset choice already carries its 合.
          let resolved: any = null
          if (op === 'speak') {
            const spoken = typeof args.text === 'string' ? args.text.trim().slice(0, SIDE_STORY_BEAT_LIMIT) : ''
            if (!spoken) return view()
            const pending = sideStoryState().scene
            if (!pending || pending.settled) return view()
            const outcome = await generateSideStoryFreeReply(pending, spoken)
            resolved = { text: spoken, effects: outcome.effects, reply: outcome.reply }
          }
          return await runSerializedStateTask(async () => {
            const state = sideStoryState()
            const scene = state.scene
            if (!scene || scene.settled) return view()
            const interlude = pendingSideStoryInterlude(scene)
            const choice = op === 'speak'
              ? resolved
              : (interlude ? interlude.choices : []).find((row: any) => row && row.id === args.choiceId)
            const outcome = settleSideStoryChoice(scene, choice)
            if (!outcome.applied) return view()
            if (scene.settled) {
              state.history = [
                ...state.history,
                { at: Date.now(), digest: scene.seed.summary, frame: scene.frame || '', twist: scene.twist || '', subject: scene.subject || '', cast: scene.cast.slice() },
              ].slice(-SIDE_STORY_HISTORY_LIMIT)
            }
            await save('global')
            return view()
          })
        }
        // op === 'start'
        const remaining = sideStoryCooldownRemaining()
        if (remaining > 0) return { ...view(), sideStoryError: 'cooldown' }
        const existing = sideStoryState().scene
        if (existing && !existing.settled) return view()
        await refreshActivityCache()
        const cast = pickSideStoryCast()
        const subject = pickSideStorySubject(cast)
        const seed = await resolveSideStorySeed(subject, typeof args.topic === 'string' ? args.topic : '')
        if (!seed) return { ...view(), sideStoryError: 'no-seed' }
        lastSideStoryFailure = ''
        // One retry: a malformed or over-long JSON payload is a coin flip, and
        // a second draft costs far less than the button appearing broken.
        let scene = await generateSideStoryScene(seed, cast)
        if (!scene) scene = await generateSideStoryScene(seed, cast)
        if (!scene) return { ...view(), sideStoryError: 'generation-failed', sideStoryErrorDetail: lastSideStoryFailure }
        return await runSerializedStateTask(async () => {
          const state = sideStoryState()
          state.scene = scene
          state.lastRunAt = Date.now()
          await save('global')
          return view()
        })
      }
      case 'skit-cg': {
        if (!cfg.dashscopeApiKey) return { ok: false, error: 'no-key' }
        const skitId = typeof args.skitId === 'string' ? args.skitId : ''
        return await runSerializedStateTask(async () => {
          const skit = sideStoryState().transcripts.find((row: any) => row.id === skitId)
          if (!skit) return { ok: false, error: 'not-found' }
          if (skit.cgId) return { ok: true, cgId: skit.cgId }
          const owner = skit.cast[0]
          const c = s.characters[owner]
          if (!c) return { ok: false, error: 'not-found' }
          const cgId = makeId('cg')
          c.cgs.push({
            id: cgId,
            status: 'generating',
            dataUrl: null,
            prompt: null,
            charId: owner,
            level: c.level || 1,
            at: Date.now(),
            seen: true,
            savedAsBg: false,
            error: null,
          })
          skit.cgId = cgId
          await save('global')
          void generateSkitCg(skitId, cgId)
          return { ok: true, cgId }
        })
      }
      case 'side-story-log': {
        const rows = sideStoryState().transcripts.slice().reverse().map((row: any) => ({
          id: row.id,
          at: row.at,
          seed: row.seed,
          cast: row.cast.map((id: string) => ({
            id,
            name: effectiveProfileFor(id).displayName,
            color: ROSTER[id] ? ROSTER[id].color : '#8fd8ef',
          })),
          lines: row.lines,
          cgId: row.cgId || '',
          cgStatus: row.cgId ? ((findCg(row.cgId) || {}).status || 'missing') : '',
        }))
        return { skits: rows, cgAvailable: !!cfg.dashscopeApiKey }
      }
      case 'sprite-data': {
        ensureState()
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
        ensureState()
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
        claimGlobalCharacter('sprites', charId)
        await save('global')
        return {
          ok: true,
          charId,
          revision: spriteRevisionFor(character),
          view: view(),
        }
      }
      case 'sprite-clear': {
        ensureState()
        if (ensurePreferences().enabled !== false) syncHeroine()
        const requestedCharId = shortSetting(args && (args.characterId || args.charId))
        const charId = requestedCharId ? (ROSTER[requestedCharId] ? requestedCharId : null) : s.current
        if (!charId) return { ok: false, error: '未知角色', view: view() }
        const character = s.characters[charId]
        const revision = nextSpriteRevision(character)
        character.customSprite = { dataUrl: null, fileName: '', revision }
        claimGlobalCharacter('sprites', charId)
        await save('global')
        return { ok: true, charId, revision, view: view() }
      }
      case 'bg-set-builtin': {
        ensureState()
        if (ensurePreferences().enabled !== false) syncHeroine()
        const key = shortSetting(args && (args.key || args.backgroundKey))
        const option = builtinBackgroundOptions(s.current).find((row: any) => row.key === key)
        if (!option) {
          return {
            ok: false,
            error: '当前角色不支持该内置背景',
            view: view(),
          }
        }
        const snapshot = captureBackgroundMutationSnapshot()
        s.characters[s.current].chosenBuiltinBackground = option.key
        // Selecting a built-in background is an explicit request to leave any
        // global upload/CG override and return to character-aware switching.
        s.bg = null
        for (const cg of allCgs()) cg.savedAsBg = false
        ensurePreferences().customBgName = ''
        bumpBackgroundRevision()
        claimGlobalValue('bg')
        claimGlobalPreferences(['customBgName'])
        await persistBackgroundMutation(snapshot)
        return {
          ok: true,
          charId: s.current,
          key: option.key,
          view: view(),
        }
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
          backgroundRevision: backgroundRevisionFor(s && s.backgroundRevision),
          fileName: custom && s && s.preferences && typeof s.preferences.customBgName === 'string'
            ? s.preferences.customBgName
            : '',
        }
      }
      case 'bg-upload': {
        ensureState()
        const dataUrl = validCustomBackground(args && args.dataUrl)
        if (!dataUrl) {
          return { ok: false, error: '仅支持 18MB 以内的 PNG、JPEG、WebP 或 AVIF 图片', view: view() }
        }
        const snapshot = captureBackgroundMutationSnapshot()
        s.bg = dataUrl
        for (const cg of allCgs()) cg.savedAsBg = false
        const p = ensurePreferences()
        p.customBgName = shortSetting(args && args.fileName).slice(0, 180)
        bumpBackgroundRevision()
        claimGlobalValue('bg')
        claimGlobalPreferences(['customBgName'])
        await persistBackgroundMutation(snapshot)
        return { ok: true, view: view() }
      }
      case 'bg-clear-custom': {
        const snapshot = captureBackgroundMutationSnapshot()
        if (s && typeof s.bg === 'string' && s.bg.startsWith('data:')) s.bg = null
        const p = ensurePreferences()
        p.customBgName = ''
        bumpBackgroundRevision()
        claimGlobalValue('bg')
        claimGlobalPreferences(['customBgName'])
        await persistBackgroundMutation(snapshot)
        return { ok: true, view: view() }
      }
      case 'cg-gallery': {
        return {
          items: allCgs().filter((cg: any) => cg.status === 'ready' && cg.dataUrl).map((cg: any) => ({
            id: cg.id,
            status: cg.status,
            prompt: cg.prompt,
            charId: cg.charId,
            name: ROSTER[cg.charId] ? effectiveProfileFor(cg.charId).displayName : cg.charId,
            level: cg.level,
            at: cg.at,
            seen: cg.seen === true,
            savedAsBg: cg.savedAsBg === true,
            error: cg.error || null,
          })),
        }
      }
      case 'cg-data': {
        const id = shortSetting(args && args.id)
        const cg = id ? findCg(id) : null
        if (!cg || cg.status !== 'ready' || typeof cg.dataUrl !== 'string' || !cg.dataUrl.startsWith('data:')) {
          return { ok: false, error: 'CG 不存在或尚未生成完成' }
        }
        // The gallery list stays lightweight; multi-megabyte image payloads
        // are returned only when the client explicitly opens one CG.
        return {
          ok: true,
          id: cg.id,
          status: cg.status,
          dataUrl: cg.dataUrl,
          prompt: cg.prompt,
          charId: cg.charId,
          name: ROSTER[cg.charId] ? effectiveProfileFor(cg.charId).displayName : cg.charId,
          level: cg.level,
          at: cg.at,
          seen: cg.seen === true,
          savedAsBg: cg.savedAsBg === true,
        }
      }
      case 'cg-ack': {
        const cg = args && typeof args.id === 'string' ? findCg(args.id) : currentCg()
        if (cg) cg.seen = true
        await save('global')
        return view()
      }
      case 'cg-save-bg': {
        const cg = args && typeof args.id === 'string' ? findCg(args.id) : currentCg()
        let snapshot: any = null
        if (s && cg && cg.status === 'ready' && cg.dataUrl) {
          snapshot = captureBackgroundMutationSnapshot()
          for (const item of allCgs()) item.savedAsBg = item.id === cg.id
          cg.seen = true
          s.bg = 'cg:' + cg.id
          ensurePreferences().customBgName = ''
          bumpBackgroundRevision()
          claimGlobalValue('bg')
          claimGlobalPreferences(['customBgName'])
        }
        if (snapshot) await persistBackgroundMutation(snapshot)
        else await save('global')
        return view()
      }
      case 'cg-clear-bg': {
        let snapshot: any = null
        if (currentStateBacking()) {
          snapshot = captureBackgroundMutationSnapshot()
          s.bg = null
          for (const cg of allCgs()) cg.savedAsBg = false
          ensurePreferences().customBgName = ''
          bumpBackgroundRevision()
          claimGlobalValue('bg')
          claimGlobalPreferences(['customBgName'])
        }
        if (snapshot) await persistBackgroundMutation(snapshot)
        else await save('global')
        return view()
      }
      case 'pet-set': {
        ensureState()
        const p = ensurePreferences()
        if (args && typeof args.enabled === 'boolean') p.petEnabled = args.enabled
        if (args && typeof args.enabled === 'boolean') claimGlobalPreferences(['petEnabled'])
        await save('global')
        return view()
      }
      case 'reset': {
        ensureState()
        for (const id of ROSTER_IDS) {
          s.characters[id].level = 1
          s.characters[id].affection = 0
        }
        const now = Date.now()
        if (splitStorageActive()) globalState.relationshipLastActiveAt = now
        else if (s.tokens) s.tokens.lastActiveAt = now
        // “重新开始”只重置关系进度。CG、立绘、角色设定、背景、
        // preferences，以及各工作区的聊天/任务上下文全部保留。
        if (splitStorageActive()) ensureGlobalMigrationState().claims.relationshipReset = true
        await save(splitStorageActive() ? 'global' : 'both')
        return view()
      }
      default:
        return view()
    }
  }

  async function handleAction(action: string, args: any): Promise<any> {
    if (!splitStorageActive()) {
      if (action !== 'chat') return dispatchAction(action, args)
      return runSerializedChatTask(null, () => dispatchAction(action, args))
    }

    await ensureGlobalReady()
    const sessionId = args && typeof args.sessionId === 'string' ? args.sessionId.trim() : ''
    const explicitCharacterId = shortSetting(args && (args.characterId || args.charId))
    const hasExplicitCharacter = !!ROSTER[explicitCharacterId]
    const globalReadOnly = new Set([
      'view',
      'model-options',
      'settings-get',
      'profile-get',
      'sprite-data',
      'bg-data',
      'cg-gallery',
      'cg-data',
    ])
    const globalWithoutWorkspace = new Set([
      'settings-set',
      'profile-set',
      'profile-reset',
      'sprite-upload',
      'sprite-clear',
      'bg-upload',
      'bg-clear-custom',
      'cg-ack',
      'cg-save-bg',
      'cg-clear-bg',
      'pet-set',
      'reset',
    ])
    const explicitCharacterGlobal = hasExplicitCharacter && new Set([
      'profile-set',
      'profile-reset',
      'sprite-upload',
      'sprite-clear',
    ]).has(action)
    let runtime: any
    let unresolvedSession = false
    if (!sessionId && (globalReadOnly.has(action) || globalWithoutWorkspace.has(action) || explicitCharacterGlobal)) {
      runtime = makeWorkspaceRuntime('', 'global-read')
    } else {
      const descriptor = await workspaceForSession(sessionId)
      runtime = await ensureWorkspaceReady(descriptor.root, descriptor.key)
      unresolvedSession = !!descriptor.sessionId && !descriptor.root
      if (!unresolvedSession) activateWorkspaceRuntime(runtime)
    }

    const requiresResolvedWorkspace = new Set(['chat', 'bg-set-builtin']).has(action)
      || ((!hasExplicitCharacter) && new Set([
        'profile-set',
        'profile-reset',
        'sprite-upload',
        'sprite-clear',
      ]).has(action))
    if (!sessionId && !hasExplicitCharacter && new Set([
      'profile-set',
      'profile-reset',
      'sprite-upload',
      'sprite-clear',
    ]).has(action)) {
      const isolatedView = workspaceStateContext.run(runtime, () => view(false))
      return {
        ok: false,
        retryable: true,
        workspaceResolving: false,
        error: '缺少 characterId 或工作区会话；未修改任何角色数据。',
        view: isolatedView,
      }
    }
    if ((!sessionId || unresolvedSession) && requiresResolvedWorkspace) {
      const isolatedView = workspaceStateContext.run(runtime, () => view(false))
      return {
        ...isolatedView,
        ok: false,
        retryable: true,
        workspaceResolving: !!sessionId,
        error: sessionId
          ? '正在确认当前工作区，请稍后重试。此次操作未写入任何存档。'
          : '此操作需要明确的工作区会话；此次操作未写入任何存档。',
        view: isolatedView,
      }
    }
    const execute = () => workspaceStateContext.run(runtime, () => dispatchAction(action, args))
    const mutating = new Set([
      'settings-set',
      'profile-set',
      'profile-reset',
      'sprite-upload',
      'sprite-clear',
      'bg-set-builtin',
      'bg-upload',
      'bg-clear-custom',
      'cg-ack',
      'cg-save-bg',
      'cg-clear-bg',
      'pet-set',
      'reset',
    ])
    if (action === 'chat' || action === 'side-story') return runSerializedChatTask(runtime, execute)
    return mutating.has(action) ? runSerializedStateTask(execute) : execute()
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
    void ensureReady().catch((err: any) => {
      console.error('whale-galgame initial state load failed:', err && err.message ? err.message : String(err))
    })
  })
}
