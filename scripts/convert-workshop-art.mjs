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
  'walk-directions': sprite,
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

// One foot point per 256px cell: the lowest solid row, and the middle of the legs above it.
// A walk cycle's two frames share one anchor so the figure does not jitter between them.
function footAnchors({ data, info }, columns, rows) {
  const cell = info.width / columns
  const anchors = []
  for (let row = 0; row < rows; row++) {
    anchors.push([])
    for (let column = 0; column < columns; column++) {
      const solid = (x, y) => data[((row * cell + y) * info.width + column * cell + x) * 4 + 3] > 128
      let bottom = cell - 1
      while (bottom > 0 && !Array.from({ length: cell }, (_, x) => solid(x, bottom)).some(Boolean)) bottom--
      const xs = []
      for (let y = Math.max(0, bottom - 40); y <= bottom; y++) for (let x = 0; x < cell; x++) if (solid(x, y)) xs.push(x)
      xs.sort((a, b) => a - b)
      anchors[row].push({ x: xs[Math.floor(xs.length / 2)] ?? cell / 2, y: bottom + 1 })
    }
  }
  for (let row = 0; row + 1 < rows; row += 2) for (let column = 0; column < columns; column++) {
    const a = anchors[row][column], b = anchors[row + 1][column]
    const x = (a.x + b.x) / 2
    anchors[row][column] = { x, y: a.y }; anchors[row + 1][column] = { x, y: b.y }
  }
  return anchors
}

for (const [name, options] of Object.entries(targets)) {
  const file = resolve(directory, name + '.png')
  let image = sharp(readFileSync(file))
  if (name === 'walk-directions') {
    const cleaned = await withoutHaze(file)
    manifest.walkLayout = { ...manifest.walkLayout, columns: 6, rows: 4, footAnchors: footAnchors(cleaned, 6, 4) }
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
