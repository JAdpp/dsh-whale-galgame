import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createWorkshopLayout, createResidents, syncResidents, stepResidents, settleResidents,
  walkingRoute, RESIDENT_IDS, TILE_SIZE, OFFICE_ART, type WorkshopLayout, type Point, type Bounds,
} from '../src/client/workshop-world.ts'

test('rooms follow connected families, coalescing model versions and aliases', () => {
  const one = createWorkshopLayout(['deepseek', 'deepseek', 'deepseek'])
  assert.deepEqual(one.ids, ['deepseek'])
  assert.deepEqual(one.rooms.filter((room) => room.kind === 'dorm').map((room) => room.characterId), ['deepseek'])
  assert.deepEqual(createResidents({}, 0, one).map((person) => person.id), ['deepseek'])
  const three = createWorkshopLayout(['kimi', 'gpt', 'chatgpt', 'unknown', 'deepseek'])
  assert.deepEqual(three.ids, ['deepseek', 'chatgpt', 'kimi'])
  assert.equal(three.rooms.filter((room) => room.kind === 'dorm').length, 3)
  assert.equal(Object.hasOwn(three.nodes, 'work-claude'), false)
  const empty = createWorkshopLayout([])
  assert.equal(empty.rooms.filter((room) => room.kind === 'dorm').length, 0)
  assert.deepEqual(createResidents({}, 0, empty), [])
  assert.ok(empty.height < one.height)
})

test('one or two dorms are centred and the fourth connected family creates a second row', () => {
  for (const count of [1, 2]) {
    const layout = createWorkshopLayout(RESIDENT_IDS.slice(0, count))
    const dorms = layout.rooms.filter((room) => room.kind === 'dorm')
    assert.equal(dorms[0].x, layout.width - dorms.at(-1)!.x - dorms.at(-1)!.width)
  }
  const three = createWorkshopLayout(RESIDENT_IDS.slice(0, 3))
  const four = createWorkshopLayout(RESIDENT_IDS.slice(0, 4))
  assert.ok(four.height > three.height)
  assert.equal(new Set(four.rooms.filter((room) => room.kind === 'dorm').map((room) => room.y)).size, 2)
  for (const room of four.rooms) {
    assert.ok(room.x >= 64 && room.x + room.width <= four.width - 64)
    assert.ok(room.y >= 0 && room.y + room.height <= four.height)
  }
})

function wallCrossing(a: Point, b: Point, x: number, y: number, width: number, height: number): Point[] {
  const crossings: Point[] = []
  if (a.x === b.x && a.x > x && a.x < x + width) {
    for (const wallY of [y, y + height]) if (Math.min(a.y, b.y) < wallY && Math.max(a.y, b.y) >= wallY) crossings.push({ x: a.x, y: wallY })
  }
  if (a.y === b.y && a.y > y && a.y < y + height) {
    for (const wallX of [x, x + width]) if (Math.min(a.x, b.x) < wallX && Math.max(a.x, b.x) >= wallX) crossings.push({ x: wallX, y: a.y })
  }
  return crossings
}

function assertClearRoute(layout: WorkshopLayout, start: string, destination: string): void {
  const route = [start, ...walkingRoute(start, destination, layout)]
  assert.equal(route.at(-1), destination, `${start} must reach ${destination}`)
  for (let index = 1; index < route.length; index++) {
    const a = layout.nodes[route[index - 1]], b = layout.nodes[route[index]]
    assert.ok(a.x === b.x || a.y === b.y, 'movement stays orthogonal')
    for (const room of layout.rooms) for (const crossing of wallCrossing(a, b, room.x, room.y, room.width, room.height)) {
      assert.ok(room.doors.some((door) => door.x === crossing.x && door.y === crossing.y), `${start}→${destination} must use ${room.id}'s door`)
    }
  }
}

test('every available dorm and shared area reaches each assigned desk through doorways, including both dorm rows', () => {
  for (const ids of [['deepseek'], ['claude', 'kimi'], [...RESIDENT_IDS]]) {
    const layout = createWorkshopLayout(ids)
    const starts = [...layout.ids.map((id) => 'dorm-' + id), ...layout.commonDestinations]
    for (const start of starts) for (const id of layout.ids) assertClearRoute(layout, start, 'work-' + id)
    for (const start of layout.commonDestinations) for (const destination of layout.commonDestinations) assertClearRoute(layout, start, destination)
  }
})

