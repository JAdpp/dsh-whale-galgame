/** Paints the manor as one building in the deep sea: shell, gallery, rooms, furniture, desks. */
import { createWorkshopLayout, STATION_SIZE, TILE_SIZE, type Bounds, type WorkshopLayout } from './workshop-world'

export const CHARACTERS = ['deepseek', 'claude', 'chatgpt', 'gemini', 'kimi', 'grok'] as const
export const DEFAULT_NAMES: Record<string, string> = {
  deepseek: 'DeepSeek', claude: 'Claude', chatgpt: 'GPT', gpt: 'GPT', gemini: 'Gemini', kimi: 'Kimi', grok: 'Grok',
}
export type WorkshopArtAssets = {
  /** 2 × 2 sheet: workshop, lounge, observatory, gallery. */
  publicAtlas?: CanvasImageSource | null
  /** 3 × 2 sheet of themed dorms in CHARACTERS order. */
  roomAtlas?: CanvasImageSource | null
  residentAtlas?: CanvasImageSource | null; decorAtlas?: CanvasImageSource | null
  workstationAtlas?: CanvasImageSource | null
  residentAnchors?: Array<Array<{ x: number; y: number }>>
  /** Per-cell opaque bounds, normalised to 0..1 in the 3 × 2 decoration sheet. */
  decorBounds?: Bounds[]
}
export type WorkshopDecoration = { kind: number; bounds: Bounds }

// The stage palette: deep-sea navy with brass trim.
const SEA = '#0a2436', SEA_SPECK = '#11364d', SEA_GLINT = '#1a4a63'
const BRASS = '#c9a45c', BRASS_DARK = '#8f7440', WALL = '#1c2f44'
const PLASTER = '#e6dcc6', PLASTER_SHADE = '#d6cab0', PANEL = '#2c4d6b', PANEL_LIGHT = '#3a6485', SKIRTING = '#16283a'
const CARPET = '#27496f', CARPET_MOTIF = '#3a6796', CARPET_TRIM = '#d7b66c'
const SHELL = 12
/** Height of the visible north wall above the gallery floor. */
export const WALL_FACE = TILE_SIZE * 2

function imageSize(image: CanvasImageSource): { width: number; height: number } {
  const source = image as any
  return { width: Number(source.naturalWidth || source.videoWidth || source.width) || 0,
    height: Number(source.naturalHeight || source.videoHeight || source.height) || 0 }
}

function grow(rect: Bounds, by: number): Bounds {
  return { x: rect.x - by, y: rect.y - by, width: rect.width + by * 2, height: rect.height + by * 2 }
}

function cell(ctx: CanvasRenderingContext2D, image: CanvasImageSource, index: number, columns: number, rows: number, target: Bounds): void {
  const size = imageSize(image)
  if (!size.width || !size.height) return
  const width = size.width / columns, height = size.height / rows
  ctx.drawImage(image, index % columns * width, Math.floor(index / columns) * height, width, height,
    target.x, target.y, target.width, target.height)
}

function sea(ctx: CanvasRenderingContext2D, layout: WorkshopLayout): void {
  ctx.fillStyle = SEA
  ctx.fillRect(0, 0, layout.width, layout.height)
  // Fixed pseudo-random motes so the water has texture without animating.
  let seed = 7
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let index = 0; index < layout.width * layout.height / 5200; index++) {
    const x = Math.floor(next() * layout.width / 2) * 2, y = Math.floor(next() * layout.height / 2) * 2
    const glint = next() > .82
    ctx.fillStyle = glint ? SEA_GLINT : SEA_SPECK
    ctx.fillRect(x, y, glint ? 2 : 4, 2)
  }
  // Slanted light shafts from the surface, stepped in 4px rows to stay on the pixel grid.
  ctx.fillStyle = 'rgba(120,190,225,.045)'
  for (const [start, width] of [[.08, 70], [.2, 34], [.74, 90], [.9, 40]] as const) {
    for (let y = 0; y < layout.height; y += 4) ctx.fillRect(Math.round((layout.width * start - y * .22) / 2) * 2, y, width, 4)
  }
  // Kelp rises from the sea floor, thickest toward the two bottom corners.
  for (let index = 0; index < 46; index++) {
    const side = index % 2 ? 1 : -1, spread = next() ** 1.7 * layout.width * .34
    const x = Math.round((side < 0 ? 24 + spread : layout.width - 24 - spread) / 4) * 4
    const height = 60 + Math.floor(next() * 220), phase = next() * 6
    ctx.fillStyle = next() > .5 ? '#0f3f4a' : '#13515a'
    for (let step = 0; step < height; step += 8) {
      const sway = Math.round(Math.sin(step / 26 + phase) * 6 / 2) * 2
      ctx.fillRect(x + sway, layout.height - step - 8, step > height - 24 ? 4 : 6, 8)
    }
  }
  // A few rising bubble trails.
  ctx.fillStyle = '#2a6b86'
  for (let index = 0; index < 10; index++) {
    const x = Math.round(next() * layout.width / 2) * 2, bottom = layout.height * (.55 + next() * .4)
    for (let bubble = 0; bubble < 5; bubble++) {
      const size = bubble % 2 ? 4 : 6, y = Math.round(bottom - bubble * (26 + next() * 18))
      const drift = Math.round(Math.sin(bubble * 1.7 + index) * 6)
      ctx.fillRect(x + drift, y, size, 2); ctx.fillRect(x + drift, y + size - 2, size, 2)
      ctx.fillRect(x + drift - 2, y + 2, 2, size - 4); ctx.fillRect(x + drift + size, y + 2, 2, size - 4)
    }
  }
}

