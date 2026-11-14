// Pure companion state: time advances only when the owner sends a timeout tick.
export type PetMode = 'running' | 'waiting' | 'idle'
export type PetAct = 'idle' | 'look' | 'work' | 'wait' | 'fed' | 'basin' | 'beg' | 'nap' | 'hover' | 'carried' | 'landed'
export const PET_FRAME_ROWS = [
  ['idle', 'blink', 'happy', 'wave', 'sleepy', 'doze'],
  ['call-a', 'call-b', 'laptop-out', 'type-a', 'type-b', 'type-c'],
  ['eat-a', 'eat-b', 'beg-a', 'beg-b', 'basin-up', 'hat-a'],
  ['hat-b', 'hat-knock', 'carry-a', 'carry-b', 'carry-c', 'landed'],
  ['look-0', 'look-1', 'look-2', 'look-3', 'look-4', 'look-5'],
  ['look-6', 'look-7', 'look-8', 'look-9', 'look-10', 'look-11'],
  ['look-12', 'look-13', 'look-14', 'look-15'],
] as const
export type PetFrame = typeof PET_FRAME_ROWS[number][number]
export const PET_FRAMES = Object.fromEntries(PET_FRAME_ROWS.flatMap((row, y) =>
  row.map((name, x) => [name, { column: x, row: y }]),
)) as Record<PetFrame, { column: number; row: number }>
export const PET_BUBBLES = {
  basin: '铁盆护体！', beg: '主人，饿饿，饭饭……', nap: 'Zzz…',
  fed: '开饭啦～谢谢主人的 Token！', carried: '放、放我下来啦！', landed: '呼……',
} as const
export const PET_IDLE_ORDER = ['basin', 'beg', 'nap', 'beg', 'basin', 'nap'] as const
// Start-to-start intervals, repeated with the action order. No random clock.
export const PET_IDLE_INTERVALS = [30000, 42000, 55000, 36000, 48000, 33000] as const
export const PET_FIRST_IDLE_DELAY = 18000
export const PET_LOOK_RESET_DELAY = 1100
export function petLookIndex(dx: number, dy: number): number {
  const clockwiseFromUp = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360
  return Math.round(clockwiseFromUp / 22.5) % 16
}
type Action = typeof PET_IDLE_ORDER[number] | 'fed' | 'landed'
type Bubble = keyof typeof PET_BUBBLES
type FrameStep = readonly [PetFrame, number]
const ACTIONS: Record<Action, readonly FrameStep[]> = {
  basin: [['basin-up', 400], ['hat-a', 600], ['hat-b', 600], ['hat-a', 600], ['hat-knock', 500], ['hat-a', 600], ['hat-knock', 500], ['hat-a', 700], ['basin-up', 500]],
  beg: Array.from({ length: 8 }, (_, i) => [i % 2 ? 'beg-b' : 'beg-a', 425] as const),
  nap: [['sleepy', 1200], ['doze', 4600], ['sleepy', 1200]],
  fed: Array.from({ length: 12 }, (_, i) => [i % 2 ? 'eat-b' : 'eat-a', 200] as const),
  landed: [['landed', 650]],
}
export type PetBehavior = {
  now: number; mode: PetMode; reducedMotion: boolean; hovered: boolean; carried: boolean
  carryDirection: -1 | 0 | 1; baseStart: number; action: Action | null; actionStart: number
  idleIndex: number; nextIdleAt: number | null; bubble: Bubble | null; bubbleUntil: number
  lookIndex: number | null; lookUntil: number
}
export type PetEvent =
  | { type: 'tick'; ms?: number }
  | { type: 'mode'; mode: PetMode }
  | { type: 'hover'; hovered: boolean }
  | { type: 'look'; dx: number; dy: number }
  | { type: 'carry'; direction?: -1 | 0 | 1 }
  | { type: 'land' }
  | { type: 'reduced'; reducedMotion: boolean }
export type PetView = { act: PetAct; frame: PetFrame; delay: number | null; bubble: string | null }

