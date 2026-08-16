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

function makeHarness(options: {
  roots: string[]
  dshHome: string
  files: SharedDisk
}) {
  const sessions = options.roots.map((root, index) => ({
    header: {
      version: 0,
      id: 'choices-session-' + String.fromCharCode(97 + index),
      cwd: root,
      createdAt: 1_000 + index,
    },
    live: true,
    persisted: true,
    events: [],
  }))
  const versions = new Map<string, number>()
  for (const target of options.files.keys()) versions.set(target, 1)
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
      writeText: async (target: string, value: string, expected?: any) => {
        const before = options.files.has(target) ? options.files.get(target)! : null
        const version = versions.get(target)
        if (expected && expected.kind === 'createIfAbsent' && before !== null) {
          throw new Error('FS_ALREADY_EXISTS: ' + target)
        }
        if (expected && expected.kind === 'replaceIfVersion' && expected.version !== version) {
          throw new Error('FS_STALE_VERSION: ' + target)
        }
        options.files.set(target, value)
        versions.set(target, (version || 0) + 1)
        return { operation: before === null ? 'create' : 'update', version: versions.get(target) }
      },
    },
    sandboxPolicy: { resolve: () => undefined },
    sessions: { list: () => sessions },
    workspaceRegistry: { list: () => options.roots.map((path) => ({ path })) },
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
      stream: async function* (): AsyncGenerator<any> {
        throw new Error('simulated model outage')
        // Keep this function an async generator without yielding at runtime.
        yield { type: 'text-delta', text: '' }
      },
    },
    inject: (names: string[], callback: Function) => {
      if (names.includes('sessionQuery')) callback({ sessionQuery: services.sessionQuery })
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

  async function post(sessionId: string, action: string, args: any = {}): Promise<any> {
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

  return { post }
}

function assertThreeChoices(view: any): void {
  assert.equal(Array.isArray(view && view.choices), true)
  assert.equal(view.choices.length, 3)
  assert.deepEqual(view.choices.map((choice: any) => choice.effect).sort(), [-1, 0, 1])
  assert.equal(new Set(view.choices.map((choice: any) => choice.id)).size, 3)
  assert.equal(new Set(view.choices.map((choice: any) => choice.text)).size, 3)
}

test('keeps one randomized three-choice turn across workspaces, characters, restart, and model fallback', async () => {
  const dshHome = mkdtempSync(join(tmpdir(), 'dsh-whale-choices-'))
  const files: SharedDisk = new Map()
  const roots = ['E:\\workspace\\choices-a', 'E:\\workspace\\choices-b']
  const originalRandom = Math.random
  const originalConsoleError = console.error
  // A deterministic non-canonical shuffle makes the persistence assertion
  // meaningful without turning this regression test probabilistic.
  Math.random = () => 0
  // Model failure is the expected fixture path in this test.
  console.error = () => undefined
  try {
    const firstHarness = makeHarness({ roots, dshHome, files })
    const firstEntry = await firstHarness.post('choices-session-a', 'view')
    assertThreeChoices(firstEntry)
    assert.equal(firstEntry.history.at(-1).who, 'heroine')

    const afterFallback = await firstHarness.post('choices-session-a', 'chat', {
      choiceId: firstEntry.choices[0].id,
      text: firstEntry.choices[0].text,
    })
    assert.equal(afterFallback.fallbackUsed, true)
    assertThreeChoices(afterFallback)
    const deepseekOrder = afterFallback.choices.map((choice: any) => ({
      id: choice.id,
      effect: choice.effect,
      text: choice.text,
    }))

    const fromOtherWorkspace = await firstHarness.post('choices-session-b', 'view')
    assertThreeChoices(fromOtherWorkspace)
    assert.deepEqual(fromOtherWorkspace.choices, deepseekOrder)

    const chatgpt = await firstHarness.post('choices-session-b', 'settings-set', {
      characterMode: 'manual',
      characterId: 'chatgpt',
    })
    assert.equal(chatgpt.ok, true)
    assertThreeChoices(chatgpt.view)
    assert.equal(chatgpt.view.history.at(-1).who, 'heroine')

    const backToDeepseek = await firstHarness.post('choices-session-a', 'settings-set', {
      characterMode: 'manual',
      characterId: 'deepseek',
    })
    assert.equal(backToDeepseek.ok, true)
    assert.deepEqual(backToDeepseek.view.choices, deepseekOrder)

    const restartedHarness = makeHarness({ roots, dshHome, files })
    const afterRestart = await restartedHarness.post('choices-session-b', 'view')
    assertThreeChoices(afterRestart)
    assert.deepEqual(afterRestart.choices, deepseekOrder)
  } finally {
    Math.random = originalRandom
    console.error = originalConsoleError
    rmSync(dshHome, { recursive: true, force: true })
  }
})