/** Rectangles whose union is the building's footprint. */
export function buildingFootprint(layout: WorkshopLayout): Bounds[] {
  const footprint: Bounds[] = layout.halls.map((hall) => ({ x: hall.x, y: hall.y - WALL_FACE, width: hall.width, height: hall.height + WALL_FACE }))
  const dorms = layout.rooms.filter((room) => room.kind === 'dorm')
  if (dorms.length) {
    const left = Math.min(...dorms.map((room) => room.x)), right = Math.max(...dorms.map((room) => room.x + room.width))
    footprint.push({ x: left, y: dorms[0].y, width: right - left, height: dorms[0].height })
  }
  const commons = layout.rooms.filter((room) => room.kind === 'lounge' || room.kind === 'observatory')
  if (commons.length) {
    // One solid wing from the lounge to the observatory; the workshop extends below it.
    const left = Math.min(...commons.map((room) => room.x)), right = Math.max(...commons.map((room) => room.x + room.width))
    footprint.push({ x: left, y: commons[0].y, width: right - left, height: commons[0].height })
  }
  for (const room of layout.rooms) if (room.kind === 'office') footprint.push(room)
  return footprint
}

function shell(ctx: CanvasRenderingContext2D, layout: WorkshopLayout): void {
  const footprint = buildingFootprint(layout)
  ctx.fillStyle = 'rgba(2,10,18,.45)'
  for (const part of footprint) { const rect = grow(part, SHELL); ctx.fillRect(rect.x + 6, rect.y + 12, rect.width, rect.height) }
  // Brass first, then the wall inside it, leaves a continuous trim around the union.
  for (const [color, inset] of [[BRASS, 0], [BRASS_DARK, 2], [WALL, 4]] as const) {
    ctx.fillStyle = color
    for (const part of footprint) { const rect = grow(part, SHELL - inset); ctx.fillRect(rect.x, rect.y, rect.width, rect.height) }
  }
}

function marble(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, rect: Bounds): void {
  if (!assets.publicAtlas) { ctx.fillStyle = '#e9e1d2'; ctx.fillRect(rect.x, rect.y, rect.width, rect.height); return }
  const size = imageSize(assets.publicAtlas)
  const width = size.width / 2, height = size.height / 2
  ctx.save()
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip()
  // Cell 3 is a complete gallery; sample its clean lower-central marble at a square scale.
  for (let y = rect.y; y < rect.y + rect.height; y += TILE_SIZE) {
    for (let x = rect.x; x < rect.x + rect.width; x += TILE_SIZE) {
      ctx.drawImage(assets.publicAtlas, width * 1.44, height * 1.64, width * .06, height * .06, x, y, TILE_SIZE, TILE_SIZE)
    }
  }
  ctx.restore()
}

