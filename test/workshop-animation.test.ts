import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import { createResidents, createWorkshopLayout, stepResidents, settleResidents, syncResidents, selectResidentFrame, LEISURE_TIMING, RESIDENT_IDS, type ResidentFrameOptions, type ResidentSheet } from '../src/client/workshop-world.ts'

const available = { resident: true, frontBack: true, side: true, sideMid: true, leisure: true, workstation: true }
const pose = (options: Partial<ResidentFrameOptions> = {}) => selectResidentFrame({
  id: 'deepseek', frame: 0, status: 'idle', moving: false, settled: true, available, ...options,
})
const cycle = 4 * LEISURE_TIMING.frame + LEISURE_TIMING.hold
const cell = (frame: number, options: Partial<ResidentFrameOptions> = {}) => {
  const result = pose({ frame, ...options })
  return [result.sheet, result.row, result.mirror]
}

test('walking preserves front/back four-step and mirrored side eight-step cycles', () => {
  for (const status of ['idle', 'running', 'waiting'] as const) {
    const walking = { moving: true, status, atDesk: true }
    assert.deepEqual([0, 6, 12, 18, 24].map(frame => cell(frame, { ...walking, facing: 'down' })), [
      ['frontBack', 0, false], ['resident', 0, false], ['frontBack', 1, false], ['resident', 0, false], ['frontBack', 0, false],
    ])
    assert.deepEqual([0, 6, 12, 18, 24].map(frame => cell(frame, { ...walking, facing: 'up' })), [
      ['frontBack', 2, false], ['side', 3, false], ['frontBack', 3, false], ['side', 3, false], ['frontBack', 2, false],
    ])
    for (const facing of ['left', 'right'] as const) {
      const steps = [['side', 0], ['sideMid', 0], ['sideMid', 3], ['sideMid', 1], ['side', 1], ['sideMid', 1], ['sideMid', 2], ['sideMid', 0], ['side', 0]]
      assert.deepEqual(steps.map((_, index) => cell(index * 5, { ...walking, facing })), steps.map(([sheet, row]) => [sheet, row, facing === 'left']))
    }
  }
})

test('arrived busy residents use three workstation frames or the waiting frame', () => {
  assert.deepEqual([0, 12, 24, 36].map(frame => cell(frame, { status: 'running', atDesk: true })),
    [1, 2, 3, 1].map(row => ['workstation', row, false]))
  for (const frame of [0, 12, 40, 500]) assert.deepEqual(cell(frame, { status: 'waiting', atDesk: true }), ['workstation', 4, false])
})

test('settled idle residents play four leisure rows then hold, using time since settling', () => {
  assert.deepEqual(LEISURE_TIMING, { frame: 13, hold: 100, stagger: 20 })
  assert.equal(cycle, 152)
  for (const id of RESIDENT_IDS) for (let since = -100; since <= cycle * 2; since++) {
    const phase = since < 0 ? 151 : since % cycle
    const expected = ['leisure', phase <= 12 ? 0 : phase <= 25 ? 1 : phase <= 38 ? 2 : 3, false]
    for (const frame of [0, 77, 1000]) assert.deepEqual(cell(frame, { id, since }), expected)
    assert.deepEqual(pose({ id: 'gpt', frame: 77, since }), pose({ id: 'chatgpt', frame: 77, since }))
    if (since >= 0) assert.deepEqual(cell(since, { id }), expected, 'omitted since uses frame')
  }
  assert.deepEqual([0, 12, 13, 25, 26, 38, 39, 51, 52, 151, 152].map(since => pose({ since }).row),
    [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 0])
})

test('new residents start in roster order with every delay inside the final-pose hold', () => {
  const now = 12345
  const residents = createResidents({}, now)
  residents.forEach((resident, index) => {
    assert.equal(resident.settledAt, now + index * LEISURE_TIMING.stagger * 30)
    const since = Math.floor(now / 30) - Math.floor(resident.settledAt / 30)
    assert.deepEqual(cell(999, { id: resident.id, since }), ['leisure', index === 0 ? 0 : 3, false])
  })
  assert.ok(residents.at(-1)!.settledAt - now <= LEISURE_TIMING.hold * 30)
})

