import assert from 'node:assert/strict'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import * as nativeFs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { Readable } from 'node:stream'
import test, { after } from 'node:test'
import { apply, createNativeGlobalStorage, createNativeWorkspaceStorage } from '../src/index.ts'

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
const PIXEL_ALT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII='
const TEMP_HOMES = new Set<string>()

after(() => {
  for (const root of TEMP_HOMES) rmSync(root, { recursive: true, force: true })
})

function legacySave(label: string): string {
  return JSON.stringify({
    v: 9,
    current: 'deepseek',
    lastCurrent: 'deepseek',
    characters: {
      deepseek: {
        affection: 7,
        level: 2,
        log: [{ role: 'user', text: label + '-private-log' }],
        chatLines: [{ who: 'heroine', text: label + '-private-history' }],
        choices: [{ id: label + '-choice', text: label + '-private-choice', effect: 0 }],
        activity: { seen: ['activity-' + label.toLowerCase() + '123'], lastMentionedAt: label === 'A' ? 101 : 202 },
        cgs: label === 'A' ? [{
          id: 'global-cg',
          status: 'ready',
          dataUrl: PIXEL,
          prompt: 'global-cg-prompt',
          charId: 'deepseek',
          level: 2,
          at: 123,
          seen: true,
          savedAsBg: false,
        }] : [],
        customSprite: label === 'A'
          ? { dataUrl: PIXEL, fileName: 'global-sprite.png', revision: 12 }
          : { dataUrl: null, fileName: '', revision: 0 },
        chosenBuiltinBackground: 'bg-deepseek-seaside-study',
        profileOverrides: label === 'A' ? { displayName: '全局鲸鱼娘', tone: '全局语气' } : {},
      },
    },
    tokens: { bank: 0, lastActiveAt: 0 },
    bg: PIXEL,
    cg: { cgId: 'global-cg' },
    preferences: {
      enabled: true,
      petEnabled: true,
      characterMode: 'manual',
      characterId: 'deepseek',
      characterProvider: '',
      characterModel: '',
      chatMode: 'configured',
      chatProvider: '',
      chatModel: '',
      customBgName: 'global-background.png',
    },
  })
}

function workspaceFile(root: string): string {
  return root.replace(/[\\/]$/, '') + '\\.whale-girl-save.json'
}

