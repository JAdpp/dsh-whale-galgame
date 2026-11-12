/** Read-only, process-local workshop presence. No transcript text is retained. */
export type WorkshopStatus = 'idle' | 'running' | 'waiting'
export type WorkshopCharacterPresence = {
  id: string
  name: string
  status: WorkshopStatus
  activeSessions: number
}

export type WorkshopCatalogSnapshot = {
  availableCharacters: { id: string; name: string }[]
  catalogReady: boolean
  catalogError?: string
}

/** Mirrors the Harness Models page's providerUsable join using safe metadata only. */
export async function workshopProviderUsable(provider: string, source: {
  listConfigurableProviders?: () => any
  describeSettings?: () => any
  describeCredential?: (ref: string) => Promise<any> | any
}): Promise<boolean> {
  // Older hosts expose only registered routes; retain that compatibility
  // when the safe description capabilities do not exist.
  if (!source.listConfigurableProviders || !source.describeSettings || !source.describeCredential) return true
  const [directory, descriptors] = await Promise.all([
    Promise.resolve().then(() => source.listConfigurableProviders!()),
    Promise.resolve().then(() => source.describeSettings!()),
  ])
  if (!Array.isArray(directory) || !Array.isArray(descriptors)) throw new Error('provider metadata unavailable')
  const entry = directory.find((row) => row?.provider === provider)
  if (!entry) return true // live third-party routes need not publish a settings address
  const descriptor = descriptors.find((row) => row?.ns === entry.settingsNs)
  if (!descriptor) return true
  let profile = descriptor.value
  for (const segment of Array.isArray(entry.settingsPath) ? entry.settingsPath : []) {
    if (!profile || typeof profile !== 'object' || !Object.prototype.hasOwnProperty.call(profile, segment)) return true
    profile = profile[segment]
  }
  const ref = profile && typeof profile === 'object' ? profile.apiKeyEnv : undefined
  // Profiles naming no reference use their own auth path (OAuth, ambient
  // cloud auth, or a local gateway). Registration is enough for these routes.
  if (typeof ref !== 'string' || !ref) return true
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) throw new Error('invalid credential reference')
  const info = await source.describeCredential(ref)
  if (typeof info?.configured !== 'boolean') throw new Error('credential metadata unavailable')
  return info.configured
}

/**
 * Only registered adapters and their text-model catalog establish residents.
 * Configurable-but-dormant providers and saved/default character selections
 * deliberately do not. This describes configured routes, not an API health
 * probe: no completion request or credentials are read by the workshop.
 */
