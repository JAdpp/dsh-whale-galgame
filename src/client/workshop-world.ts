// Transient RPG-style navigation. The generated art is assembled on one 48px grid.
// Model-family availability determines rooms; movement never touches the Galgame save.
export const TILE_SIZE = 48
// Rug bounds in the square office atlas cell, in resident slot order.
export const OFFICE_ART = {
  cellSize: 627,
  rugs: [
    { x0: 96, y0: 245, x1: 217, y1: 368 },
    { x0: 260, y0: 245, x1: 381, y1: 368 },
    { x0: 424, y0: 245, x1: 545, y1: 368 },
    { x0: 96, y0: 407, x1: 217, y1: 530 },
    { x0: 260, y0: 407, x1: 381, y1: 530 },
    { x0: 424, y0: 407, x1: 545, y1: 530 },
  ],
} as const
export const RESIDENT_IDS = ['deepseek', 'claude', 'chatgpt', 'gemini', 'kimi', 'grok'] as const
export type ResidentId = typeof RESIDENT_IDS[number]
export type PresenceStatus = 'idle' | 'running' | 'waiting'
export type Presence = { id: string; name: string; status: PresenceStatus; activeSessions: number }
export type Point = { x: number; y: number }
export type Bounds = Point & { width: number; height: number }
export type Resident = Presence & Point & {
  node: string; route: string[]; destination: string; waitUntil: number; visits: number
}
export type RoomKind = 'dorm' | 'office' | 'lounge' | 'observatory'
export type WorkshopRoom = Bounds & {
  id: string; kind: RoomKind; characterId?: ResidentId; atlasIndex: number
  label: string; door: Point; doors: Point[]
}
export type WorkshopStation = Bounds & {
  id: ResidentId; walkPoint: Point; tableBounds: Bounds
}
export type PropKind = 'bed' | 'bookcase' | 'window' | 'plant' | 'sofa' | 'tea' | 'telescope'
export type WorkshopProp = Bounds & { kind: PropKind; blocking: boolean }
export type WorkshopLayout = {
  ids: ResidentId[]; width: number; height: number; tileSize: number
  rooms: WorkshopRoom[]; stations: WorkshopStation[]; props: WorkshopProp[]
  nodes: Record<string, Point>; edges: Record<string, string[]>; commonDestinations: string[]
  halls: Bounds[]
}

const ROOM_SIZE = TILE_SIZE * 6
const ROW_PITCH = TILE_SIZE * 8
const WORLD_WIDTH = TILE_SIZE * 24
const FAMILY_NAMES: Record<ResidentId, string> = {
  deepseek: 'DeepSeek', claude: 'Claude', chatgpt: 'GPT', gemini: 'Gemini', kimi: 'Kimi', grok: 'Grok',
}