test('walking preserves settledAt until the exact step that reaches the destination', () => {
  const layout = createWorkshopLayout(['deepseek'])
  const residents = createResidents({}, 123, layout)
  syncResidents(residents, [{ id: 'deepseek', name: 'DeepSeek', status: 'running', activeSessions: 1 }], 200, layout)
  const resident = residents[0]
  assert.ok(resident.route.length > 1)
  let now = 200, steps = 0
  while (resident.route.length) {
    now += 200
    stepResidents(residents, .2, now, false, layout)
    assert.equal(resident.settledAt, resident.route.length ? 123 : now)
    assert.ok(++steps < 1000)
  }
  assert.equal(resident.node, resident.destination)
  stepResidents(residents, .2, now + 200, false, layout)
  assert.equal(resident.settledAt, now)
})

test('settling with a timestamp only resets residents moved off a route; omitted time preserves it', () => {
  for (const now of [undefined, 0, 9000]) {
    const layout = createWorkshopLayout()
    const residents = createResidents({}, 123, layout)
    const initial = residents.map(resident => resident.settledAt)
    syncResidents(residents, [{ id: 'deepseek', name: 'DeepSeek', status: 'running', activeSessions: 1 }], 200, layout)
    assert.ok(residents[0].route.length)
    settleResidents(residents, layout, now)
    residents.forEach((resident, index) => {
      assert.equal(resident.settledAt, index === 0 && now !== undefined ? now : initial[index])
      assert.equal(resident.node, resident.destination)
      assert.equal(resident.route.length, 0)
    })
  }
})

test('busy away from desks and idle residents not yet settled always stand', () => {
  for (let frame = 0; frame < cycle; frame++) {
    for (const status of ['running', 'waiting'] as const) assert.deepEqual(cell(frame, { status }), ['resident', 0, false])
    assert.deepEqual(cell(frame, { settled: false }), ['resident', 0, false])
  }
})

test('roster avatars stand regardless of status, movement, desk and animation phase', () => {
  for (const id of RESIDENT_IDS) for (const status of ['idle', 'running', 'waiting'] as const) {
    for (const frame of [0, 100, 151, cycle + 100]) for (const moving of [false, true]) {
      assert.deepEqual(cell(frame, { id, status, small: true, moving, atDesk: true }), ['resident', 0, false])
    }
  }
})

test('missing motion sheets fall back to standing without ever selecting legacy resident rows', () => {
  for (const missing of ['frontBack', 'side', 'sideMid'] as ResidentSheet[]) {
    for (const facing of ['down', 'up', 'left', 'right'] as const) for (let frame = 0; frame < 40; frame++) {
      assert.deepEqual(cell(frame, { moving: true, facing, available: { ...available, [missing]: false } }), ['resident', 0, false])
    }
  }
  for (const id of RESIDENT_IDS) for (let frame = 0; frame < cycle; frame++) {
    assert.deepEqual(cell(frame, { id, available: { ...available, leisure: false } }), ['resident', 0, false])
  }
  assert.deepEqual(cell(100, { status: 'running', atDesk: true, available: { ...available, workstation: false } }), ['resident', 0, false])
})

test('a frozen frame counter preserves the current pose', () => {
  for (const id of RESIDENT_IDS) for (let frame = 0; frame < cycle; frame++) {
    const current = pose({ id, frame })
    assert.deepEqual(pose({ id, frame }), current)
  }
})

test('reduced motion holds the leisure ending pose and missing leisure falls back to standing', () => {
  for (const id of RESIDENT_IDS) for (let frame = 0; frame < cycle * 2; frame++) {
    assert.deepEqual(cell(frame, { id, reducedMotion: true }), ['leisure', 3, false])
    assert.deepEqual(cell(frame, { id, reducedMotion: true, available: { ...available, leisure: false } }), ['resident', 0, false])
  }
})

const manifest = JSON.parse(readFileSync(new URL('../assets/workshop/manifest.json', import.meta.url), 'utf8'))
test('standing and roster use resident anchors while front walking transitions use walk idle anchors', () => {
  const source = readFileSync(new URL('../src/client/workshop-art.ts', import.meta.url), 'utf8')
  const draw = runInNewContext(stripTypeScriptTypes(source.replace(/^import .*$/m, '').replace(/export /g, '') + '\ndrawResident'), {
    createWorkshopLayout: () => ({}), selectResidentFrame, STATION_SIZE: 192, TILE_SIZE: 48,
  })
  const image = { width: 1536, height: 1024 }
  const residentAnchor = { x: 110, y: 240 }, walkAnchor = { x: 140, y: 250 }
  const assets = {
    residentAtlas: image, walkAtlas: image, walkSideAtlas: image, walkMidAtlas: image,
    residentAnchors: [Array(6).fill(residentAnchor)], walk: { idle: Array(6).fill(walkAnchor) },
  }
  for (const [moving, small, anchor] of [[false, false, residentAnchor], [true, true, residentAnchor], [true, false, walkAnchor]] as const) {
    const calls: any[][] = []
    const ctx = { save() {}, restore() {}, drawImage(...args: any[]) { calls.push(args) } }
    draw(ctx, 'grok', 48, 100, 6, 'idle', moving, assets, false, 'down', { small })
    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0].slice(5), [48 - anchor.x / 256 * 96, 100 - anchor.y / 256 * 96, 96, 96])
  }
  const calls: any[][] = []
  draw({ save() {}, restore() {}, drawImage(...args: any[]) { calls.push(args) } },
    'grok', 48, 100, 0, 'idle', false, { residentAtlas: image })
  assert.deepEqual(calls[0].slice(5), [0, 100 - 248 / 256 * 96, 96, 96])
})