export function createWorkshopCatalog(
  source: {
    listProviders: () => any
    listModels: (provider: string) => Promise<any> | any
    isProviderAvailable?: (provider: string) => Promise<boolean> | boolean
  },
  options: { cacheMs?: number; timeoutMs?: number; now?: () => number } = {},
) {
  const cacheMs = options.cacheMs ?? 15_000
  const timeoutMs = options.timeoutMs ?? 1_500
  const now = options.now || Date.now
  const confirmedByProvider = new Map<string, Set<string>>()
  let lastAttemptAt = -Infinity
  let ready = false
  let failed = false
  let pending: Promise<void> | null = null

  async function providerFamilies(provider: string): Promise<Set<string>> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        Promise.resolve().then(async () => {
          if (source.isProviderAvailable && !await source.isProviderAvailable(provider)) return new Set<string>()
          const models = await source.listModels(provider)
          if (!Array.isArray(models)) throw new Error('invalid model catalog')
          const ids = new Set<string>()
          for (const model of models) {
            if (!model || typeof model.id !== 'string' || !model.id) continue
            if (Array.isArray(model.inputModalities) && !model.inputModalities.includes('text')) continue
            const id = workshopCharacterForModel({ provider, model: model.id })
            if (id) ids.add(id)
          }
          return ids
        }),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('catalog timeout')), timeoutMs)
        }),
      ])
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  function refresh(): Promise<void> {
    if (pending) return pending
    if (now() - lastAttemptAt < cacheMs) return Promise.resolve()
    lastAttemptAt = now()
    const work = Promise.resolve().then(async () => {
      try {
        const rows = source.listProviders()
        if (!Array.isArray(rows)) throw new Error('invalid provider catalog')
        const providers = new Set<string>(rows
          .filter((row) => row && typeof row.id === 'string' && row.id)
          .map((row) => row.id))
        // A successful registry listing proves removals even if another
        // provider's model list is temporarily unavailable.
        for (const provider of confirmedByProvider.keys()) {
          if (!providers.has(provider)) confirmedByProvider.delete(provider)
        }
        const results = await Promise.allSettled([...providers].map(async (provider) => {
          const ids = await providerFamilies(provider)
          confirmedByProvider.set(provider, ids)
        }))
        failed = results.some((result) => result.status === 'rejected')
      } catch {
        // Registry failures cannot prove that existing residents were removed.
        failed = true
      } finally {
        ready = true
      }
    }).finally(() => {
      if (pending === work) pending = null
    })
    pending = work
    return work
  }

  return {
    refresh,
    snapshot(characters: WorkshopCharacterPresence[]): WorkshopCatalogSnapshot {
      void refresh()
      const ids = new Set<string>()
      for (const families of confirmedByProvider.values()) for (const id of families) ids.add(id)
      // Live work proves availability even during directory outages or when
      // the adapter does not enumerate the exact model selected by the user.
      for (const character of characters) if (character.activeSessions > 0) ids.add(character.id)
      return {
        availableCharacters: characters.filter((character) => ids.has(character.id)).map(({ id, name }) => ({ id, name })),
        catalogReady: ready,
        ...(failed ? { catalogError: '部分模型目录暂时不可用，稍后会自动重试。' } : {}),
      }
    },
  }
}

type Projection = {
  nextIndex: number
  running: boolean
  route: { provider: string; model: string } | null
  questions: Set<string>
}

function modelRoute(value: any): { provider: string; model: string } | null {
  if (!value || typeof value !== 'object') return null
  const provider = typeof value.provider === 'string' ? value.provider : ''
  const model = typeof value.model === 'string' ? value.model : ''
  return provider || model ? { provider, model } : null
}

/** A named model wins over compatible/gateway provider names. Unknown routes stay unknown. */
export function workshopCharacterForModel(selection: any): string | null {
  const model = String(selection?.model || '').toLowerCase()
  const provider = String(selection?.provider || '').toLowerCase()
  if (/grok/.test(model)) return 'grok'
  if (/kimi|moonshot/.test(model)) return 'kimi'
  if (/claude/.test(model)) return 'claude'
  if (/gemini/.test(model)) return 'gemini'
  if (/gpt|chatgpt|\bo1\b|\bo3\b|\bo4\b|codex/.test(model)) return 'chatgpt'
  if (/deepseek/.test(model)) return 'deepseek'
  if (/grok|\bxai\b|x-ai/.test(provider)) return 'grok'
  if (/kimi|moonshot/.test(provider)) return 'kimi'
  if (/claude|anthropic/.test(provider)) return 'claude'
  if (/gemini|google/.test(provider)) return 'gemini'
  if (/deepseek/.test(provider)) return 'deepseek'
  if (/^(openai|openai-official)$/.test(provider)) return 'chatgpt'
  return null
}

function foldEvent(projection: Projection, event: any): void {
  if (!event || typeof event !== 'object') return
  const data = event.data
  switch (event.type) {
    case 'turn/start':
      projection.running = true
      projection.questions.clear()
      break
    case 'turn/end':
    case 'session/end-seed':
      projection.running = false
      projection.questions.clear()
      break
    case 'request/header':
      projection.route = modelRoute(data?.header?.config) || projection.route
      break
    case 'request/context':
      projection.route = modelRoute(data) || projection.route
      break
    case 'tool/call':
      if (projection.running && data?.name === 'ask_user_question' && typeof data.callId === 'string') {
        projection.questions.add(data.callId)
      }
      break
    case 'tool/result':
      projection.questions.delete(String(data?.message?.source?.callId || data?.callId || ''))
      break
    case 'approval/asked':
      if (projection.running && typeof data?.id === 'string') projection.questions.add('approval:' + data.id)
      break
    case 'approval/decided':
      projection.questions.delete('approval:' + String(data?.id || ''))
      break
  }
}