function wallFace(ctx: CanvasRenderingContext2D, hall: Bounds): void {
  const top = hall.y - WALL_FACE, rail = top + 58
  ctx.fillStyle = PLASTER; ctx.fillRect(hall.x, top, hall.width, 58)
  ctx.fillStyle = PLASTER_SHADE; ctx.fillRect(hall.x, top + 50, hall.width, 8)
  ctx.fillStyle = BRASS; ctx.fillRect(hall.x, top, hall.width, 4)
  ctx.fillStyle = BRASS_DARK; ctx.fillRect(hall.x, top + 4, hall.width, 2)
  ctx.fillStyle = PANEL; ctx.fillRect(hall.x, rail, hall.width, WALL_FACE - 58)
  ctx.fillStyle = BRASS; ctx.fillRect(hall.x, rail, hall.width, 3)
  // Wainscot panels on the tile grid.
  ctx.fillStyle = PANEL_LIGHT
  for (let x = hall.x; x < hall.x + hall.width; x += TILE_SIZE) {
    const width = Math.min(TILE_SIZE, hall.x + hall.width - x) - 12
    if (width < 8) continue
    ctx.fillRect(x + 6, rail + 9, width, 2); ctx.fillRect(x + 6, hall.y - 12, width, 2)
    ctx.fillRect(x + 6, rail + 9, 2, hall.y - rail - 19); ctx.fillRect(x + 4 + width, rail + 9, 2, hall.y - rail - 19)
  }
  ctx.fillStyle = SKIRTING; ctx.fillRect(hall.x, hall.y - 5, hall.width, 5)
  // The wall's shadow falls onto the floor.
  ctx.fillStyle = 'rgba(20,30,45,.16)'; ctx.fillRect(hall.x, hall.y, hall.width, 6)
}

function carpetStrip(ctx: CanvasRenderingContext2D, rect: Bounds): void {
  ctx.fillStyle = CARPET; ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
  ctx.fillStyle = CARPET_TRIM
  const horizontal = rect.width >= rect.height
  if (horizontal) {
    ctx.fillRect(rect.x, rect.y + 3, rect.width, 2); ctx.fillRect(rect.x, rect.y + rect.height - 5, rect.width, 2)
    ctx.fillRect(rect.x + 3, rect.y + 3, 2, rect.height - 6); ctx.fillRect(rect.x + rect.width - 5, rect.y + 3, 2, rect.height - 6)
  } else {
    ctx.fillRect(rect.x + 3, rect.y, 2, rect.height); ctx.fillRect(rect.x + rect.width - 5, rect.y, 2, rect.height)
  }
  ctx.fillStyle = CARPET_MOTIF
  if (horizontal) for (let x = rect.x + 24; x < rect.x + rect.width - 12; x += 24) ctx.fillRect(x - 2, rect.y + rect.height / 2 - 2, 4, 4)
  else for (let y = rect.y + 16; y < rect.y + rect.height - 8; y += 24) ctx.fillRect(rect.x + rect.width / 2 - 2, y - 2, 4, 4)
}

/** A runner along the walking line with a short branch to every door. */
function carpet(ctx: CanvasRenderingContext2D, layout: WorkshopLayout, hall: Bounds): void {
  const walkY = hall.y + hall.height / 2, half = 22
  for (const room of layout.rooms) for (const door of room.doors) {
    const up = door.y <= walkY
    carpetStrip(ctx, { x: door.x - half, y: up ? hall.y : walkY + half - 6, width: half * 2, height: up ? walkY - half + 6 - hall.y : hall.y + hall.height - walkY - half + 6 })
  }
  carpetStrip(ctx, { x: hall.x + 20, y: walkY - half, width: hall.width - 40, height: half * 2 })
  // Open the runner's trim where a branch joins it.
  ctx.fillStyle = CARPET
  for (const room of layout.rooms) for (const door of room.doors) {
    ctx.fillRect(door.x - half + 5, door.y <= walkY ? walkY - half : walkY + half - 6, half * 2 - 10, 6)
  }
}

/** A low wall closes the gallery's south side, open only at the doors. */
function southWall(ctx: CanvasRenderingContext2D, layout: WorkshopLayout, hall: Bounds): void {
  const y = hall.y + hall.height - 8
  const doors = layout.rooms.flatMap((room) => room.doors).filter((door) => door.y > hall.y + hall.height / 2)
    .map((door) => door.x).sort((a, b) => a - b)
  let from = hall.x
  for (const to of [...doors.map((x) => x - 26), hall.x + hall.width]) {
    if (to > from) {
      ctx.fillStyle = WALL; ctx.fillRect(from, y, to - from, 8)
      ctx.fillStyle = BRASS; ctx.fillRect(from, y, to - from, 2)
    }
    from = to + 52
  }
}

