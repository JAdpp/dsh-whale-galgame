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
  residentAtlas?: CanvasImageSource | null
  workstationAtlas?: CanvasImageSource | null; atlasColumns?: number; atlasRows?: number
  residentAnchors?: Array<Array<{ x: number; y: number }>>
}

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
  floor(ctx, assets, hall)
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
    // Small generated flower arrangements sit along the edge, off the walking axis.
    for (const x of [hall.x + 22, hall.x + hall.width / 2 - 184, hall.x + hall.width / 2 + 152, hall.x + hall.width - 54]) {
      flowerStand(ctx, assets, { x, y: hall.y + 2, width: 32, height: 40 })
    }
  } else {
    for (let y = hall.y + 36; y < hall.y + hall.height - 20; y += 96) ctx.fillRect(hall.x + hall.width / 2 - 1, y, 2, 7)
  }
  ctx.restore()
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
  }
  // Fixed room props are intentionally omitted: the full interiors already contain them.
  for (const station of layout.stations) workFrame(ctx, assets, station.id, station, 0)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = '600 13px "Microsoft YaHei", "PingFang SC", sans-serif'
  for (const room of layout.rooms) {
    const labelWidth = Math.min(room.width - 24, Math.max(116, room.label.length * 12 + 28))
    const left = room.x + (room.width - labelWidth) / 2, top = room.y - 36
    // An independent plaque above the room leaves every interior detail visible.
    ctx.fillStyle = '#5c513b24'; ctx.fillRect(left + 2, top + 3, labelWidth, 27)
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(left, top, labelWidth, 27)
    ctx.strokeStyle = '#b8a57f'; ctx.lineWidth = 1; ctx.strokeRect(left + .5, top + .5, labelWidth - 1, 26)
    ctx.fillStyle = '#5f523d'; ctx.fillText(room.label, room.x + room.width / 2, top + 14)
  }
  ctx.restore()
}
/** x/y is the ground footpoint. At a desk it is the approach square south of the table. */
export function drawResident(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, frame: number,
  status: 'idle' | 'running' | 'waiting', moving: boolean, assets: WorkshopArtAssets = {}, atDesk = false): void {
  if (atDesk && status !== 'idle' && assets.workstationAtlas) {
    const row = status === 'waiting' ? 4 : 1 + Math.floor(frame / 12) % 3
    ctx.save(); ctx.imageSmoothingEnabled = false
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
  ctx.save(); ctx.imageSmoothingEnabled = false
  // Full cells preserve each character's horns, wings, tools and tail.
  ctx.drawImage(assets.residentAtlas, column * cellWidth, row * cellHeight, cellWidth, cellHeight,
    x - anchor.x / 256 * 96, y - anchor.y / 256 * 96, 96, 96)
  ctx.restore()
}
