import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../src/client/index.ts', import.meta.url), 'utf8')
function section(start: string, end: string): string {
  const from = source.indexOf(start)
  const to = source.indexOf(end, from + start.length)
  assert.notEqual(from, -1, 'missing section: ' + start)
  assert.notEqual(to, -1, 'missing boundary: ' + end)
  return source.slice(from, to)
}
function evaluate(code: string, globals: Record<string, any> = {}): any {
  return runInNewContext(stripTypeScriptTypes(code.replace(/^export /gm, '')), globals)
}
const defaults = { font: 'literary', panelOpacity: 55, ambience: true, sound: false, volume: 50, bgm: false }

test('fonts and sound never load external resources', () => {
  assert.doesNotMatch(source, /fonts\.googleapis|https?:\/\/|new Audio\s*\(/)
  assert.doesNotMatch(source, /@font-face|createMediaElementSource|decodeAudioData|<audio/)
  const css = section('const CSS = [', 'function art(')
  assert.match(css, /font-family:"LXGW WenKai","霞鹜文楷","LXGW WenKai Screen","Source Han Serif SC","思源宋体","Noto Serif SC","Songti SC","STSong","SimSun",serif/)
  assert.match(css, /\[data-font="system"\] \.whg-line-now\{font-family:system-ui/)
  assert.doesNotMatch(css, /\.whg-line-now\.narrator\{[^}]*font-style:italic/)
  assert.match(css, /\.whg-line-now\.narrator\{[^}]*letter-spacing:/)
})

test('display defaults are silent and storage failures and invalid values are recoverable', () => {
  const code = section('const TEXT_SPEEDS', '// Generated once')
  const read = (value: string | null, legacy: string | null = null, blocked = false) => evaluate(code + '\n({ settings: readDisplaySettings(), speed: readTextSpeed() })', {
    localStorage: { getItem(key: string) { if (blocked) throw new Error('blocked'); return key === 'whg-text-speed' ? legacy : value } },
  })
  assert.deepEqual(JSON.parse(JSON.stringify(read(null).settings)), defaults)
  assert.deepEqual(JSON.parse(JSON.stringify(read(null, null, true).settings)), defaults)
  for (const value of ['broken', 'null']) assert.deepEqual(JSON.parse(JSON.stringify(read(value).settings)), defaults)
  const saved = read(JSON.stringify({ font: 'system', ambience: false, sound: true, volume: 500, bgm: true, textSpeed: '快' }))
  assert.equal(saved.settings.volume, 100)
  assert.equal(saved.settings.font, 'system')
  assert.equal(saved.settings.ambience, false)
  assert.equal(saved.speed, 2)
  assert.equal(read('{"volume":-10}').settings.volume, 0)
  assert.equal(read('{"volume":"90","sound":"true","bgm":1}').settings.volume, 50)
  assert.equal(read('{"sound":"true","bgm":1}').settings.sound, false)
  assert.equal(read('{"sound":"true","bgm":1}').settings.bgm, false)
  for (const [index, label] of ['慢', '中', '快', '瞬间'].entries()) assert.equal(read('{"textSpeed":"快"}', label).speed, index)
  assert.equal(read('{}', 'unknown').speed, 1)
  assert.match(code, /try\s*\{[\s\S]*localStorage\.getItem\('whg-display-settings'\)[\s\S]*catch/)
  const write = section('function changeDisplaySettings(', 'function hideUi(')
  assert.match(write, /try\s*\{\s*localStorage\.setItem\('whg-display-settings', JSON\.stringify\(\{ \.\.\.next, textSpeed:/)
  assert.match(write, /catch \{ next = \{ \.\.\.DEFAULT_DISPLAY_SETTINGS \} \}/)
  assert.match(section('function textSpeedButton()', 'function levelMeter()'), /localStorage\.setItem\('whg-text-speed'/)
})

test('panel surface keeps a readable tint, increases monotonically and restores the original surface at 100', () => {
  const surface = evaluate(section('const TEXT_SPEEDS', '// Generated once') + '\npanelSurface')
  const expected = [
    [0, { top: .15, bottom: .35, blur: 0, edge: .1 }],
    [40, { top: .474, bottom: .602, blur: 1.92, edge: .161 }],
    [55, { top: .596, bottom: .697, blur: 3.63, edge: .215 }],
    [100, { top: .96, bottom: .98, blur: 12, edge: .48 }],
  ] as const
  for (const [opacity, values] of expected) {
    const actual = surface(opacity)
    for (const key of ['top', 'bottom', 'blur', 'edge'] as const) {
      assert.ok(Math.abs(actual[key] - values[key]) <= .005, opacity + ': ' + key)
      assert.equal(actual[key], Number(actual[key].toFixed(3)), key + ' rounds to three decimals')
    }
  }
  assert.deepEqual(JSON.parse(JSON.stringify(surface(100))), { top: .96, bottom: .98, blur: 12, edge: .48 })
  assert.deepEqual(JSON.parse(JSON.stringify(surface(-5))), JSON.parse(JSON.stringify(surface(0))))
  assert.deepEqual(JSON.parse(JSON.stringify(surface(250))), JSON.parse(JSON.stringify(surface(100))))
  let previous = surface(0)
  for (let opacity = 1; opacity <= 100; opacity++) {
    const current = surface(opacity)
    for (const key of ['top', 'bottom', 'blur', 'edge'] as const) assert.ok(current[key] >= previous[key], opacity + ': ' + key)
    assert.ok(current.top <= current.bottom, opacity + ': the box is never darker at the top')
    previous = current
  }
  const style = evaluate(section('const TEXT_SPEEDS', '// Generated once') + '\npanelStyle')
  for (const opacity of [0, 40, 55, 70]) assert.equal(style(opacity)['--whg-panel-topline'], 0, 'a translucent box has no hard top line')
  assert.ok(style(55)['--whg-panel-feather'] > .2, 'the fade happens above the text band')
  assert.equal(style(100)['--whg-panel-feather'], 0)
  assert.equal(style(0)['--whg-panel-shadow'], 0)
  assert.equal(style(100)['--whg-panel-topline'], 1)
  assert.equal(style(100)['--whg-panel-shadow'], .6)
})

test('saved panel opacity defaults, rounds, clamps and repairs invalid values', () => {
  const code = section('const TEXT_SPEEDS', '// Generated once')
  const read = (saved: string | null) => evaluate(code + '\nreadDisplaySettings().panelOpacity', {
    localStorage: { getItem() { return saved } },
  })
  for (const saved of [null, '{}', 'null', 'broken', '{"panelOpacity":"x"}', '{"panelOpacity":null}', '{"panelOpacity":true}', '{"panelOpacity":1e400}']) assert.equal(read(saved), 55, String(saved))
  for (const [value, expected] of [[-5, 0], [250, 100], [54.4, 54], [54.5, 55], [0, 0], [100, 100]]) assert.equal(read(JSON.stringify({ panelOpacity: value })), expected)
})

test('panel CSS uses surface variables and accessibility preferences restore the solid surface', () => {
  const css = section('const CSS = [', 'function art(')
  const panel = css.match(/\.whg-panel\{--whg-brass:[^}]+\}/)?.[0]
  assert.ok(panel, 'base panel rule')
  assert.match(panel, /background:linear-gradient\(180deg,rgba\(7,30,45,var\(--whg-panel-top,\s*\.?0?596\)\) 0%/)
  assert.match(panel, /var\(--whg-panel-mid,\s*\.?0?647\)[^;]*42%/)
  assert.match(panel, /rgba\(3,17,31,var\(--whg-panel-bottom,\s*\.?0?697\)\) 100%/)
  assert.match(panel, /backdrop-filter:blur\(var\(--whg-panel-blur,\s*3\.(?:6|63)px\)\)/)
  assert.match(panel, /border:1px solid rgba\(215,182,108,var\(--whg-panel-edge,\s*\.?0?215\)\)/)
  for (const preference of ['prefers-reduced-transparency:reduce', 'forced-colors:active']) {
    const rule = css.split('\n').filter((line) => line.includes('(' + preference + ')')).join('\n')
    assert.ok(rule.includes('.whg-panel'), preference + ' restores the panel')
    assert.match(rule, /(?:--whg-panel-top:\.?0?96\s*!important|rgba\(7,30,45,\.96\))/)
    assert.match(rule, /(?:--whg-panel-bottom:\.?0?98\s*!important|rgba\(3,17,31,\.98\))/)
    assert.match(rule, /(?:--whg-panel-blur:12px\s*!important|backdrop-filter:blur\(12px\))/)
    assert.match(rule, /(?:--whg-panel-edge:\.?0?48\s*!important|border(?:-color)?:[^;}]*(?:rgba\(215,182,108,\.48\)))/)
  }
  assert.match(css, /@media \(forced-colors:active\)\{\.whg-panel\{[^}]*background:Canvas;[^}]*color:CanvasText;[^}]*border-color:CanvasText/)
})

test('panel accents, decorations and new animations preserve sprite layout and reduced motion', () => {
  const css = section('const CSS = [', 'function art(')
  assert.match(css, /\.whg-panel\{--whg-brass:#d7b66c;[^}]*border:1px solid rgba\(215,182,108,var\(--whg-panel-edge,/)
  assert.match(css, /\.whg-panel:before,\.whg-panel:after\{[^}]*left:8px;right:8px;[^}]*pointer-events:none/)
  assert.match(css, /\.whg-choice:hover,\.whg-choice:focus-visible\{[^}]*border-left-color:var\(--whg-accent\)/)
  const main = section('function dialogue()', 'function cgModal(')
  const side = section('function sideStoryDialogue(', 'function dialogue()')
  assert.match(main, /'--whg-accent': s\.color/)
  assert.match(side, /'--whg-accent': member\?\.color \|\| plateColor/)
  const reduced = css.split('\n').filter((line) => line.includes('@media (prefers-reduced-motion:reduce)')).join('\n')
  for (const name of ['whg-particle', 'whg-caustics', 'whg-restore-hint']) assert.ok(reduced.includes('.' + name), name)
  assert.match(reduced, /\.whg-ambience\{display:none\}/)
  assert.match(reduced, /\.whg-particle,\.whg-caustics,\.whg-restore-hint\{animation:none\}/)
})

test('ambience uses fixed particles and pauses with the visible stage below its sprites', () => {
  const particles = section('const AMBIENCE_PARTICLES', 'function Ambience(')
  assert.match(particles, /length: 12/)
  assert.doesNotMatch(particles, /Math\.random/)
  const variant = evaluate(section('function ambienceVariant(', 'function Ambience(') + '\nambienceVariant')
  for (const [id, expected] of [['deepseek', 'bubble'], ['kimi', 'star'], ['grok', 'circuit'], ['claude', 'dust']]) assert.equal(variant(id).variant, expected)
  const ambience = section('function Ambience(', 'function useStageVisibility(')
  assert.match(ambience, /if \(!props\.enabled \|\| reducedMotion\) return null/)
  assert.match(ambience, /'data-paused': String\(props\.paused\)/)
  const visibility = section('function useStageVisibility(', 'function stageOwnsKeyboard(')
  assert.match(visibility, /IntersectionObserver/)
  assert.match(visibility, /!document\.hidden/)
  assert.match(visibility, /document\.removeEventListener\('visibilitychange', sync\)/)
  assert.match(source, /sideStoryScene\(\)\?\.cast\?\.\[0\]\?\.id/)
  assert.match(source, /enabled: displaySettings\.ambience, paused: !stageVisible/)
  assert.equal((source.match(/className: 'whg-vignette' \}\),\s*ambience,\s*topbar\((?:false|true)\),\s*stage\(\)/g) || []).length, 2)
  assert.match(source, /\.whg-ambience\{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none/)
  assert.match(source, /\.whg-stage\{position:absolute;inset:0;z-index:2;pointer-events:none/)
  assert.match(source, /\.whg-caustics\{[^}]*opacity:\.1;mix-blend-mode:screen/)
  assert.match(source, /\.whg-ambience\[data-paused="true"\]\{animation-play-state:paused\}/)
})

test('audio creation and resume have one gesture-only entry point', () => {
  const audio = section('function createProgrammaticAudio()', 'function DisplaySettingsPopover(')
  const gesture = section('function onUserGesture(', 'function tone(')
  assert.equal((source.match(/new AudioContext\(/g) || []).length, 1)
  assert.match(gesture, /context = new AudioContext\(\)/)
  assert.match(gesture, /context!\.resume\(\)/)
  assert.doesNotMatch(audio.replace(gesture, ''), /new AudioContext|\.resume\(/)
  assert.match(source, /onPointerDownCapture: \(\) => audio\.onUserGesture\(\)/)
  assert.match(source, /onKeyDownCapture: \(\) => audio\.onUserGesture\(\)/)
  assert.match(audio, /if \(disposed \|\| \(!settings\.sound && !settings\.bgm\)\) return/)
  assert.match(audio, /context\.close\(\)/)
  assert.match(source, /useEffect\(\(\) => \(\) => audio\.dispose\(\), \[audio\]\)/)
})

test('BGM uses fixed major melodies and a cancellable lookahead interval', () => {
  const modes = evaluate(section('const AUDIO_MODES', 'function createProgrammaticAudio()') + '\nAUDIO_MODES')
  const expected = { deepseek: [50, 104], claude: [53, 96], grok: [52, 116], kimi: [48, 100], chatgpt: [55, 112], gemini: [57, 108] }
  assert.deepEqual(Object.keys(modes), Object.keys(expected))
  for (const [id, [root, bpm]] of Object.entries(expected)) {
    assert.equal(modes[id].root, root)
    assert.equal(modes[id].bpm, bpm)
    assert.ok(modes[id].echo <= .2 && modes[id].feedback <= .25)
  }
  const score = evaluate(section('  const melodies =', '  function bgmFrequency(') + '\n;({ melodies, chords })')
  assert.equal(score.melodies.length, 2)
  for (const phrase of score.melodies) {
    assert.equal(phrase.length, 4)
    for (const bar of phrase) {
      assert.equal(bar.length, 8)
      assert.ok(bar.includes(null), 'each bar leaves space for the accompaniment')
      assert.ok(bar.every((note: number | null) => note === null || [0, 2, 4, 5, 7, 9, 11].includes(note % 12)))
    }
  }
  assert.equal(JSON.stringify(score.chords.map((chord: any) => chord.root)), '[0,9,5,7]')
  for (const chord of score.chords) assert.ok(chord.notes.every((note: number) => [0, 2, 4, 5, 7, 9, 11].includes(note % 12)))
  const audio = section('function createProgrammaticAudio()', 'function DisplaySettingsPopover(')
  assert.doesNotMatch(section('const AUDIO_MODES', 'function createProgrammaticAudio()'), /third\s*:/)
  assert.doesNotMatch(audio, /\.018|createBiquadFilter|breath|sweep|Math\.random/)
  assert.match(audio, /setInterval\(\(\) => scheduleBgm\(track, mode\), 25\)/)
  assert.match(audio, /while \(track\.nextTime < context\.currentTime \+ \.12\)/)
  assert.match(section('function stopBgm()', 'function syncBgm()'), /clearInterval\(bgmTimer\)/)
  assert.match(section('    dispose() {', 'function DisplaySettingsPopover('), /clearInterval\(bgmTimer\)/)
  assert.doesNotMatch(section('function scheduleBgmNote(', 'function stopBgm()'), /setTimeout/)
  assert.match(audio, /exponentialRampToValueAtTime\(\.0001, at \+ duration\)/)
  assert.match(audio, /source\.onended = \(\) =>/)
})

function audioHarness() {
  const events: any[] = []
  const contexts: any[] = []
  let timerId = 0
  const timers = new Map<number, () => void>()
  const intervals = new Map<number, () => void>()
  const nodes: any[] = []
  const param = () => ({
    value: 0,
    setValueAtTime(value: number, at: number) { this.value = value; events.push(['value', value, at]) },
    linearRampToValueAtTime(value: number, at: number) { this.value = value; events.push(['ramp', value, at]) },
    exponentialRampToValueAtTime(value: number, at: number) { this.value = value; events.push(['envelope', value, at]) },
    setTargetAtTime(value: number) { this.value = value }, cancelScheduledValues() {},
  })
  const node = (kind: string, extra: any = {}) => {
    const result = {
      kind, disconnected: false, connections: [] as any[], ...extra,
      connect(target: any) { this.connections.push(target); return target },
      disconnect() { this.disconnected = true; events.push(['disconnect']) },
    }
    nodes.push(result)
    return result
  }
  class AudioContextMock {
    state = 'running'; currentTime = 1; destination = {}; resumed = 0; closed = 0
    constructor() { contexts.push(this) }
    createGain() { return node('gain', { gain: param() }) }
    createDelay() { return node('delay', { delayTime: param() }) }
    createOscillator() {
      return node('oscillator', {
        frequency: param(), onended: null, startAt: 0, stopAt: Infinity, ended: false,
        start(at: number) { this.startAt = at; events.push(['start', at]) },
        stop(at = 0) { this.stopAt = at; events.push(['stop', at]) },
      })
    }
    resume() { this.resumed++; this.state = 'running'; return Promise.resolve() }
    close() { this.closed++; this.state = 'closed'; return Promise.resolve() }
  }
  const document = { hidden: false }
  const audio = evaluate(section('type SynthSound', 'function DisplaySettingsPopover(') + '\ncreateProgrammaticAudio()', {
    DEFAULT_DISPLAY_SETTINGS: defaults, window: { AudioContext: AudioContextMock }, document,
    setTimeout(callback: () => void) { const id = ++timerId; timers.set(id, callback); return id },
    clearTimeout(id: number) { timers.delete(id) },
    setInterval(callback: () => void, ms: number) { assert.equal(ms, 25); const id = ++timerId; intervals.set(id, callback); return id },
    clearInterval(id: number) { intervals.delete(id) },
  })
  function advance(seconds: number) {
    contexts[0].currentTime += seconds
    for (const oscillator of nodes.filter((item) => item.kind === 'oscillator' && !item.ended && item.stopAt <= contexts[0].currentTime)) {
      oscillator.ended = true
      oscillator.onended?.()
    }
    for (const callback of intervals.values()) callback()
  }
  function flushDisconnects() {
    for (const [id, callback] of Array.from(timers)) { timers.delete(id); callback() }
  }
  return { audio, events, contexts, document, timers, intervals, nodes, advance, flushDisconnects }
}

test('audio stays silent before gestures, throttles ticks, and closes on disposal', () => {
  const { audio, contexts, events, timers } = audioHarness()
  audio.configure(defaults, 'deepseek', true)
  audio.onUserGesture()
  audio.play('click')
  assert.equal(contexts.length, 0)
  const audible = { ...defaults, sound: true }
  audio.configure(audible, 'deepseek', true)
  assert.equal(contexts.length, 0, 'restored settings cannot unlock audio')
  audio.onUserGesture()
  assert.equal(contexts.length, 1)
  audio.play('tick'); audio.play('tick')
  assert.equal(events.filter((event) => event[0] === 'start').length, 1)
  contexts[0].currentTime += .051
  audio.play('tick')
  audio.play('click'); audio.play('affection'); audio.play('level')
  assert.equal(events.filter((event) => event[0] === 'start').length, 8)
  assert.ok(events.some((event) => event[0] === 'envelope'))
  const previous = events.length
  audio.configure(defaults, 'deepseek', true)
  audio.play('tick'); audio.play('click'); audio.play('level')
  assert.equal(events.length, previous)
  audio.dispose()
  assert.equal(contexts[0].closed, 1)
  assert.equal(timers.size, 0)
})

test('BGM fades, stops and restarts without visibility callbacks resuming contexts', async () => {
  const { audio, contexts, events, document, timers, intervals, nodes, advance, flushDisconnects } = audioHarness()
  const settings = { ...defaults, bgm: true }
  audio.configure(settings, 'deepseek', true)
  assert.equal(contexts.length, 0)
  audio.onUserGesture()
  const starts = () => events.filter((event) => event[0] === 'start').length
  assert.equal(starts(), 6, 'melody, arpeggio and bass each have a quiet octave harmonic')
  assert.equal(intervals.size, 1)
  assert.ok(events.some((event) => event[0] === 'ramp' && event[1] === .3 && event[2] === 2.02))
  assert.equal(contexts[0].resumed, 0)
  document.hidden = true
  audio.configure(settings, 'deepseek', false)
  assert.equal(intervals.size, 0)
  assert.ok(events.some((event) => event[0] === 'ramp' && event[1] === 0 && event[2] === 1.3))
  const oldNodes = nodes.slice(1)
  assert.ok(oldNodes.filter((node) => node.kind === 'oscillator').every((node) => node.stopAt <= 1.3))
  audio.play('level')
  assert.equal(starts(), 6)
  document.hidden = false
  audio.configure(settings, 'deepseek', true)
  assert.equal(starts(), 6, 'a restarted track waits for the previous fade')
  advance(.2)
  assert.equal(starts(), 12)
  assert.ok(events.filter((event) => event[0] === 'start').slice(6).every((event) => event[1] >= 1.3))
  audio.configure(settings, 'grok', true)
  assert.equal(starts(), 12, 'character changes wait for the old music to fade')
  assert.equal(intervals.size, 1, 'only the replacement scheduler survives')
  advance(.2)
  assert.equal(starts(), 18)
  assert.ok(events.filter((event) => event[0] === 'start').slice(12).every((event) => event[1] >= 1.5))
  flushDisconnects()
  assert.ok(oldNodes.every((node) => node.disconnected), 'retired voices and echo feedback are disconnected')
  contexts[0].state = 'suspended'
  audio.configure(settings, 'grok', true)
  assert.equal(contexts[0].resumed, 0)
  assert.equal(intervals.size, 0)
  audio.onUserGesture()
  await Promise.resolve()
  assert.equal(contexts[0].resumed, 1)
  audio.dispose()
  assert.equal(contexts[0].closed, 1)
  assert.equal(timers.size, 0)
  assert.equal(intervals.size, 0)
  assert.ok(nodes.slice(1).every((node) => node.disconnected), 'dispose also drains pending fade cleanups')
})

test('lookahead schedules three short voices, skips stalls and loops its written score', () => {
  const { audio, contexts, nodes, timers, intervals, advance } = audioHarness()
  audio.configure({ ...defaults, bgm: true }, 'deepseek', true)
  audio.onUserGesture()
  const eighth = 60 / 104 / 2
  const firstVoices = nodes.filter((node) => node.kind === 'oscillator')
  assert.equal(firstVoices.length, 6)
  assert.deepEqual(firstVoices.filter((_node, i) => i % 2 === 0).map((node) => Math.round(node.frequency.value)), [587, 294, 147])
  assert.ok(firstVoices.every((node) => node.stopAt - node.startAt <= .51 + 1e-9))
  assert.equal(timers.size, 0, 'notes use AudioContext time and onended, never wall-clock timeouts')
  advance(eighth - .08)
  const offbeat = nodes.filter((node) => node.kind === 'oscillator').slice(6)
  assert.equal(offbeat.length, 2, 'the first melody rest leaves only the arpeggio')
  assert.ok(offbeat.every((node) => node.startAt > contexts[0].currentTime && node.startAt < contexts[0].currentTime + .12))
  const beforeStall = nodes.length
  advance(2)
  assert.ok(nodes.slice(beforeStall).filter((node) => node.kind === 'oscillator').length <= 6, 'no catch-up burst after a stalled timer')
  assert.ok(firstVoices.every((node) => node.disconnected), 'ended notes disconnect without stopping the score')

  const loop = audioHarness()
  loop.audio.configure({ ...defaults, bgm: true }, 'deepseek', true)
  loop.audio.onUserGesture()
  const initial = loop.nodes.filter((node) => node.kind === 'oscillator').map((node) => node.frequency.value)
  for (let step = 1; step <= 64; step++) loop.advance(eighth)
  const last = loop.nodes.filter((node) => node.kind === 'oscillator').slice(-6)
  assert.deepEqual(last.map((node) => node.frequency.value), initial, 'the eight-bar score repeats exactly')
  assert.ok(last.every((node) => Math.abs(node.startAt - (1.02 + 64 * eighth)) < 1e-9))
  assert.ok(loop.nodes.filter((node) => node.kind === 'oscillator' && !node.disconnected).length < 20, 'live voices stay bounded over a full loop')
  loop.audio.dispose()
  audio.dispose()
  assert.equal(intervals.size, 0)
})

test('unknown roles use DeepSeek and scheduler guards stop hidden or disabled music', () => {
  const opening = (id: string) => {
    const h = audioHarness()
    h.audio.configure({ ...defaults, bgm: true }, id, true)
    h.audio.onUserGesture()
    const notes = h.nodes.filter((node) => node.kind === 'oscillator').map((node) => node.frequency.value)
    h.audio.dispose()
    return notes
  }
  assert.deepEqual(opening('unknown'), opening('deepseek'))
  assert.deepEqual(opening('constructor'), opening('deepseek'))
  const h = audioHarness()
  const settings = { ...defaults, bgm: true }
  h.audio.configure(settings, 'kimi', false)
  h.audio.onUserGesture()
  assert.equal(h.intervals.size, 0)
  h.audio.configure(settings, 'kimi', true)
  assert.equal(h.intervals.size, 1)
  h.document.hidden = true
  h.advance(.025)
  assert.equal(h.intervals.size, 0, 'the interval itself also observes document visibility')
  h.document.hidden = false
  h.audio.configure(settings, 'kimi', true)
  assert.equal(h.intervals.size, 1)
  h.audio.configure(defaults, 'kimi', true)
  assert.equal(h.intervals.size, 0)
  h.audio.dispose()
  assert.equal(h.timers.size, 0)
  assert.ok(h.nodes.slice(1).every((node) => node.disconnected))
})

test('typewriter ticks only for timed Unicode triplets, never for direct completion', () => {
  const writer = section('function Typewriter(', 'function CrossfadeImg(')
  assert.match(writer, /setTimeout\(\(\) => \{\s*setLine[\s\S]*?\(count \+ 1\) % 3 === 0[\s\S]*?props\.onTick\?\.\(\)/)
  assert.match(writer, /if \(!typing\) \{[\s\S]*?return undefined/)
  assert.doesNotMatch(section('  const advance = () => {', '    const node = lineRef.current'), /onTick/)
  assert.match(source, /context\.currentTime - lastTick < \.05/)
})

test('settings controls are named and dismiss to their trigger', () => {
  const settings = section('function DisplaySettingsPopover(', 'function Typewriter(')
  for (const label of ['台词字体', '对话框不透明度', '氛围特效', '音效', '音量', 'BGM']) assert.ok(settings.includes("'" + label + "'"), label)
  assert.match(settings, /'aria-label': '显示设置', 'aria-expanded': props\.open, 'aria-haspopup': 'dialog'/)
  assert.match(settings, /event\.key !== 'Escape'/)
  assert.match(settings, /!wrapperRef\.current\?\.contains\(event\.target\)/)
  assert.match(settings, /requestAnimationFrame\(\(\) => triggerRef\.current\?\.focus\(\)\)/)
  assert.match(settings, /type: 'range', min: 0, max: 100, value: props\.settings\.volume, disabled: !props\.settings\.sound/)
})

test('opacity slider is a live display control and changes persist with the other settings', () => {
  const changes: any[] = []
  const popover = evaluate(section('function DisplaySettingsPopover(', 'function Typewriter(') + '\nDisplaySettingsPopover', {
    React: { createElement(type: any, props: any, ...children: any[]) { return { type, props: props || {}, children } } },
    useRef: () => ({ current: null }), useEffect: () => {},
  })
  const tree = popover({ settings: defaults, speedControl: null, open: true, onOpenChange() {}, onChange: (patch: any) => changes.push(patch) })
  const slider = nodes(tree).find((node) => node.type === 'input' && node.props['aria-label'] === '对话框不透明度')
  assert.ok(slider)
  assert.equal(slider.props.type, 'range')
  assert.equal(slider.props.min, 0)
  assert.equal(slider.props.max, 100)
  assert.equal(slider.props.step, 5)
  assert.equal(slider.props.value, 55)
  assert.equal(slider.props['aria-valuetext'], '55%')
  assert.ok(!slider.props.disabled, 'opacity remains available with sound disabled')
  const label = nodes(tree).find((node) => node.type === 'label' && node.children.includes(slider))
  assert.ok(label && hasClass(label, 'whg-display-row'))
  assert.ok(label.children.some((child: any) => typeof child === 'string' && child.includes('55%')))
  slider.props.onChange({ target: { value: '25' } })
  assert.deepEqual(JSON.parse(JSON.stringify(changes)), [{ panelOpacity: 25 }])

  const stored: any[] = []
  let live: any
  const change = evaluate(section('function changeDisplaySettings(', 'function hideUi(') + '\nchangeDisplaySettings', {
    displaySettings: defaults, textSpeed: 1, TEXT_SPEEDS: [{ label: '慢' }, { label: '中' }],
    DEFAULT_DISPLAY_SETTINGS: defaults, atmosphereCharacter: 'deepseek', stageVisible: true,
    localStorage: { setItem(key: string, value: string) { stored.push([key, JSON.parse(value)]) } },
    setDisplaySettings(next: any) { live = next }, audio: { configure() {}, onUserGesture() {}, play() {} },
  })
  change(changes[0])
  assert.equal(live.panelOpacity, 25)
  assert.equal(stored[0][0], 'whg-display-settings')
  assert.deepEqual(stored[0][1], { ...defaults, panelOpacity: 25, textSpeed: '中' })
})

test('H shortcuts reject editing and hidden or unowned conversations', () => {
  const app = section('function App(', 'export const name')
  assert.match(app, /if \(!stageVisible \|\| !root\) return undefined/)
  assert.match(app, /target\.closest\('input,textarea,select,\[contenteditable\]'\) \|\| target\.isContentEditable/)
  assert.match(app, /event\.ctrlKey \|\| event\.metaKey \|\| event\.altKey/)
  assert.match(app, /!stageOwnsKeyboard\(root\)/)
  assert.match(app, /uiHidden && \(event\.key === 'Escape' \|\| event\.key\.toLowerCase\(\) === 'h'\)/)
  assert.match(app, /setTimeout\(\(\) => setRestoreHint\(false\), 3000\)/)
  const click = section('function onStageClick(', 'function onPanelWheel(')
  assert.match(click, /event\.preventDefault\(\)[\s\S]*event\.stopPropagation\(\)[\s\S]*restoreUi\(\)/)
  assert.match(click, /onStageContextMenu[\s\S]*event\.preventDefault\(\)[\s\S]*hideUi\(\)/)
  assert.match(section('function Typewriter(', 'function CrossfadeImg('), /stageOwnsKeyboard\(node\)/)
  assert.match(section('function stageOwnsKeyboard(', 'function canScrollUp('), /return root\.contains\(focused\)/)
})

test('wheel history yields to scrollable content and history replays stored heroine emotions', () => {
  const wheel = section('function onPanelWheel(', 'function playTypeTick(')
  assert.match(wheel, /event\.deltaY >= 0/)
  assert.match(wheel, /canScrollUp\(event\.target, event\.currentTarget\)/)
  assert.match(wheel, /openArchive\('history', event\.currentTarget\)/)
  assert.match(source, /node\.scrollHeight > node\.clientHeight && node\.scrollTop > 0/)
  const history = section('} else if (isHistory) {', '} else if (gallerySelected) {')
  assert.match(history, /emotion !== 'normal' \? EMOTION_SYMBOLS\[emotion\] : ''/)
  assert.match(history, /kind === 'heroine' \? React\.createElement\('button'/)
  assert.match(history, /'当时的表情：'/)
  assert.match(history, /s\.current === 'deepseek' \? art\(EMOTION_ART\[emotion\]\)/)
  assert.match(history, /kind === 'heroine' && historyExpression === index/)
})

test('keyboard ownership follows the focused conversation and skips offscreen roots', () => {
  class ElementMock {
    root: any = this
    visible = true
    bounds = { top: 0, left: 0, right: 800, bottom: 600 }
    classList = { contains: (_name: string) => false }
    closest() { return this.root }
    getClientRects() { return this.visible ? [this.bounds] : [] }
    getBoundingClientRect() { return this.bounds }
    contains(node: any) { return node === this || node.root === this }
  }
  const first = new ElementMock()
  const second = new ElementMock()
  second.bounds = { top: 900, left: 0, right: 800, bottom: 1500 }
  const body = new ElementMock()
  const document = { hidden: false, body, documentElement: new ElementMock(), activeElement: body, querySelectorAll: () => [first, second] }
  const owns = evaluate(section('function stageOwnsKeyboard(', 'function canScrollUp(') + '\nstageOwnsKeyboard', {
    document, HTMLElement: ElementMock, window: { innerWidth: 800, innerHeight: 600 }, getComputedStyle: () => ({ visibility: 'visible' }),
  })
  assert.equal(owns(first), true)
  assert.equal(owns(second), false)
  document.activeElement = second
  assert.equal(owns(first), false)
  document.activeElement = first
  assert.equal(owns(first), true)
  document.activeElement = new ElementMock()
  assert.equal(owns(first), false, 'unrelated host input keeps its keyboard')
  document.hidden = true
  assert.equal(owns(first), false)
  assert.equal(owns(null), false)
})

test('wheel scrolling respects a nested scroll position before opening history', () => {
  class ElementMock {
    parentElement: ElementMock | null = null
    scrollHeight = 100; clientHeight = 50; scrollTop = 10; overflowY = 'auto'
    contains(node: any): boolean { return node === this || !!node.parentElement && this.contains(node.parentElement) }
  }
  const panel = new ElementMock()
  const content = new ElementMock()
  content.parentElement = panel
  panel.scrollHeight = panel.clientHeight
  const scrollable = evaluate(section('function canScrollUp(', 'type SynthSound') + '\ncanScrollUp', {
    Element: ElementMock, HTMLElement: ElementMock, getComputedStyle: (node: ElementMock) => ({ overflowY: node.overflowY }),
  })
  assert.equal(scrollable(content, panel), true)
  content.scrollTop = 0
  assert.equal(scrollable(content, panel), false)
  content.scrollTop = 10
  content.overflowY = 'hidden'
  assert.equal(scrollable(content, panel), false)
  assert.equal(scrollable(new ElementMock(), panel), false)
})

function renderHarness(view: any) {
  let cursor = 0
  const hooks: any[] = []
  const useState = (initial: any) => {
    const index = cursor++
    if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial
    return [hooks[index], (value: any) => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value }]
  }
  const useRef = (initial: any) => {
    const index = cursor++
    if (!(index in hooks)) hooks[index] = { current: initial }
    return hooks[index]
  }
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type: any, props: any, ...children: any[]) { return { type, props: props || {}, children: children.flat(Infinity).filter((item) => item !== null && item !== undefined) } },
  }
  const App = evaluate(section('const CSS = [', 'export const name') + "\nrememberView(viewCacheKey('render-test'), fixture); App", {
    React, useState, useRef, useEffect: () => {}, localStorage: { getItem: () => null, setItem() {} }, fixture: view,
    WHALE_ART: { 'whale-normal': 'data:image/png;base64,AA', 'whale-angry': 'data:image/png;base64,BB' },
  })
  return () => { cursor = 0; return App({ variant: 'tab', sessionId: 'render-test', useSessions: null }) }
}
function nodes(root: any): any[] {
  return root && typeof root === 'object' ? [root, ...(root.children || []).flatMap(nodes)] : []
}
function hasClass(root: any, className: string): boolean {
  return String(root.props?.className || '').split(' ').includes(className)
}

test('rendered main dialogue keeps its accent, ambient layer and stored-expression replay', () => {
  const render = renderHarness({
    current: 'deepseek', name: '大肥鱼', color: '#7fd0ff', enabled: true, level: 1, affection: 5, cap: 10,
    sprite: 'whale-normal', choices: [], history: [{ who: 'heroine', text: '哼！', emotion: 'angry' }, { who: 'user', text: '好啦' }],
  })
  let tree = render()
  const panel = nodes(tree).find((node) => hasClass(node, 'whg-panel'))
  assert.equal(panel.props.style['--whg-accent'], '#7fd0ff')
  assert.equal(panel.props['data-font'], 'literary')
  assert.equal(panel.props.style['--whg-panel-top'], 0.596)
  assert.equal(panel.props.style['--whg-panel-bottom'], .697)
  assert.equal(panel.props.style['--whg-panel-mid'], .647)
  assert.equal(panel.props.style['--whg-panel-blur'], '3.63px')
  assert.equal(panel.props.style['--whg-panel-edge'], .215)
  const atmosphere = tree.children.findIndex((node: any) => node.type?.name === 'Ambience')
  assert.ok(atmosphere > tree.children.findIndex((node: any) => hasClass(node, 'whg-vignette')))
  assert.ok(atmosphere < tree.children.findIndex((node: any) => hasClass(node, 'whg-stage')))
  nodes(tree).find((node) => node.type?.name === 'DisplaySettingsPopover').props.onChange({ panelOpacity: 25 })
  tree = render()
  const updatedPanel = nodes(tree).find((node) => hasClass(node, 'whg-panel'))
  assert.equal(updatedPanel.props.style['--whg-panel-top'], 0.353)
  assert.equal(updatedPanel.props.style['--whg-panel-blur'], '0.75px')
  assert.equal(nodes(tree).find((node) => node.type?.name === 'DisplaySettingsPopover').props.settings.panelOpacity, 25)
  nodes(tree).find((node) => node.type === 'button' && node.children.includes('对话历史')).props.onClick({ currentTarget: {} })
  tree = render()
  const replay = nodes(tree).filter((node) => hasClass(node, 'whg-history-replay'))
  assert.equal(replay.length, 1, 'user lines are not replay buttons')
  assert.ok(nodes(replay[0]).some((node) => node.children.includes('💢')))
  replay[0].props.onClick()
  tree = render()
  const preview = nodes(tree).find((node) => hasClass(node, 'whg-history-expression'))
  assert.ok(nodes(preview).some((node) => node.children.includes('当时的表情：💢 生气')))
  assert.equal(nodes(preview).find((node) => node.type === 'img').props.src, 'data:image/png;base64,BB')
})

test('side-story accents follow its speaker while ambience follows the first cast member', () => {
  const render = renderHarness({
    current: 'deepseek', name: '大肥鱼', color: '#7fd0ff', enabled: true, level: 1, affection: 5, cap: 10,
    history: [], choices: [], sideStory: { scene: {
      id: 'scene', cursor: 0, choices: [],
      cast: [{ id: 'kimi', name: '月见', color: '#6fc3f7' }, { id: 'grok', name: '洛可', color: '#25c7d9' }],
      beats: [{ speaker: 'grok', text: '今天很热闹。', emotion: 'cheerful' }],
    } },
  })
  const tree = render()
  const panel = nodes(tree).find((node) => hasClass(node, 'whg-panel'))
  assert.equal(panel.props.style['--whg-accent'], '#25c7d9')
  assert.equal(panel.props.style['--whg-panel-top'], 0.596)
  assert.equal(panel.props.style['--whg-panel-bottom'], .697)
  assert.equal(panel.props.style['--whg-panel-mid'], .647)
  assert.equal(panel.props.style['--whg-panel-blur'], '3.63px')
  assert.equal(panel.props.style['--whg-panel-edge'], .215)
  assert.equal(tree.children.find((node: any) => node.type?.name === 'Ambience').props.characterId, 'kimi')
})