// Decoration kinds, in atlas order.
const PLANT = 0, FLOWERS = 1, LAMP = 2, BOOKCASE = 3, BENCH = 4, GLOBE = 5
type DecorPiece = { kind: number; dx: number; dy?: number }
// Furniture stands against the gallery's north wall as small scenes.
// Offsets are from the scene's centre; pieces share one floor line unless dy is set.
const DECOR_SCENES: Record<string, DecorPiece[]> = {
  lounge: [{ kind: PLANT, dx: -122 }, { kind: BENCH, dx: 0 }, { kind: LAMP, dx: 100, dy: -6 }],
  study: [{ kind: LAMP, dx: -112, dy: -6 }, { kind: BOOKCASE, dx: -48 }, { kind: GLOBE, dx: 50 }],
  seat: [{ kind: BENCH, dx: -18 }, { kind: LAMP, dx: 82, dy: -6 }],
  shelf: [{ kind: BOOKCASE, dx: -44 }, { kind: GLOBE, dx: 48 }],
  plant: [{ kind: PLANT, dx: 0 }],
  flowers: [{ kind: FLOWERS, dx: 0 }],
  lamp: [{ kind: LAMP, dx: 0, dy: -6 }],
}
const DECOR_LIMITS = [[82, 112], [60, 82], [46, 124], [80, 96], [144, 100], [88, 108]]

function decorationFrame(frames: readonly Bounds[], index: number): Bounds {
  const frame = frames[index]
  return frame && [frame.x, frame.y, frame.width, frame.height].every(Number.isFinite)
    && frame.x >= 0 && frame.y >= 0 && frame.width > 0 && frame.height > 0
    && frame.x + frame.width <= 1.001 && frame.y + frame.height <= 1.001
    ? frame : { x: 0, y: 0, width: 1, height: 1 }
}

function overlaps(a: Bounds, b: Bounds, padding = 0): boolean {
  return a.x < b.x + b.width + padding && a.x + a.width > b.x - padding
    && a.y < b.y + b.height + padding && a.y + a.height > b.y - padding
}

/**
 * Deterministic, inspectable placement. Everything leans on the gallery's north wall:
 * a lamp on each pier between dorms, and a sitting corner and a study corner on the
 * free wall either side of the dorm row. Furniture never changes the walking graph.
 */
export function workshopDecorations(layout: WorkshopLayout, frames: readonly Bounds[] = []): WorkshopDecoration[] {
  const hall = layout.halls[0]
  if (!hall) return []
  const navigation: Bounds[] = []
  for (const [from, neighbors] of Object.entries(layout.edges)) for (const to of neighbors) {
    if (from > to) continue
    const a = layout.nodes[from], b = layout.nodes[to]
    navigation.push({ x: Math.min(a.x, b.x) - 18, y: Math.min(a.y, b.y) - 18,
      width: Math.abs(a.x - b.x) + 36, height: Math.abs(a.y - b.y) + 36 })
  }
  const decorations: WorkshopDecoration[] = []
  const floor = hall.y + 32
  // A scene is placed whole or not at all, so no stray half-arrangements remain.
  const place = (scene: string, x: number): void => {
    const placed: WorkshopDecoration[] = []
    for (const piece of DECOR_SCENES[scene]) {
      const frame = decorationFrame(frames, piece.kind)
      const [maxWidth, maxHeight] = DECOR_LIMITS[piece.kind]
      const scale = Math.min(maxWidth / frame.width, maxHeight / frame.height)
      const width = frame.width * scale, height = frame.height * scale
      const bounds = { x: x + piece.dx - width / 2, y: floor + (piece.dy || 0) - height, width, height }
      if (bounds.x < hall.x + 4 || bounds.x + width > hall.x + hall.width - 4
        || layout.rooms.some((room) => overlaps(bounds, room))
        || navigation.some((edge) => overlaps(bounds, edge))
        || decorations.some((other) => overlaps(bounds, other.bounds, 8))) return
      placed.push({ kind: piece.kind, bounds })
    }
    decorations.push(...placed)
  }
  const dorms = layout.rooms.filter((room) => room.kind === 'dorm').sort((a, b) => a.x - b.x)
  for (let index = 1; index < dorms.length; index++) {
    const from = dorms[index - 1].x + dorms[index - 1].width
    place('lamp', (from + dorms[index].x) / 2)
  }
  const left = dorms.length ? dorms[0].x : hall.x + hall.width / 2
  const right = dorms.length ? dorms[dorms.length - 1].x + dorms[dorms.length - 1].width : hall.x + hall.width / 2
  const ends: Array<[number, number, string, string]> = [
    [hall.x, left, 'lounge', 'seat'], [right, hall.x + hall.width, 'study', 'shelf'],
  ]
  for (const [from, to, wide, narrow] of ends) {
    const room = to - from
    if (room >= 340) place(wide, (from + to) / 2)
    else if (room >= 240) place(narrow, (from + to) / 2)
    else if (room >= 96) place('plant', (from + to) / 2)
  }
  // Paint back to front so pieces in a scene overlap naturally.
  return decorations.sort((a, b) => a.bounds.y + a.bounds.height - b.bounds.y - b.bounds.height)
}