function crossesTable(a: Point, b: Point, table: Bounds): boolean {
  if (a.x === b.x) return a.x > table.x && a.x < table.x + table.width
    && Math.max(a.y, b.y) > table.y && Math.min(a.y, b.y) < table.y + table.height
  return a.y > table.y && a.y < table.y + table.height
    && Math.max(a.x, b.x) > table.x && Math.min(a.x, b.x) < table.x + table.width
}

test('the same 48px grid governs every floor, room and furniture module', () => {
  assert.equal(TILE_SIZE, 48)
  for (const count of [0, 1, 2, 3, 4, 5, 6]) {
    const layout = createWorkshopLayout(RESIDENT_IDS.slice(0, count))
    assert.equal(layout.tileSize, 48)
    for (const rect of [...layout.rooms, ...layout.halls, ...layout.props]) {
      for (const value of [rect.x, rect.y, rect.width, rect.height]) assert.equal(value % 48, 0)
    }
  }
})

test('the workshop has six non-overlapping full-size stations with walkpoints south of the desks', () => {
  const layout = createWorkshopLayout()
  const office = layout.rooms.find((room) => room.kind === 'office')!
  assert.equal(layout.stations.length, 6)
  assert.equal(office.width, 960)
  assert.equal(office.height, 960)
  for (const station of layout.stations) {
    assert.equal(station.width, 192)
    assert.equal(station.height, 192)
    assert.ok(station.x >= office.x + 48 && station.x + station.width <= office.x + office.width - 48)
    assert.ok(station.y >= office.y + 48 && station.y + station.height <= office.y + office.height - 48)
    assert.ok(station.walkPoint.y >= station.tableBounds.y + station.tableBounds.height + 48)
    assert.deepEqual(layout.nodes['work-' + station.id], station.walkPoint)
    assert.ok(station.walkPoint.y < office.y + office.height - 48)
    for (const other of layout.stations) if (other !== station) {
      assert.ok(station.x + station.width <= other.x || other.x + other.width <= station.x
        || station.y + station.height <= other.y || other.y + other.height <= station.y)
    }
  }
  const one = createWorkshopLayout(['deepseek'])
  assert.equal(one.stations.length, 1)
  assert.equal(one.rooms.find((room) => room.kind === 'office')!.height, office.height)
})

test('the office stays square and each station follows its painted rug for every occupied row', () => {
  for (const count of [1, 3, 4, 6]) {
    const layout = createWorkshopLayout(RESIDENT_IDS.slice(0, count))
    const office = layout.rooms.find((room) => room.kind === 'office')!
    assert.equal(office.width / office.height, 1)
    const scale = office.width / OFFICE_ART.cellSize
    assert.equal(layout.stations.length, count)
    layout.stations.forEach((station, index) => {
      const rug = OFFICE_ART.rugs[index]
      const rugCentre = office.x + (rug.x0 + rug.x1) / 2 * scale
      const rugBottom = office.y + rug.y1 * scale
      assert.ok(Math.abs(station.x + station.width / 2 - rugCentre) <= 1, `${station.id} centres on its rug`)
      assert.ok(Math.abs(rugBottom - station.y - station.height - 20) <= 1, `${station.id} sits 20px above the rug bottom`)
      assert.deepEqual({ x: station.walkPoint.x - TILE_SIZE * 2, y: station.walkPoint.y - TILE_SIZE * 4.5 },
        { x: station.x, y: station.y }, 'the seated frame uses the same origin as the empty desk')
      assert.ok(Number.isInteger(station.x) && Number.isInteger(station.y), 'desk frames align to world pixels')
    })
  }
})