function makeHarness(options: {
  roots: string[]
  legacy?: Record<string, string>
  globalSave?: string
  genericMissingReadError?: boolean
  listProviders?: () => any[]
  listModels?: (provider: string) => any
  synchronizeLegacyReads?: boolean
  dshHome?: string
  denyWorkspaceWritesFor?: string[]
}) {
  const tempHome = options.dshHome || mkdtempSync(join(tmpdir(), 'dsh-whale-galgame-'))
  TEMP_HOMES.add(tempHome)
  const globalPath = join(tempHome, 'storages', 'dsh-whale-galgame', 'global.json')
  const files = new Map<string, string>()
  if (typeof options.globalSave === 'string') {
    mkdirSync(join(tempHome, 'storages', 'dsh-whale-galgame'), { recursive: true })
    writeFileSync(globalPath, options.globalSave, 'utf8')
  }
  for (const [root, value] of Object.entries(options.legacy || {})) files.set(workspaceFile(root), value)
  const versions = new Map(Array.from(files.keys(), (target) => [target, 1]))
  const sessions = options.roots.map((root, index) => ({
    header: { version: 0, id: 'session-' + String.fromCharCode(97 + index), cwd: root, createdAt: 100 + index },
    live: true,
    persisted: true,
    events: [],
  }))
  let routeHandler: any = null
  let readSessionCalls = 0
  const readTargets: string[] = []
  const writeTargets: string[] = []
  let legacyReadCount = 0
  let releaseLegacyReads: (() => void) | null = null
  const legacyReadBarrier = new Promise<void>((resolve) => { releaseLegacyReads = resolve })
  let legacyReadsReleased = options.synchronizeLegacyReads !== true
  let failNextWorkspaceWrite = false
  let failNextGlobalWrite = false
  const listeners = new Map<string, Function>()
  const nativeGlobalIo: any = {
    ...nativeFs,
    readFile: async (target: any, ...args: any[]) => {
      if (String(target) === globalPath) readTargets.push(globalPath)
      return (nativeFs.readFile as any)(target, ...args)
    },
    link: async (source: any, target: any) => {
      if (String(target) === globalPath) {
        writeTargets.push(globalPath)
        if (failNextGlobalWrite) {
          failNextGlobalWrite = false
          const error: any = new Error('simulated global write failure')
          error.code = 'EIO'
          throw error
        }
      }
      return nativeFs.link(source, target)
    },
    rename: async (source: any, target: any) => {
      if (String(target) === globalPath) {
        writeTargets.push(globalPath)
        if (failNextGlobalWrite) {
          failNextGlobalWrite = false
          const error: any = new Error('simulated global write failure')
          error.code = 'EIO'
          throw error
        }
      }
      return nativeFs.rename(source, target)
    },
  }
  const services: any = {
    fs: {
      resolve: async (name: string, scope?: any) => scope && scope.cwd ? workspaceFile(scope.cwd) : name,
      stat: async (target: string) => files.has(target)
        ? { type: 'file', version: versions.get(target) }
        : undefined,
      readText: async (target: string) => {
        readTargets.push(target)
        if (!files.has(target)) {
          if (options.genericMissingReadError) throw new Error('DSH file service could not read this path')
          throw new Error('ENOENT: ' + target)
        }
        if (!legacyReadsReleased && Object.prototype.hasOwnProperty.call(options.legacy || {},
          options.roots.find((root) => workspaceFile(root) === target) || '')) {
          legacyReadCount += 1
          if (legacyReadCount >= options.roots.length) {
            legacyReadsReleased = true
            releaseLegacyReads!()
          }
          await legacyReadBarrier
        }
        return files.get(target)!
      },
      writeText: async (target: string, value: string, expected?: any) => {
        writeTargets.push(target)
        if ((options.denyWorkspaceWritesFor || []).some((root) => workspaceFile(root) === target)) {
          throw new Error(`cannot write "${target}": file access denied under workspace-write mode`)
        }
        const before = files.has(target) ? files.get(target)! : null
        const currentVersion = versions.get(target)
        if (expected && expected.kind === 'createIfAbsent' && before !== null) {
          throw new Error('FS_ALREADY_EXISTS: ' + target)
        }
        if (expected && expected.kind === 'replaceIfVersion' && expected.version !== currentVersion) {
          throw new Error('FS_STALE_VERSION: ' + target)
        }
        if (failNextWorkspaceWrite && target.endsWith('\\.whale-girl-save.json')) {
          failNextWorkspaceWrite = false
          throw new Error('simulated workspace write failure')
        }
        files.set(target, value)
        const version = (currentVersion || 0) + 1
        versions.set(target, version)
        return { operation: before === null ? 'create' : 'update', version, before, after: value }
      },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => sessions },
    workspaceRegistry: { list: () => options.roots.map((path) => ({ path })) },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek-official', model: 'deepseek-v4-flash' }) },
    dshHomePath: (...segments: string[]) => join(tempHome, ...segments),
    sessionQuery: {
      listSessions: async () => sessions,
      listEvents: async () => [],
      filterSessions: async () => sessions,
      readSession: async () => {
        readSessionCalls += 1
        return new Promise(() => {})
      },
    },
  }
  const llm: any = {
    listProviders: options.listProviders || (() => [{ id: 'deepseek-official', name: 'DeepSeek' }]),
    listModels: options.listModels || (async () => [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', inputModalities: ['text'] }]),
    resolveModelInfo: async () => ({}),
    stream: async function* (request: any): AsyncGenerator<any> {
      const system = String(request && request.system || '')
      const text = system.includes('情绪分类器')
        ? 'normal'
        : system.includes('对话选项生成器')
          ? '{"positive":"靠近一点","neutral":"继续聊聊","negative":"先静一静"}'
          : '我在这里。'
      yield { type: 'text-delta', text }
    },
  }
  const ctx: any = {
    dshHomePath: services.dshHomePath,
    webServer: { register: (route: any) => { routeHandler = route.handler } },
    llm,
    inject: (names: string[], callback: Function) => {
      if (names.includes('sessionQuery')) callback({ sessionQuery: services.sessionQuery })
      else callback(services)
    },
    on: (event: string, callback: Function) => { listeners.set(event, callback) },
    effect: (callback: Function) => callback(),
  }
  apply(
    ctx,
    { chatProvider: 'deepseek-official', chatModel: 'deepseek-v4-flash' },
    { nativeGlobalIo },
  )

  async function request(sessionId: string, action: string, args: any = {}): Promise<{ status: number; body: any }> {
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
    return { status, body: JSON.parse(body) }
  }

  async function post(sessionId: string, action: string, args: any = {}): Promise<any> {
    const { status, body } = await request(sessionId, action, args)
    assert.equal(status, 200, body)
    return body
  }

  const fileView = {
    get(target: string): string | undefined {
      if (target === globalPath) return existsSync(globalPath) ? readFileSync(globalPath, 'utf8') : undefined
      return files.get(target)
    },
    has(target: string): boolean {
      return target === globalPath ? existsSync(globalPath) : files.has(target)
    },
  }

  return {
    dshHome: tempHome,
    files: fileView,
    globalPath,
    listeners,
    post,
    failNextWorkspaceWrite: () => { failNextWorkspaceWrite = true },
    failNextGlobalWrite: () => { failNextGlobalWrite = true },
    readTargets,
    readSessionCalls: () => readSessionCalls,
    request,
    sessions,
    writeTargets,
  }
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

test('keeps one continuous game timeline while workspaces remain event-source markers', async () => {
  const rootA = 'E:\\workspace\\galgame-a'
  const rootB = 'E:\\workspace\\galgame-b'
  const harness = makeHarness({
    roots: [rootA, rootB],
    legacy: { [rootA]: legacySave('A'), [rootB]: legacySave('B') },
  })

  const viewA = await beforeDeadline(harness.post('session-a', 'view'), 1_000, 'workspace A view did not resolve')
  assert.notEqual(viewA.workspaceMismatch, true)
  assert.equal(viewA.enabled, true)
  assert.equal(viewA.affection, 7)
  assert.deepEqual(viewA.history.map((line: any) => line.text), ['A-private-history'])
  assert.deepEqual(viewA.choices.map((choice: any) => choice.effect).sort(), [-1, 0, 1])
  const choicesA = viewA.choices

  const viewB = await beforeDeadline(harness.post('session-b', 'view'), 1_000, 'workspace B view did not resolve')
  assert.notEqual(viewB.workspaceMismatch, true)
  assert.equal(viewB.enabled, true)
  assert.equal(viewB.affection, 7)
  assert.deepEqual(viewB.history.map((line: any) => line.text), ['A-private-history', 'B-private-history'])
  assert.deepEqual(viewB.choices, choicesA)
  const resumedA = await harness.post('session-a', 'view')
  assert.deepEqual(resumedA.history, viewB.history)
  assert.deepEqual(resumedA.choices, viewB.choices)

  const profileB = await harness.post('session-b', 'profile-get', { characterId: 'deepseek' })
  assert.equal(profileB.effective.displayName, '全局鲸鱼娘')
  assert.equal(profileB.effective.tone, '全局语气')

  const spriteB = await harness.post('session-b', 'sprite-data', { characterId: 'deepseek' })
  assert.equal(spriteB.kind, 'custom')
  assert.equal(spriteB.dataUrl, PIXEL)
  assert.equal(spriteB.fileName, 'global-sprite.png')

  const galleryB = await harness.post('session-b', 'cg-gallery')
  assert.equal(galleryB.items.length, 1)
  assert.equal(galleryB.items[0].id, 'global-cg')
  assert.equal(Object.prototype.hasOwnProperty.call(galleryB.items[0], 'dataUrl'), false)
  const cgDataB = await harness.post('session-b', 'cg-data', { id: 'global-cg' })
  assert.equal(cgDataB.ok, true)
  assert.equal(cgDataB.dataUrl, PIXEL)

  const backgroundB = await harness.post('session-b', 'bg-data')
  assert.equal(backgroundB.dataUrl, PIXEL)

  await harness.post('session-b', 'profile-set', {
    characterId: 'deepseek',
    overrides: { displayName: '跨工作区昵称' },
  })
  assert.equal((await harness.post('session-a', 'profile-get', { characterId: 'deepseek' })).effective.displayName, '跨工作区昵称')

  await harness.post('session-b', 'sprite-upload', {
    characterId: 'deepseek',
    dataUrl: PIXEL_ALT,
    fileName: 'shared-new.png',
  })
  const spriteA = await harness.post('session-a', 'sprite-data', { characterId: 'deepseek' })
  assert.equal(spriteA.dataUrl, PIXEL_ALT)
  assert.equal(spriteA.fileName, 'shared-new.png')

  await harness.post('session-a', 'bg-upload', { dataUrl: PIXEL_ALT, fileName: 'shared-background.png' })
  assert.equal((await harness.post('session-b', 'bg-data')).dataUrl, PIXEL_ALT)

  const global = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(global.kind, 'dsh-whale-galgame-global')
  assert.equal(global.characters.deepseek.affection, 7)
  assert.equal(global.characters.deepseek.profileOverrides.displayName, '跨工作区昵称')
  assert.equal(global.characters.deepseek.customSprite.dataUrl, PIXEL_ALT)
  assert.equal(global.characters.deepseek.cgs[0].id, 'global-cg')
  assert.equal(global.bg, PIXEL_ALT)
  assert.deepEqual(global.characters.deepseek.log.map((entry: any) => entry.text), ['A-private-log', 'B-private-log'])
  assert.deepEqual(global.characters.deepseek.chatLines.map((entry: any) => entry.text), ['A-private-history', 'B-private-history'])
  assert.deepEqual(global.characters.deepseek.choices, choicesA)
  assert.deepEqual(global.characters.deepseek.activity.seen, ['activity-a123', 'activity-b123'])

  const workspaceA = JSON.parse(harness.files.get(workspaceFile(rootA)) || '{}')
  const workspaceB = JSON.parse(harness.files.get(workspaceFile(rootB)) || '{}')
  assert.equal(workspaceA.kind, 'dsh-whale-galgame-workspace')
  assert.equal(workspaceB.kind, 'dsh-whale-galgame-workspace')
  assert.equal(workspaceA.v, 2)
  assert.equal(workspaceB.v, 2)
  assert.equal(typeof workspaceA.source.workspaceKey, 'string')
  assert.equal(typeof workspaceB.source.workspaceKey, 'string')
  assert.equal(Object.prototype.hasOwnProperty.call(workspaceA, 'characters'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(workspaceB, 'tokens'), false)

  const historyBeforeReset = global.characters.deepseek.chatLines
  const resetView = await harness.post('session-a', 'reset')
  assert.equal(resetView.level, 1)
  assert.equal(resetView.affection, 0)
  assert.equal((await harness.post('session-b', 'profile-get', { characterId: 'deepseek' })).effective.displayName, '跨工作区昵称')
  assert.equal((await harness.post('session-b', 'sprite-data', { characterId: 'deepseek' })).dataUrl, PIXEL_ALT)
  assert.equal((await harness.post('session-b', 'cg-data', { id: 'global-cg' })).dataUrl, PIXEL)
  assert.equal((await harness.post('session-b', 'bg-data')).dataUrl, PIXEL_ALT)
  assert.deepEqual(JSON.parse(harness.files.get(harness.globalPath) || '{}').characters.deepseek.chatLines, historyBeforeReset)

  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(harness.readSessionCalls(), 0, 'normal API reads must not call the potentially hanging readSession path')
})

test('aggregates safe Harness activity globally and consumes one event only once across workspaces', async () => {
  const rootA = 'E:\\workspace\\activity-global-a'
  const rootB = 'E:\\workspace\\activity-global-b'
  const harness = makeHarness({ roots: [rootA, rootB] })
  const now = Date.now()
  harness.sessions[0].events.push(
    { type: 'turn/start', seq: 1, time: now - 3_000, data: { turn: 1 } },
    {
      type: 'user/message',
      seq: 2,
      time: now - 2_000,
      data: {
        turn: 1,
        id: 'private-activity-message',
        role: 'user',
        source: { kind: 'user' },
        content: [{ type: 'text', text: '请 debug C:\\private\\secret.ts 的 TypeScript bug，密钥 sk-never-store-this' }],
      },
    },
    { type: 'turn/end', seq: 3, time: now - 1_000, data: { turn: 1, reason: { kind: 'completed' } } },
  )

  await harness.post('session-a', 'chat', { text: '先陪我聊聊' })
  const afterA = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(afterA.activityFeed.length, 1)
  assert.equal(afterA.activityFeed[0].category, 'code-debug')
  assert.equal(afterA.characters.deepseek.activity.seen.length, 1)
  assert.doesNotMatch(JSON.stringify(afterA), /secret\.ts|never-store|private-activity-message/i)

  await harness.post('session-b', 'chat', { text: '换个工作区继续聊' })
  const afterB = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.deepEqual(afterB.characters.deepseek.activity.seen, afterA.characters.deepseek.activity.seen)
  assert.equal(afterB.activityFeed.length, 1)
})

test('persists a global background revision across same-kind custom and CG replacements', async () => {
  const root = 'E:\\workspace\\background-revision'
  const legacy = JSON.parse(legacySave('A'))
  legacy.characters.deepseek.cgs.push({
    id: 'global-cg-alt',
    status: 'ready',
    dataUrl: PIXEL_ALT,
    prompt: 'global-cg-alt-prompt',
    charId: 'deepseek',
    level: 2,
    at: 124,
    seen: true,
    savedAsBg: false,
  })
  for (const id of ['gpt', 'claude', 'gemini', 'grok', 'kimi']) legacy.characters[id] = {}
  const harness = makeHarness({ roots: [root], legacy: { [root]: JSON.stringify(legacy) } })

  const initial = await harness.post('session-a', 'view')
  assert.equal(initial.bg, 'cg')
  assert.equal(Number.isSafeInteger(initial.backgroundRevision), true)
  const initialData = await harness.post('session-a', 'bg-data')
  assert.equal(initialData.backgroundRevision, initial.backgroundRevision)

  const customOne = await harness.post('session-a', 'bg-upload', {
    dataUrl: PIXEL,
    fileName: 'custom-one.png',
  })
  assert.equal(customOne.view.bg, 'custom')
  assert.equal(customOne.view.backgroundRevision, initial.backgroundRevision + 1)

  const customTwo = await harness.post('session-a', 'bg-upload', {
    dataUrl: PIXEL_ALT,
    fileName: 'custom-two.png',
  })
  assert.equal(customTwo.view.bg, 'custom')
  assert.equal(customTwo.view.backgroundRevision, customOne.view.backgroundRevision + 1)
  const customData = await harness.post('session-a', 'bg-data')
  assert.equal(customData.dataUrl, PIXEL_ALT)
  assert.equal(customData.backgroundRevision, customTwo.view.backgroundRevision)

  const beforeFailedSave = harness.files.get(harness.globalPath)
  harness.failNextGlobalWrite()
  const failedSave = await harness.request('session-a', 'cg-save-bg', { id: 'global-cg-alt' })
  assert.equal(failedSave.status, 500)
  assert.match(String(failedSave.body && failedSave.body.error), /simulated global write failure/)
  const afterFailedSave = await harness.post('session-a', 'view')
  assert.equal(afterFailedSave.bg, 'custom')
  assert.equal(afterFailedSave.backgroundRevision, customTwo.view.backgroundRevision)
  assert.equal((await harness.post('session-a', 'bg-data')).dataUrl, PIXEL_ALT)
  assert.equal(harness.files.get(harness.globalPath), beforeFailedSave)
  assert.equal((await harness.post('session-a', 'cg-gallery')).items.some((item: any) => item.savedAsBg), false)

  const cgOne = await harness.post('session-a', 'cg-save-bg', { id: 'global-cg-alt' })
  assert.equal(cgOne.bg, 'cg')
  assert.equal(cgOne.backgroundRevision, customTwo.view.backgroundRevision + 1)
  assert.equal((await harness.post('session-a', 'bg-data')).dataUrl, PIXEL_ALT)

  const cgTwo = await harness.post('session-a', 'cg-save-bg', { id: 'global-cg' })
  assert.equal(cgTwo.bg, 'cg')
  assert.equal(cgTwo.backgroundRevision, cgOne.backgroundRevision + 1)
  const cgData = await harness.post('session-a', 'bg-data')
  assert.equal(cgData.dataUrl, PIXEL)
  assert.equal(cgData.backgroundRevision, cgTwo.backgroundRevision)

  const globalSave = harness.files.get(harness.globalPath) || ''
  const workspaceSave = harness.files.get(workspaceFile(root)) || ''
  assert.equal(JSON.parse(globalSave).backgroundRevision, cgTwo.backgroundRevision)

  const restarted = makeHarness({
    roots: [root],
    globalSave,
    legacy: { [root]: workspaceSave },
  })
  const restartedView = await restarted.post('session-a', 'view')
  assert.equal(restartedView.bg, 'cg')
  assert.equal(restartedView.backgroundRevision, cgTwo.backgroundRevision)
  const restartedData = await restarted.post('session-a', 'bg-data')
  assert.equal(restartedData.dataUrl, PIXEL)
  assert.equal(restartedData.backgroundRevision, cgTwo.backgroundRevision)

  const preRevisionGlobal = JSON.parse(globalSave)
  delete preRevisionGlobal.backgroundRevision
  const migrated = makeHarness({
    roots: [root],
    globalSave: JSON.stringify(preRevisionGlobal),
    legacy: { [root]: workspaceSave },
  })
  const migratedView = await migrated.post('session-a', 'view')
  assert.equal(migratedView.backgroundRevision, 1)
  assert.equal(JSON.parse(migrated.files.get(migrated.globalPath) || '{}').backgroundRevision, 1)
})

test('merges concurrent migrations into one global token ledger, activity memory, and chat timeline', async () => {
  const rootA = 'E:\\workspace\\concurrent-a'
  const rootB = 'E:\\workspace\\concurrent-b'
  const legacyA = JSON.parse(legacySave('A'))
  legacyA.characters.deepseek.affection = 3
  legacyA.characters.deepseek.level = 1
  legacyA.characters.deepseek.profileOverrides = { displayName: '并发昵称' }
  legacyA.tokens = { bank: 111, lastActiveAt: 0 }

  const legacyB = JSON.parse(legacySave('B'))
  legacyB.characters.deepseek.affection = 12
  legacyB.characters.deepseek.level = 2
  legacyB.characters.deepseek.profileOverrides = { tone: '并发语气' }
  legacyB.characters.deepseek.cgs = [{
    id: 'global-cg-b',
    status: 'ready',
    dataUrl: PIXEL_ALT,
    prompt: 'global-cg-b-prompt',
    charId: 'deepseek',
    level: 2,
    at: 456,
    seen: false,
    savedAsBg: false,
  }]
  legacyB.characters.deepseek.customSprite = { dataUrl: null, fileName: '', revision: 0 }
  legacyB.tokens = { bank: 222, lastActiveAt: 0 }
  legacyB.bg = null
  legacyB.cg = null

  const harness = makeHarness({
    roots: [rootA, rootB],
    legacy: { [rootA]: JSON.stringify(legacyA), [rootB]: JSON.stringify(legacyB) },
    synchronizeLegacyReads: true,
  })

  await beforeDeadline(Promise.all([
    harness.post('session-a', 'view'),
    harness.post('session-b', 'view'),
  ]), 1_000, 'concurrent workspace migration did not settle')

  const mergedA = await harness.post('session-a', 'view')
  const mergedB = await harness.post('session-b', 'view')
  assert.equal(mergedA.affection, 12)
  assert.equal(mergedB.affection, 12)
  assert.equal((await harness.post('session-a', 'profile-get')).effective.displayName, '并发昵称')
  assert.equal((await harness.post('session-b', 'profile-get')).effective.tone, '并发语气')
  assert.deepEqual((await harness.post('session-a', 'cg-gallery')).items.map((item: any) => item.id).sort(), [
    'global-cg',
    'global-cg-b',
  ])
  assert.equal((await harness.post('session-b', 'sprite-data')).dataUrl, PIXEL)

  const onSessionEvent = harness.listeners.get('session/event')
  assert.equal(typeof onSessionEvent, 'function')
  const usageA = {
    type: 'assistant/message',
    seq: 40,
    time: 400,
    data: { id: 'usage-a', usage: { inputTokens: 5_000, outputTokens: 0 } },
  }
  onSessionEvent!({ header: harness.sessions[0].header }, usageA)
  // Re-delivery of the same Harness event must not award tokens twice.
  onSessionEvent!({ header: harness.sessions[0].header }, usageA)
  onSessionEvent!({ header: harness.sessions[1].header }, {
    type: 'assistant/message',
    seq: 41,
    time: 401,
    data: { id: 'usage-b', usage: { inputTokens: 1_000, outputTokens: 0 } },
  })

  await beforeDeadline(Promise.all([
    harness.post('session-a', 'profile-set', {
      characterId: 'deepseek',
      overrides: { displayName: '并发后昵称' },
    }),
    harness.post('session-b', 'chat', { text: '喜欢和你说话' }),
  ]), 1_000, 'concurrent profile/chat write did not settle')
  await harness.post('session-a', 'chat', { text: '记录在 A 的话' })

  const finalA = await harness.post('session-a', 'view')
  const finalB = await harness.post('session-b', 'view')
  // One 5k token point plus the one explicitly warm chat phrase; the second
  // plain chat line has no keyword affection delta.
  assert.equal(finalA.affection, 14)
  assert.equal(finalB.affection, 14)
  assert.equal((await harness.post('session-b', 'profile-get')).effective.displayName, '并发后昵称')
  assert.equal(finalA.history.some((line: any) => line.text === '记录在 A 的话'), true)
  assert.equal(finalA.history.some((line: any) => line.text === '喜欢和你说话'), true)
  assert.equal(finalB.history.some((line: any) => line.text === '喜欢和你说话'), true)
  assert.equal(finalB.history.some((line: any) => line.text === '记录在 A 的话'), true)
  assert.deepEqual(finalA.history, finalB.history)
  assert.deepEqual(finalA.choices, finalB.choices)

  const workspaceA = JSON.parse(harness.files.get(workspaceFile(rootA)) || '{}')
  const workspaceB = JSON.parse(harness.files.get(workspaceFile(rootB)) || '{}')
  assert.equal(workspaceA.v, 2)
  assert.equal(workspaceB.v, 2)
  assert.equal(Object.prototype.hasOwnProperty.call(workspaceA, 'tokens'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(workspaceB, 'characters'), false)
  const global = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(global.tokens.bank, 1_333)
  assert.equal(global.tokens.seenUsage.length, 2)
  assert.deepEqual(global.characters.deepseek.activity.seen, ['activity-a123', 'activity-b123'])
})

test('uses the newest global relationship clock instead of decaying once per workspace', async () => {
  const rootA = 'E:\\workspace\\clock-a'
  const rootB = 'E:\\workspace\\clock-b'
  const now = Date.now()
  const oldActivity = now - 10 * 24 * 60 * 60 * 1_000
  const recentActivity = now - 60 * 60 * 1_000
  const legacyA = JSON.parse(legacySave('A'))
  const legacyB = JSON.parse(legacySave('B'))
  legacyA.tokens = { bank: 0, lastActiveAt: oldActivity }
  legacyB.tokens = { bank: 0, lastActiveAt: recentActivity }

  const harness = makeHarness({
    roots: [rootA, rootB],
    legacy: { [rootA]: JSON.stringify(legacyA), [rootB]: JSON.stringify(legacyB) },
  })

  // Profile reads load and migrate both saves without running relationship
  // settlement, so the merged clock can be asserted directly.
  await harness.post('session-a', 'profile-get', { characterId: 'deepseek' })
  await harness.post('session-b', 'profile-get', { characterId: 'deepseek' })
  const migratedGlobal = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(migratedGlobal.relationshipLastActiveAt, recentActivity)

  const before = migratedGlobal.characters.deepseek.affection
  await harness.post('session-a', 'view')
  await new Promise((resolve) => setTimeout(resolve, 30))
  const after = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(after.characters.deepseek.affection, before)
  const workspace = JSON.parse(harness.files.get(workspaceFile(rootA)) || '{}')
  assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'tokens'), false)
})

test('does not let a later legacy workspace overwrite explicitly chosen global settings or art', async () => {
  const rootA = 'E:\\workspace\\claims-a'
  const rootB = 'E:\\workspace\\claims-b'
  const legacyA = JSON.parse(legacySave('A'))
  legacyA.characters.deepseek.profileOverrides = {}
  legacyA.characters.deepseek.customSprite = { dataUrl: null, fileName: '', revision: 0 }
  legacyA.bg = null
  legacyA.cg = null
  legacyA.characters.deepseek.cgs = []

  const legacyB = JSON.parse(legacySave('B'))
  legacyB.characters.deepseek.profileOverrides = {
    displayName: '旧工作区昵称',
    tone: '旧工作区语气',
  }
  legacyB.characters.deepseek.customSprite = {
    dataUrl: PIXEL,
    fileName: 'old-workspace.png',
    revision: 999,
  }
  legacyB.bg = PIXEL

  const harness = makeHarness({
    roots: [rootA, rootB],
    legacy: { [rootA]: JSON.stringify(legacyA), [rootB]: JSON.stringify(legacyB) },
  })

  await harness.post('session-a', 'view')
  await harness.post('session-a', 'profile-set', {
    characterId: 'deepseek',
    overrides: { displayName: '用户全局昵称' },
  })
  await harness.post('session-a', 'sprite-upload', {
    characterId: 'deepseek',
    dataUrl: PIXEL_ALT,
    fileName: 'user-global.png',
  })
  await harness.post('session-a', 'bg-upload', {
    dataUrl: PIXEL_ALT,
    fileName: 'user-global-background.png',
  })
  await harness.post('session-a', 'settings-set', { petEnabled: false })

  // Loading B performs its legacy import after the global choices above have
  // already been claimed.
  await harness.post('session-b', 'view')
  const profile = await harness.post('session-b', 'profile-get', { characterId: 'deepseek' })
  assert.equal(profile.effective.displayName, '用户全局昵称')
  assert.equal(profile.effective.tone, '旧工作区语气')
  assert.equal((await harness.post('session-b', 'sprite-data', { characterId: 'deepseek' })).dataUrl, PIXEL_ALT)
  assert.equal((await harness.post('session-b', 'bg-data')).dataUrl, PIXEL_ALT)
  assert.equal((await harness.post('session-b', 'settings-get')).petEnabled, false)
})

test('ordinary game saves touch only global v2 and roll back a failed global write', async () => {
  const root = 'E:\\workspace\\partial-commit'
  const harness = makeHarness({
    roots: [root],
    legacy: { [root]: legacySave('A') },
  })

  const beforeProfile = await harness.post('session-a', 'profile-get', { characterId: 'deepseek' })
  const beforeGlobal = harness.files.get(harness.globalPath)
  const beforeWorkspace = harness.files.get(workspaceFile(root))
  assert.equal(typeof beforeGlobal, 'string')
  assert.equal(typeof beforeWorkspace, 'string')

  harness.failNextWorkspaceWrite()
  const saved = await harness.post('session-a', 'profile-set', {
    characterId: 'deepseek',
    overrides: { displayName: '全局提交的昵称' },
  })

  assert.equal(saved.ok, true)
  assert.notEqual(harness.files.get(harness.globalPath), beforeGlobal)
  assert.equal(harness.files.get(workspaceFile(root)), beforeWorkspace)
  const afterProfile = await harness.post('session-a', 'profile-get', { characterId: 'deepseek' })
  assert.equal(afterProfile.effective.displayName, '全局提交的昵称')

  const committedGlobal = harness.files.get(harness.globalPath)
  const committedClaims = JSON.parse(committedGlobal || '{}').migration.claims.profiles.deepseek
  harness.failNextGlobalWrite()
  const failedGlobal = await harness.post('session-a', 'profile-set', {
    characterId: 'deepseek',
    overrides: { tone: '也不应提交的语气' },
  })

  assert.equal(failedGlobal.ok, false)
  assert.equal(failedGlobal.error, '角色设定保存失败')
  assert.equal(harness.files.get(harness.globalPath), committedGlobal)
  assert.equal(harness.files.get(workspaceFile(root)), beforeWorkspace)
  const afterGlobalFailure = await harness.post('session-a', 'profile-get', { characterId: 'deepseek' })
  assert.equal(afterGlobalFailure.effective.tone, beforeProfile.effective.tone)
  assert.deepEqual(
    JSON.parse(harness.files.get(harness.globalPath) || '{}').migration.claims.profiles.deepseek,
    committedClaims,
  )
})

test('treats a stat-absent DSH save as a clean first install without reading it', async () => {
  const root = 'E:\\workspace\\first-install'
  const harness = makeHarness({ roots: [root], genericMissingReadError: true })

  const settings = await beforeDeadline(
    harness.post('', 'settings-get'),
    1_000,
    'first-install global state did not become ready',
  )

  assert.equal(settings.enabled, true)
  assert.equal(harness.files.has(harness.globalPath), false)
  assert.equal(harness.readTargets.includes(harness.globalPath), false)
  assert.deepEqual(harness.writeTargets, [])
})

test('latches corrupt or unknown global saves and never overwrites them', async () => {
  for (const [name, source, errorPattern] of [
    ['invalid JSON', '{this is not json', /JSON 已损坏/],
    ['future schema', JSON.stringify({
      kind: 'dsh-whale-galgame-global',
      v: 99,
      characters: {},
      preferences: {},
    }), /版本或结构无法识别/],
  ] as const) {
    const harness = makeHarness({
      roots: ['E:\\workspace\\global-fail-' + name.replace(/\s+/g, '-')],
      globalSave: source,
    })

    const first = await harness.request('', 'settings-get')
    const mutation = await harness.request('', 'pet-set', { enabled: false })
    const reset = await harness.request('', 'reset')

    assert.equal(first.status, 500, name)
    assert.match(String(first.body.error), errorPattern, name)
    assert.equal(mutation.status, 500, name)
    assert.equal(reset.status, 500, name)
    assert.equal(harness.files.get(harness.globalPath), source, name)
    assert.equal(harness.readTargets.filter((target) => target === harness.globalPath).length, 1, name)
    assert.deepEqual(harness.writeTargets, [], name)
  }
})

test('fails closed for damaged and future workspace saves without legacy fallback', async () => {
  const futureWorkspace = JSON.stringify({
    kind: 'dsh-whale-galgame-workspace-next',
    v: 9,
    current: 'deepseek',
    characters: {
      deepseek: {
        affection: 999,
        log: [{ role: 'user', text: 'must-not-import' }],
        chatLines: [{ who: 'user', text: 'must-not-import' }],
        choices: [],
      },
    },
    tokens: { bank: 999 },
  })
  for (const [suffix, source, errorPattern] of [
    ['json', '{broken workspace json', /工作区存档 JSON 已损坏/],
    ['future', futureWorkspace, /kind 或版本无法识别/],
  ] as const) {
    const root = 'E:\\workspace\\workspace-fail-' + suffix
    const target = workspaceFile(root)
    const harness = makeHarness({ roots: [root], legacy: { [root]: source } })

    const result = await harness.request('session-a', 'view')

    assert.equal(result.status, 500, suffix)
    assert.match(String(result.body.error), errorPattern, suffix)
    assert.equal(harness.files.get(target), source, suffix)
    assert.equal(harness.writeTargets.includes(target), false, suffix)
    assert.equal(harness.files.has(harness.globalPath), false, suffix)
  }
})

test('keeps unscoped overlays ephemeral and rejects workspace mutations with zero writes', async () => {
  const root = 'E:\\workspace\\unscoped-private'
  const target = workspaceFile(root)
  const source = legacySave('A')
  const harness = makeHarness({ roots: [root], legacy: { [root]: source } })

  const overlay = await harness.post('', 'view')
  assert.equal(overlay.history.some((line: any) => /A-private/.test(String(line.text))), false)
  assert.equal(harness.readTargets.includes(target), false)

  await new Promise((resolve) => setTimeout(resolve, 30))
  const writesBeforeChat = harness.writeTargets.length
  const chat = await harness.post('', 'chat', { text: '不能写入任何工作区' })
  assert.equal(chat.ok, false)
  assert.equal(chat.retryable, true)
  assert.equal(chat.workspaceResolving, false)
  assert.match(chat.error, /需要明确的工作区会话/)
  assert.equal(harness.writeTargets.length, writesBeforeChat)
  assert.equal(harness.files.get(target), source)

  const settings = await harness.post('', 'settings-set', { petEnabled: false })
  assert.equal(settings.ok, true)
  assert.equal((await harness.post('', 'settings-get')).petEnabled, false)
  assert.equal(harness.files.get(target), source)
})

test('native global storage atomically creates, conditionally replaces, and reopens one fixed file', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-native-adapter-'))
  TEMP_HOMES.add(dshHome)
  const target = join(dshHome, 'storages', 'dsh-whale-galgame', 'global.json')
  const storage = createNativeGlobalStorage(target)

  assert.equal(await storage.stat(), undefined)
  const created = await storage.writeText('{"step":1}', { kind: 'createIfAbsent' })
  assert.equal(created.operation, 'create')
  assert.match(created.version, /^\d+:\d+:\d+:\d+:\d+$/)

  await assert.rejects(
    storage.writeText('{"step":"clobber"}', { kind: 'createIfAbsent' }),
    (error: any) => error && error.code === 'FS_NOT_OBSERVED',
  )
  const observed = await storage.stat()
  assert.ok(observed)
  const replaced = await storage.writeText('{"step":2}', {
    kind: 'replaceIfVersion',
    version: observed.version,
  })
  assert.equal(replaced.operation, 'update')
  assert.notEqual(replaced.version, observed.version)

  await assert.rejects(
    storage.writeText('{"step":"stale"}', {
      kind: 'replaceIfVersion',
      version: observed.version,
    }),
    (error: any) => error && error.code === 'FS_STALE_VERSION',
  )
  const reopened = createNativeGlobalStorage(target)
  assert.equal(await reopened.readText(), '{"step":2}')
  assert.deepEqual(await nativeFs.readdir(dirname(target)), ['global.json'])

  if (process.platform !== 'win32') {
    assert.equal((await nativeFs.stat(dirname(target))).mode & 0o777, 0o700)
    assert.equal((await nativeFs.stat(target)).mode & 0o777, 0o600)
  }
})

test('native workspace storage accepts only an absolute root and fixes the marker basename', () => {
  assert.throws(
    () => createNativeWorkspaceStorage('relative-workspace'),
    (error: any) => error && error.code === 'WORKSPACE_STORAGE_PATH_INVALID',
  )
  const root = mkdtempSync(join(tmpdir(), 'dsh-whale-native-workspace-'))
  TEMP_HOMES.add(root)
  const storage = createNativeWorkspaceStorage(root)
  assert.equal(storage.target, join(root, '.whale-girl-save.json'))
})

test('migrates a combined save into global v2 and resumes its timeline after restart in another workspace', async () => {
  const rootA = 'E:\\workspace\\native-migration-a'
  const first = makeHarness({ roots: [rootA], legacy: { [rootA]: legacySave('A') } })

  const firstView = await first.post('session-a', 'view')
  assert.equal(firstView.name, '全局鲸鱼娘')
  const global = JSON.parse(first.files.get(first.globalPath) || '{}')
  const workspace = JSON.parse(first.files.get(workspaceFile(rootA)) || '{}')
  assert.equal(global.kind, 'dsh-whale-galgame-global')
  assert.equal(workspace.kind, 'dsh-whale-galgame-workspace')
  assert.equal(global.characters.deepseek.profileOverrides.displayName, '全局鲸鱼娘')
  assert.match(global.characters.deepseek.log[0].text, /A-private-log/)
  assert.equal(workspace.v, 2)
  assert.equal(Object.prototype.hasOwnProperty.call(workspace, 'characters'), false)
  await new Promise((resolve) => setTimeout(resolve, 30))

  const rootB = 'E:\\workspace\\native-migration-b'
  const restarted = makeHarness({ roots: [rootB], dshHome: first.dshHome })
  const [settings, view, profile] = await Promise.all([
    restarted.post('session-a', 'settings-get'),
    restarted.post('session-a', 'view'),
    restarted.post('session-a', 'profile-get', { characterId: 'deepseek' }),
  ])
  assert.equal(settings.characterId, 'deepseek')
  assert.equal(profile.effective.displayName, '全局鲸鱼娘')
  assert.equal(view.history.some((line: any) => /A-private/.test(String(line.text))), true)
  assert.equal(restarted.files.has(workspaceFile(rootB)), false)
})

test('upgrades deployed global v1 plus workspace v1 exactly once and preserves the complete game', async () => {
  const seedRoot = 'E:\\workspace\\v1-seed'
  const seed = makeHarness({ roots: [seedRoot], legacy: { [seedRoot]: legacySave('A') } })
  await seed.post('session-a', 'view')
  const seededGlobal = JSON.parse(seed.files.get(seed.globalPath) || '{}')

  const globalV1 = JSON.parse(JSON.stringify(seededGlobal))
  globalV1.v = 1
  delete globalV1.current
  delete globalV1.lastCurrent
  delete globalV1.tokens
  delete globalV1.activityFeed
  delete globalV1.migration.contextImports
  for (const id of Object.keys(globalV1.characters)) {
    delete globalV1.characters[id].log
    delete globalV1.characters[id].chatLines
    delete globalV1.characters[id].choices
    delete globalV1.characters[id].activity
  }

  const combined = JSON.parse(legacySave('A'))
  const workspaceCharacters: Record<string, any> = {}
  for (const id of Object.keys(seededGlobal.characters)) {
    const source = combined.characters[id] || {}
    workspaceCharacters[id] = {
      log: Array.isArray(source.log) ? source.log : [],
      chatLines: Array.isArray(source.chatLines) ? source.chatLines : [],
      choices: Array.isArray(source.choices) ? source.choices : [],
      activity: source.activity || { seen: [], lastMentionedAt: 0 },
    }
  }
  workspaceCharacters.claude = {
    log: [],
    chatLines: [
      { who: 'heroine', text: '旧版问候' },
      { who: 'narrator', text: '旧版登场旁白' },
      { who: 'narrator', text: '旧版状态旁白' },
    ],
    choices: [],
    activity: { seen: [], lastMentionedAt: 0 },
  }
  const workspaceV1 = JSON.stringify({
    kind: 'dsh-whale-galgame-workspace',
    v: 1,
    current: 'deepseek',
    lastCurrent: 'deepseek',
    characters: workspaceCharacters,
    tokens: { bank: 777 },
    modelOnline: true,
    characterModelLabel: 'deepseek-v4-flash',
    chatModelLabel: 'deepseek-v4-flash',
  })

  const rootA = 'E:\\workspace\\v1-upgrade-a'
  const rootB = 'E:\\workspace\\v1-upgrade-b'
  const upgraded = makeHarness({
    roots: [rootA, rootB],
    globalSave: JSON.stringify(globalV1),
    legacy: { [rootA]: workspaceV1 },
  })
  const first = await upgraded.post('session-a', 'view')
  assert.equal(first.history.some((line: any) => line.text === 'A-private-history'), true)
  assert.deepEqual(first.choices.map((choice: any) => choice.effect).sort(), [-1, 0, 1])
  const once = JSON.parse(upgraded.files.get(upgraded.globalPath) || '{}')
  assert.equal(once.v, 2)
  assert.equal(once.tokens.bank, 777)
  assert.equal(once.migration.contextImports.length, 1)
  assert.equal(JSON.parse(upgraded.files.get(workspaceFile(rootA)) || '{}').v, 2)

  const repairedClaude = await upgraded.post('session-a', 'settings-set', {
    characterMode: 'manual',
    characterId: 'claude',
  })
  assert.deepEqual(repairedClaude.view.history.map((line: any) => line.who), ['heroine', 'narrator', 'narrator'])
  assert.deepEqual(repairedClaude.view.choices.map((choice: any) => choice.effect).sort(), [-1, 0, 1])
  const claudeChoices = repairedClaude.view.choices
  assert.deepEqual((await upgraded.post('session-b', 'view')).choices, claudeChoices)
  await upgraded.post('session-a', 'settings-set', { characterMode: 'manual', characterId: 'deepseek' })

  const reloaded = makeHarness({
    roots: [rootA, rootB],
    dshHome: upgraded.dshHome,
    legacy: { [rootA]: upgraded.files.get(workspaceFile(rootA)) || '' },
  })
  const [againA, fromB] = await Promise.all([
    reloaded.post('session-a', 'view'),
    reloaded.post('session-b', 'view'),
  ])
  assert.deepEqual(againA.history, fromB.history)
  assert.equal(againA.history.filter((line: any) => line.text === 'A-private-history').length, 1)
  const reloadedClaude = await reloaded.post('session-b', 'settings-set', {
    characterMode: 'manual',
    characterId: 'claude',
  })
  assert.deepEqual(reloadedClaude.view.choices, claudeChoices)
  const afterRestart = JSON.parse(reloaded.files.get(reloaded.globalPath) || '{}')
  assert.equal(afterRestart.tokens.bank, 777)
  assert.equal(afterRestart.migration.contextImports.length, 1)
  await new Promise((resolve) => setTimeout(resolve, 40))
})

test('migrates a registered second-root workspace v1 when ctx.fs remains fenced to the launch workspace', async () => {
  const launchRoot = 'E:\\workspace\\launch-root'
  const secondRoot = mkdtempSync(join(tmpdir(), 'dsh-whale-second-root-'))
  TEMP_HOMES.add(secondRoot)
  const combined = JSON.parse(legacySave('A'))
  const characters: Record<string, any> = {}
  for (const id of ['deepseek', 'claude', 'chatgpt', 'gemini', 'kimi', 'grok']) {
    const source = combined.characters[id] || {}
    characters[id] = {
      log: Array.isArray(source.log) ? source.log : [],
      chatLines: Array.isArray(source.chatLines) ? source.chatLines : [],
      choices: Array.isArray(source.choices) ? source.choices : [],
      activity: source.activity || { seen: [], lastMentionedAt: 0 },
    }
  }
  const workspaceV1 = JSON.stringify({
    kind: 'dsh-whale-galgame-workspace',
    v: 1,
    current: 'deepseek',
    lastCurrent: 'deepseek',
    characters,
    tokens: { bank: 321 },
    modelOnline: true,
    characterModelLabel: 'deepseek-v4-flash',
    chatModelLabel: 'deepseek-v4-flash',
    modelLabel: 'deepseek-v4-flash',
    lastModel: 'deepseek-v4-flash',
    fallbackUsed: false,
    fallbackReason: '',
  })
  const markerPath = workspaceFile(secondRoot)
  writeFileSync(markerPath, workspaceV1, 'utf8')
  const harness = makeHarness({
    roots: [launchRoot, secondRoot],
    legacy: { [secondRoot]: workspaceV1 },
    denyWorkspaceWritesFor: [secondRoot],
  })

  const view = await harness.post('session-b', 'view')
  assert.equal(view.history.some((line: any) => line.text === 'A-private-history'), true)
  assert.deepEqual(view.choices.map((choice: any) => choice.effect).sort(), [-1, 0, 1])
  const nativeMarker = JSON.parse(readFileSync(markerPath, 'utf8'))
  assert.equal(nativeMarker.kind, 'dsh-whale-galgame-workspace')
  assert.equal(nativeMarker.v, 2)
  assert.equal(Object.prototype.hasOwnProperty.call(nativeMarker, 'characters'), false)
  const global = JSON.parse(harness.files.get(harness.globalPath) || '{}')
  assert.equal(global.tokens.bank, 321)
  assert.equal(global.migration.contextImports.length, 1)
  assert.equal(harness.writeTargets.includes(markerPath), true)
  await new Promise((resolve) => setTimeout(resolve, 40))
})
