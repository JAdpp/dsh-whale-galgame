import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import * as nativeFs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply } from '../src/index.ts'

type SharedDisk = Map<string, string>

function workspaceFile(root: string): string {
  return root.replace(/[\\/]$/, '') + '\\.whale-girl-save.json'
}

function missing(target: string): Error & { code: string } {
  return Object.assign(new Error('ENOENT: ' + target), { code: 'ENOENT' })
}

/** Events that classify into a debugging activity, so a story seed exists. */
function debugEvents(now: number): any[] {
  return [
    { type: 'turn/start', seq: 0, time: now - 5_000, data: { turn: 1 } },
    {
      type: 'user/message',
      seq: 1,
      time: now - 4_000,
      data: {
        id: 'message-1',
        role: 'user',
        content: [{ type: 'text', text: '帮我排查这个 TypeScript 编译报错的 bug' }],
        source: { kind: 'user' },
      },
    },
    { type: 'turn/end', seq: 2, time: now - 2_000, data: { turn: 1, reason: { kind: 'completed' } } },
  ]
}

function choiceSet(lead: string, second: string, tag: string): any[] {
  return [
    {
      text: tag + '：我陪你一起扛',
      effects: { [lead]: 1, [second]: 1 },
      reply: [{ speaker: lead, text: '真、真的吗？那我可当真了。', emotion: 'shy' }],
    },
    {
      text: tag + '：都少说两句吧',
      effects: { [lead]: 1, [second]: -1 },
      reply: [{ speaker: second, text: '好吧好吧，我闭嘴。', emotion: 'exasperated' }],
    },
    {
      text: tag + '：确实是菜了点',
      effects: { [lead]: -1, [second]: -1 },
      reply: [{ speaker: lead, text: '主人你也太直白了！', emotion: 'angry' }],
    },
  ]
}

/** Three acts: the master gets to speak at the end of the first two. */
function defaultScene(cast: string[]): any {
  const [lead, second, third] = cast
  return {
    acts: [
      {
        beats: [
          { speaker: 'narrator', text: '茶具还没收完，话头已经起来了。' },
          { speaker: lead, text: '听说我最近老在跟 bug 较劲？', emotion: 'shy' },
          { speaker: second, text: '这话可不是我传的哦。', emotion: 'cheerful' },
        ],
        choices: choiceSet(lead, second, '一'),
      },
      {
        beats: [
          { speaker: second, text: '不过你上回连茶壶都拧反了。', emotion: 'cheerful' },
          { speaker: third || lead, text: '这个我可以作证。', emotion: 'serious' },
          { speaker: lead, text: '你们两个说好的吧！', emotion: 'angry' },
        ],
        choices: choiceSet(lead, second, '二'),
      },
      {
        beats: [{ speaker: 'narrator', text: '茶终于凉了，没人记得是谁泡的。' }],
      },
    ],
  }
}

/**
 * Saves and background maintenance keep running after a request resolves. Give
 * them a tick before the temp home disappears, otherwise a late write lands
 * during the next test and shows up as a spurious failure.
 */
async function drain(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 60))
}

