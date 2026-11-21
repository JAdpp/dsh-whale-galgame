import assert from 'node:assert/strict'
import test from 'node:test'
import { apply, registerSharedApiRoute } from '../src/index.ts'

// Mirrors @deepseek-ai/dsh-host-webserver register(): duplicate paths throw,
// and the returned disposer removes the route.
function fakeWebServer() {
  const prefixes = new Map<string, any>()
  return {
    prefixes,
    register(route: any) {
      if (prefixes.has(route.path)) throw new Error(`webserver: duplicate ${route.kind} route "${route.path}"`)
      prefixes.set(route.path, route)
      return () => { prefixes.delete(route.path) }
    },
  }
}

function pluginCtx(webServer: any) {
  const disposers: Function[] = []
  const ctx: any = {
    webServer,
    llm: { listProviders: () => [], listModels: () => [], resolveModelInfo: async () => ({}), stream: async function* () {} },
    inject: () => undefined,
    on: () => undefined,
    effect: (callback: Function) => {
      const dispose = callback()
      if (typeof dispose === 'function') disposers.push(dispose)
    },
  }
  return { ctx, dispose: () => { for (const d of disposers.splice(0).reverse()) d() } }
}

async function ping(webServer: any): Promise<number> {
  const route = webServer.prefixes.get('/whale-galgame-api')
  assert.ok(route, 'route is registered')
  let status = 0
  await route.handler({ method: 'GET' }, { writeHead: (s: number) => { status = s }, end: () => undefined })
  return status
}

test('unload then reload re-registers the API route without a duplicate error', async () => {
  const webServer = fakeWebServer()
  const first = pluginCtx(webServer)
  apply(first.ctx)
  assert.equal(await ping(webServer), 200)
  first.dispose()
  assert.equal(webServer.prefixes.size, 0)

  const second = pluginCtx(webServer)
  assert.doesNotThrow(() => apply(second.ctx))
  assert.equal(await ping(webServer), 200)
  second.dispose()
  assert.equal(webServer.prefixes.size, 0)
})

test('two live instances share one route until the last one unloads', async () => {
  const webServer = fakeWebServer()
  const a = pluginCtx(webServer)
  const b = pluginCtx(webServer)
  apply(a.ctx)
  assert.doesNotThrow(() => apply(b.ctx))
  a.dispose()
  assert.equal(await ping(webServer), 200)
  b.dispose()
  assert.equal(webServer.prefixes.size, 0)
})

test('the newest instance handler serves and disposers are idempotent', async () => {
  const webServer = fakeWebServer()
  const calls: string[] = []
  const disposeA = registerSharedApiRoute(webServer, async () => { calls.push('a') })
  const disposeB = registerSharedApiRoute(webServer, async () => { calls.push('b') })
  await webServer.prefixes.get('/whale-galgame-api').handler({}, {})
  assert.deepEqual(calls, ['b'])
  disposeA()
  disposeA()
  assert.equal(webServer.prefixes.size, 1)
  disposeB()
  assert.equal(webServer.prefixes.size, 0)
})

test('takes over a stale route left by an older build that never released it', async () => {
  const webServer = fakeWebServer()
  webServer.register({ kind: 'prefix', path: '/whale-galgame-api', handler: async () => { throw new Error('stale') } })
  const live = pluginCtx(webServer)
  assert.doesNotThrow(() => apply(live.ctx))
  assert.equal(await ping(webServer), 200)
  live.dispose()
  assert.equal(webServer.prefixes.size, 0)
})
