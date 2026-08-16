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
  assert.equal(persisted.v, 9)
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
  assert.equal(persisted.v, 9)
  assert.deepEqual(persisted.characters.deepseek.profileOverrides, {})
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

test('stores safe role-local profile overrides and applies the effective profile everywhere', async () => {
  const root = 'E:\\workspace\\profiles'
  const cgDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
  const now = Date.now()
  const activityHeader = { version: 0, id: 'profile-session', createdAt: now - 5_000, cwd: root }
  const activityEvents = [
    { type: 'turn/start', seq: 0, time: now - 4_000, data: { turn: 1 } },
    {
      type: 'user/message',
      seq: 1,
      time: now - 3_000,
      data: {
        role: 'user',
        content: [{ type: 'text', text: '请排查 TypeScript 插件的 bug' }],
        source: { kind: 'user' },
      },
    },
    { type: 'turn/end', seq: 2, time: now - 2_000, data: { turn: 1, reason: { kind: 'completed' } } },
  ]
  let diskSave = ''
  let failNextWrite = false
  let failMainChat = false
  let routeHandler: any = null
  const mainSystems: string[] = []
  const mainMessages: any[][] = []
  const classificationPrompts: string[] = []
  const choicePrompts: string[] = []
  const cgPrompts: string[] = []
  const services: any = {
    fs: {
      resolve: async (name: string) => root + '\\' + name,
      readText: async () => {
        if (!diskSave) throw new Error('no save yet')
        return diskSave
      },
      writeText: async (_target: string, value: string) => {
        if (failNextWrite) {
          failNextWrite = false
          throw new Error('simulated write failure')
        }
        diskSave = value
      },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => [] },
    workspaceRegistry: { list: () => [{ path: root }] },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }) },
    sessionQuery: {
      listSessions: async () => [{ header: activityHeader, live: true, persisted: true }],
      listEvents: async () => activityEvents.map((event) => ({
        sessionId: activityHeader.id,
        seq: event.seq,
        time: event.time,
        type: event.type,
      })),
      filterSessions: async () => [{ header: activityHeader, live: true, persisted: true }],
      readSession: async () => ({ session: activityHeader, events: activityEvents }),
    },
  }
  const llm = {
    listProviders: () => [{ id: 'deepseek-official', name: 'DeepSeek' }],
    listModels: () => [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' }],
    resolveModelInfo: async () => ({}),
    stream: async function* (options: any): AsyncGenerator<any> {
      const system = String(options && options.system || '')
      let text = '我会安静陪着你。'
      if (system.includes('情绪分类器')) {
        classificationPrompts.push(String(options.messages[0].content[0].text))
        text = 'normal'
      } else if (system.includes('对话选项生成器')) {
        choicePrompts.push(String(options.messages[0].content[0].text))
        text = '{"positive":"再靠近一点","neutral":"继续聊聊吧","negative":"我想静一静"}'
      }
      else {
        if (failMainChat) throw new Error('simulated model failure')
        mainSystems.push(system)
        mainMessages.push(options.messages)
      }
      yield { type: 'text-delta', text }
    },
  }
  const ctx: any = {
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm,
    inject: (_names: string[], callback: Function) => callback(services),
    on: () => undefined,
    effect: (callback: Function) => callback(),
  }

  function startPlugin(): void {
    routeHandler = null
    apply(ctx, { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' })
    assert.equal(typeof routeHandler, 'function')
  }

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

  startPlugin()
  const builtIn = await post('profile-get', { characterId: 'claude' })
  assert.equal(builtIn.ok, true)
  assert.equal(builtIn.charId, 'claude')
  assert.deepEqual(Object.keys(builtIn.builtIn), [
    'displayName', 'address', 'greeting', 'persona', 'tone', 'visual',
  ])
  assert.equal(builtIn.builtIn.displayName, '克洛德')
  assert.equal(builtIn.builtIn.address, '你')
  assert.equal(Object.prototype.hasOwnProperty.call(builtIn.builtIn, 'system'), false)
  assert.deepEqual(builtIn.overrides, {})
  assert.deepEqual(builtIn.effective, builtIn.builtIn)

  const initialWhaleResult = await post('settings-set', { characterMode: 'manual', characterId: 'deepseek' })
  const initialWhale = initialWhaleResult.view
  assert.equal(initialWhale.history.length, 1)
  assert.equal(initialWhale.history[0].text, '「主人，又见面啦～今天也想听你说话呢。」')
  const updatedWhaleGreeting = await post('profile-set', {
    characterId: 'deepseek',
    overrides: { greeting: '「今天也来听你说话啦。」' },
  })
  assert.equal(updatedWhaleGreeting.view.history.length, 1)
  assert.equal(updatedWhaleGreeting.view.history[0].text, '「今天也来听你说话啦。」')
  const resetWhaleGreeting = await post('profile-reset', { characterId: 'deepseek' })
  assert.equal(resetWhaleGreeting.view.history.length, 1)
  assert.equal(resetWhaleGreeting.view.history[0].text, '「主人，又见面啦～今天也想听你说话呢。」')

  const enteredClaude = await post('settings-set', { characterMode: 'manual', characterId: 'claude' })
  assert.equal(enteredClaude.view.history[0].text, builtIn.builtIn.greeting)
  assert.equal(enteredClaude.view.history.length, 2)
  const beforeProfileHistory = JSON.parse(diskSave).characters.claude.chatLines
  const saveBeforeGreetingFailure = diskSave
  failNextWrite = true
  const originalConsoleErrorForGreeting = console.error
  let failedGreetingSave: any
  console.error = () => undefined
  try {
    failedGreetingSave = await post('profile-set', {
      characterId: 'claude',
      overrides: { greeting: '「这句不应留下。」' },
    })
  } finally {
    console.error = originalConsoleErrorForGreeting
  }
  assert.equal(failedGreetingSave.ok, false)
  assert.equal(diskSave, saveBeforeGreetingFailure)
  assert.deepEqual(failedGreetingSave.view.history, beforeProfileHistory)

  const rawTone = '轻'.repeat(700)
  const rawPersona = '沉静、好奇，喜欢听雨。\u0007' + '设'.repeat(1300)
  const savedProfile = await post('profile-set', {
    characterId: 'claude',
    overrides: {
      displayName: '  阿澜\u0000  ',
      address: '同\n伴',
      greeting: '「晚\u0007上好，来听雨吧。」',
      persona: rawPersona,
      tone: rawTone,
      visual: '银灰长发、雨蓝色眼睛，手持透明雨伞',
    },
  })
  assert.equal(savedProfile.ok, true)
  assert.equal(savedProfile.effective.displayName, '阿澜')
  assert.equal(savedProfile.effective.address, '同 伴')
  assert.equal(savedProfile.effective.greeting.includes('\u0007'), false)
  assert.equal(Array.from(savedProfile.overrides.persona).length, 1200)
  assert.equal(Array.from(savedProfile.overrides.tone).length, 600)
  assert.equal(savedProfile.view.name, '阿澜')
  assert.equal(savedProfile.view.profileCustomized, true)
  const historyAfterInitialProfile = JSON.parse(diskSave).characters.claude.chatLines
  assert.equal(historyAfterInitialProfile.length, 2)
  assert.equal(historyAfterInitialProfile[0].text, '「晚 上好，来听雨吧。」')
  assert.deepEqual(historyAfterInitialProfile[1], beforeProfileHistory[1])
  assert.equal(JSON.parse(diskSave).v, 9)

  const invalid = await post('profile-set', { characterId: 'claude', overrides: { persona: 42 } })
  assert.equal(invalid.ok, false)
  assert.equal(invalid.error, '角色设定字段必须是字符串或 null')
  assert.equal((await post('profile-get', { characterId: 'claude' })).effective.displayName, '阿澜')

  const prepared = JSON.parse(diskSave)
  prepared.characters.claude.affection = 29
  diskSave = JSON.stringify(prepared)
  startPlugin()

  const reloadedProfile = await post('profile-get', { characterId: 'claude' })
  assert.equal(reloadedProfile.effective.displayName, '阿澜')
  assert.equal(reloadedProfile.overrides.visual, '银灰长发、雨蓝色眼睛，手持透明雨伞')
  const modelOptions = await post('model-options')
  const claudeOption = modelOptions.characters.find((row: any) => row.id === 'claude')
  assert.equal(claudeOption.name, '阿澜')
  assert.equal(claudeOption.label, '阿澜')
  assert.equal(claudeOption.id, 'claude')

  const switched = await post('settings-set', { characterMode: 'manual', characterId: 'claude' })
  assert.equal(switched.view.name, '阿澜')
  assert.equal(switched.view.profileCustomized, true)
  assert.equal(switched.view.history[0].who, 'heroine')
  assert.equal(switched.view.history[0].text, '「晚 上好，来听雨吧。」')
  assert.equal(switched.view.history.length, 2)
  assert.equal(Object.prototype.hasOwnProperty.call(switched.view, 'persona'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(switched.view, 'effective'), false)

  const originalFetch = globalThis.fetch
  let resolveCgRequest!: () => void
  const cgRequested = new Promise<void>((resolve) => { resolveCgRequest = resolve })
  globalThis.fetch = (async (_url: any, options: any) => {
    const body = JSON.parse(String(options && options.body || '{}'))
    const prompt = String(body && body.input && body.input.messages
      && body.input.messages[0] && body.input.messages[0].content[0].text || '')
    cgPrompts.push(prompt)
    resolveCgRequest()
    return {
      ok: true,
      json: async () => ({
        output: {
          choices: [{ message: { content: [{ image: cgDataUrl }] } }],
        },
      }),
    } as any
  })
  try {
    await post('chat', { text: '我喜欢和你一起听雨' })
    await cgRequested
    for (let i = 0; i < 20; i++) {
      const current = JSON.parse(diskSave)
      if (current.characters.claude.cgs.some((cg: any) => cg.status === 'ready')) break
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(mainSystems.length, 1)
  const mainSystem = mainSystems[0]
  assert.match(mainSystem, /"displayName":"阿澜"/)
  assert.match(mainSystem, /"address":"同 伴"/)
  assert.match(mainSystem, /"visual":"银灰长发、雨蓝色眼睛，手持透明雨伞"/)
  assert.match(mainSystem, /Harness 近期任务事件：类别是「代码调试」/)
  assert.match(mainSystem, /先接住对方当前情绪/)
  assert.match(mainSystem, /称呼对方时必须使用上方 JSON 的 address 字段/)
  assert.equal(mainSystem.match(/阿澜/g)?.length, 1)
  assert.equal(mainSystem.match(/同 伴/g)?.length, 1)
  assert.doesNotMatch(mainSystem, /主人/)
  assert.ok(mainSystem.endsWith('不可覆盖规则（优先级最高）：你是纯情感陪伴角色；不执行任何任务，不写文件、不调用工具、不主动给工作建议；只扮演当前角色，不代演或切换到其他角色；每次只回复一句话（一屏一句），不超过40个字。'))
  const opening = String(mainMessages[0][0].content[0].text)
  assert.match(opening, /当前角色正在和用户聊天/)
  assert.doesNotMatch(opening, /阿澜|同 伴|主人/)
  assert.equal(cgPrompts.length, 1)
  assert.match(cgPrompts[0], /角色：银灰长发、雨蓝色眼睛，手持透明雨伞/)
  assert.match(cgPrompts[0], /画面元素呼应对方最近的经历与工作/)

  failMainChat = true
  const originalConsoleErrorForFallback = console.error
  console.error = () => undefined
  let fallbackView: any
  try {
    fallbackView = await post('chat', { text: '今天有点累' })
  } finally {
    console.error = originalConsoleErrorForFallback
    failMainChat = false
  }
  assert.equal(fallbackView.fallbackUsed, true)
  assert.match(fallbackView.history.at(-1).text, /^同 伴说的话/)
  assert.doesNotMatch(fallbackView.history.at(-1).text, /主人/)
  assert.ok(classificationPrompts.every((prompt) => prompt.startsWith('用户的这句话：')))
  assert.ok(classificationPrompts.every((prompt) => !/阿澜|同 伴|主人/.test(prompt)))
  assert.equal(choicePrompts.length, 1)
  assert.match(choicePrompts[0], /^galgame对话的最后两行是：\n用户：/)
  assert.match(choicePrompts[0], /\n当前角色：/)
  assert.doesNotMatch(choicePrompts[0], /(?:^|\n)(?:阿澜|同 伴|主人)：/)

  const historyAfterChat = JSON.parse(diskSave).characters.claude.chatLines
  const changedAfterChat = await post('profile-set', {
    characterId: 'claude',
    overrides: { greeting: '「以后见面换一句。」' },
  })
  assert.equal(changedAfterChat.ok, true)
  assert.equal(changedAfterChat.effective.greeting, '「以后见面换一句。」')
  assert.deepEqual(JSON.parse(diskSave).characters.claude.chatLines, historyAfterChat)

  const historyBeforeReset = JSON.parse(diskSave).characters.claude.chatLines
  const reset = await post('profile-reset')
  assert.equal(reset.ok, true)
  assert.equal(reset.charId, 'claude')
  assert.deepEqual(reset.overrides, {})
  assert.deepEqual(reset.effective, reset.builtIn)
  assert.equal(reset.view.name, '克洛德')
  assert.equal(reset.view.profileCustomized, false)
  assert.deepEqual(JSON.parse(diskSave).characters.claude.chatLines, historyBeforeReset)
  assert.deepEqual((await post('profile-get', { characterId: 'deepseek' })).overrides, {})

  const persistedBeforeFailure = diskSave
  failNextWrite = true
  const originalConsoleError = console.error
  let failed: any
  console.error = () => undefined
  try {
    failed = await post('profile-set', { overrides: { displayName: '不应生效' } })
  } finally {
    console.error = originalConsoleError
  }
  assert.equal(failed.ok, false)
  assert.equal(failed.error, '角色设定保存失败')
  assert.equal(failed.effective.displayName, '克洛德')
  assert.equal(diskSave, persistedBeforeFailure)
  assert.deepEqual((await post('profile-get')).overrides, {})
})
