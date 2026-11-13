import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPetBehavior, petTransition, petView, PET_FRAMES, PET_BUBBLES, PET_FIRST_IDLE_DELAY,
  PET_IDLE_INTERVALS, PET_IDLE_ORDER, PET_DEFAULT_POSITION, clampPetPosition, readPetPosition,
  createPetDrag, movePetDrag, endPetDrag, type PetBehavior, type PetFrame,
  petLookIndex, PET_LOOK_RESET_DELAY,
} from '../src/client/pet-behavior.ts'

const tick = (state: PetBehavior, ms?: number) => petTransition(state, { type: 'tick', ms })
const frame = (state: PetBehavior) => petView(state).frame
function expectFrame(state: PetBehavior, expected: PetFrame, delay?: number) {
  assert.equal(frame(state), expected)
  if (delay !== undefined) assert.equal(petView(state).delay, delay)
}

test('new atlas maps 24 unchanged action frames and 16 gaze frames to its 6 by 7 cells', () => {
  assert.equal(Object.keys(PET_FRAMES).length, 40)
  assert.deepEqual(PET_FRAMES.idle, { column: 0, row: 0 })
  assert.deepEqual(PET_FRAMES['laptop-out'], { column: 2, row: 1 })
  assert.deepEqual(PET_FRAMES['carry-a'], { column: 2, row: 3 })
  assert.deepEqual(PET_FRAMES.landed, { column: 5, row: 3 })
  for (let n = 0; n < 16; n++) {
    assert.deepEqual(PET_FRAMES[`look-${n}` as PetFrame], { column: n % 6, row: 4 + Math.floor(n / 6) })
  }
  assert.equal(new Set(Object.values(PET_FRAMES).map(({ column, row }) => `${column},${row}`)).size, 40)
})

const look = (state: PetBehavior, dx = 0, dy = -100) => petTransition(state, { type: 'look', dx, dy })

test('gaze maps clockwise from up at 22.5-degree steps and wraps at north', () => {
  for (let n = 0; n < 16; n++) {
    const angle = n * 22.5 * Math.PI / 180
    const dx = Math.sin(angle) * 100, dy = -Math.cos(angle) * 100
    assert.equal(petLookIndex(dx, dy), n)
    expectFrame(look(createPetBehavior(), dx, dy), `look-${n}` as PetFrame)
  }
  for (const [dx, dy, expected] of [[0, -100, 0], [100, 0, 4], [0, 100, 8], [-100, 0, 12], [-1, -100, 0]]) {
    assert.equal(petLookIndex(dx, dy), expected)
  }
  for (const [degrees, expected] of [[11.24, 0], [11.26, 1], [348.74, 15], [348.76, 0]]) {
    assert.equal(petLookIndex(Math.sin(degrees * Math.PI / 180), -Math.cos(degrees * Math.PI / 180)), expected)
  }
})

test('gaze refreshes only its 1.1-second deadline, then resumes the idle blink clock', () => {
  let state = look(tick(createPetBehavior(), 2400))
  assert.equal(petView(state).act, 'look')
  assert.equal(petView(state).delay, PET_LOOK_RESET_DELAY)
  const idleDeadline = state.nextIdleAt
  state = tick(state, 500)
  state = look(state, 100, 0)
  expectFrame(state, 'look-4', 1100)
  assert.equal(state.nextIdleAt, idleDeadline)
  state = tick(state, 1099)
  expectFrame(state, 'look-4')
  state = tick(state, 1)
  assert.equal(petView(state).act, 'idle')
  expectFrame(state, 'idle')
  expectFrame(tick(state, 3540 + 3400 - state.now), 'blink')
})

test('gaze never postpones idle actions and interruptions discard it instead of replaying it', () => {
  let state = tick(createPetBehavior(), PET_FIRST_IDLE_DELAY - 500)
  state = look(state)
  expectFrame(state, 'look-0', 500)
  state = tick(state, 500)
  assert.equal(petView(state).act, 'basin')
  assert.equal(state.lookIndex, null)
  assert.equal(petView(look(state)).act, 'basin')
  state = tick(state, 5000)
  assert.equal(petView(state).act, 'idle')
  for (const event of [
    { type: 'hover', hovered: true }, { type: 'carry' },
    { type: 'mode', mode: 'running' }, { type: 'mode', mode: 'waiting' },
    { type: 'reduced', reducedMotion: true },
  ] as const) {
    const interrupted = petTransition(look(createPetBehavior()), event)
    assert.notEqual(petView(interrupted).act, 'look')
    assert.equal(interrupted.lookIndex, null)
    assert.notEqual(petView(look(interrupted)).act, 'look')
  }
  let hovered = petTransition(look(createPetBehavior()), { type: 'hover', hovered: true })
  expectFrame(look(hovered), 'happy')
  hovered = petTransition(hovered, { type: 'hover', hovered: false })
  expectFrame(hovered, 'idle')
})

