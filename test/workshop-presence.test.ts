import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { apply } from '../src/index.ts'
import { createWorkshopCatalog, createWorkshopPresenceTracker, workshopCharacterForModel, workshopProviderUsable } from '../src/workshop-presence.ts'

const roster = ['deepseek', 'claude', 'chatgpt', 'gemini', 'kimi', 'grok'].map((id) => ({ id, name: id }))
const event = (type: string, data: any = {}, seq = 0) => ({ type, data, seq, time: Date.now() })
const headerEvent = (model: string, provider = 'openai-compatible') => event('request/header', { header: { config: { provider, model } } })

function liveSession(id: string, model: string, status: 'running' | 'idle' = 'running') {
  const session = {
    id, header: { id, cwd: 'E:\\private\\' + id },
    firstLiveSeq: 0,
    events: [event('turn/start', { turn: 1 }), headerEvent(model)],
  }
  const agent = { id, session, status, options: { provider: 'openai-compatible', model } }
  return { session, agent }
}

test('map models use named routes before compatible providers and do not invent unknown residents', () => {
  for (const [model, id] of [
    ['deepseek-v4-flash', 'deepseek'], ['anthropic/claude-opus-4.5', 'claude'],
    ['gpt-6.1', 'chatgpt'], ['gemini-3-pro', 'gemini'], ['moonshot/kimi-k2', 'kimi'], ['grok-4', 'grok'],
  ]) assert.equal(workshopCharacterForModel({ provider: 'openai', model }), id)
  assert.equal(workshopCharacterForModel({ provider: 'gateway', model: 'llama' }), null)
  assert.equal(workshopCharacterForModel({ provider: 'anthropic', model: 'custom' }), 'claude')
})

test('all live workspaces and subagents contribute once per actual model, independently of appearances', () => {
  const a = liveSession('workspace-a', 'claude-sonnet-4.5')
  const b = liveSession('workspace-b', 'gpt-6.1')
  const c = liveSession('subagent-c', 'claude-opus-4.5')
  const tracker = createWorkshopPresenceTracker()
  const result = tracker.snapshot([a.session, b.session, c.session], [a.agent, b.agent, c.agent], roster)
  assert.deepEqual(result.find((row) => row.id === 'claude'), { id: 'claude', name: 'claude', status: 'running', activeSessions: 2 })
  assert.equal(result.find((row) => row.id === 'chatgpt')?.activeSessions, 1)
  assert.equal(result.find((row) => row.id === 'deepseek')?.status, 'idle')
})

test('live request changes move work to the routed character instead of initial agent options', () => {
  const { session, agent } = liveSession('switched', 'deepseek-v4-flash')
  const tracker = createWorkshopPresenceTracker()
  assert.equal(tracker.snapshot([session], [agent], roster)[0].status, 'running')
  session.events = [...session.events, headerEvent('gemini-3-pro'), event('request/context', { provider: 'google', model: 'gemini-3-pro' })]
  const result = tracker.snapshot([session], [agent], roster)
  assert.equal(result[0].status, 'idle')
  assert.equal(result.find((row) => row.id === 'gemini')?.status, 'running')
})

test('questions and approvals wait at the desk and resume when answered', () => {
  const { session, agent } = liveSession('waiting', 'gpt-6.1')
  const tracker = createWorkshopPresenceTracker()
  const status = () => tracker.snapshot([session], [agent], roster).find((row) => row.id === 'chatgpt')?.status
  session.events.push(event('tool/call', { name: 'ask_user_question', callId: 'question-1', arguments: 'PRIVATE PROMPT' }))
  assert.equal(status(), 'waiting')
  session.events.push(event('tool/result', { message: { source: { callId: 'question-1' }, content: 'PRIVATE ANSWER' } }))
  assert.equal(status(), 'running')
  session.events.push(event('approval/asked', { id: 'approval-1', toolName: 'exec_command' }))
  assert.equal(status(), 'waiting')
  session.events.push(event('approval/decided', { id: 'approval-1', outcome: 'rejected' }))
  assert.equal(status(), 'running')
  agent.status = 'idle'
  assert.equal(status(), 'idle')
})