test('ten workshop assets include a 6 by 4 leisure loop with generated anchors, scale and hashes', () => {
  assert.equal(manifest.assets.length, 10)
  assert.equal(new Set(manifest.assets.map((asset: any) => asset.key)).size, 10)
  assert.ok(manifest.assets.some((asset: any) => asset.key === 'workshop-leisure-atlas' && asset.file === 'leisure-actions.png'))
  for (const asset of manifest.assets) {
    const png = readFileSync(new URL('../assets/workshop/' + asset.file, import.meta.url))
    const webp = readFileSync(new URL('../assets/workshop/' + asset.runtime.file, import.meta.url))
    assert.equal(createHash('sha256').update(png).digest('hex'), asset.sha256)
    assert.equal(createHash('sha256').update(webp).digest('hex'), asset.runtime.sha256)
  }
  assert.deepEqual(manifest.residentLayout.activeRows, [0])
  assert.deepEqual(manifest.residentLayout.deprecatedRows.rows, [1, 2, 3])
  const layout = manifest.leisureLayout
  assert.deepEqual([layout.columns, layout.rows], [6, 4])
  assert.deepEqual(layout.characters, [...RESIDENT_IDS])
  assert.deepEqual(layout.frames, [0, 1, 2, 3])
  assert.ok(layout.scale >= .85 && layout.scale <= .95)
  assert.equal(layout.footAnchors.length, 4)
  for (const row of layout.footAnchors) {
    assert.equal(row.length, 6)
    assert.deepEqual(row, layout.footAnchors[0])
    for (const point of row) assert.ok([point.x, point.y].every(value => Number.isFinite(value) && value >= 0 && value <= 256))
  }
  const generated = readFileSync(new URL('../src/client/workshop.generated.ts', import.meta.url), 'utf8')
  assert.match(generated, /'workshop-leisure-atlas': 'data:image\/webp;base64,/)
  const leisure = JSON.parse(generated.match(/export const WORKSHOP_LEISURE = (.+)/)![1])
  assert.deepEqual(leisure, { scale: layout.scale, anchors: layout.footAnchors })
})

test('optional walking and leisure image load failures keep the map usable', async () => {
  const source = readFileSync(new URL('../src/client/workshop-map.ts', import.meta.url), 'utf8')
  const loader = source.slice(source.indexOf('let workshopImages:'), source.indexOf('function PixelAvatar('))
  for (const missing of ['workshop-walk-atlas', 'workshop-walk-side-atlas', 'workshop-walk-mid-atlas', 'workshop-leisure-atlas', 'workshop-resident-atlas']) {
    const art = Object.fromEntries(manifest.assets.map((asset: any) => [asset.key, asset.key]))
    class ImageStub {
      onload: () => void = () => {}; onerror: () => void = () => {}
      set src(value: string) { queueMicrotask(() => value === missing ? this.onerror() : this.onload()) }
    }
    const result = runInNewContext(stripTypeScriptTypes(loader + '\nloadWorkshopImages()'), {
      Image: ImageStub, WORKSHOP_ART: art, WORKSHOP_WALK: {}, WORKSHOP_LEISURE: {}, WORKSHOP_DECOR_BOUNDS: [], WORKSHOP_SPRITE_ANCHORS: [],
    })
    if (missing === 'workshop-resident-atlas') await assert.rejects(result, /加载失败/)
    else {
      const images = await result
      const property = { 'workshop-walk-atlas': 'walkAtlas', 'workshop-walk-side-atlas': 'walkSideAtlas', 'workshop-walk-mid-atlas': 'walkMidAtlas', 'workshop-leisure-atlas': 'leisureAtlas' }[missing]!
      assert.equal(images[property], null)
      assert.ok(images.residentAtlas)
    }
  }
})
