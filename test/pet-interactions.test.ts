import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import * as behavior from '../src/client/pet-behavior.ts'

const source = readFileSync(new URL('../src/client/index.ts', import.meta.url), 'utf8')

// Exercise the real component's handlers and timeout effects with a virtual
// clock. The renderer preserves hook refs and effect cleanup between renders.
function harness(options: { saved?: string; reduced?: boolean; storageThrows?: boolean } = {}) {
  let now = 0, cursor = 0, dirty = true, tree: any, mode = 'idle', opens = 0, sequence = 0
  const hooks: any[] = [], effects: Array<() => void> = []
  const timers = new Map<number, { at: number; callback: () => void }>()
  const storage = new Map(options.saved ? [['whg-pet-position', options.saved]] : [])
  const capture = new Set<number>()
  const target = {
    setPointerCapture: (id: number) => capture.add(id),
    hasPointerCapture: (id: number) => capture.has(id),
    releasePointerCapture: (id: number) => capture.delete(id),
    getBoundingClientRect: () => ({ left: 1000 - parseFloat(tree.props.style.right) - 172.8, top: 800 - parseFloat(tree.props.style.bottom) - 230.4, width: 172.8, height: 230.4 }),
  }
  const query = Object.assign(new EventTarget(), { matches: options.reduced === true })
  const window = Object.assign(new EventTarget(), { innerWidth: 1000, innerHeight: 800, matchMedia: () => query })
  const localStorage = {
    getItem(key: string) { if (options.storageThrows) throw Error('blocked'); return storage.get(key) ?? null },
    setItem(key: string, value: string) { if (options.storageThrows) throw Error('blocked'); storage.set(key, value) },
    removeItem(key: string) { if (options.storageThrows) throw Error('blocked'); storage.delete(key) },
  }
  const useState = (initial: any) => {
    const i = cursor++
    if (!(i in hooks)) hooks[i] = typeof initial === 'function' ? initial() : initial
    return [hooks[i], (value: any) => {
      const next = typeof value === 'function' ? value(hooks[i]) : value
      if (!Object.is(next, hooks[i])) { hooks[i] = next; dirty = true }
    }]
  }
  const useRef = (initial: any) => {
    const i = cursor++
    if (!(i in hooks)) hooks[i] = { current: initial }
    return hooks[i]
  }
  const useEffect = (effect: () => any, deps: any[]) => {
    const i = cursor++, old = hooks[i]
    if (!old || deps.some((item, index) => !Object.is(item, old.deps[index]))) {
      effects.push(() => { old?.cleanup?.(); hooks[i] = { deps, cleanup: effect() } })
    }
  }
  const env = {
    ...behavior, window, localStorage, useState, useRef, useEffect,
    performance: { now: () => now },
    Image: class { onerror: any; src = '' },
    art: () => 'data:image/webp;base64,fixture',
    selectMode: (state: any) => state,
    setTimeout: (callback: () => void, delay: number) => { const id = ++sequence; timers.set(id, { at: now + delay, callback }); return id },
    clearTimeout: (id: number) => timers.delete(id),
    React: { createElement: (type: any, props: any, ...children: any[]) => ({ type, props: props || {}, children: children.flat().filter(Boolean) }) },
  }
  const code = stripTypeScriptTypes(source.slice(source.indexOf('function Pet('), source.indexOf('\nfunction optionText(')))
  const Pet = new Function(...Object.keys(env), code + '\nreturn Pet')(...Object.values(env))
  function render() {
    let limit = 0
    while (dirty) {
      assert.ok(++limit < 30, 'component failed to settle')
      cursor = 0; dirty = false
      tree = Pet({ useSessions: () => mode, onOpen: () => opens++ })
      tree.props.ref.current = target
      effects.splice(0).forEach((effect) => effect())
    }
    return tree
  }
  function tick(ms: number) {
    const end = now + ms
    let limit = 0
    for (;;) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0]
      if (!next || next[1].at > end) break
      assert.ok(++limit < 10000, 'timer loop did not progress')
      now = next[1].at; timers.delete(next[0]); next[1].callback(); render()
    }
    now = end; render()
  }
  function event(name: string, patch: any = {}) {
    let prevented = false
    const event = { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, clientX: 850, clientY: 550, timeStamp: now, detail: 1, currentTarget: target, preventDefault() { prevented = true }, ...patch }
    render().props[name](event); render()
    return prevented
  }
  render()
  return {
    event, tick, render, window, query, storage, capture,
    get opens() { return opens },
    mode(value: string) { mode = value; dirty = true; render() },
    dispose() { hooks.forEach((hook) => hook?.cleanup?.()); assert.equal(timers.size, 0, 'unmount leaked timeout') },
  }
}

