import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/client/index.ts', import.meta.url), 'utf8')

function section(start: string, end: string): string {
  const from = source.indexOf(start)
  const to = source.indexOf(end, from + start.length)
  assert.notEqual(from, -1, 'missing client section: ' + start)
  assert.notEqual(to, -1, 'missing client section boundary: ' + end)
  return source.slice(from, to)
}

test('picker catalogue reads never reuse the mutation lock', () => {
  const loader = section('function loadPickerData()', 'function openPicker(')
  const option = section('function pickerOption(', 'function characterPicker(')

  assert.match(loader, /setPickerCatalogLoading\(true\)/)
  assert.match(loader, /callApi\('settings-get'\)/)
  assert.match(loader, /callModelOptions\(\)/)
  assert.doesNotMatch(loader, /setPickerLoading\(/)
  assert.match(option, /disabled:\s*pickerLoading/)
})

test('profile fields remain editable until a profile write begins', () => {
  const load = section('function loadCharacterProfile(', 'function updateProfileField(')
  const field = section('function profileField(', 'function profileEditor(')
  const save = section('function saveCharacterProfile()', 'function resetCharacterProfile(')

  assert.match(source, /const PROFILE_KEYS = \['displayName', 'address', 'greeting', 'persona', 'tone', 'visual'\] as const/)
  assert.match(load, /\.finally\(\(\)\s*=>\s*\{[\s\S]*setProfileLoading\(false\)/)
  assert.match(field, /disabled:\s*profileLoading\s*\|\|\s*profileSaving/)
  assert.match(field, /onChange:[\s\S]*updateProfileField/)
  assert.match(save, /!profileLoaded\s*\|\|\s*profileSaving/)
  assert.doesNotMatch(save, /pickerLoading/)
  assert.match(save, /setProfileSaving\(true\)/)
  assert.match(save, /\.finally\(\(\)\s*=>\s*setProfileSaving\(false\)\)/)
})

test('available reply choices are not hidden by the latest line author', () => {
  const dialogue = section('function dialogue()', 'function cgModal(')
  assert.match(dialogue, /const showChoices = Array\.isArray\(s\.choices\) && s\.choices\.length > 0/)
  assert.doesNotMatch(dialogue, /last\.who === 'heroine' && s\.choices/)
})

test('plugin-owned settings remain discoverable inside the Plugins section', () => {
  const registration = section(
    '// The plugin owns its settings through /whale-galgame-api',
    "ctx.effect(() => () => {",
  )

  assert.match(registration, /slots\.inject\('settings\.plugins\.tab'/)
  assert.match(registration, /name:\s*'settings\.plugins\.tab'/)
  assert.match(registration, /id:\s*'whale-galgame'/)
  assert.match(registration, /label:\s*'鲸鱼娘'/)
  assert.doesNotMatch(registration, /settings\.plugin\.item/)
})

test('other plugins keep ownership of their skins', () => {
  assert.doesNotMatch(source, /data-dsh-maid-atelier/)
  assert.doesNotMatch(source, /data-skin-owner/)
  assert.doesNotMatch(source, /attributeFilter/)
  assert.match(source, /body\[data-whale-galgame-active\] \[data-slot="conversation\.composer"\]/)
})

test('plugin settings expose a dedicated pet visibility switch', () => {
  const settings = section('function PluginSettingsCard()', 'function App(')
  const app = section('function App(', 'export const name')

  assert.match(settings, /const petEnabled = !settings \|\| settings\.petEnabled !== false/)
  assert.match(settings, /React\.createElement\('strong', null, '显示桌宠'\)/)
  assert.match(settings, /'aria-checked': petEnabled/)
  assert.match(settings, /'aria-label': '显示桌宠'/)
  assert.match(settings, /onClick: \(\) => save\(\{ petEnabled: !petEnabled \}\)/)
  assert.match(settings, /关闭后仍可从会话顶部的 galgame 页签进入，并在这里重新开启。/)
  assert.match(settings, /window\.addEventListener\('whg:pet-setting', onPetSetting\)/)
  assert.match(settings, /Object\.prototype\.hasOwnProperty\.call\(patch, 'petEnabled'\)/)
  assert.match(settings, /new CustomEvent\('whg:pet-setting', \{ detail: nextSettings\.petEnabled \}\)/)
  assert.match(app, /window\.addEventListener\('whg:pet-setting', onPetSetting\)/)
  assert.match(app, /setS\(\(prev: any\) => prev \? \{ \.\.\.prev, petEnabled: enabled \} : prev\)/)
  assert.match(app, /const petEnabled = !!s && s\.enabled !== false && s\.petEnabled !== false/)
  assert.match(app, /React\.createElement\(Pet/)
})

test('typewriter uses Unicode characters and safely remembers the four text speeds', () => {
  const speeds = section('const TEXT_SPEEDS', 'function Typewriter(')
  const writer = section('function Typewriter(', 'function CrossfadeImg(')
  const button = section('function textSpeedButton()', 'function levelMeter(')

  assert.match(writer, /Array\.from\(props\.text\)/)
  assert.match(writer, /count: chars\.length/)
  assert.match(writer, /line\.id === props\.lineId && line\.text === props\.text/)
  assert.match(writer, /const alreadySeen = !sameLine && seenLines\.current\.has\(lineKey\)/)
  assert.match(writer, /if \(!sameLine\)[\s\S]*count: alreadySeen \? chars\.length : 0/)
  for (const ms of [60, 35, 18, 0]) assert.match(speeds, new RegExp('ms: ' + ms + ' \\}'))
  assert.match(speeds, /try\s*\{\s*const saved = localStorage\.getItem\('whg-text-speed'\)/)
  assert.match(speeds, /catch\s*\{\s*return 1/)
  assert.match(button, /try\s*\{ localStorage\.setItem\('whg-text-speed', TEXT_SPEEDS\[next\]\.label\) \} catch/)
  assert.match(button, /catch \{ next = 1 \}/)
  assert.match(button, /'aria-label': '文字速度：' \+ label/)
})

test('line clicks and visible-panel keyboard input share completion and advance behavior', () => {
  const writer = section('function Typewriter(', 'function CrossfadeImg(')
  const side = section('function sideStoryDialogue(', 'function dialogue()')
  const main = section('function dialogue()', 'function cgModal(')

  assert.match(writer, /if \(typing\) setLine\([\s\S]*else if \(props\.canAdvance\) props\.onAdvance\?\.\(\)/)
  assert.match(writer, /onClick: advance/)
  assert.match(writer, /event\.key !== ' ' && event\.key !== 'Enter'/)
  assert.match(writer, /target\.closest\('input,textarea,button,select'\)/)
  assert.match(writer, /event\.preventDefault\(\)/)
  assert.match(writer, /IntersectionObserver[\s\S]*entry\.isIntersecting/)
  assert.match(writer, /window\.removeEventListener\('keydown', onKeyDown\)/)
  assert.match(writer, /observer\.disconnect\(\); sync\(false\)/)
  assert.match(side, /React\.createElement\(Typewriter/)
  assert.match(side, /canAdvance: pendingLine === null && !busy && offered\.length === 0 && !atEnd/)
  assert.match(side, /onAdvance: \(\) => \{ act\('side-story', \{ op: 'advance' \}\) \}/)
  assert.match(main, /React\.createElement\(Typewriter/)
  assert.doesNotMatch(main, /canAdvance:|onAdvance:/)
  assert.doesNotMatch(side + main, /key: 'side-'|key: 'now-'/)
})

test('speech requests show pending text and restore the original input on failure', () => {
  const send = section('function send()', '// whale-girl emotion sprites')
  const act = section('function act(', 'function closePicker(')
  const side = section('function sideStoryDialogue(', 'function dialogue()')
  const pending = section('function pendingResponse(', 'function progressOverlay(')

  assert.match(send, /setPendingLine\(t\)[\s\S]*setText\(''\)[\s\S]*act\('chat', \{ text: t \}\)/)
  assert.match(act, /action === 'chat' \|\| \(action === 'side-story' && args && args\.op === 'speak'\)/)
  assert.match(act, /if \(spoken !== null\) setPendingLine\(spoken\)/)
  assert.match(act, /assertApiResult\(v,/)
  assert.match(act, /\.catch\([\s\S]*setApiError[\s\S]*setSkitText\(spoken\)[\s\S]*setText\(spoken\)/)
  assert.match(act, /\.finally\([\s\S]*setPendingLine\(null\)[\s\S]*setBusy\(false\)/)
  assert.match(side, /const spoken = skitText\s/)
  assert.match(side, /setPendingLine\(spoken\)[\s\S]*act\('side-story', \{ op: 'speak', text: spoken \}\)/)
  assert.match(pending, /role: 'status'/)
  assert.match(pending, /characterName \+ ' 正在回应'/)
})

test('backgrounds and the single-character sprite crossfade only after the new image loads', () => {
  const image = section('function CrossfadeImg(', 'function Pet(')
  const stage = section('function stage()', 'function textSpeedButton(')
  const render = section("const isTab = props.variant === 'tab'", 'export const name')

  assert.match(image, /displayedSrc !== props\.src \? displayedSrc : null/)
  assert.match(image, /onLoad: \(\) => \{ if \(previous\) setFadingSrc\(props\.src\) \}/)
  assert.match(image, /if \(fadingSrc !== props\.src \|\| !previous\) return undefined/)
  assert.match(image, /setTimeout\([\s\S]*setDisplayedSrc\(props\.src\)[\s\S]*400\)/)
  assert.match(image, /onError: props\.onError/)
  assert.match(image, /alt: props\.alt, draggable: props\.draggable/)
  assert.match(stage, /React\.createElement\(CrossfadeImg/)
  assert.match(stage, /key: s\.current, className: 'whg-character-enter'/)
  assert.match(render, /const backgroundSrc = nextBackground \|\| lastBackground\.current/)
  assert.equal((render.match(/React\.createElement\(CrossfadeImg, \{ className: 'whg-bg'/g) || []).length, 2)
})

test('affection effects belong to local chat and side-story choices, with CG shown afterward', () => {
  const act = section('function act(', 'function closePicker(')
  const app = section('function App(', 'export const name')

  assert.match(app, /const previousProgress = useRef</)
  assert.match(act, /const before = previousProgress\.current/)
  assert.match(act, /const affectsProgress = action === 'chat'[\s\S]*args\.op === 'choose' \|\| args\.op === 'speak'/)
  assert.match(act, /before\.characterId === String\(v\.current \|\| ''\)/)
  assert.match(act, /Number\(v\.affection\) - before\.affection/)
  assert.match(act, /Number\(v\.level\) > before\.level/)
  assert.match(act, /Number\(v\.affection\) - before\.affection \+ \(Number\(v\.level\) > before\.level \? before\.cap : 0\)/)
  assert.match(app, /setTimeout\(\(\) => setAffectionFeedback\(null\), 1200\)/)
  assert.match(app, /setTimeout\(\(\) => setLevelUp\(null\), 2200\)/)
  assert.equal((app.match(/levelUp \? progressOverlay\(\) : cgModal\(\)/g) || []).length, 2)
})

test('all presentation animations respect reduced motion', () => {
  const css = section('const CSS = [', 'function art(')
  const reduced = css.split('\n').filter((line) => line.includes('@media (prefers-reduced-motion:reduce)')).join('\n')
  for (const className of [
    'whg-type-cursor', 'whg-advance-cursor', 'whg-response-dot', 'whg-thinking',
    'whg-crossfade-fading', 'whg-character-enter', 'whg-affection-delta',
    'whg-level-shine:after', 'whg-level-up-card', 'whg-level-up-card:before',
  ]) assert.ok(reduced.includes('.' + className), 'missing reduced-motion override: ' + className)
  assert.match(reduced, /animation:none/)
  assert.match(reduced, /\.whg-crossfade>\.whg-crossfade-fading\{animation:none;opacity:0\}/)
  assert.match(section('function Typewriter(', 'function CrossfadeImg('), /props\.speed === 0 \|\| reducedMotion \|\| alreadySeen \? chars\.length/)
})

test('level meter children never share a React key', () => {
  const meter = section('function levelMeter()', 'function pendingResponse(')
  // A shared key between the track and the delta span leaks one extra track per affection change.
  assert.match(meter, /key:\s*'track-'\s*\+/)
  assert.match(meter, /key:\s*'delta-'\s*\+/)
})