test('gaze is disabled during meals, landing, other modes and reduced motion', () => {
  const fed = petTransition(createPetBehavior('running'), { type: 'mode', mode: 'idle' })
  const landed = petTransition(petTransition(createPetBehavior(), { type: 'carry' }), { type: 'land' })
  for (const state of [fed, landed, createPetBehavior('running'), createPetBehavior('waiting'), createPetBehavior('idle', true)]) {
    assert.deepEqual(look(state), state)
  }
  for (const [dx, dy] of [[NaN, 0], [0, Infinity]]) assert.deepEqual(look(createPetBehavior(), dx, dy), createPetBehavior())
})

test('running opens the laptop, alternates typing and inserts a longer type-c every seven seconds', () => {
  let state = createPetBehavior('running')
  expectFrame(state, 'laptop-out', 500)
  state = tick(state)
  expectFrame(state, 'type-a', 170)
  state = tick(state)
  expectFrame(state, 'type-b', 170)
  state = tick(state)
  expectFrame(state, 'type-a', 170)
  state = tick(state, 7000 - state.now)
  expectFrame(state, 'type-c', 900)
  state = tick(state)
  expectFrame(state, 'type-a', 170)
  state = tick(state, 14000 - state.now)
  expectFrame(state, 'type-c', 900)
  assert.equal(petView(state).act, 'work')
})

test('waiting alternates call frames every 420ms; idle blinks for 140ms every 3.4 seconds', () => {
  let waiting = createPetBehavior('waiting')
  expectFrame(waiting, 'call-a', 420)
  waiting = tick(waiting)
  expectFrame(waiting, 'call-b', 420)
  expectFrame(tick(waiting), 'call-a', 420)
  assert.equal(petView(waiting).act, 'wait')
  let idle = createPetBehavior()
  expectFrame(idle, 'idle', 3400)
  idle = tick(idle)
  expectFrame(idle, 'blink', 140)
  expectFrame(tick(idle), 'idle', 3400)
})

test('only running to idle feeds once for 2.4 seconds; running to waiting never feeds', () => {
  let state = petTransition(createPetBehavior('running'), { type: 'mode', mode: 'idle' })
  assert.equal(petView(state).act, 'fed')
  assert.equal(petView(state).bubble, PET_BUBBLES.fed)
  for (let i = 0; i < 12; i++) {
    expectFrame(state, i % 2 ? 'eat-b' : 'eat-a')
    state = tick(state, 200)
  }
  assert.equal(petView(state).act, 'idle')
  assert.equal(petView(state).bubble, null)
  assert.equal(state.nextIdleAt, 2400 + PET_FIRST_IDLE_DELAY)
  state = petTransition(state, { type: 'mode', mode: 'idle' })
  assert.equal(petView(state).act, 'idle', 'repeated mode reports do not feed twice')
  const waiting = petTransition(createPetBehavior('running'), { type: 'mode', mode: 'waiting' })
  expectFrame(waiting, 'call-a')
  assert.equal(petView(waiting).bubble, null)
  assert.equal(petView(petTransition(waiting, { type: 'mode', mode: 'idle' })).act, 'idle')
})

test('idle actions start at 18 seconds, then repeat the fixed order and interval table', () => {
  let state = createPetBehavior()
  state = tick(state, PET_FIRST_IDLE_DELAY - 1)
  assert.equal(petView(state).act, 'idle')
  state = tick(state, 1)
  let expectedAt = PET_FIRST_IDLE_DELAY
  for (let index = 0; index < 12; index++) {
    const slot = index % PET_IDLE_ORDER.length
    assert.equal(state.now, expectedAt)
    assert.equal(petView(state).act, PET_IDLE_ORDER[slot])
    assert.equal(petView(state).bubble, PET_BUBBLES[PET_IDLE_ORDER[slot]])
    const interval = PET_IDLE_INTERVALS[slot]
    assert.ok(interval >= 30000 && interval <= 55000)
    assert.equal(state.nextIdleAt, expectedAt + interval)
    state = tick(state, interval - 1)
    assert.equal(petView(state).act, 'idle')
    state = tick(state, 1)
    expectedAt += interval
  }
})