test('running wins over waiting when the same model has concurrent sessions', () => {
  const a = liveSession('waiting-grok', 'grok-4')
  const b = liveSession('running-grok', 'grok-4')
  a.session.events.push(event('tool/call', { name: 'ask_user_question', callId: 'question-2' }))
  const tracker = createWorkshopPresenceTracker()
  const result = tracker.snapshot([a.session, b.session], [a.agent, b.agent], roster)
  assert.equal(result.find((row) => row.id === 'grok')?.status, 'running')
  assert.equal(result.find((row) => row.id === 'grok')?.activeSessions, 2)
})

test('process seed boundaries exclude stale unclosed persisted turns and unknown old-host history', () => {
  const tracker = createWorkshopPresenceTracker()
  const persisted = { ...liveSession('persisted', 'kimi-k2').session, firstLiveSeq: 2 }
  const oldHost: any = { ...liveSession('old-host', 'claude-sonnet-4.5').session }
  delete oldHost.firstLiveSeq
  assert.ok(tracker.snapshot([persisted, oldHost], [], roster).every((row) => row.status === 'idle'))
  persisted.events.push(event('turn/start', { turn: 2 }))
  oldHost.events.push(event('turn/start', { turn: 2 }))
  assert.equal(tracker.snapshot([persisted, oldHost], [], roster).find((row) => row.id === 'kimi')?.status, 'running')
  assert.equal(tracker.snapshot([persisted, oldHost], [], roster).find((row) => row.id === 'claude')?.status, 'running')
  oldHost.events.push(event('turn/end', { turn: 2, reason: { kind: 'interrupted' } }))
  assert.equal(tracker.snapshot([persisted, oldHost], [], roster).find((row) => row.id === 'claude')?.status, 'idle')
  assert.ok(tracker.snapshot([], [], roster).every((row) => row.status === 'idle'), 'disposed sessions must leave the map')
})

test('an idle Agent overrides unclosed events and explicit inactive session metadata', () => {
  const { session, agent } = liveSession('idle-agent', 'gemini-3-pro', 'idle')
  const tracker = createWorkshopPresenceTracker()
  assert.ok(tracker.snapshot([session], [agent], roster).every((row) => row.status === 'idle'))
  assert.ok(tracker.snapshot([{ ...session, live: false }], [], roster).every((row) => row.status === 'idle'))
})

test('observed events support old hosts without replaying inherited work', () => {
  const tracker = createWorkshopPresenceTracker()
  const session: any = { id: 'observed', events: [headerEvent('deepseek-v4-flash')] }
  tracker.observe(session, event('turn/start', { turn: 5 }))
  assert.equal(tracker.snapshot([session], [], roster)[0].status, 'running')
  tracker.observe(session, event('turn/end', { turn: 5, reason: { kind: 'completed' } }))
  assert.equal(tracker.snapshot([session], [], roster)[0].status, 'idle')
})

