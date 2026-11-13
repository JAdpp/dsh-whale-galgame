/** Complete generated interiors with a separately furnished, navigable workshop. */
import { createWorkshopLayout, TILE_SIZE, type Bounds, type WorkshopLayout, type WorkshopRoom } from './workshop-world'

export const MAP_WIDTH = 1152
export const MAP_HEIGHT = createWorkshopLayout().height
export const CHARACTERS = ['deepseek', 'claude', 'chatgpt', 'gemini', 'kimi', 'grok'] as const
export const CHARACTER_COLORS: Record<string, string> = {
  deepseek: '#356eac', claude: '#b16a43', chatgpt: '#378a75', gpt: '#378a75',
  gemini: '#8662ab', kimi: '#6074a2', grok: '#80624f',
}
export const DEFAULT_NAMES: Record<string, string> = {
  deepseek: 'DeepSeek', claude: 'Claude', chatgpt: 'GPT', gpt: 'GPT', gemini: 'Gemini', kimi: 'Kimi', grok: 'Grok',
}
export type WorkshopArtAssets = {
  atlas?: CanvasImageSource | null; roomAtlas?: CanvasImageSource | null; publicAtlas?: CanvasImageSource | null
  residentAtlas?: CanvasImageSource | null; decorAtlas?: CanvasImageSource | null
  workstationAtlas?: CanvasImageSource | null; atlasColumns?: number; atlasRows?: number
  residentAnchors?: Array<Array<{ x: number; y: number }>>
  /** Per-cell opaque bounds, normalised to 0..1 in the 3×2 decoration sheet. */
  decorBounds?: Bounds[]
}
export type WorkshopDecoration = { kind: number; bounds: Bounds }

type MaterialPatch = { cell: number; x: number; y: number; width: number; height: number }
const MATERIALS = {
  floor: { cell: 3, x: 480, y: 830, width: 64, height: 64 },
  wall: { cell: 0, x: 656, y: 972, width: 128, height: 44 },
} satisfies Record<string, MaterialPatch>

function imageSize(image: CanvasImageSource): { width: number; height: number } {
  const source = image as any
  return { width: Number(source.naturalWidth || source.videoWidth || source.width) || 0,
    height: Number(source.naturalHeight || source.videoHeight || source.height) || 0 }
}

function publicInteriorImage(assets: WorkshopArtAssets): CanvasImageSource | null {
  // The production map-atlas key is the new 2×2 public-interior sheet.
  // Older callers can still provide the archived 3×2 sheet separately.
  return assets.publicAtlas || (assets.atlasColumns === 2 && assets.atlasRows === 2 ? assets.atlas || null : null)
}

function material(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, patch: MaterialPatch,
  target: Bounds, sourceX = 0, sourceY = 0, sourceWidth = 1, sourceHeight = 1): void {
  if (!assets.atlas || target.width <= 0 || target.height <= 0) return
  const size = imageSize(assets.atlas)
  if (!size.width || !size.height) return
  const columns = assets.atlasColumns || 3, rows = assets.atlasRows || 2
  const cellWidth = size.width / columns, cellHeight = size.height / rows
  const sx = (patch.cell % columns) * cellWidth + (patch.x + patch.width * sourceX) / 1024 * cellWidth
  const sy = Math.floor(patch.cell / columns) * cellHeight + (patch.y + patch.height * sourceY) / 1024 * cellHeight
  ctx.drawImage(assets.atlas, sx, sy, patch.width / 1024 * cellWidth * sourceWidth,
    patch.height / 1024 * cellHeight * sourceHeight, target.x, target.y, target.width, target.height)
}

function completeRoom(ctx: CanvasRenderingContext2D, image: CanvasImageSource, index: number,
  room: Bounds, columns = 3, rows = 2): void {
  const size = imageSize(image)
  if (!size.width || !size.height) return
  const width = size.width / columns, height = size.height / rows
  ctx.drawImage(image, index % columns * width, Math.floor(index / columns) * height, width, height,
    room.x, room.y, room.width, room.height)
}