export function createPetBehavior(mode: PetMode = 'idle', reducedMotion = false): PetBehavior {
  return { now: 0, mode, reducedMotion, hovered: false, carried: false, carryDirection: 0,
    baseStart: 0, action: null, actionStart: 0, idleIndex: 0,
    nextIdleAt: mode === 'idle' && !reducedMotion ? PET_FIRST_IDLE_DELAY : null,
    bubble: null, bubbleUntil: 0, lookIndex: null, lookUntil: 0 }
}
function resetIdle(state: PetBehavior): void {
  state.nextIdleAt = state.mode === 'idle' && !state.reducedMotion && !state.hovered && !state.carried
    ? state.now + PET_FIRST_IDLE_DELAY : null
}
function clearAction(state: PetBehavior): void {
  state.action = null
  state.bubble = null
  state.lookIndex = null
}
function startAction(state: PetBehavior, action: Action): void {
  state.lookIndex = null
  state.action = action
  state.actionStart = state.now
  state.bubble = action
  state.bubbleUntil = state.now + 2400
}
function duration(action: Action): number { return ACTIONS[action].reduce((sum, step) => sum + step[1], 0) }
function settle(state: PetBehavior): void {
  if (state.lookIndex !== null && state.now >= state.lookUntil) state.lookIndex = null
  if (state.bubble && state.now >= state.bubbleUntil) state.bubble = null
  if (state.action && state.now >= state.actionStart + duration(state.action)) {
    const finished = state.action
    state.action = null
    if (finished === 'fed' || finished === 'landed') resetIdle(state)
  }
  if (!state.action && !state.carried && !state.hovered && !state.reducedMotion && state.mode === 'idle'
    && state.nextIdleAt !== null && state.now >= state.nextIdleAt) {
    const index = state.idleIndex % PET_IDLE_ORDER.length
    startAction(state, PET_IDLE_ORDER[index])
    state.nextIdleAt = state.now + PET_IDLE_INTERVALS[index]
    state.idleIndex++
  }
}
function baseFrame(state: PetBehavior): { act: PetAct; frame: PetFrame; delay: number | null } {
  const age = state.now - state.baseStart
  if (state.mode === 'running') {
    if (state.reducedMotion) return { act: 'work', frame: 'type-a', delay: null }
    if (age < 500) return { act: 'work', frame: 'laptop-out', delay: 500 - age }
    const cycle = Math.floor(age / 7000)
    const inside = age % 7000
    if (cycle > 0 && inside < 900) return { act: 'work', frame: 'type-c', delay: 900 - inside }
    const typingAge = cycle === 0 ? age - 500 : inside - 900
    return { act: 'work', frame: Math.floor(typingAge / 170) % 2 ? 'type-b' : 'type-a',
      delay: Math.min(170 - typingAge % 170, 7000 - inside) }
  }
  if (state.mode === 'waiting') return { act: 'wait', frame: state.reducedMotion || Math.floor(age / 420) % 2 === 0 ? 'call-a' : 'call-b', delay: state.reducedMotion ? null : 420 - age % 420 }
  const phase = age % 3540
  return { act: 'idle', frame: !state.reducedMotion && phase >= 3400 ? 'blink' : 'idle', delay: state.reducedMotion ? null : phase < 3400 ? 3400 - phase : 3540 - phase }
}
export function petView(state: PetBehavior): PetView {
  let view: { act: PetAct; frame: PetFrame; delay: number | null }
  if (state.carried) view = { act: 'carried', frame: state.reducedMotion || !state.carryDirection ? 'carry-a' : state.carryDirection > 0 ? 'carry-b' : 'carry-c', delay: null }
  else if (state.action && !state.reducedMotion) {
    let age = state.now - state.actionStart
    let step = ACTIONS[state.action][0]
    for (const candidate of ACTIONS[state.action]) {
      step = candidate
      if (age < step[1]) break
      age -= step[1]
    }
    view = { act: state.action, frame: step[0], delay: step[1] - age }
  } else if (state.hovered && !state.reducedMotion) view = { act: 'hover', frame: 'happy', delay: null }
  else if (state.mode === 'idle' && !state.reducedMotion && state.lookIndex !== null) {
    view = { act: 'look', frame: `look-${state.lookIndex}` as PetFrame, delay: state.lookUntil - state.now }
  } else view = baseFrame(state)
  const deadlines = [view.delay]
  if (state.bubble) deadlines.push(state.bubbleUntil - state.now)
  if (state.mode === 'idle' && !state.reducedMotion && !state.hovered && !state.carried && state.nextIdleAt !== null) deadlines.push(state.nextIdleAt - state.now)
  const positive = deadlines.filter((delay): delay is number => delay !== null && delay > 0)
  return { ...view, delay: positive.length ? Math.min(...positive) : null, bubble: state.bubble ? PET_BUBBLES[state.bubble] : null }
}
export function petTransition(previous: PetBehavior, event: PetEvent): PetBehavior {
  const state = { ...previous }
  if (event.type === 'tick') {
    const ms = event.ms ?? petView(state).delay ?? 0
    if (!Number.isFinite(ms) || ms <= 0) return state
    const target = state.now + ms
    // Jump from deadline to deadline, including bubble and action completion.
    while (state.now < target) {
      const delay = petView(state).delay
      // Subtraction around fractional event origins can leave a deadline less
      // than one representable clock step away. Always make forward progress.
      const clockStep = Number.EPSILON * Math.max(1, Math.abs(state.now)) * 8
      state.now = Math.min(target, state.now + Math.max(clockStep, delay ?? target - state.now))
      settle(state)
    }
    return state
  }
  if (event.type === 'look') {
    if (state.mode === 'idle' && !state.reducedMotion && !state.action && !state.hovered && !state.carried
      && Number.isFinite(event.dx) && Number.isFinite(event.dy)) {
      state.lookIndex = petLookIndex(event.dx, event.dy)
      state.lookUntil = state.now + PET_LOOK_RESET_DELAY
    }
  } else if (event.type === 'mode') {
    if (event.mode === state.mode) return state
    const feed = state.mode === 'running' && event.mode === 'idle'
    state.mode = event.mode
    state.lookIndex = null
    state.baseStart = state.now
    if (!state.carried) clearAction(state)
    resetIdle(state)
    if (feed && !state.reducedMotion && !state.hovered && !state.carried) {
      startAction(state, 'fed')
      state.nextIdleAt = null
    }
  } else if (event.type === 'hover') {
    if (state.hovered === event.hovered) return state
    state.hovered = event.hovered
    if (!state.carried && state.action !== 'landed') clearAction(state)
    resetIdle(state)
  } else if (event.type === 'carry') {
    if (!state.carried) {
      clearAction(state)
      state.carried = true
      state.bubble = 'carried'
      state.bubbleUntil = state.now + 2400
      state.nextIdleAt = null
    }
    state.carryDirection = event.direction ?? 0
  } else if (event.type === 'land') {
    if (!state.carried) return state
    state.carried = false
    state.carryDirection = 0
    clearAction(state)
    if (!state.reducedMotion) startAction(state, 'landed')
    else { state.bubble = 'landed'; state.bubbleUntil = state.now + 2400 }
    resetIdle(state)
  } else if (event.type === 'reduced') {
    if (state.reducedMotion === event.reducedMotion) return state
    state.reducedMotion = event.reducedMotion
    clearAction(state)
    state.baseStart = state.now
    resetIdle(state)
  }
  return state
}

