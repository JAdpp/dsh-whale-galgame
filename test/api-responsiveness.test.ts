import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import test, { after } from 'node:test'
import { apply } from '../src/index.ts'

const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-whale-responsive-'))
after(() => rmSync(storageRoot, { recursive: true, force: true }))

function never(): Promise<never> {
  return new Promise(() => {})
}

async function beforeDeadline<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function responsiveHarness(options: {
  stream?: (request: any) => AsyncIterable<any>
} = {}) {
  const root = 'E:\\workspace\\responsive'
  const sessionId = 'responsive-session'
  const header = { version: 0, id: sessionId, cwd: root, createdAt: 1 }
  const files = new Map<string, string>()
  let routeHandler: any = null
  let readSessionCalls = 0
  const harnessStorage = mkdtempSync(join(storageRoot, 'harness-'))
  const services: any = {
    fs: {
      resolve: async (name: string, scope?: any) => scope && scope.cwd
        ? scope.cwd.replace(/[\\/]$/, '') + '\\' + name
        : name,
      readText: async (target: string) => {
        if (!files.has(target)) throw new Error('ENOENT: ' + target)
        return files.get(target)!
      },
      writeText: async (target: string, value: string) => { files.set(target, value) },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => [{ header, live: true, persisted: true, events: [] }] },
    workspaceRegistry: { list: () => [{ path: root }] },
    agentDefaultModel: { currentSelection: () => ({ provider: 'fast-provider', model: 'fast-model' }) },
    dshHomePath: (...segments: string[]) => join(harnessStorage, ...segments),
    sessionQuery: {
      listSessions: async () => [{ header, live: true, persisted: true }],
      listEvents: async () => [],
      filterSessions: async () => [{ header, live: true, persisted: true }],
      readSession: async () => {
        readSessionCalls += 1
        return never()
      },
    },
  }
  const stream = options.stream || (async function* (request: any): AsyncGenerator<any> {
    const system = String(request && request.system || '')
    const text = system.includes('情绪分类器')
      ? 'normal'
      : system.includes('对话选项生成器')
        ? '{"positive":"靠近一点","neutral":"继续聊聊","negative":"先静一静"}'
        : '我在这里。'
    yield { type: 'text-delta', text }
  })
  const ctx: any = {
    dshHomePath: services.dshHomePath,
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm: {
      listProviders: () => [
        { id: 'fast-provider', name: 'Fast' },
        { id: 'stalled-provider', name: 'Stalled' },
      ],
      listModels: (provider: string) => provider === 'stalled-provider'
        ? never()
        : Promise.resolve([{ id: 'fast-model', name: 'Fast Model', inputModalities: ['text'] }]),
      resolveModelInfo: async () => ({}),
      stream,
    },
    inject: (names: string[], callback: Function) => {
      if (names.includes('sessionQuery')) callback({ sessionQuery: services.sessionQuery })
      else callback(services)
    },
    on: () => undefined,
    effect: (callback: Function) => callback(),
  }
  apply(ctx, { chatProvider: 'fast-provider', chatModel: 'fast-model' })

  async function post(action: string, args: any = {}): Promise<any> {
    assert.equal(typeof routeHandler, 'function')
    const req: any = Readable.from([JSON.stringify({ action, args: { ...args, sessionId } })])
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

  return { post, readSessionCalls: () => readSessionCalls }
}

test('returns a partial model catalog when one provider never resolves', async () => {
  const harness = responsiveHarness()
  const result = await beforeDeadline(
    harness.post('model-options'),
    3_000,
    'model-options waited forever for a stalled provider',
  )

  assert.deepEqual(result.providers.map((provider: any) => provider.id), ['fast-provider', 'stalled-provider'])
  assert.equal(result.models.some((model: any) => model.provider === 'fast-provider' && model.model === 'fast-model'), true)
  assert.equal(result.models.some((model: any) => model.provider === 'stalled-provider'), false)
  assert.equal(harness.readSessionCalls(), 0)
})

test('live session metadata keeps ordinary reads off a hanging readSession path', async () => {
  const harness = responsiveHarness()
  const results = await beforeDeadline(Promise.all([
    harness.post('settings-get'),
    harness.post('profile-get', { characterId: 'deepseek' }),
    harness.post('cg-gallery'),
    harness.post('sprite-data', { characterId: 'deepseek' }),
    harness.post('bg-data'),
  ]), 1_000, 'an ordinary Galgame read remained pending')

  assert.equal(results[0].enabled, true)
  assert.equal(results[1].ok, true)
  assert.deepEqual(results[2].items, [])
  assert.equal(results[3].ok, true)
  assert.equal(results[4].dataUrl, null)
  assert.equal(harness.readSessionCalls(), 0)
})

test('a hanging model stream does not block settings or other short state mutations', async () => {
  let releaseStream!: () => void
  let markStarted!: () => void
  const streamGate = new Promise<void>((resolve) => { releaseStream = resolve })
  const streamStarted = new Promise<void>((resolve) => { markStarted = resolve })
  const signals: any[] = []
  const harness = responsiveHarness({
    stream: async function* (request: any): AsyncGenerator<any> {
      signals.push(request && request.signal)
      markStarted()
      await streamGate
      const system = String(request && request.system || '')
      const text = system.includes('情绪分类器')
        ? 'normal'
        : system.includes('对话选项生成器')
          ? '{"positive":"靠近一点","neutral":"继续聊聊","negative":"先静一静"}'
          : '我在这里。'
      yield { type: 'text-delta', text }
    },
  })

  const chatPromise = harness.post('chat', { text: '请陪我聊一会儿' })
  try {
    await beforeDeadline(streamStarted, 1_000, 'chat never reached the model stream')
    const settings = await beforeDeadline(
      harness.post('pet-set', { enabled: false }),
      500,
      'a hanging chat held the shared state mutation lock',
    )
    assert.equal(settings.petEnabled, false)
  } finally {
    releaseStream()
  }

  const chat = await beforeDeadline(chatPromise, 1_000, 'chat did not settle after its stream was released')
  assert.equal(chat.history.some((line: any) => line.text === '请陪我聊一会儿'), true)
  assert.equal(signals.length >= 2, true)
  assert.equal(signals.every((signal) => signal && typeof signal.addEventListener === 'function'), true)
})

test('classifies the heroine reply and never adds emotion to the user line', async () => {
  const prompts: string[] = []
  const harness = responsiveHarness({
    stream: async function* (request: any): AsyncGenerator<any> {
      const system = String(request.system || '')
      if (system.includes('情绪分类器')) {
        prompts.push(request.messages[0].content[0].text)
        yield { type: 'text-delta', text: 'cheerful' }
      } else if (system.includes('对话选项生成器')) {
        yield { type: 'text-delta', text: '{"positive":"再靠近一点","neutral":"继续聊聊","negative":"先静一静"}' }
      } else {
        yield { type: 'text-delta', text: '见到你真开心！' }
      }
    },
  })
  const result = await harness.post('chat', { text: '气死我了，真讨厌！' })
  assert.deepEqual(prompts, ['当前角色的这句回复：见到你真开心！'])
  assert.equal(result.history.at(-1).who, 'heroine')
  assert.equal(result.history.at(-1).emotion, 'cheerful')
  assert.equal(result.history.at(-2).who, 'user')
  assert.equal(Object.hasOwn(result.history.at(-2), 'emotion'), false)
  assert.equal((await harness.post('view')).history.at(-1).emotion, 'cheerful')
})

test('emotion timeout cancels classification while choices and settings remain responsive', async () => {
  let markChoices!: () => void
  const choicesStarted = new Promise<void>((resolve) => { markChoices = resolve })
  let emotionSignal: AbortSignal | undefined
  const harness = responsiveHarness({
    stream: async function* (request: any): AsyncGenerator<any> {
      const system = String(request.system || '')
      if (system.includes('情绪分类器')) {
        emotionSignal = request.signal
        await never()
      } else if (system.includes('对话选项生成器')) {
        markChoices()
        yield { type: 'text-delta', text: '{"positive":"再靠近一点","neutral":"继续聊聊","negative":"先静一静"}' }
      } else {
        yield { type: 'text-delta', text: '见到你真开心！' }
      }
    },
  })
  const chat = harness.post('chat', { text: '陪我坐一会儿' })
  await beforeDeadline(choicesStarted, 1000, 'choices waited for emotion classification')
  await beforeDeadline(harness.post('pet-set', { enabled: false }), 500, 'classification held the state lock')
  const result = await beforeDeadline(chat, 4000, 'emotion classification did not time out')
  assert.equal(emotionSignal?.aborted, true)
  assert.equal(result.history.at(-1).emotion, 'normal')
  assert.equal(result.choices.length, 3)
})

test('classification failures default to normal and fallback replies skip the classifier', async () => {
  for (const fallback of [false, true]) {
    let classificationCalls = 0
    const harness = responsiveHarness({
      stream: async function* (request: any): AsyncGenerator<any> {
        const system = String(request.system || '')
        if (system.includes('情绪分类器')) {
          classificationCalls++
          throw new Error('simulated classification failure')
        }
        if (system.includes('对话选项生成器')) {
          yield { type: 'text-delta', text: '{"positive":"再靠近一点","neutral":"继续聊聊","negative":"先静一静"}' }
        } else if (!fallback) {
          yield { type: 'text-delta', text: '见到你真开心！' }
        }
      },
    })
    const result = await harness.post('chat', { text: '真讨厌' })
    assert.equal(result.fallbackUsed, fallback)
    assert.equal(classificationCalls, fallback ? 0 : 1)
    assert.equal(result.history.at(-1).who, 'heroine')
    assert.equal(result.history.at(-1).emotion, fallback ? 'cheerful' : 'normal')
    assert.equal(Object.hasOwn(result.history.at(-2), 'emotion'), false)
  }
})