export function createWorkshopLayout(availableIds: readonly string[] = RESIDENT_IDS): WorkshopLayout {
  const available = new Set(availableIds.map((id) => id === 'gpt' ? 'chatgpt' : id))
  const ids = RESIDENT_IDS.filter((id) => available.has(id))
  const dormRows = Math.ceil(ids.length / 3)
  const officeY = TILE_SIZE + (dormRows ? dormRows * ROW_PITCH : TILE_SIZE * 2)
  const workRows = Math.max(1, Math.ceil(ids.length / 3))
  // Keep the complete square interior at a uniform scale for every roster size.
  const officeHeight = TILE_SIZE * 20
  const publicY = officeY + officeHeight + TILE_SIZE * 2
  const rooms: WorkshopRoom[] = [], stations: WorkshopStation[] = [], props: WorkshopProp[] = []
  const nodes: Record<string, Point> = {}, edges: Record<string, string[]> = {}, halls: Bounds[] = []
  const add = (id: string, x: number, y: number): string => {
    nodes[id] = { x, y }; edges[id] = []; return id
  }
  const link = (a: string, b: string): void => { edges[a].push(b); edges[b].push(a) }
  const prop = (kind: PropKind, x: number, y: number, width: number, height: number, blocking = true): void => {
    props.push({ kind, x, y, width, height, blocking })
  }
  for (let row = 0; row < dormRows; row++) {
    const rowIds = ids.slice(row * 3, row * 3 + 3)
    // A two-room row has a two-tile gap so both rooms remain centred on the grid.
    const gap = rowIds.length === 2 ? TILE_SIZE * 2 : TILE_SIZE
    const rowWidth = rowIds.length * ROOM_SIZE + (rowIds.length - 1) * gap
    const left = (WORLD_WIDTH - rowWidth) / 2
    rowIds.forEach((id, column) => {
      const x = left + column * (ROOM_SIZE + gap), y = TILE_SIZE + row * ROW_PITCH
      const door = { x: x + ROOM_SIZE / 2, y: y + ROOM_SIZE }
      rooms.push({ id: 'dorm-' + id, kind: 'dorm', characterId: id, x, y, width: ROOM_SIZE, height: ROOM_SIZE,
        atlasIndex: 0, label: FAMILY_NAMES[id] + ' 的房间', door, doors: [door] })
      prop('window', x + TILE_SIZE * 2, y, TILE_SIZE * 3, TILE_SIZE * 2, false)
      prop('bed', x + TILE_SIZE, y + TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE * 3)
      prop('bookcase', x + TILE_SIZE * 4, y + TILE_SIZE, TILE_SIZE, TILE_SIZE * 2)
      prop('plant', x + TILE_SIZE, y + TILE_SIZE, TILE_SIZE, TILE_SIZE)
    })
  }
  const officeDoor = { x: TILE_SIZE * 19.5, y: officeY }
  const officeBackDoor = { x: officeDoor.x, y: officeY + officeHeight }
  const office: WorkshopRoom = { id: 'office', kind: 'office', x: TILE_SIZE * 2, y: officeY,
    width: TILE_SIZE * 20, height: officeHeight, atlasIndex: 1, label: '协作工坊',
    door: officeDoor, doors: [officeDoor, officeBackDoor] }
  rooms.push(office)
  for (const [kind, x, label, atlasIndex] of [
    ['lounge', TILE_SIZE * 2, '茶水休息室', 2], ['observatory', TILE_SIZE * 13, '海底观景室', 3],
  ] as const) {
    const door = { x: x + TILE_SIZE * 4.5, y: publicY }
    rooms.push({ id: kind, kind, x, y: publicY, width: TILE_SIZE * 9, height: TILE_SIZE * 7,
      atlasIndex, label, door, doors: [door] })
    prop('window', x + TILE_SIZE * 5, publicY, TILE_SIZE * 3, TILE_SIZE * 2, false)
    if (kind === 'lounge') {
      prop('sofa', x + TILE_SIZE, publicY + TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE * 2)
      prop('tea', x + TILE_SIZE * 6, publicY + TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE * 2)
      prop('bookcase', x + TILE_SIZE, publicY + TILE_SIZE * 5, TILE_SIZE * 2, TILE_SIZE)
    } else {
      prop('telescope', x + TILE_SIZE, publicY + TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE * 2)
      prop('sofa', x + TILE_SIZE * 6, publicY + TILE_SIZE * 2, TILE_SIZE * 2, TILE_SIZE * 2)
      prop('plant', x + TILE_SIZE, publicY + TILE_SIZE * 5, TILE_SIZE, TILE_SIZE)
    }
  }
  // Every room floor and gallery uses the same 48px source tile.
  const hallRows = Math.max(1, dormRows)
  const hallXs = [...new Set([TILE_SIZE, WORLD_WIDTH - TILE_SIZE, ...rooms.flatMap((room) => room.doors.map((door) => door.x))])].sort((a, b) => a - b)
  const hallName = (row: number, x: number) => 'hall-' + row + '-' + x
  for (let row = 0; row < hallRows; row++) {
    const y = dormRows ? TILE_SIZE + row * ROW_PITCH + ROOM_SIZE + TILE_SIZE : officeY - TILE_SIZE
    halls.push({ x: 0, y: y - TILE_SIZE, width: WORLD_WIDTH, height: TILE_SIZE * 2 })
    hallXs.forEach((x, index) => {
      add(hallName(row, x), x, y)
      if (index) link(hallName(row, hallXs[index - 1]), hallName(row, x))
    })
    if (row) for (const x of [TILE_SIZE, WORLD_WIDTH - TILE_SIZE]) link(hallName(row - 1, x), hallName(row, x))
  }
  if (hallRows > 1) for (const x of [0, WORLD_WIDTH - TILE_SIZE * 2]) {
    halls.push({ x, y: TILE_SIZE + ROOM_SIZE, width: TILE_SIZE * 2, height: (hallRows - 1) * ROW_PITCH + TILE_SIZE * 2 })
  }
  for (const room of rooms) {
    if (room.kind !== 'dorm') continue
    const row = Math.floor(ids.indexOf(room.characterId!) / 3)
    add(room.id, room.door.x, room.y + TILE_SIZE * 4.5)
    add(room.id + '-door', room.door.x, room.door.y)
    link(room.id, room.id + '-door'); link(room.id + '-door', hallName(row, room.door.x))
  }
  add('work-door', officeDoor.x, officeDoor.y)
  link(hallName(hallRows - 1, officeDoor.x), 'work-door')
  add('work-entry', officeDoor.x, officeY + TILE_SIZE * 1.5)
  link('work-door', 'work-entry')
  const officeScale = office.width / OFFICE_ART.cellSize
  const stationSize = TILE_SIZE * 4
  for (let row = 0; row < workRows; row++) {
    const rowRug = OFFICE_ART.rugs[row * 3]
    // Round the shared frame origin once so empty and seated desks stay aligned.
    const stationY = Math.round(office.y + rowRug.y1 * officeScale - 20 - stationSize)
    const aisleY = stationY + stationSize + TILE_SIZE * .5
    const aisle = add('work-aisle-' + row, officeDoor.x, aisleY)
    link(row === 0 ? 'work-entry' : 'work-aisle-' + (row - 1), aisle)
    ids.slice(row * 3, row * 3 + 3).forEach((id, column) => {
      const rug = OFFICE_ART.rugs[row * 3 + column]
      const x = Math.round(office.x + (rug.x0 + rug.x1) / 2 * officeScale - stationSize / 2)
      const walkPoint = { x: x + stationSize / 2, y: aisleY }
      stations.push({ id, x, y: stationY, width: stationSize, height: stationSize, walkPoint,
        tableBounds: { x: x + TILE_SIZE * .5, y: stationY + TILE_SIZE * 1.5, width: TILE_SIZE * 3, height: TILE_SIZE * 2 } })
      add('work-' + id, walkPoint.x, walkPoint.y)
      link(aisle, 'work-' + id)
    })
  }
  add('work-back-door', officeBackDoor.x, officeBackDoor.y)
  link('work-aisle-' + (workRows - 1), 'work-back-door')
  const publicHallY = publicY - TILE_SIZE
  halls.push({ x: 0, y: publicHallY - TILE_SIZE, width: WORLD_WIDTH, height: TILE_SIZE * 2 })
  hallXs.forEach((x, index) => {
    add('public-hall-' + x, x, publicHallY)
    if (index) link('public-hall-' + hallXs[index - 1], 'public-hall-' + x)
  })
  link('work-back-door', 'public-hall-' + officeBackDoor.x)
  for (const kind of ['lounge', 'observatory'] as const) {
    const room = rooms.find((entry) => entry.kind === kind)!
    const names = kind === 'lounge' ? ['lounge-coffee', 'lounge-sofa'] : ['observatory-window', 'observatory-aquarium']
    add(kind + '-door', room.door.x, room.door.y)
    link('public-hall-' + room.door.x, kind + '-door')
    for (let index = 0; index < 2; index++) {
      const y = publicY + TILE_SIZE * (index === 0 ? 4.5 : 5.5)
      const aisle = add(names[index] + '-aisle', room.door.x, y)
      link(index === 0 ? kind + '-door' : names[0] + '-aisle', aisle)
      add(names[index], room.x + TILE_SIZE * (index === 0 ? 2.5 : 6.5), y)
      link(aisle, names[index])
    }
  }
  return { ids, width: WORLD_WIDTH, height: publicY + TILE_SIZE * 8, tileSize: TILE_SIZE,
    rooms, stations, props, nodes, edges, halls,
    commonDestinations: ['lounge-coffee', 'observatory-window', 'lounge-sofa', 'observatory-aquarium'] }
}
const DEFAULT_LAYOUT = createWorkshopLayout()
// Compatibility exports describe the complete roster; live maps pass their own layout.
export const WALK_NODES: Readonly<Record<string, Point>> = DEFAULT_LAYOUT.nodes