test('pet timeout driver follows work, wait, completed meal and hover without frame polling', () => {
  const h = harness()
  h.mode('running')
  assert.equal(h.render().props['data-frame'], 'laptop-out')
  h.tick(500)
  assert.equal(h.render().props['data-frame'], 'type-a')
  h.tick(170)
  assert.equal(h.render().props['data-frame'], 'type-b')
  h.mode('waiting')
  assert.equal(h.render().props['data-frame'], 'call-a')
  h.tick(420)
  assert.equal(h.render().props['data-frame'], 'call-b')
  h.mode('idle')
  assert.equal(h.render().props['data-act'], 'idle')
  h.mode('running'); h.mode('idle')
  assert.equal(h.render().props['data-act'], 'fed')
  h.tick(2400)
  assert.equal(h.render().props['data-act'], 'idle')
  h.event('onPointerEnter')
  assert.equal(h.render().props['data-frame'], 'happy')
  h.event('onPointerLeave')
  assert.equal(h.render().props['data-act'], 'idle')
  h.dispose()
})

test('pointer threshold preserves clicks, carry direction and pickup point; drag release never opens galgame', () => {
  const h = harness()
  h.event('onPointerDown')
  assert.equal(h.capture.has(1), true)
  h.event('onPointerMove', { clientX: 856 })
  assert.equal(h.render().props['data-act'], 'idle')
  h.event('onPointerUp'); h.event('onClick')
  assert.equal(h.opens, 1)
  h.event('onPointerDown')
  h.tick(16)
  h.event('onPointerMove', { clientX: 870, clientY: 400 })
  assert.equal(h.render().props['data-frame'], 'carry-b')
  assert.equal(h.render().props.style.right, '43.599999999999994px')
  assert.equal(h.render().props.style.bottom, '187.6px')
  assert.ok(Math.abs(parseFloat(h.render().props.style['--whg-swing'])) <= 12)
  h.tick(16)
  h.event('onPointerMove', { clientX: 840, clientY: 400 })
  assert.equal(h.render().props['data-frame'], 'carry-c')
  h.tick(120)
  assert.equal(h.render().props['data-frame'], 'carry-a')
  assert.equal(h.render().props.style['--whg-swing'], '0deg')
  h.event('onPointerUp')
  assert.equal(h.render().props['data-frame'], 'landed')
  assert.equal(h.capture.has(1), false)
  h.event('onClick')
  assert.equal(h.opens, 1)
  assert.deepEqual(JSON.parse(h.storage.get('whg-pet-position')!), { right: 73.6, bottom: 187.6 })
  h.tick(650)
  assert.equal(h.render().props['data-act'], 'idle')
  h.event('onClick', { detail: 0 })
  assert.equal(h.opens, 2, 'native Enter/Space click remains available')
  h.dispose()
})

test('touch, pen, pointer cancellation and loss of capture terminate drag and release timers', () => {
  for (const pointerType of ['touch', 'pen']) for (const ending of ['onPointerCancel', 'onLostPointerCapture']) {
    const h = harness()
    h.event('onPointerEnter', { pointerType })
    assert.equal(h.render().props['data-act'], pointerType === 'touch' ? 'idle' : 'hover')
    h.event('onPointerDown', { pointerType })
    h.event('onPointerMove', { pointerType, clientX: 780 })
    h.event(ending, { pointerType })
    assert.equal(h.render().props['data-act'], 'landed')
    h.event('onClick')
    assert.equal(h.opens, 0)
    h.tick(120)
    assert.equal(h.render().props['data-act'], 'landed', 'carry settling timer must be cancelled')
    h.dispose()
  }
})

test('position survives reload, keyboard/Shift movement, viewport changes and reset event', () => {
  const h = harness({ saved: '{"right":100,"bottom":150}' })
  assert.equal(h.render().props.style.right, '100px')
  h.event('onKeyDown', { key: 'ArrowLeft', shiftKey: false })
  h.event('onKeyDown', { key: 'ArrowUp', shiftKey: true })
  assert.deepEqual(JSON.parse(h.storage.get('whg-pet-position')!), { right: 116, bottom: 214 })
  h.window.innerWidth = 300; h.window.innerHeight = 250
  h.window.dispatchEvent(new Event('resize')); h.render()
  assert.deepEqual(JSON.parse(h.storage.get('whg-pet-position')!), { right: 116, bottom: 54 })
  h.window.dispatchEvent(new Event('whg:pet-reset')); h.render()
  assert.equal(h.storage.has('whg-pet-position'), false)
  assert.equal(h.render().props.style.right, '18px')
  assert.equal(h.render().props.style.bottom, '54px')
  h.dispose()
  const unavailable = harness({ storageThrows: true })
  assert.equal(unavailable.render().props.style.right, '18px')
  unavailable.event('onKeyDown', { key: 'ArrowRight' })
  assert.equal(unavailable.render().props.style.right, '4px')
  unavailable.dispose()
})