function makeHarness(options: {
  root: string
  dshHome: string
  files: SharedDisk
  scene?: (cast: string[]) => any
  freeReply?: (cast: string[]) => any
  web?: { search: (req: any) => Promise<any> } | null
  onSearch?: (req: any) => void
}) {
  const now = Date.now()
  const sessions = [{
    header: { version: 0, id: 'side-session', cwd: options.root, createdAt: now - 10_000 },
    live: true,
    persisted: true,
    events: debugEvents(now),
  }]
  const versions = new Map<string, number>()
  let routeHandler: any = null

  const services: any = {
    fs: {
      resolve: async (_name: string, scope?: any) => workspaceFile(String(scope && scope.cwd || '')),
      stat: async (target: string) => options.files.has(target)
        ? { type: 'file', version: versions.get(target) }
        : undefined,
      readText: async (target: string) => {
        if (!options.files.has(target)) throw missing(target)
        return options.files.get(target)!
      },
      writeText: async (target: string, value: string) => {
        const before = options.files.has(target) ? options.files.get(target)! : null
        const version = versions.get(target) || 0
        options.files.set(target, value)
        versions.set(target, version + 1)
        return { operation: before === null ? 'create' : 'update', version: version + 1 }
      },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => sessions },
    workspaceRegistry: { list: () => [{ path: options.root }] },
    agentDefaultModel: {
      currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }),
    },
    dshHomePath: (...segments: string[]) => join(options.dshHome, ...segments),
    sessionQuery: {
      listSessions: async () => sessions,
      listEvents: async () => [],
      filterSessions: async () => sessions,
    },
  }

  const ctx: any = {
    dshHomePath: services.dshHomePath,
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm: {
      listProviders: () => [{ id: 'deepseek-official', name: 'DeepSeek' }],
      listModels: async () => [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', inputModalities: ['text'] }],
      resolveModelInfo: async () => ({}),
      stream: async function* (opts: any): AsyncGenerator<any> {
        const system = String(opts && opts.system || '')
        // The follow-up prompt also says 小剧场编剧, so it has to be matched first.
        if (system.includes('正在续写结尾')) {
          const cast = [...system.matchAll(/^- ([a-z]+)（/gm)].map((row) => row[1])
          const build = options.freeReply || ((ids: string[]) => ({
            effects: { [ids[0]]: 1 },
            reply: [{ speaker: ids[0], text: '主人这么说，我可就当真了。', emotion: 'shy' }],
          }))
          yield { type: 'text-delta', text: JSON.stringify(build(cast)) }
          return
        }
        if (system.includes('小剧场编剧')) {
          // The server owns cast selection; recover it from the prompt the way a
          // real model would, so the fixture cannot drift from the real pick.
          const cast = [...system.matchAll(/^- ([a-z]+)（/gm)].map((row) => row[1])
          const build = options.scene || defaultScene
          yield { type: 'text-delta', text: JSON.stringify(build(cast)) }
          return
        }
        yield { type: 'text-delta', text: system.includes('情绪分类器') ? 'normal' : '主人辛苦啦。' }
      },
    },
    inject: (names: string[], callback: Function) => {
      if (names.includes('sessionQuery')) callback({ sessionQuery: services.sessionQuery })
      // A profile without the web seam simply never fires this callback, which
      // is what the optional-injection contract has to survive.
      else if (names.includes('web')) {
        if (options.web) {
          callback({
            web: {
              search: async (req: any) => {
                if (options.onSearch) options.onSearch(req)
                return options.web!.search(req)
              },
            },
          })
        }
      }
      else callback(services)
    },
    on: () => undefined,
    effect: (callback: Function) => callback(),
  }

  apply(
    ctx,
    { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' },
    { nativeGlobalIo: nativeFs },
  )

  async function post(action: string, args: any = {}): Promise<any> {
    assert.equal(typeof routeHandler, 'function')
    const req: any = Readable.from([JSON.stringify({ action, args: { ...args, sessionId: 'side-session' } })])
    req.method = 'POST'
    let status = 0
    let body = ''
    const res = {
      writeHead: (nextStatus: number) => { status = nextStatus },
      end: (value: string) => { body = value },
    }
    await routeHandler(req, res)
    assert.equal(status, 200, body)
    return JSON.parse(body)
  }

  return { post }
}

/** Advance until the master is asked to speak, or the scene runs out of beats. */
async function playToChoices(post: Function, view: any): Promise<any> {
  let current = view
  for (let step = 0; step < 20; step++) {
    const scene = current.sideStory.scene
    if (!scene) break
    if (Array.isArray(scene.choices) && scene.choices.length > 0) break
    if (scene.cursor >= scene.beats.length - 1) break
    current = await post('side-story', { op: 'advance' })
  }
  return current
}

test('gives the master more than one place to speak inside a single skit', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({ root: 'E:\\workspace\\side', dshHome, files })
    const entry = await post('view')
    assert.equal(entry.sideStory.scene, null)

    const started = await post('side-story', { op: 'start' })
    const scene = started.sideStory.scene
    assert.ok(scene, 'a scene should have been generated')
    assert.equal(scene.interludeCount, 2, 'the master speaks twice, not once at the end')
    assert.equal(scene.cast.length >= 2, true)
    assert.equal(scene.cast[0].id, entry.current, 'the current heroine headlines')
    const castIds = new Set(scene.cast.map((row: any) => row.id))
    for (const beat of scene.beats) {
      assert.equal(
        beat.speaker === 'narrator' || castIds.has(beat.speaker),
        true,
        'beat speaker is not on stage: ' + beat.speaker,
      )
    }

    const lead = scene.cast[0].id
    const second = scene.cast[1].id
    const before = await post('view')
    const mainTailBefore = JSON.parse(JSON.stringify(before.history))

    // First interlude.
    const firstStop = await playToChoices(post, started)
    assert.equal(firstStop.sideStory.scene.choices.length, 3, 'the first interlude offers three lines')
    const firstPick = firstStop.sideStory.scene.choices.find(
      (row: any) => row.effects[lead] === 1 && row.effects[second] === 1,
    )
    assert.ok(firstPick)
    const afterFirst = await post('side-story', { op: 'choose', choiceId: firstPick.id })
    assert.equal(afterFirst.sideStory.scene.settled, false, 'one choice must not end the whole skit')
    assert.equal(afterFirst.sideStory.scene.interludesLeft, 1)
    assert.equal(afterFirst.affection, before.affection + 1)
    assert.equal(
      afterFirst.sideStory.scene.beats[afterFirst.sideStory.scene.cursor].speaker,
      'user',
      'playback resumes on the line she just spoke',
    )

    // Second interlude.
    const secondStop = await playToChoices(post, afterFirst)
    assert.equal(secondStop.sideStory.scene.choices.length, 3, 'the second interlude offers three more lines')
    assert.notEqual(
      secondStop.sideStory.scene.choices[0].id,
      firstStop.sideStory.scene.choices[0].id,
      'the second interlude is its own set of lines',
    )
    const secondPick = secondStop.sideStory.scene.choices.find((row: any) => row.effects[lead] === 1)
    assert.ok(secondPick)
    const settled = await post('side-story', { op: 'choose', choiceId: secondPick.id })
    assert.equal(settled.sideStory.scene.settled, true, 'the skit closes once every interlude is used')
    assert.equal(settled.affection, before.affection + 2, 'both choices moved her, one step each')

    const finished = await playToChoices(post, settled)
    const finalScene = finished.sideStory.scene
    assert.equal(finalScene.beats.at(-1).speaker, 'narrator', 'the closing beat reveals the outcome')
    assert.equal(finalScene.beats.filter((row: any) => row.speaker === 'user').length, 2)

    // The main dialogue box renders the tail of chatLines, so a skit must not
    // append to it: doing so replaced the heroine's last line when a skit ended.
    assert.deepEqual(finished.history, mainTailBefore, 'a skit must leave the main conversation untouched')

    const log = await post('side-story-log')
    assert.equal(log.skits.length, 1)
    assert.deepEqual(log.skits[0].cast.map((row: any) => row.id), scene.cast.map((row: any) => row.id))
    assert.equal(log.skits[0].lines.filter((row: any) => row.who === 'user').length, 2)

    const closed = await post('side-story', { op: 'close' })
    assert.equal(closed.sideStory.scene, null)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('will not let the master skip past an interlude with the continue button', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-skip-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({ root: 'E:\\workspace\\side-skip', dshHome, files })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const stopped = await playToChoices(post, started)
    const cursorAtInterlude = stopped.sideStory.scene.cursor
    assert.equal(stopped.sideStory.scene.choices.length, 3)

    const nudged = await post('side-story', { op: 'advance' })
    assert.equal(nudged.sideStory.scene.cursor, cursorAtInterlude, 'advance must be inert while she owes a line')
    assert.equal(nudged.sideStory.scene.choices.length, 3)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('refuses a second skit inside the cooldown window', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-cd-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({ root: 'E:\\workspace\\side-cd', dshHome, files })
    await post('view')
    const first = await post('side-story', { op: 'start' })
    assert.ok(first.sideStory.scene)
    await post('side-story', { op: 'close' })

    const second = await post('side-story', { op: 'start' })
    assert.equal(second.sideStoryError, 'cooldown')
    assert.equal(second.sideStory.scene, null, 'the cooldown must not queue another scene')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('drops a scene that never lets the master speak', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-mute-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\side-mute',
      dshHome,
      files,
      // Well-formed beats, but no act ever hands over to the master.
      scene: (cast) => ({
        acts: [
          { beats: [{ speaker: 'narrator', text: '茶凉了。' }, { speaker: cast[0], text: '嗯。', emotion: 'serious' }] },
          { beats: [{ speaker: cast[1], text: '哦。', emotion: 'cheerful' }] },
        ],
      }),
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    assert.equal(started.sideStoryError, 'generation-failed')
    assert.equal(started.sideStory.scene, null)
    assert.equal(started.sideStory.cooldownMs, 0, 'a rejected generation must not burn the cooldown')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('rejects choices with no reply, so the master is never left talking to a wall', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-noreply-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\side-noreply',
      dshHome,
      files,
      scene: (cast) => ({
        acts: [
          {
            beats: [{ speaker: cast[0], text: '听说我又在跟 bug 较劲。', emotion: 'shy' }],
            choices: [
              { text: '我陪你抓', effects: { [cast[0]]: 1, [cast[1]]: 1 } },
              { text: '都少说两句', effects: { [cast[0]]: 1, [cast[1]]: -1 } },
              { text: '确实菜', effects: { [cast[0]]: -1, [cast[1]]: -1 } },
            ],
          },
          { beats: [{ speaker: 'narrator', text: '散了。' }] },
        ],
      }),
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    assert.equal(started.sideStoryError, 'generation-failed')
    assert.equal(started.sideStory.scene, null)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('leaves main-line reply choices free of the multi-character effects map', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-main-'))
  const files: SharedDisk = new Map()
  try {
    const { post } = makeHarness({ root: 'E:\\workspace\\side-main', dshHome, files })
    const entry = await post('view')
    assert.equal(entry.choices.length, 3)
    for (const choice of entry.choices) {
      assert.equal(Object.hasOwn(choice, 'effects'), false, 'main-line choices settle on one character only')
    }
  } finally {
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('lets the master speak her own line at an interlude', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-speak-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({ root: 'E:\\workspace\\side-speak', dshHome, files })
    const entry = await post('view')
    const started = await post('side-story', { op: 'start' })
    const stopped = await playToChoices(post, started)
    assert.equal(stopped.sideStory.scene.choices.length, 3)

    const spoken = await post('side-story', { op: 'speak', text: '我请你吃小鱼干' })
    const scene = spoken.sideStory.scene
    const userBeat = scene.beats.find((row: any) => row.speaker === 'user')
    assert.ok(userBeat)
    assert.equal(userBeat.text, '我请你吃小鱼干', 'the typed line lands on stage verbatim')
    assert.equal(scene.settled, false, 'a typed line settles its interlude, not the whole skit')
    // Effects come from what she actually said, resolved by the follow-up call.
    assert.equal(spoken.affection, entry.affection + 1)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('still settles an interlude when the follow-up generation fails', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-speak-bad-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  const originalConsoleError = console.error
  Math.random = () => 0
  console.error = () => undefined
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\side-speak-bad',
      dshHome,
      files,
      freeReply: () => ({ nonsense: true }),
    })
    const entry = await post('view')
    const started = await post('side-story', { op: 'start' })
    await playToChoices(post, started)
    const spoken = await post('side-story', { op: 'speak', text: '随便说说' })
    const userBeat = spoken.sideStory.scene.beats.find((row: any) => row.speaker === 'user')
    assert.ok(userBeat, 'a broken reply must not strand the interlude')
    // Neutral fallback: playback continues but nobody moves.
    assert.equal(spoken.affection, entry.affection)
  } finally {
    Math.random = originalRandom
    console.error = originalConsoleError
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('carries the cooldown and the recorded skit across a restart', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-side-restart-'))
  const files: SharedDisk = new Map()
  const root = 'E:\\workspace\\side-restart'
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const first = makeHarness({ root, dshHome, files })
    await first.post('view')
    let current = await first.post('side-story', { op: 'start' })
    const lead = current.sideStory.scene.cast[0].id
    // Walk the whole skit: two interludes, then the closing beat.
    for (let round = 0; round < 2; round++) {
      current = await playToChoices(first.post, current)
      const choice = current.sideStory.scene.choices[0]
      assert.ok(choice, 'expected an interlude on round ' + round)
      current = await first.post('side-story', { op: 'choose', choiceId: choice.id })
    }
    assert.equal(current.sideStory.scene.settled, true)
    const affectionAfter = current.affection
    await first.post('side-story', { op: 'close' })

    // A fresh process must see the same global progress: skit state lives in the
    // global save, not in the workspace marker file.
    const second = makeHarness({ root, dshHome, files })
    const reloaded = await second.post('view')
    assert.equal(reloaded.current, lead)
    assert.equal(reloaded.affection, affectionAfter, 'affection from the skit survives a restart')
    assert.equal(reloaded.sideStory.cooldownMs > 0, true, 'the cooldown must outlive the process')

    const reloadedLog = await second.post('side-story-log')
    assert.equal(reloadedLog.skits.length, 1, 'the recorded skit must outlive the process')
    assert.equal(reloadedLog.skits[0].lines.length > 0, true)

    const blocked = await second.post('side-story', { op: 'start' })
    assert.equal(blocked.sideStoryError, 'cooldown')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

function freshSources(rows: Array<[string, string]>): any {
  const now = new Date().toISOString()
  return { sources: rows.map(([title, snippet], i) => ({ url: 'https://example.com/' + i, title, snippet, publishedAt: now })), truncated: false }
}

test('takes its seed from the web when the seam offers something fresh', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-web-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  const queries: string[] = []
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\web-ok',
      dshHome,
      files,
      onSearch: (req) => queries.push(String(req.query)),
      web: { search: async () => freshSources([['新版本手感变轻快了', '社区普遍觉得响应更快'], ['有人在玩新的梗', '截图满天飞']]) },
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const scene = started.sideStory.scene
    assert.ok(scene, 'a web-seeded scene should generate')
    assert.equal(scene.seed.kind, 'web')
    assert.equal(scene.sources.length > 0, true, 'web seeds must carry citeable sources')
    assert.equal(scene.sources[0].url.startsWith('https://'), true)
    // The query may only carry character-facing words, never the master's data.
    assert.equal(queries.length, 1)
    assert.equal(/bug|TypeScript|排查|主人/.test(queries[0]), false, 'the query must not leak session content: ' + queries[0])
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('routes serious material away from comedy and falls back to the local seed', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-web-block-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\web-block',
      dshHome,
      files,
      web: { search: async () => freshSources([
        ['公司面临集体诉讼', '监管部门已介入调查'],
        ['大规模裁员传闻', '据称影响数百人'],
        ['数据泄露事件复盘', '安全漏洞细节'],
      ]) },
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const scene = started.sideStory.scene
    assert.ok(scene, 'the run should still produce a scene')
    assert.equal(scene.seed.kind, 'activity', 'lawsuits and layoffs are not skit material')
    assert.deepEqual(scene.sources, [], 'a fallback seed carries no citations')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('never touches the network when the seed source is set to activity', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-web-off-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  let searched = 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\web-off',
      dshHome,
      files,
      onSearch: () => { searched += 1 },
      web: { search: async () => freshSources([['随便什么', '内容']]) },
    })
    await post('view')
    const set = await post('settings-set', { sideStorySeedSource: 'activity' })
    assert.equal(set.ok, true)
    const started = await post('side-story', { op: 'start' })
    assert.equal(started.sideStory.scene.seed.kind, 'activity')
    assert.equal(searched, 0, 'the offline setting must make no request at all')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('a topic typed by the master outranks both the web and the activity feed', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-topic-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  let searched = 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\topic',
      dshHome,
      files,
      onSearch: () => { searched += 1 },
      web: { search: async () => freshSources([['网上的话题', '不该被用到']]) },
    })
    await post('view')
    const started = await post('side-story', { op: 'start', topic: '谁泡的茶最难喝' })
    const scene = started.sideStory.scene
    assert.equal(scene.seed.kind, 'manual')
    assert.equal(scene.seed.summary.includes('谁泡的茶最难喝'), true)
    assert.equal(searched, 0, 'a supplied topic makes the web lookup pointless')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('still works when the profile has no web seam at all', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-noweb-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    // web omitted entirely: ctx.inject(['web']) never fires its callback.
    const { post } = makeHarness({ root: 'E:\\workspace\\noweb', dshHome, files })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    assert.ok(started.sideStory.scene, 'a missing web seam must not disable the feature')
    assert.equal(started.sideStory.scene.seed.kind, 'activity')
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('finishes a sentence instead of chopping an overlong beat mid-word', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-trim-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\trim',
      dshHome,
      files,
      scene: (cast) => ({
        acts: [
          {
            beats: [
              // 30 chars, a full stop, then more: the stop is the natural cut.
              { speaker: cast[0], text: '听说外面有人讲我最近写的东西又慢又啰嗦，我其实挺在意的。不过主人从来没有嫌弃过我这一点呢', emotion: 'shy' },
            ],
            choices: choiceSet(cast[0], cast[1], '一'),
          },
          { beats: [{ speaker: 'narrator', text: '散了。' }] },
        ],
      }),
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const beat = started.sideStory.scene.beats[0]
    assert.equal(
      /[。！？～…]$/.test(beat.text),
      true,
      'an overlong beat should end on punctuation, got: ' + beat.text,
    )
    assert.equal(beat.text.endsWith('我其实挺在意的。'), true, 'got: ' + beat.text)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('collapses providers that repeat a page title back on itself', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-dupe-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const doubled = '实测新版本：强得意外，慢得着急 - 实测新版本：强得意外，慢得着急'
    const { post } = makeHarness({
      root: 'E:\\workspace\\dupe',
      dshHome,
      files,
      web: { search: async () => ({
        sources: [{ url: 'https://example.com/a', title: doubled, snippet: '社区讨论', publishedAt: new Date().toISOString() }],
        truncated: false,
      }) },
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const scene = started.sideStory.scene
    assert.equal(scene.seed.kind, 'web')
    assert.equal(scene.sources[0].title, '实测新版本：强得意外，慢得着急', 'got: ' + scene.sources[0].title)
    assert.equal(scene.seed.summary.includes(' - '), false, 'got: ' + scene.seed.summary)
  } finally {
    Math.random = originalRandom
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})

test('writes display names when the model leaks a raw roster id into narration', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-ids-'))
  const files: SharedDisk = new Map()
  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const { post } = makeHarness({
      root: 'E:\\workspace\\ids',
      dshHome,
      files,
      scene: (cast) => ({
        acts: [
          {
            beats: [
              { speaker: 'narrator', text: cast[1] + '凑过来按下播放键，听说 Kimi 慢得着急。' },
            ],
            choices: choiceSet(cast[0], cast[1], '一'),
          },
          { beats: [{ speaker: 'narrator', text: '散了。' }] },
        ],
      }),
    })
    await post('view')
    const started = await post('side-story', { op: 'start' })
    const scene = started.sideStory.scene
    const narration = scene.beats[0].text
    const secondName = scene.cast[1].name
    assert.equal(narration.startsWith(secondName), true, 'got: ' + narration)
    assert.equal(narration.includes(scene.cast[1].id), false, 'a bare id must not survive: ' + narration)
    // A capitalised model name is legitimate rumour material and must survive.
    assert.equal(narration.includes('Kimi'), true, 'got: ' + narration)
  } finally {
    await drain()
    rmSync(dshHome, { recursive: true, force: true })
  }
})
