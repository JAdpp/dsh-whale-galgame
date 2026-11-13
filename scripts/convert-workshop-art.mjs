// Derives the embedded WebP atlases from the PNG masters in assets/workshop and
// records their hashes (and the walking foot anchors) in manifest.json.
// sharp is not a project dependency: run `npm i --no-save sharp` first.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const { default: sharp } = await import('sharp').catch(() => {
  throw new Error('sharp is missing. Run: npm i --no-save sharp')
})
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../assets/workshop')
const manifestPath = resolve(directory, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
// Opaque room paintings compress well at high quality; sprites keep exact alpha edges.
const room = { quality: 92, effort: 6 }
const sprite = { nearLossless: true, quality: 60, effort: 6 }
const targets = {
  'public-rooms-atlas': room,
  'office-hires': room,
  'themed-rooms-atlas': room,
  'residents-atlas-builtin': sprite,
  'walk-cycle-front-back': sprite,
  'walk-cycle-side': sprite,
  'workstations-rpg-atlas': sprite,
  'decor-atlas-builtin': sprite,
}

// The generated walking sheet keeps a faint haze (alpha below ~8) outside the figures.
// Clear it so the sprites have clean edges; the PNG master stays untouched.
async function withoutHaze(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] < 24) data.fill(0, offset, offset + 4)
  }
  return { data, info }
}

// One anchor per 256px cell: y is the lowest solid row (the soles), x is the middle of the head.
// Legs spread differently in every frame of a stride, so anchoring x on the head keeps the
// body still while the feet move. Rows listed in `pairs` are the two contact frames of one
// walk and share an x.
function footAnchors({ data, info }, columns, rows, pairs) {
  const cell = info.width / columns
  const anchors = []
  for (let row = 0; row < rows; row++) {
    anchors.push([])
    for (let column = 0; column < columns; column++) {
      const solid = (x, y) => data[((row * cell + y) * info.width + column * cell + x) * 4 + 3] > 128
      let bottom = cell - 1
      while (bottom > 0 && !Array.from({ length: cell }, (_, x) => solid(x, bottom)).some(Boolean)) bottom--
      let top = 0
      while (top < bottom && !Array.from({ length: cell }, (_, x) => solid(x, top)).some(Boolean)) top++
      const xs = []
      for (let y = top; y <= top + (bottom - top) * .35; y++) for (let x = 0; x < cell; x++) if (solid(x, y)) xs.push(x)
      xs.sort((a, b) => a - b)
      anchors[row].push({ x: xs[Math.floor(xs.length / 2)] ?? cell / 2, y: bottom + 1 })
    }
  }
  for (const row of pairs) for (let column = 0; column < columns; column++) {
    const a = anchors[row][column], b = anchors[row + 1][column]
    const x = (a.x + b.x) / 2
    anchors[row][column] = { x, y: a.y }; anchors[row + 1][column] = { x, y: b.y }
  }
  return anchors
}

// Median height of the solid figures in the given rows, to match scale between sheets.
function figureHeight({ data, info }, columns, rowList) {
  const cell = info.width / columns, heights = []
  for (const row of rowList) for (let column = 0; column < columns; column++) {
    let top = cell, bottom = -1
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      if (data[((row * cell + y) * info.width + column * cell + x) * 4 + 3] > 128) { if (y < top) top = y; if (y > bottom) bottom = y }
    }
    heights.push(bottom - top + 1)
  }
  return heights.sort((a, b) => a - b)[Math.floor(heights.length / 2)]
}

// Standing height of the front-facing idle row: every walking sheet is drawn to match it.
const standing = figureHeight(await withoutHaze(resolve(directory, 'residents-atlas-builtin.png')), 6, [0])
// The front-facing passing pose is the idle row; anchor it the same way as the walking frames.
manifest.walkLayout.idleAnchors = footAnchors(await withoutHaze(resolve(directory, 'residents-atlas-builtin.png')), 6, 1, [])[0]
const walking = {
  'walk-cycle-front-back': { key: 'frontBack', pairs: [0, 2], standingRows: [0, 1, 2, 3] },
  'walk-cycle-side': { key: 'side', pairs: [0], standingRows: [2, 3] },
}
for (const [name, options] of Object.entries(targets)) {
  const file = resolve(directory, name + '.png')
  let image = sharp(readFileSync(file))
  if (walking[name]) {
    const sheet = walking[name], cleaned = await withoutHaze(file)
    manifest.walkLayout[sheet.key] = { ...manifest.walkLayout[sheet.key],
      scale: Math.round(standing / figureHeight(cleaned, 6, sheet.standingRows) * 100) / 100,
      footAnchors: footAnchors(cleaned, 6, 4, sheet.pairs) }
    image = sharp(cleaned.data, { raw: cleaned.info })
  }
  const bytes = await image.webp(options).toBuffer()
  writeFileSync(resolve(directory, name + '.webp'), bytes)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const asset = manifest.assets.find((item) => item.file === name + '.png')
  if (!asset) throw new Error('manifest.json has no asset for ' + name + '.png')
  asset.runtime = { file: name + '.webp', sha256 }
  console.log(name + '.webp', bytes.length, sha256)
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