function floor(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, rect: Bounds): void {
  const publicAtlas = publicInteriorImage(assets)
  const publicSize = publicAtlas ? imageSize(publicAtlas) : null
  const publicWidth = publicSize ? publicSize.width / 2 : 0, publicHeight = publicSize ? publicSize.height / 2 : 0
  ctx.save()
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip()
  for (let y = Math.floor(rect.y / TILE_SIZE) * TILE_SIZE; y < rect.y + rect.height; y += TILE_SIZE) {
    for (let x = Math.floor(rect.x / TILE_SIZE) * TILE_SIZE; x < rect.x + rect.width; x += TILE_SIZE) {
      if (publicAtlas) {
        // Cell 3 is a complete gallery. Sample its clean lower-central marble,
        // away from the central star and border ornaments; every
        // corridor keeps a square material scale rather than a flattened room.
        if (publicWidth && publicHeight) ctx.drawImage(publicAtlas, publicWidth * 1.44, publicHeight * 1.64,
          publicWidth * .06, publicHeight * .06, x, y, TILE_SIZE, TILE_SIZE)
      } else material(ctx, assets, MATERIALS.floor, { x, y, width: TILE_SIZE, height: TILE_SIZE })
    }
  }
  ctx.restore()
}

function wallRow(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, room: WorkshopRoom, y: number, boundary: number): void {
  const doors = room.doors.filter((door) => door.y === boundary)
  for (let x = room.x; x < room.x + room.width; x += TILE_SIZE) {
    let pieces = [{ start: x, end: x + TILE_SIZE }]
    for (const door of doors) {
      const from = door.x - TILE_SIZE, to = door.x + TILE_SIZE
      pieces = pieces.flatMap((piece) => {
        if (piece.end <= from || piece.start >= to) return [piece]
        return [{ start: piece.start, end: Math.min(piece.end, from) }, { start: Math.max(piece.start, to), end: piece.end }]
          .filter((part) => part.end > part.start)
      })
    }
    for (const piece of pieces) material(ctx, assets, MATERIALS.wall,
      { x: piece.start, y, width: piece.end - piece.start, height: TILE_SIZE },
      (piece.start - x) / TILE_SIZE, 0, (piece.end - piece.start) / TILE_SIZE, 1)
  }
}

function walls(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, room: WorkshopRoom): void {
  for (let y = room.y + TILE_SIZE; y < room.y + room.height - TILE_SIZE; y += TILE_SIZE) {
    for (const x of [room.x, room.x + room.width - TILE_SIZE]) {
      ctx.save(); ctx.translate(x + TILE_SIZE, y); ctx.rotate(Math.PI / 2)
      material(ctx, assets, MATERIALS.wall, { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE })
      ctx.restore()
    }
  }
  wallRow(ctx, assets, room, room.y, room.y)
  wallRow(ctx, assets, room, room.y + room.height - TILE_SIZE, room.y + room.height)
}

function flowerStand(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, target: Bounds): void {
  if (!assets.workstationAtlas) return
  const size = imageSize(assets.workstationAtlas)
  if (!size.width || !size.height) return
  const width = size.width / 6, height = size.height / 5
  // The empty DeepSeek desk has an isolated blue hydrangea on transparent pixels.
  // Reusing that arrangement avoids rectangular room-background scraps in the gallery.
  ctx.drawImage(assets.workstationAtlas, width * .14, height * .30, width * .25, height * .38,
    target.x, target.y, target.width, target.height)
}

function gallery(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, hall: Bounds): void {
  ctx.save()
  ctx.beginPath(); ctx.rect(hall.x, hall.y, hall.width, hall.height); ctx.clip()
  const horizontal = hall.width > hall.height
  // Inlaid metal rails make the gallery a designed connection rather than spare floor.
  ctx.strokeStyle = '#9f8964'; ctx.lineWidth = 2
  ctx.strokeRect(hall.x + 5, hall.y + 5, hall.width - 10, hall.height - 10)
  ctx.strokeStyle = '#e4d5ae'; ctx.lineWidth = 1
  ctx.strokeRect(hall.x + 9, hall.y + 9, hall.width - 18, hall.height - 18)
  ctx.fillStyle = '#c2aa7a'
  if (horizontal) {
    for (let x = hall.x + 36; x < hall.x + hall.width - 20; x += 96) ctx.fillRect(x, hall.y + hall.height / 2 - 1, 7, 2)
  } else {
    for (let y = hall.y + 36; y < hall.y + hall.height - 20; y += 96) ctx.fillRect(hall.x + hall.width / 2 - 1, y, 2, 7)
  }
  ctx.restore()
}

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

