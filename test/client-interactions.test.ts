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
