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
  assert.equal(persisted.v, 7)
  assert.equal(persisted.characters.deepseek.activity.seen.length, 1)
  assert.doesNotMatch(saved, /secret\.ts|exec_command|private/i)

  const beforeMismatch = saved
  const mismatch = await post('view', { sessionId: otherSessionId })
  assert.deepEqual(mismatch, { enabled: false, workspaceMismatch: true, petEnabled: false })
  await post('chat', { sessionId: otherSessionId, text: '不应写入另一个工作区' })
  assert.equal(saved, beforeMismatch)
})