export type PetPosition = { right: number; bottom: number }
export type PetSize = { width: number; height: number }
export const PET_DEFAULT_POSITION: PetPosition = { right: 18, bottom: 124 }
export function clampPetPosition(position: PetPosition, viewport: PetSize, size: PetSize): PetPosition {
  return {
    right: Math.max(4, Math.min(Math.max(4, viewport.width - size.width - 4), position.right)),
    bottom: Math.max(4, Math.min(Math.max(4, viewport.height - size.height - 4), position.bottom)),
  }
}
export function readPetPosition(raw: string | null, viewport: PetSize, size: PetSize): PetPosition {
  let position = PET_DEFAULT_POSITION
  try {
    const saved = raw ? JSON.parse(raw) : null
    if (saved && typeof saved.right === 'number' && Number.isFinite(saved.right)
      && typeof saved.bottom === 'number' && Number.isFinite(saved.bottom)) position = saved
  } catch { /* Invalid or unavailable storage uses the default corner. */ }
  return clampPetPosition(position, viewport, size)
}
export type PetDrag = { pointerId: number; startX: number; startY: number; x: number; y: number; dragging: boolean }
export function createPetDrag(pointerId: number, x: number, y: number): PetDrag {
  return { pointerId, startX: x, startY: y, x, y, dragging: false }
}
export function movePetDrag(state: PetDrag, x: number, y: number): PetDrag {
  return { ...state, x, y, dragging: state.dragging || Math.hypot(x - state.startX, y - state.startY) > 6 }
}
export function endPetDrag(state: PetDrag): { suppressClick: boolean } { return { suppressClick: state.dragging } }