// Decoration kinds, in atlas order.
const PLANT = 0, FLOWERS = 1, LAMP = 2, BOOKCASE = 3, BENCH = 4, GLOBE = 5
type DecorPiece = { kind: number; dx: number; dy?: number; maxWidth?: number }
// Furniture is composed into small scenes instead of being spaced along the edges.
// Offsets are from the scene's centre; every piece shares one floor line unless dy is set.
const DECOR_SCENES: Record<string, DecorPiece[]> = {
  lounge: [{ kind: PLANT, dx: -122 }, { kind: BENCH, dx: 0 }, { kind: LAMP, dx: 100, dy: -8 }],
  study: [{ kind: LAMP, dx: -112, dy: -8 }, { kind: BOOKCASE, dx: -48 }, { kind: GLOBE, dx: 50 }],
  seat: [{ kind: BENCH, dx: -18 }, { kind: LAMP, dx: 82, dy: -8 }],
  shelf: [{ kind: BOOKCASE, dx: -44 }, { kind: GLOBE, dx: 48 }],
}
const DECOR_LIMITS = [[82, 112], [60, 82], [46, 128], [80, 96], [144, 100], [88, 108]]

/** Deterministic, inspectable placement; furniture never changes the walking graph. */
export function workshopDecorations(layout: WorkshopLayout, frames: readonly Bounds[] = []): WorkshopDecoration[] {
  const navigation: Bounds[] = []
  for (const [from, neighbors] of Object.entries(layout.edges)) for (const to of neighbors) {
    if (from > to) continue
    const a = layout.nodes[from], b = layout.nodes[to]
    navigation.push({ x: Math.min(a.x, b.x) - 18, y: Math.min(a.y, b.y) - 18,
      width: Math.abs(a.x - b.x) + 36, height: Math.abs(a.y - b.y) + 36 })
  }
  const doors = layout.rooms.flatMap((room) => room.doors.map((door) => ({ x: door.x - 60, y: door.y - 32, width: 120, height: 64 })))
  const decorations: WorkshopDecoration[] = []
  const fit = (piece: DecorPiece, x: number, y: number): WorkshopDecoration | null => {
    const frame = decorationFrame(frames, piece.kind)
    const [limitWidth, maxHeight] = DECOR_LIMITS[piece.kind]
    const scale = Math.min(Math.min(limitWidth, piece.maxWidth || limitWidth) / frame.width, maxHeight / frame.height)
    const width = frame.width * scale, height = frame.height * scale
    const bounds = { x: x + piece.dx - width / 2, y: y + (piece.dy || 0) - height, width, height }
    if (bounds.x < 8 || bounds.y < 8 || bounds.x + width > layout.width - 8 || bounds.y + height > layout.height - 8) return null
    if (layout.rooms.some((room) => overlaps(bounds, room, 6))
      || layout.stations.some((station) => overlaps(bounds, station, 8))
      || doors.some((door) => overlaps(bounds, door))
      || navigation.some((edge) => overlaps(bounds, edge))
      || decorations.some((other) => overlaps(bounds, other.bounds, 8))) return null
    return { kind: piece.kind, bounds }
  }
  // A scene is placed whole or not at all, so no stray half-arrangements remain.
  const place = (pieces: DecorPiece[], x: number, y: number): boolean => {
    const placed: WorkshopDecoration[] = []
    for (const piece of pieces) {
      const item = fit(piece, x, y)
      if (!item) return false
      placed.push(item)
    }
    decorations.push(...placed)
    return true
  }

  const rowYs = [...new Set(layout.rooms.filter((room) => room.kind === 'dorm').map((room) => room.y))].sort((a, b) => a - b)
  rowYs.forEach((y, row) => {
    const rooms = layout.rooms.filter((room) => room.kind === 'dorm' && room.y === y).sort((a, b) => a.x - b.x)
    const floor = y + rooms[0].height - 30
    const left = rooms[0].x, right = layout.width - (rooms[rooms.length - 1].x + rooms[rooms.length - 1].width)
    // The two ends of a row get different scenes, and alternate rows swap them.
    const wide = row % 2 ? ['study', 'lounge'] : ['lounge', 'study']
    const narrow = row % 2 ? ['shelf', 'seat'] : ['seat', 'shelf']
    const ends: Array<[number, number, number]> = [[left / 2, left, 0], [layout.width - right / 2, right, 1]]
    for (const [x, room, side] of ends) {
      if (room >= 380) place(DECOR_SCENES[wide[side]], x, floor)
      else if (room >= 200) place(DECOR_SCENES[narrow[side]], x, floor)
      else if (room >= 90) place([{ kind: PLANT, dx: 0 }], x, y + rooms[0].height * .6)
    }
    // Neighbours share one piece between their doors rather than a stack of props.
    for (let index = 1; index < rooms.length; index++) {
      const from = rooms[index - 1].x + rooms[index - 1].width, gap = rooms[index].x - from
      if (gap >= 90) place([{ kind: FLOWERS, dx: 0 }], from + gap / 2, floor)
      else if (gap >= 40) place([{ kind: LAMP, dx: 0, maxWidth: gap - 16 }], from + gap / 2, floor)
    }
  })

  const office = layout.rooms.find((room) => room.kind === 'office')
  if (office) {
    // Nobody walks beside the workshop: a quiet, even line of lamps reads as a lit gallery.
    for (const x of [office.x / 2, layout.width - (layout.width - office.x - office.width) / 2]) {
      for (const part of [.22, .5, .78]) place([{ kind: LAMP, dx: 0 }], x, office.y + office.height * part + 64)
    }
  }

  const commons = layout.rooms.filter((room) => room.kind === 'lounge' || room.kind === 'observatory').sort((a, b) => a.x - b.x)
  if (commons.length) {
    const floor = commons[0].y + commons[0].height * .62
    const first = commons[0], last = commons[commons.length - 1]
    place([{ kind: PLANT, dx: 0 }], first.x / 2, floor)
    place([{ kind: PLANT, dx: 0 }], layout.width - (layout.width - last.x - last.width) / 2, floor)
    for (let index = 1; index < commons.length; index++) {
      const from = commons[index - 1].x + commons[index - 1].width, gap = commons[index].x - from
      if (gap >= 60) place([{ kind: GLOBE, dx: 0, maxWidth: gap - 16 }], from + gap / 2, floor)
    }
  }
  // Paint back to front so pieces in a scene overlap naturally.
  return decorations.sort((a, b) => a.bounds.y + a.bounds.height - b.bounds.y - b.bounds.height)
}