test('map-state stays off workspace resolution, model calls, transcript payloads and persistence', async () => {
  const { session, agent } = liveSession('private-session', 'claude-sonnet-4.5')
  session.events.push(event('user/message', new Proxy({}, { get: () => { throw new Error('read private message') } })))
  const listeners = new Map<string, Function>()
  let handler: any
  let queries = 0
  let writes = 0
  let llmCalls = 0
  const services = {
    sessions: { list: () => [session] },
    agents: { list: () => [agent] },
    sessionQuery: { listSessions: () => { queries++; return new Promise(() => {}) }, readSession: () => { queries++; return new Promise(() => {}) } },
    workspaceRegistry: { list: () => [] },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }) },
    fs: { resolve: async (name: string) => name, readText: async () => { throw new Error('ENOENT') }, writeText: async () => { writes++ } },
  }
  apply({
    inject: (_names: string[], callback: Function) => callback(services),
    on: (name: string, callback: Function) => listeners.set(name, callback),
    effect: () => undefined,
    webServer: { register: (route: any) => { handler = route.handler } },
    llm: { listProviders: () => [], stream: () => { llmCalls++; throw new Error('unexpected model') } },
  }, {})
  async function mapState() {
    const req: any = Readable.from([JSON.stringify({ action: 'map-state', args: { sessionId: 'unresolved-session' } })])
    req.method = 'POST'
    let status = 0
    let body = ''
    await handler(req, { writeHead: (code: number) => { status = code }, end: (value: string) => { body = value } })
    assert.equal(status, 200, body)
    return JSON.parse(body)
  }
  let deadline: ReturnType<typeof setTimeout> | undefined
  try {
    const result: any = await Promise.race([mapState(), new Promise((_resolve, reject) => { deadline = setTimeout(() => reject(new Error('map-state hung')), 500) })])
    assert.equal(result.characters.length, 6)
    assert.equal(result.characters.find((row: any) => row.id === 'claude').status, 'running')
    assert.deepEqual(result.availableCharacters.map((row: any) => row.id), ['claude'])
    assert.doesNotMatch(JSON.stringify(result), /private|unresolved|\\\\|user\/message|provider|model/)
    assert.deepEqual([queries, writes, llmCalls], [0, 0, 0])
    agent.status = 'idle'
    assert.ok((await mapState()).characters.every((row: any) => row.status === 'idle'))
  } finally { if (deadline) clearTimeout(deadline) }
})

const idleCharacters = () => roster.map((row) => ({ ...row, status: 'idle' as const, activeSessions: 0 }))

function catalogHarness(initial: Record<string, any[]>) {
  let time = 10_000
  let providers = Object.keys(initial).map((id) => ({ id }))
  let registryError = false
  const failures = new Set<string>()
  const models = new Map(Object.entries(initial))
  const calls: string[] = []
  const catalog = createWorkshopCatalog({
    listProviders: () => {
      if (registryError) throw new Error('PRIVATE registry credentials')
      return providers
    },
    listModels: async (provider: string) => {
      calls.push(provider)
      if (failures.has(provider)) throw new Error('PRIVATE https://secret.example/key')
      return models.get(provider) || []
    },
  }, { now: () => time })
  return {
    catalog, calls, models, failures,
    next: () => { time += 15_001 },
    removeProvider: (id: string) => { providers = providers.filter((row) => row.id !== id) },
    failRegistry: () => { registryError = true },
    snapshot: () => catalog.snapshot(idleCharacters()),
  }
}

test('only connected DeepSeek creates one resident across multiple versions', async () => {
  const h = catalogHarness({ 'deepseek-official': [{ id: 'deepseek-v4-flash' }, { id: 'deepseek-v4-pro' }, { id: 'deepseek-chat' }] })
  assert.deepEqual(h.snapshot(), { availableCharacters: [], catalogReady: false })
  await h.catalog.refresh()
  assert.deepEqual(h.snapshot(), { availableCharacters: [{ id: 'deepseek', name: 'deepseek' }], catalogReady: true })
  assert.deepEqual(h.calls, ['deepseek-official'], 'polling inside the cache window must not repeat directory work')
})

test('two connected families share their family rooms and exclude unsupported image-only models', async () => {
  const h = catalogHarness({
    gateway: [
      { id: 'deepseek-v4-flash', inputModalities: ['text'] },
      { id: 'claude-sonnet-4.5', inputModalities: ['text', 'image'] },
      { id: 'claude-opus-4.5' },
      { id: 'gemini-image-generator', inputModalities: ['image'] },
      { id: 'qwen-custom', inputModalities: ['text'] },
    ],
  })
  await h.catalog.refresh()
  assert.deepEqual(h.snapshot().availableCharacters.map((row) => row.id), ['deepseek', 'claude'])
})

test('no registered routes and successful empty model lists both produce an empty residence list', async () => {
  for (const providers of [{}, { gateway: [] }]) {
    const h = catalogHarness(providers)
    await h.catalog.refresh()
    assert.deepEqual(h.snapshot(), { availableCharacters: [], catalogReady: true })
  }
})