test('basin, begging and nap sequences last five, 3.4 and seven seconds with 2.4-second bubbles', () => {
  let state = tick(createPetBehavior(), 18000)
  const basin = ['basin-up', 'hat-a', 'hat-b', 'hat-a', 'hat-knock', 'hat-a', 'hat-knock', 'hat-a', 'basin-up'] as const
  const basinDurations = [400, 600, 600, 600, 500, 600, 500, 700, 500]
  for (let i = 0; i < basin.length; i++) {
    expectFrame(state, basin[i])
    state = tick(state, basinDurations[i])
  }
  assert.equal(state.now, 23000)
  assert.equal(petView(state).act, 'idle')
  state = tick(state, 48000 - state.now)
  const beggingStart = state.now
  for (let i = 0; i < 8; i++) {
    expectFrame(state, i % 2 ? 'beg-b' : 'beg-a')
    state = tick(state, 425)
  }
  assert.equal(state.now - beggingStart, 3400)
  assert.equal(petView(state).act, 'idle')
  state = tick(state, 90000 - state.now)
  expectFrame(state, 'sleepy')
  state = tick(state, 1200)
  expectFrame(state, 'doze')
  state = tick(state, 1199)
  assert.equal(petView(state).bubble, PET_BUBBLES.nap)
  state = tick(state, 1)
  assert.equal(petView(state).bubble, null)
  state = tick(state, 3400)
  expectFrame(state, 'sleepy')
  state = tick(state, 1200)
  assert.equal(state.now, 97000)
  assert.equal(petView(state).act, 'idle')
})

test('running, waiting, hover and pickup immediately interrupt every idle action', () => {
  for (const start of [18000, 48000, 90000]) {
    const action = tick(createPetBehavior(), start)
    assert.ok(['basin', 'beg', 'nap'].includes(petView(action).act))
    for (const mode of ['running', 'waiting'] as const) {
      const changed = petTransition(action, { type: 'mode', mode })
      assert.equal(petView(changed).act, mode === 'running' ? 'work' : 'wait')
      assert.equal(petView(changed).bubble, null)
    }
    let hovered = petTransition(action, { type: 'hover', hovered: true })
    expectFrame(hovered, 'happy')
    assert.equal(petView(hovered).act, 'hover')
    assert.equal(petView(hovered).bubble, null)
    hovered = tick(hovered, 60000)
    expectFrame(hovered, 'happy')
    hovered = petTransition(hovered, { type: 'hover', hovered: false })
    assert.equal(petView(hovered).act, 'idle')
    assert.equal(hovered.nextIdleAt, hovered.now + PET_FIRST_IDLE_DELAY)
    const carried = petTransition(action, { type: 'carry' })
    expectFrame(carried, 'carry-a')
    assert.equal(petView(carried).act, 'carried')
    assert.equal(carried.action, null)
  }
})

test('hover returns to the underlying work mode without feeding or replaying the interrupted action', () => {
  let state = tick(createPetBehavior('running'), 500)
  state = petTransition(state, { type: 'hover', hovered: true })
  expectFrame(state, 'happy')
  state = petTransition(state, { type: 'hover', hovered: false })
  expectFrame(state, 'type-a')
  state = petTransition(state, { type: 'mode', mode: 'idle' })
  assert.equal(petView(state).act, 'fed')
  state = petTransition(state, { type: 'hover', hovered: true })
  state = petTransition(state, { type: 'hover', hovered: false })
  assert.equal(petView(state).act, 'idle', 'hover cancels the feed too')
})

test('carrying follows direction, keeps its original bubble deadline and lands for 650ms before current mode', () => {
  let state = petTransition(createPetBehavior(), { type: 'carry' })
  assert.equal(petView(state).bubble, PET_BUBBLES.carried)
  state = tick(state, 1000)
  state = petTransition(state, { type: 'carry', direction: 1 })
  expectFrame(state, 'carry-b')
  assert.equal(state.bubbleUntil, 2400)
  state = petTransition(state, { type: 'carry', direction: -1 })
  expectFrame(state, 'carry-c')
  state = petTransition(state, { type: 'carry', direction: 0 })
  expectFrame(state, 'carry-a')
  state = petTransition(state, { type: 'mode', mode: 'waiting' })
  expectFrame(state, 'carry-a')
  assert.equal(petView(state).bubble, PET_BUBBLES.carried)
  state = petTransition(state, { type: 'land' })
  expectFrame(state, 'landed', 650)
  assert.equal(petView(state).bubble, PET_BUBBLES.landed)
  state = tick(state, 649)
  expectFrame(state, 'landed')
  state = tick(state, 1)
  assert.equal(petView(state).act, 'wait')
  assert.equal(petView(state).bubble, PET_BUBBLES.landed)
  state = tick(state, 1750)
  assert.equal(petView(state).bubble, null)
})