function scenery(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, layout: WorkshopLayout): void {
  const targets = workshopDecorations(layout, assets.decorBounds)
  const size = assets.decorAtlas ? imageSize(assets.decorAtlas) : null
  for (const target of targets) {
    if (assets.decorAtlas && size?.width && size.height) {
      const frame = decorationFrame(assets.decorBounds || [], target.kind)
      const width = size.width / 3, height = size.height / 2
      ctx.drawImage(assets.decorAtlas, (target.kind % 3 + frame.x) * width,
        (Math.floor(target.kind / 3) + frame.y) * height, frame.width * width, frame.height * height,
        target.bounds.x, target.bounds.y, target.bounds.width, target.bounds.height)
    } else if (target.kind === 1) flowerStand(ctx, assets, target.bounds)
  }
}

function officeInterior(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, office: WorkshopRoom): void {
  const publicAtlas = publicInteriorImage(assets)
  if (publicAtlas) {
    completeRoom(ctx, publicAtlas, 0, office, 2, 2)
    return
  }
  // Compatibility while the optional public-interior pack is unavailable.
  // Desk furniture comes only from workstationAtlas, never a second room crop.
  floor(ctx, assets, office)
  walls(ctx, assets, office)
}

function workFrame(ctx: CanvasRenderingContext2D, assets: WorkshopArtAssets, id: string,
  bounds: Bounds, row: number): void {
  if (!assets.workstationAtlas) return
  const column = CHARACTERS.indexOf((id === 'gpt' ? 'chatgpt' : id) as typeof CHARACTERS[number])
  if (column < 0) return
  const size = imageSize(assets.workstationAtlas)
  if (!size.width || !size.height) return
  const cellWidth = size.width / 6, cellHeight = size.height / 5
  ctx.drawImage(assets.workstationAtlas, column * cellWidth, row * cellHeight, cellWidth, cellHeight,
    bounds.x, bounds.y, bounds.width, bounds.height)
}