test('catalog refresh removes deleted model families and explicitly removed providers', async () => {
  const h = catalogHarness({
    gateway: [{ id: 'deepseek-v4-flash' }, { id: 'claude-sonnet-4.5' }],
    google: [{ id: 'gemini-3-pro' }],
  })
  await h.catalog.refresh()
  assert.equal(h.snapshot().availableCharacters.length, 3)
  h.models.set('gateway', [{ id: 'deepseek-v4-pro' }])
  h.removeProvider('google')
  h.next()
  await h.catalog.refresh()
  assert.deepEqual(h.snapshot().availableCharacters.map((row) => row.id), ['deepseek'])
})

test('provider and registry failures retain only previously confirmed families and expose no diagnostics', async () => {
  const h = catalogHarness({
    gateway: [{ id: 'gpt-6.1' }, { id: 'claude-sonnet-4.5' }],
    deepseek: [{ id: 'deepseek-v4-flash' }],
  })
  await h.catalog.refresh()
  h.failures.add('gateway')
  h.removeProvider('deepseek')
  h.next()
  await h.catalog.refresh()
  assert.deepEqual(h.snapshot().availableCharacters.map((row) => row.id), ['claude', 'chatgpt'])
  assert.equal(h.snapshot().catalogReady, true)
  assert.ok(h.snapshot().catalogError)
  assert.doesNotMatch(JSON.stringify(h.snapshot()), /PRIVATE|secret|credentials|gateway|https/)
  h.failRegistry()
  h.next()
  await h.catalog.refresh()
  assert.deepEqual(h.snapshot().availableCharacters.map((row) => row.id), ['claude', 'chatgpt'])
})

test('first snapshots never wait for a hanging catalog and active routes remain visible through failures', async () => {
  const characters = idleCharacters()
  const kimi = characters.find((row) => row.id === 'kimi')!
  kimi.activeSessions = 1
  const catalog = createWorkshopCatalog({
    listProviders: () => [{ id: 'deepseek-official' }, { id: 'stalled' }],
    listModels: (provider) => provider === 'stalled'
      ? new Promise(() => {})
      : Promise.resolve([{ id: 'deepseek-v4-flash' }]),
  }, { timeoutMs: 20 })
  const initial = catalog.snapshot(characters)
  assert.equal(initial.catalogReady, false)
  assert.deepEqual(initial.availableCharacters.map((row) => row.id), ['kimi'])
  await catalog.refresh()
  const settled = catalog.snapshot(characters)
  assert.equal(settled.catalogReady, true)
  assert.ok(settled.catalogError)
  assert.deepEqual(settled.availableCharacters.map((row) => row.id), ['deepseek', 'kimi'])
})

test('safe provider metadata excludes an explicitly missing credential without reading secret values', async () => {
  let configured = false
  const source = {
    listConfigurableProviders: () => [{ provider: 'deepseek-official', settingsNs: 'llm-deepseek', settingsPath: [] }],
    describeSettings: () => [{ ns: 'llm-deepseek', value: { apiKeyEnv: 'DEEPSEEK_API_KEY' } }],
    describeCredential: async (ref: string) => {
      assert.equal(ref, 'DEEPSEEK_API_KEY')
      return new Proxy({ configured }, { get: (target, key) => {
        if (key === 'value' || key === 'key') throw new Error('must never read a credential value')
        return Reflect.get(target, key)
      } })
    },
  }
  assert.equal(await workshopProviderUsable('deepseek-official', source), false)
  configured = true
  assert.equal(await workshopProviderUsable('deepseek-official', source), true)
})

test('provider-owned authentication and older hosts retain registered-route compatibility', async () => {
  assert.equal(await workshopProviderUsable('local-gateway', {}), true)
  assert.equal(await workshopProviderUsable('local-gateway', {
    listConfigurableProviders: () => [{ provider: 'local-gateway', settingsNs: 'llm-pi-ai', settingsPath: ['providers', 'local-gateway'] }],
    describeSettings: () => [{ ns: 'llm-pi-ai', value: { providers: { 'local-gateway': { api: 'openai-completions' } } } }],
    describeCredential: () => { throw new Error('routes naming no credential ref owe no key') },
  }), true)
})