/**
 * SessionStore contains live Session objects, not client session snapshots.
 * Agent.status is authoritative when the optional registry exists. On older
 * hosts, only turn events appended in THIS process may establish activity:
 * Session.firstLiveSeq excludes resumed/forked history, while session/event
 * observation covers hosts that do not expose that boundary.
 */
export function createWorkshopPresenceTracker() {
  const projections = new WeakMap<object, Projection>()

  function projectionFor(session: any): Projection {
    const cached = projections.get(session)
    if (cached) return cached
    const events = Array.isArray(session.events) ? session.events : []
    const start = Number.isSafeInteger(session.firstLiveSeq) && session.firstLiveSeq >= 0
      ? Math.min(session.firstLiveSeq, events.length)
      : events.length
    const projection: Projection = { nextIndex: start, running: false, route: null, questions: new Set() }
    // Request headers are safe route metadata. A seeded request may identify
    // the next live turn's model, but a seeded turn can never establish work.
    try {
      projection.route = typeof session.requestHeader === 'function'
        ? modelRoute(session.requestHeader()?.config)
        : null
    } catch { /* an incomplete live session can still supply a later header */ }
    if (!projection.route) {
      for (let index = events.length - 1; index >= 0; index--) {
        const event = events[index]
        if (event?.type === 'request/header') projection.route = modelRoute(event.data?.header?.config)
        else if (event?.type === 'request/context') projection.route = modelRoute(event.data)
        if (projection.route) break
      }
    }
    projections.set(session, projection)
    return projection
  }

  function update(session: any): Projection {
    const projection = projectionFor(session)
    const events = Array.isArray(session.events) ? session.events : []
    for (let index = projection.nextIndex; index < events.length; index++) foldEvent(projection, events[index])
    projection.nextIndex = events.length
    return projection
  }

  return {
    observe(session: any, event: any): void {
      if (!session || typeof session !== 'object') return
      const projection = update(session)
      // New Session implementations dispatch after append; older ones may
      // dispatch before append. Folding these assignments twice is harmless.
      foldEvent(projection, event)
    },

    snapshot(sessions: any[], agents: any[], roster: { id: string; name: string }[]): WorkshopCharacterPresence[] {
      const characters = roster.map(({ id, name }) => ({ id, name, status: 'idle' as WorkshopStatus, activeSessions: 0 }))
      const byCharacter = new Map(characters.map((row) => [row.id, row]))
      const bySession = new Map<string, any>()
      for (const session of Array.isArray(sessions) ? sessions : []) {
        if (!session || typeof session !== 'object' || session.live === false) continue
        const id = String(session.id || session.header?.id || '')
        if (id) bySession.set(id, { session, agent: null })
      }
      for (const agent of Array.isArray(agents) ? agents : []) {
        const session = agent?.session
        const id = String(agent?.id || session?.id || session?.header?.id || '')
        if (id && session && typeof session === 'object') bySession.set(id, { session, agent })
      }
      for (const { session, agent } of bySession.values()) {
        const projection = update(session)
        const runtime = agent || session
        const running = runtime.status === 'idle' || runtime.running === false ? false
          : runtime.status === 'running' || runtime.running === true ? true
            : projection.running
        if (!running) continue
        // A folded live request is authoritative over initial agent options.
        const route = projection.route || modelRoute(agent?.options) || modelRoute(session.modelSelection)
        const character = byCharacter.get(workshopCharacterForModel(route) || '')
        if (!character) continue
        const waiting = runtime.pendingInteraction != null || session.pendingInteraction != null || projection.questions.size > 0
        const status = waiting ? 'waiting' : 'running'
        character.activeSessions += 1
        // One actively computing session keeps this model at its desk even
        // when another session of the same model awaits a user answer.
        if (status === 'running' || character.status === 'idle') character.status = status
      }
      return characters
    },
  }
}