export function drawWorkshop(ctx: CanvasRenderingContext2D, layout: WorkshopLayout = createWorkshopLayout(), assets: WorkshopArtAssets = {}): void {
  const publicAtlas = publicInteriorImage(assets)
  ctx.save()
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#e9eadf'
  ctx.fillRect(0, 0, layout.width, layout.height)
  if (assets.atlas || assets.roomAtlas || assets.publicAtlas) {
    // A single material covers all exterior floor, including margins and room gaps.
    floor(ctx, assets, { x: 0, y: 0, width: layout.width, height: layout.height })
    for (const hall of layout.halls) gallery(ctx, assets, hall)
    for (const room of layout.rooms) {
      if (room.kind === 'office') { officeInterior(ctx, assets, room); continue }
      const familyIndex = CHARACTERS.indexOf(room.characterId as typeof CHARACTERS[number])
      if (room.kind === 'dorm' && assets.roomAtlas && familyIndex >= 0) completeRoom(ctx, assets.roomAtlas, familyIndex, room)
      else if (room.kind !== 'dorm' && publicAtlas) completeRoom(ctx, publicAtlas,
        room.kind === 'lounge' ? 1 : 2, room, 2, 2)
      else if (assets.atlas) completeRoom(ctx, assets.atlas, room.kind === 'dorm' ? 0 : room.atlasIndex,
        room, assets.atlasColumns || 3, assets.atlasRows || 2)
    }
    scenery(ctx, assets, layout)
  }
  // Fixed room props are intentionally omitted: the full interiors already contain them.
  for (const station of layout.stations) workFrame(ctx, assets, station.id, station, 0)
  ctx.restore()
}
/** x/y is the ground footpoint. At a desk it is the approach square south of the table. */
export function drawResident(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, frame: number,
  status: 'idle' | 'running' | 'waiting', moving: boolean, assets: WorkshopArtAssets = {}, atDesk = false): void {
  if (atDesk && status !== 'idle' && assets.workstationAtlas) {
    const row = status === 'waiting' ? 4 : 1 + Math.floor(frame / 12) % 3
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    workFrame(ctx, assets, id, { x: x - TILE_SIZE * 2, y: y - TILE_SIZE * 4.5,
      width: TILE_SIZE * 4, height: TILE_SIZE * 4 }, row)
    ctx.restore()
    return
  }
  if (!assets.residentAtlas) return
  const family = id === 'gpt' ? 'chatgpt' : id
  const column = CHARACTERS.indexOf(family as typeof CHARACTERS[number])
  if (column < 0) return
  const size = imageSize(assets.residentAtlas)
  if (!size.width || !size.height) return
  const cellWidth = size.width / 6, cellHeight = size.height / 4
  const row = moving ? 1 + Math.floor(frame / 8) % 2 : status === 'idle' ? 0 : 3
  const anchor = assets.residentAnchors?.[row]?.[column] || { x: 128, y: 248 }
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  // Full cells preserve each character's horns, wings, tools and tail.
  ctx.drawImage(assets.residentAtlas, column * cellWidth, row * cellHeight, cellWidth, cellHeight,
    x - anchor.x / 256 * 96, y - anchor.y / 256 * 96, 96, 96)
  ctx.restore()
}