test('credential and settings metadata share the bounded background catalog timeout', async () => {
  let modelLists = 0
  const catalog = createWorkshopCatalog({
    listProviders: () => [{ id: 'deepseek-official' }],
    isProviderAvailable: (provider) => workshopProviderUsable(provider, {
      listConfigurableProviders: () => [{ provider, settingsNs: 'llm-deepseek', settingsPath: [] }],
      describeSettings: () => new Promise(() => {}),
      describeCredential: () => new Promise(() => {}),
    }),
    listModels: () => { modelLists++; return [{ id: 'deepseek-v4-flash' }] },
  }, { timeoutMs: 20 })
  assert.deepEqual(catalog.snapshot(idleCharacters()), { availableCharacters: [], catalogReady: false })
  await catalog.refresh()
  assert.equal(catalog.snapshot(idleCharacters()).catalogReady, true)
  assert.ok(catalog.snapshot(idleCharacters()).catalogError)
  assert.equal(modelLists, 0)
})

test('map-state filters uncredentialed registered built-ins: only DeepSeek or genuinely zero residents', async () => {
  const routes = [
    ['deepseek-official', 'deepseek-v4-flash', 'DEEPSEEK_API_KEY'],
    ['anthropic', 'claude-sonnet-4.5', 'ANTHROPIC_API_KEY'],
    ['openai', 'gpt-6.1', 'OPENAI_API_KEY'],
    ['google', 'gemini-3-pro', 'GOOGLE_API_KEY'],
    ['moonshot', 'kimi-k2', 'MOONSHOT_API_KEY'],
    ['xai', 'grok-4', 'XAI_API_KEY'],
  ]
  for (const deepseekConfigured of [false, true]) {
    let handler: any
    let redactedReads = 0
    const services = {
      sessions: { list: () => [] }, agents: { list: () => [] },
      settings: { describe: (options: any) => {
        assert.deepEqual(options, { redactSecrets: true })
        redactedReads++
        return [
          { ns: 'llm-deepseek', value: { apiKeyEnv: 'DEEPSEEK_API_KEY' } },
          { ns: 'llm-pi-ai', value: { providers: Object.fromEntries(routes.slice(1).map(([id, _model, ref]) => [id, { apiKeyEnv: ref }])) } },
        ]
      } },
      credentials: {
        describe: async (ref: string) => ({ configured: deepseekConfigured && ref === 'DEEPSEEK_API_KEY' }),
        resolve: () => { throw new Error('must never resolve a credential value') },
      },
    }
    apply({
      inject: (_names: string[], callback: Function) => callback(services),
      on: () => undefined, effect: () => undefined,
      webServer: { register: (route: any) => { handler = route.handler } },
      llm: {
        listProviders: () => routes.map(([id]) => ({ id })),
        listConfigurableProviders: () => routes.map(([provider]) => ({ provider,
          settingsNs: provider === 'deepseek-official' ? 'llm-deepseek' : 'llm-pi-ai',
          settingsPath: provider === 'deepseek-official' ? [] : ['providers', provider],
        })),
        listModels: async (provider: string) => [{ id: routes.find(([id]) => id === provider)![1] }],
        stream: () => { throw new Error('must never generate') },
      },
    }, {})
    const read = async () => {
      const req: any = Readable.from([JSON.stringify({ action: 'map-state' })])
      req.method = 'POST'
      let body = ''
      await handler(req, { writeHead: (code: number) => assert.equal(code, 200), end: (value: string) => { body = value } })
      return JSON.parse(body)
    }
    assert.equal((await read()).catalogReady, false)
    await new Promise<void>((resolve) => setImmediate(resolve))
    const result = await read()
    assert.equal(result.catalogReady, true)
    assert.deepEqual(result.availableCharacters.map((row: any) => row.id), deepseekConfigured ? ['deepseek'] : [])
    assert.ok(redactedReads > 0)
    assert.doesNotMatch(JSON.stringify(result), /API_KEY|settingsNs|llm-pi-ai|credentials/)
  }
})