export function walkingRoute(from: string, to: string, layout: WorkshopLayout = DEFAULT_LAYOUT): string[] {
  const { nodes, edges } = layout
  if (!nodes[from] || !nodes[to] || from === to) return []
  const distance = new Map<string, number>([[from, 0]])
  const previous = new Map<string, string>()
  const pending = new Set(Object.keys(nodes))
  while (pending.size) {
    let current = ''
    for (const id of pending) if (!current || (distance.get(id) ?? Infinity) < (distance.get(current) ?? Infinity)) current = id
    if (current === to || !Number.isFinite(distance.get(current))) break
    pending.delete(current)
    for (const next of edges[current]) {
      if (!pending.has(next)) continue
      const cost = distance.get(current)! + Math.abs(nodes[current].x - nodes[next].x) + Math.abs(nodes[current].y - nodes[next].y)
      if (cost < (distance.get(next) ?? Infinity)) { distance.set(next, cost); previous.set(next, current) }
    }
  }
  const route: string[] = []
  let cursor = to
  while (cursor !== from) {
    route.unshift(cursor)
    const parent = previous.get(cursor)
    if (!parent) return []
    cursor = parent
  }
  return route
}

export function createResidents(names: Record<string, string>, now: number, layout: WorkshopLayout = DEFAULT_LAYOUT): Resident[] {
  return layout.ids.map((id, index) => ({
    id, name: names[id] || FAMILY_NAMES[id], status: 'idle', activeSessions: 0,
    ...layout.nodes['dorm-' + id], node: 'dorm-' + id, destination: 'dorm-' + id,
    route: [], waitUntil: now + 6000 + index * 2200, visits: 0,
  }))
}