function scenery(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, layout: WorkshopLayout): void {
  if (!assets.decorAtlas) return
  const size = imageSize(assets.decorAtlas)
  if (!size.width || !size.height) return
  const width = size.width / 3, height = size.height / 2
  for (const target of workshopDecorations(layout, assets.decorBounds)) {
    const { bounds } = target
    // A soft contact shadow seats the piece on the floor.
    ctx.fillStyle = 'rgba(20,30,45,.2)'
    ctx.beginPath(); ctx.ellipse(bounds.x + bounds.width / 2, bounds.y + bounds.height - 3, bounds.width * .44, 5, 0, 0, Math.PI * 2); ctx.fill()
    const frame = decorationFrame(assets.decorBounds || [], target.kind)
    ctx.drawImage(assets.decorAtlas, (target.kind % 3 + frame.x) * width,
      (Math.floor(target.kind / 3) + frame.y) * height, frame.width * width, frame.height * height,
      bounds.x, bounds.y, bounds.width, bounds.height)
  }
}

function workFrame(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, id: string,
  bounds: Bounds, row: number): void {
  if (!assets.workstationAtlas) return
  const column = CHARACTERS.indexOf((id === 'gpt' ? 'chatgpt' : id) as typeof CHARACTERS[number])
  if (column < 0) return
  cell(ctx, assets.workstationAtlas, row * 6 + column, 6, 5, bounds)
}

export function drawWorkshop(ctx: CanvasRenderingContext2D, layout: WorkshopLayout = createWorkshopLayout(), assets: WorkshopArtAssets = {}): void {
  ctx.save()
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  sea(ctx, layout)
  shell(ctx, layout)
  for (const hall of layout.halls) {
    marble(ctx, assets, hall)
    wallFace(ctx, hall)
    carpet(ctx, layout, hall)
    southWall(ctx, layout, hall)
  }
  for (const room of layout.rooms) {
    if (room.kind === 'dorm') {
      const index = CHARACTERS.indexOf(room.characterId as typeof CHARACTERS[number])
      if (assets.roomAtlas && index >= 0) cell(ctx, assets.roomAtlas, index, 3, 2, room)
    } else if (assets.publicAtlas) {
      cell(ctx, assets.publicAtlas, room.kind === 'office' ? 0 : room.kind === 'lounge' ? 1 : 2, 2, 2, room)
    }
  }
  scenery(ctx, assets, layout)
  for (const station of layout.stations) workFrame(ctx, assets, station.id, station, 0)
  ctx.restore()
}

/** x/y is the ground footpoint. At a desk it is the approach square south of the table. */
export function drawResident(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, frame: number,
  status: 'idle' | 'running' | 'waiting', moving: boolean, assets: WorkshopArtAssets = {}, atDesk = false): void {
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  if (atDesk && status !== 'idle' && assets.workstationAtlas) {
    const row = status === 'waiting' ? 4 : 1 + Math.floor(frame / 12) % 3
    workFrame(ctx, assets, id, { x: x - STATION_SIZE / 2, y: y - STATION_SIZE - TILE_SIZE * .5,
      width: STATION_SIZE, height: STATION_SIZE }, row)
  } else if (assets.residentAtlas) {
    const column = CHARACTERS.indexOf((id === 'gpt' ? 'chatgpt' : id) as typeof CHARACTERS[number])
    const row = moving ? 1 + Math.floor(frame / 8) % 2 : status === 'idle' ? 0 : 3
    const anchor = assets.residentAnchors?.[row]?.[column] || { x: 128, y: 248 }
    // Full cells preserve each character's horns, wings, tools and tail.
    if (column >= 0) cell(ctx, assets.residentAtlas, row * 6 + column, 6, 4,
      { x: x - anchor.x / 256 * 96, y: y - anchor.y / 256 * 96, width: 96, height: 96 })
  }
  ctx.restore()
}