test('dragging starts only beyond 6px and suppresses the release click even after returning to its start', () => {
  let drag = createPetDrag(7, 10, 20)
  drag = movePetDrag(drag, 16, 20)
  assert.equal(drag.dragging, false)
  assert.equal(endPetDrag(drag).suppressClick, false)
  drag = movePetDrag(drag, 16.01, 20)
  assert.equal(drag.dragging, true)
  assert.equal(endPetDrag(drag).suppressClick, true)
  drag = movePetDrag(drag, 10, 20)
  assert.equal(endPetDrag(drag).suppressClick, true)
  assert.equal(drag.pointerId, 7)
  assert.equal(movePetDrag(createPetDrag(1, 0, 0), 4.3, 4.3).dragging, true, 'threshold uses Euclidean movement')
})

test('positions clamp both edges, re-clamp on resize and safely read invalid saved JSON', () => {
  const viewport = { width: 1000, height: 800 }
  const size = { width: 172.8, height: 230.4 }
  assert.deepEqual(clampPetPosition({ right: -99, bottom: 9999 }, viewport, size), { right: 4, bottom: 565.6 })
  const saved = JSON.stringify({ right: 700, bottom: 500 })
  assert.deepEqual(readPetPosition(saved, viewport, size), { right: 700, bottom: 500 })
  assert.deepEqual(readPetPosition(saved, { width: 320, height: 400 }, size), { right: 143.2, bottom: 165.6 })
  assert.deepEqual(clampPetPosition(PET_DEFAULT_POSITION, { width: 100, height: 100 }, size), { right: 4, bottom: 4 })
  for (const raw of [null, '', '{oops', 'null', '[]', '4', '{}', '{"right":18}', '{"right":"18","bottom":124}', '{"right":1e400,"bottom":124}']) {
    assert.deepEqual(readPetPosition(raw, viewport, size), PET_DEFAULT_POSITION, String(raw))
  }
})

test('reduced motion uses the three static mode frames and carry-a without feeding or idle actions', () => {
  for (const [mode, expected] of [['idle', 'idle'], ['running', 'type-a'], ['waiting', 'call-a']] as const) {
    let state = createPetBehavior(mode, true)
    expectFrame(state, expected)
    assert.equal(petView(state).delay, null)
    state = tick(state, 10000000)
    expectFrame(state, expected)
    state = petTransition(state, { type: 'hover', hovered: true })
    expectFrame(state, expected)
    state = petTransition(state, { type: 'carry', direction: 1 })
    expectFrame(state, 'carry-a')
    state = petTransition(state, { type: 'land' })
    expectFrame(state, expected)
  }
  let state = petTransition(createPetBehavior('running', true), { type: 'mode', mode: 'idle' })
  expectFrame(state, 'idle')
  state = petTransition(tick(createPetBehavior(), 18000), { type: 'reduced', reducedMotion: true })
  expectFrame(state, 'idle')
  assert.equal(petView(state).bubble, null)
  assert.equal(petView(state).delay, null)
  state = petTransition(state, { type: 'reduced', reducedMotion: false })
  assert.equal(state.nextIdleAt, state.now + PET_FIRST_IDLE_DELAY)
})

test('transitions leave their input state unchanged and arbitrary elapsed ticks match deadline stepping', () => {
  const start = createPetBehavior()
  const snapshot = structuredClone(start)
  const jumped = tick(start, 100000)
  let stepped = start
  while (stepped.now < 100000) stepped = tick(stepped, Math.min(petView(stepped).delay ?? 100000, 100000 - stepped.now))
  assert.deepEqual(jumped, stepped)
  assert.deepEqual(start, snapshot)
})

test('fractional pointer-event clock increments never stall at a floating-point frame deadline', () => {
  let state = createPetBehavior()
  for (let i = 0; i < 5000; i++) {
    state = tick(state, 16.667)
    if (i % 113 === 0) state = petTransition(state, { type: 'mode', mode: (['running', 'waiting', 'idle'] as const)[Math.floor(i / 113) % 3] })
    const delay = petView(state).delay
    assert.ok(delay === null || delay > 0)
  }
  assert.ok(Math.abs(state.now - 83335) < .000001)
})