function go(resident: Resident, destination: string, layout: WorkshopLayout): void {
  if (resident.destination === destination || !layout.nodes[destination]) return
  // Finish the current edge before turning: status changes cannot cut through walls.
  const next = resident.route[0]
  resident.route = next ? [next, ...walkingRoute(next, destination, layout)] : walkingRoute(resident.node, destination, layout)
  resident.destination = destination
}

export function syncResidents(residents: Resident[], presence: Presence[], now: number, layout: WorkshopLayout = DEFAULT_LAYOUT): void {
  for (const resident of residents) {
    const next = presence.find((item) => (item.id === 'gpt' ? 'chatgpt' : item.id) === resident.id)
    if (!next) continue
    const wasWorking = resident.status !== 'idle'
    resident.name = next.name || resident.name
    resident.status = next.status === 'running' || next.status === 'waiting' ? next.status : 'idle'
    resident.activeSessions = Number.isFinite(Number(next.activeSessions)) ? Math.max(0, Number(next.activeSessions)) : 0
    if (resident.status !== 'idle') go(resident, 'work-' + resident.id, layout)
    else if (wasWorking) { go(resident, 'dorm-' + resident.id, layout); resident.waitUntil = now + 8000 }
  }
}

export function stepResidents(residents: Resident[], elapsedSeconds: number, now: number, wander = true, layout: WorkshopLayout = DEFAULT_LAYOUT): void {
  const distance = Math.min(Math.max(elapsedSeconds, 0), .2) * 88
  residents.forEach((resident, index) => {
    if (resident.route.length) {
      const target = layout.nodes[resident.route[0]]
      if (!target) { resident.route = []; return }
      const dx = target.x - resident.x, dy = target.y - resident.y
      const remaining = Math.abs(dx) + Math.abs(dy)
      if (remaining <= distance) {
        resident.x = target.x; resident.y = target.y
        resident.node = resident.route.shift()!
        if (!resident.route.length) resident.waitUntil = now + 14000 + (index * 7 % 11) * 1000
      } else {
        resident.x += Math.sign(dx) * Math.min(Math.abs(dx), distance)
        resident.y += Math.sign(dy) * Math.min(Math.abs(dy), distance)
      }
    } else if (wander && resident.status === 'idle' && now >= resident.waitUntil) {
      resident.visits += 1
      const options = resident.visits % 2 === 0
        ? ['dorm-' + resident.id]
        : layout.commonDestinations.map((_, offset) => layout.commonDestinations[(index + resident.visits + offset) % layout.commonDestinations.length])
      const destination = options.find((id) => id !== resident.destination && !residents.some((other) => other !== resident && other.destination === id))
      if (destination) go(resident, destination, layout)
      else resident.waitUntil = now + 6000
    }
  })
}

export function residentActivity(resident: Resident): string {
  if (resident.status === 'running') return resident.route.length ? '正在前往工位' : '正在工作'
  if (resident.status === 'waiting') return resident.route.length ? '正在前往工位' : '等待你确认'
  if (resident.route.length) return '在工坊散步'
  if (resident.destination.startsWith('dorm-')) return '在房间里休息'
  if (resident.destination === 'lounge-coffee') return '在茶水间喝茶'
  if (resident.destination === 'lounge-sofa') return '在休息区放松'
  if (resident.destination === 'observatory-window') return '在舷窗前看海'
  return '在水族区看鱼'
}

export function settleResidents(residents: Resident[], layout: WorkshopLayout = DEFAULT_LAYOUT): void {
  // Reduced motion keeps status/location meaningful without playing walking loops.
  for (const resident of residents) {
    const target = layout.nodes[resident.destination]
    if (!target) continue
    Object.assign(resident, target)
    resident.node = resident.destination
    resident.route = []
  }
}