test('reduced motion updates live and retains static frames and usable dragging', () => {
  const h = harness()
  h.query.matches = true; h.query.dispatchEvent(new Event('change')); h.render()
  h.tick(100000)
  assert.equal(h.render().props['data-frame'], 'idle')
  h.mode('running'); h.tick(9000)
  assert.equal(h.render().props['data-frame'], 'type-a')
  h.mode('waiting'); h.tick(9000)
  assert.equal(h.render().props['data-frame'], 'call-a')
  h.event('onPointerDown'); h.event('onPointerMove', { clientX: 800 })
  assert.equal(h.render().props['data-frame'], 'carry-a')
  assert.equal(h.render().props.style['--whg-swing'], '0deg')
  h.event('onPointerUp')
  assert.equal(h.render().props['data-frame'], 'call-a')
  h.dispose()
})

test('window pointer motion selects gaze cells, refreshes its reset and never leans', () => {
  const h = harness()
  const move = (clientX: number, clientY: number, pointerType = 'mouse') => {
    h.window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX, clientY, pointerType }))
    h.render()
  }
  // Pet center is (895.6, 560.8) in the 1000 × 800 viewport.
  move(995.6, 560.8)
  assert.equal(h.render().props['data-act'], 'look')
  assert.equal(h.render().props['data-frame'], 'look-4')
  const sprite = h.render().children[0].children[0].children[0]
  assert.equal(sprite.props.style.backgroundPosition, '-768px -1024px')
  assert.equal(h.render().props.style['--whg-swing'], '0deg')
  h.tick(500)
  move(895.6, 700)
  assert.equal(h.render().props['data-frame'], 'look-8')
  h.tick(1099)
  assert.equal(h.render().props['data-act'], 'look')
  h.tick(1)
  assert.equal(h.render().props['data-act'], 'idle')
  move(1001, 500)
  move(800, 500, 'touch')
  assert.equal(h.render().props['data-act'], 'idle')
  move(895.6, 100)
  h.event('onPointerEnter')
  move(895.6, 560.8)
  assert.equal(h.render().props['data-frame'], 'happy')
  h.event('onPointerLeave')
  assert.equal(h.render().props['data-act'], 'idle')
  move(895.6, 100)
  h.query.matches = true; h.query.dispatchEvent(new Event('change')); h.render()
  move(800, 500)
  assert.equal(h.render().props['data-act'], 'idle')
  h.query.matches = false; h.query.dispatchEvent(new Event('change')); h.render()
  for (let i = 0; i < 36; i++) { h.tick(500); move(895.6, 100) }
  assert.equal(h.render().props['data-act'], 'basin', 'continuous pointer motion does not postpone idle actions')
  h.dispose()
})

test('frequent drag events do not extend bubbles', () => {
  const h = harness()
  h.event('onPointerDown')
  h.event('onPointerMove', { clientX: 870, clientY: 400 })
  const bubble = () => h.render().children.find((node: any) => node.props.className === 'whg-pet-bubble')
  assert.ok(bubble())
  for (let i = 0; i < 30; i++) {
    h.tick(80)
    h.event('onPointerMove', { clientX: 871 + i, clientY: 400 })
  }
  assert.equal(bubble(), undefined, 'pointer updates must not postpone the 2.4s bubble deadline')
  assert.equal(h.render().props['data-act'], 'carried')
  h.event('onPointerUp')
  h.dispose()
})

test('pet rendering exposes frame/action, decorative bubbles, density, reduced CSS and reset control', () => {
  const pet = source.slice(source.indexOf('function Pet('), source.indexOf('\nfunction optionText('))
  assert.doesNotMatch(pet, /requestAnimationFrame|Date\.now\(/)
  assert.match(pet, /'data-mode': mode/)
  assert.match(pet, /'data-act': view\.act/)
  assert.match(pet, /'data-frame': view\.frame/)
  assert.match(pet, /className: 'whg-pet-bubble', 'aria-hidden': 'true'/)
  assert.match(pet, /点击开始 galgame，按住可拖动/)
  assert.match(pet, /image\.onerror = \(\) => setSheetFailed\(true\)/)
  assert.match(pet, /hasSheet \? undefined : '🐋'/)
  assert.match(source, /background-size:1152px 1792px/)
  assert.doesNotMatch(pet, /setLean|--whg-lean/)
  assert.match(source, /transform-origin:96px 249px/)
  assert.match(source, /transform-origin:96px 20px/)
  assert.match(source, /touch-action:none/)
  assert.match(source, /\.whg-pet-bubble\{[^}]*pointer-events:none/)
  // Match the action selector's specificity so breathing/landing cannot win.
  assert.match(source, /@media \(prefers-reduced-motion:reduce\)\{\.whg-pet\[data-act\] \.whg-pet-sprite\{animation:none\}\.whg-pet-motion\{transform:none;transition:none\}/)
  assert.match(source, /'aria-label': '桌宠归位'/)
  assert.match(source, /window\.dispatchEvent\(new CustomEvent\('whg:pet-reset'\)\)/)
})