test('every navigation edge avoids table blocking bounds, including trips from shared areas', () => {
  for (const ids of [[], ['deepseek'], ['claude', 'kimi'], RESIDENT_IDS.slice(0, 3), RESIDENT_IDS.slice(0, 4), [...RESIDENT_IDS]]) {
    const layout = createWorkshopLayout(ids)
    for (const [from, neighbors] of Object.entries(layout.edges)) for (const to of neighbors) {
      assert.ok(layout.nodes[from].x === layout.nodes[to].x || layout.nodes[from].y === layout.nodes[to].y, `${from}→${to} stays orthogonal`)
      for (const station of layout.stations) {
        assert.equal(crossesTable(layout.nodes[from], layout.nodes[to], station.tableBounds), false, `${from}→${to} crosses ${station.id}'s desk`)
      }
    }
    for (const start of layout.commonDestinations) for (const station of layout.stations) {
      const route = [start, ...walkingRoute(start, 'work-' + station.id, layout)]
      assert.equal(route.at(-1), 'work-' + station.id)
      for (let index = 1; index < route.length; index++) for (const obstacle of layout.stations) {
        assert.equal(crossesTable(layout.nodes[route[index - 1]], layout.nodes[route[index]], obstacle.tableBounds), false)
      }
    }
  }
})

test('working residents reach their own desk, wait there, and return after work ends', () => {
  const layout = createWorkshopLayout(['deepseek', 'chatgpt'])
  const residents = createResidents({}, 0, layout)
  syncResidents(residents, [{ id: 'chatgpt', name: 'GPT', status: 'running', activeSessions: 2 }], 0, layout)
  for (let time = 0; time < 40_000; time += 100) stepResidents(residents, .1, time, false, layout)
  const gpt = residents.find((resident) => resident.id === 'chatgpt')!
  assert.equal(gpt.node, 'work-chatgpt')
  assert.equal(gpt.activeSessions, 2)
  syncResidents(residents, [{ id: 'chatgpt', name: 'GPT', status: 'waiting', activeSessions: 1 }], 40_000, layout)
  assert.equal(gpt.route.length, 0)
  syncResidents(residents, [{ id: 'chatgpt', name: 'GPT', status: 'idle', activeSessions: 0 }], 41_000, layout)
  for (let time = 41_000; time < 81_000; time += 100) stepResidents(residents, .1, time, false, layout)
  assert.equal(gpt.node, 'dorm-chatgpt')
})

test('retargeting a walking resident finishes her current edge before turning', () => {
  const layout = createWorkshopLayout(['deepseek', 'claude', 'kimi', 'grok'])
  const residents = createResidents({}, 0, layout)
  stepResidents(residents, .1, 30_000, true, layout)
  const person = residents[0]
  stepResidents(residents, .1, 30_100, true, layout)
  const endpoint = person.route[0]
  const before = { x: person.x, y: person.y }
  syncResidents(residents, [{ id: person.id, name: '鲸鱼娘', status: 'running', activeSessions: 1 }], 30_200, layout)
  assert.equal(person.route[0], endpoint)
  assert.equal(person.x, before.x)
  assert.equal(person.y, before.y)
  for (let time = 30_200; time < 70_000; time += 100) stepResidents(residents, .1, time, false, layout)
  assert.equal(person.node, 'work-deepseek')
})

test('idle residents reserve distinct destinations and reduced motion settles at their target', () => {
  const layout = createWorkshopLayout()
  const residents = createResidents({}, 0, layout)
  stepResidents(residents, .1, 30_000, true, layout)
  const destinations = residents.map((resident) => resident.destination)
  assert.equal(new Set(destinations).size, destinations.length)
  assert.ok(destinations.some((destination) => destination.startsWith('lounge-')))
  assert.ok(destinations.some((destination) => destination.startsWith('observatory-')))
  settleResidents(residents, layout)
  assert.ok(residents.every((resident) => !resident.route.length && resident.node === resident.destination))
  assert.ok(residents.every((resident) => resident.x === layout.nodes[resident.node].x && resident.y === layout.nodes[resident.node].y))
})

test('returning from a hidden tab cannot teleport residents across the map', () => {
  const layout = createWorkshopLayout(['kimi'])
  const residents = createResidents({}, 0, layout)
  syncResidents(residents, [{ id: 'kimi', name: 'Kimi', status: 'running', activeSessions: 1 }], 0, layout)
  const before = { x: residents[0].x, y: residents[0].y }
  stepResidents(residents, 60, 60_000, false, layout)
  assert.ok(Math.abs(residents[0].x - before.x) + Math.abs(residents[0].y - before.y) <= 18)
})
