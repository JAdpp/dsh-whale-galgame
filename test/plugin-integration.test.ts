import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply } from '../src/index.ts'

test('binds the active workspace, counts Harness usage, and consumes a safe activity once', async () => {
  const root = 'E:\\workspace\\integration'
  const sessionId = 'session-integration'
  const otherSessionId = 'session-other-workspace'
  const now = Date.now()
  const header = { version: 0, id: sessionId, createdAt: now - 10_000, cwd: 'e:\\WORKSPACE\\integration\\' }
  const otherHeader = { version: 0, id: otherSessionId, createdAt: now - 9_000, cwd: 'E:\\workspace\\other' }
  const events = [
    { type: 'turn/start', seq: 0, time: now - 5_000, data: { turn: 1 } },
    {
      type: 'user/message',
      seq: 1,
      time: now - 4_000,
      data: {
        id: 'message-1',
        role: 'user',
        content: [{ type: 'text', text: '请排查 TypeScript 插件的 bug，私有文件在 X:\\fixture\\secret.ts' }],
        source: { kind: 'user' },
      },
    },
    { type: 'tool/call', seq: 2, time: now - 3_000, data: { turn: 1, step: 0, callId: 'call-1', name: 'exec_command', arguments: '{"private":true}' } },
    { type: 'turn/end', seq: 3, time: now - 2_000, data: { turn: 1, reason: { kind: 'completed' } } },
  ]

  let routeHandler: any = null
  let saved = ''
  const listeners = new Map<string, Function>()
  const mainSystems: string[] = []
  const llm = {
    listProviders: () => [{ id: 'deepseek-official', name: 'DeepSeek' }],
    listModels: () => [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' }],
    resolveModelInfo: async () => ({}),
    stream: async function* (options: any): AsyncGenerator<any> {
      const system = String(options && options.system || '')
      let text = '主人刚才又在理复杂的逻辑呢，不许熬夜哦。'
      if (system.includes('情绪分类器')) text = 'normal'
      else if (system.includes('对话选项生成器')) text = '{"positive":"陪你休息一下","neutral":"继续聊聊吧","negative":"我想先静静"}'
      else {
        mainSystems.push(system)
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
      yield { type: 'text-delta', text }
    },
  }
  const services: any = {
    fs: {
      resolve: async (name: string) => root + '\\' + name,
      readText: async () => { throw new Error('no save yet') },
      writeText: async (_target: string, value: string) => { saved = value },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => [] },
    workspaceRegistry: { list: () => [{ path: root }] },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }) },
    sessionQuery: {
      listSessions: async () => [
        { header, live: true, persisted: true },
        { header: otherHeader, live: true, persisted: true },
      ],
      listEvents: async () => events.map((event) => ({ sessionId, seq: event.seq, time: event.time, type: event.type })),
      filterSessions: async () => [{ header, live: true, persisted: true }],
      readSession: async (id: string) => id === otherSessionId
        ? { session: otherHeader, events: [] }
        : { session: header, events },
    },
  }
  const ctx: any = {
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm,
    inject: (_names: string[], callback: Function) => callback(services),
    on: (event: string, callback: Function) => { listeners.set(event, callback) },
    effect: (callback: Function) => callback(),
  }
  apply(ctx, { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' })
  assert.equal(typeof routeHandler, 'function')

  async function post(action: string, args: any = {}): Promise<any> {
    const req: any = Readable.from([JSON.stringify({ action, args })])
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

  await post('view', { sessionId })
  const onSessionEvent = listeners.get('session/event')
  assert.equal(typeof onSessionEvent, 'function')
  onSessionEvent!({ header }, {
    type: 'assistant/message',
    data: { usage: { inputTokens: 3_000, outputTokens: 2_000, cacheReadTokens: 8_000 } },
  })
  const afterUsage = await post('view', { sessionId })
  assert.equal(afterUsage.affection, 1)

  await Promise.all([
    post('chat', { sessionId, text: '今天想和你聊聊' }),
    post('chat', { sessionId, text: '再说一句吧' }),
  ])
  assert.equal(mainSystems.length, 2)
  assert.match(mainSystems[0], /Harness 近期任务事件：类别是「代码调试」/)
  assert.doesNotMatch(mainSystems[0], /secret|fixture|exec_command|private/i)
  assert.doesNotMatch(mainSystems[1], /Harness 近期任务事件/)

  const persisted = JSON.parse(saved)
  assert.equal(persisted.v, 8)
  assert.equal(persisted.characters.deepseek.activity.seen.length, 1)
  assert.doesNotMatch(saved, /secret\.ts|exec_command|private/i)

  const beforeMismatch = saved
  const mismatch = await post('view', { sessionId: otherSessionId })
  assert.deepEqual(mismatch, { enabled: false, workspaceMismatch: true, petEnabled: false })
  await post('chat', { sessionId: otherSessionId, text: '不应写入另一个工作区' })
  assert.equal(saved, beforeMismatch)
})

test('migrates role-local backgrounds, preserves override behavior, and reloads saved choices', async () => {
  const root = 'E:\\workspace\\backgrounds'
  const cgDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
  let diskSave = JSON.stringify({
    v: 7,
    current: 'deepseek',
    lastCurrent: 'deepseek',
    characters: {
      deepseek: {
        affection: 7,
        level: 2,
        log: [{ role: 'user', text: '旧存档内容' }],
        chatLines: [{ who: 'heroine', text: '欢迎回来。' }],
        choices: [],
        cgs: [{
          id: 'cg-ready',
          status: 'ready',
          dataUrl: cgDataUrl,
          charId: 'deepseek',
          level: 2,
          at: 1,
          seen: true,
          savedAsBg: false,
        }],
      },
    },
    tokens: { bank: 0, lastActiveAt: 0 },
    bg: null,
    cg: { cgId: 'cg-ready' },
    preferences: {
      enabled: true,
      petEnabled: true,
      characterMode: 'follow',
      characterId: null,
      characterProvider: '',
      characterModel: '',
      chatMode: 'configured',
      chatProvider: '',
      chatModel: '',
    },
  })

  let routeHandler: any = null
  let saved = ''
  const services: any = {
    fs: {
      resolve: async (name: string) => root + '\\' + name,
      readText: async () => diskSave,
      writeText: async (_target: string, value: string) => { saved = value; diskSave = value },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => [] },
    workspaceRegistry: { list: () => [{ path: root }] },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }) },
  }
  const ctx: any = {
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm: {
      listProviders: () => [{ id: 'deepseek-official', name: 'DeepSeek' }],
      listModels: () => [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' }],
      resolveModelInfo: async () => ({}),
    },
    inject: (_names: string[], callback: Function) => callback(services),
    on: () => undefined,
    effect: (callback: Function) => callback(),
  }
  apply(ctx, { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' })
  assert.equal(typeof routeHandler, 'function')

  async function post(action: string, args: any = {}): Promise<any> {
    const req: any = Readable.from([JSON.stringify({ action, args })])
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

  const migratedView = await post('view')
  assert.equal(migratedView.bg, 'palace-night')
  assert.equal(migratedView.backgroundMode, 'builtin')
  assert.equal(migratedView.builtinBackground, 'palace-night')
  assert.deepEqual(migratedView.backgroundOptions.map((row: any) => row.key), [
    'palace-night',
    'bg-deepseek-seaside-study',
  ])
  assert.deepEqual(migratedView.builtinBackgroundOptions.map((row: any) => ({
    key: row.key,
    current: row.current,
    default: row.default,
  })), [
    { key: 'palace-night', current: true, default: true },
    { key: 'bg-deepseek-seaside-study', current: false, default: false },
  ])
  let persisted = JSON.parse(saved)
  assert.equal(persisted.v, 8)
  assert.equal(persisted.characters.deepseek.affection, 7)
  assert.equal(persisted.characters.deepseek.level, 2)
  assert.equal(persisted.characters.deepseek.log[0].text, '旧存档内容')
  assert.equal(persisted.characters.deepseek.cgs[0].id, 'cg-ready')

  const whaleAlternate = await post('bg-set-builtin', { key: 'bg-deepseek-seaside-study' })
  assert.equal(whaleAlternate.ok, true)
  assert.equal(whaleAlternate.view.bg, 'bg-deepseek-seaside-study')
  persisted = JSON.parse(saved)
  assert.equal(persisted.characters.deepseek.chosenBuiltinBackground, 'bg-deepseek-seaside-study')

  const chatgpt = await post('settings-set', { characterMode: 'manual', characterId: 'chatgpt' })
  assert.equal(chatgpt.view.current, 'chatgpt')
  assert.equal(chatgpt.view.bg, 'bg-gpt-collaboration-workshop')
  assert.equal(chatgpt.view.builtinBackground, 'bg-gpt-collaboration-workshop')

  const rejected = await post('bg-set-builtin', { key: 'bg-deepseek-seaside-study' })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.error, '当前角色不支持该内置背景')
  assert.equal(rejected.view.bg, 'bg-gpt-collaboration-workshop')

  for (const [characterId, expectedBackground] of [
    ['gemini', 'bg-gemini-twin-creative-studio'],
    ['grok', 'bg-grok-electronics-studio'],
  ]) {
    const switched = await post('settings-set', { characterMode: 'manual', characterId })
    assert.equal(switched.view.current, characterId)
    assert.equal(switched.view.bg, expectedBackground)
  }

  const custom = await post('bg-upload', { dataUrl: cgDataUrl, fileName: 'mine.png' })
  assert.equal(custom.ok, true)
  assert.equal(custom.view.bg, 'custom')
  assert.equal(custom.view.backgroundMode, 'custom')
  const claudeWithOverride = await post('settings-set', { characterMode: 'manual', characterId: 'claude' })
  assert.equal(claudeWithOverride.view.bg, 'custom')
  const claudeDefault = await post('bg-clear-custom')
  assert.equal(claudeDefault.view.bg, 'bg-claude-writing-study')
  assert.equal(claudeDefault.view.backgroundMode, 'builtin')

  const cgOverride = await post('cg-save-bg', { id: 'cg-ready' })
  assert.equal(cgOverride.bg, 'cg')
  assert.equal(cgOverride.backgroundMode, 'cg')
  const kimiWithOverride = await post('settings-set', { characterMode: 'manual', characterId: 'kimi' })
  assert.equal(kimiWithOverride.view.bg, 'cg')
  const kimiDefault = await post('cg-clear-bg')
  assert.equal(kimiDefault.bg, 'bg-kimi-moonlit-reading-study')
  assert.equal(kimiDefault.backgroundMode, 'builtin')

  const whaleAgain = await post('settings-set', { characterMode: 'manual', characterId: 'deepseek' })
  assert.equal(whaleAgain.view.bg, 'bg-deepseek-seaside-study')

  routeHandler = null
  apply(ctx, { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' })
  assert.equal(typeof routeHandler, 'function')
  const reloaded = await post('view')
  assert.equal(reloaded.current, 'deepseek')
  assert.equal(reloaded.bg, 'bg-deepseek-seaside-study')
  assert.equal(reloaded.builtinBackgroundKey, 'bg-deepseek-seaside-study')
})
