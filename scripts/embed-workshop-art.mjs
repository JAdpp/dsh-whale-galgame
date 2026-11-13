import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findMetadataChunks, readWebpDimensions } from './webp.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const directory = resolve(root, 'assets/workshop')
const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'))
const expectedKeys = ['workshop-map-atlas', 'workshop-office-atlas', 'workshop-room-atlas', 'workshop-resident-atlas', 'workshop-walk-atlas', 'workshop-walk-side-atlas', 'workshop-walk-mid-atlas', 'workshop-leisure-atlas', 'workshop-workstation-atlas', 'workshop-decor-atlas']
if (manifest.assets.length !== expectedKeys.length) throw new Error('Expected exactly ten workshop images')
const entries = expectedKeys.map((key) => {
  const asset = manifest.assets.find((item) => item.key === key)
  if (!asset || !/^[a-z0-9-]+\.png$/.test(asset.file)) throw new Error('Missing workshop asset: ' + key)
  const bytes = readFileSync(resolve(directory, asset.file))
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Expected PNG: ' + asset.file)
  if (bytes.readUInt32BE(16) !== asset.width || bytes.readUInt32BE(20) !== asset.height) throw new Error('Workshop image dimensions changed: ' + asset.file)
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error('Workshop image hash changed: ' + asset.file)
  const runtime = asset.runtime
  if (!runtime || !/^[a-z0-9-]+\.webp$/.test(runtime.file)) throw new Error('Missing workshop runtime asset: ' + key)
  const runtimeBytes = readFileSync(resolve(directory, runtime.file))
  if (createHash('sha256').update(runtimeBytes).digest('hex') !== runtime.sha256) throw new Error('Workshop runtime image hash changed: ' + runtime.file)
  const { width, height } = readWebpDimensions(runtimeBytes, runtime.file)
  if (width !== asset.width || height !== asset.height) throw new Error('Workshop runtime image dimensions changed: ' + runtime.file)
  const metadata = findMetadataChunks(runtimeBytes, runtime.file)
  if (metadata.length) throw new Error(`${runtime.file} contains non-visual WebP metadata chunk ${metadata.join(', ')}.`)
  return `  '${key}': 'data:image/webp;base64,${runtimeBytes.toString('base64')}',`
})
const anchors = manifest.residentLayout?.footAnchors
if (!Array.isArray(anchors) || anchors.length !== 4 || anchors.some((row) => !Array.isArray(row) || row.length !== 6 || row.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 256 || point.y < 0 || point.y > 256))) {
  throw new Error('Expected 4 × 6 resident foot anchors')
}
const validAnchors = (rows) => Array.isArray(rows) && rows.length === 4 && rows.every((row) => Array.isArray(row) && row.length === 6
  && row.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.x <= 256 && point.y >= 0 && point.y <= 256))
const idleAnchors = manifest.walkLayout?.idleAnchors
if (!validAnchors([idleAnchors, idleAnchors, idleAnchors, idleAnchors])) throw new Error('Expected six idle anchors for the walking cycle')
const walk = { idle: idleAnchors }
for (const [sheet, key] of [['frontBack', 'workshop-walk-atlas'], ['side', 'workshop-walk-side-atlas'], ['sideMid', 'workshop-walk-mid-atlas']]) {
  const layout = manifest.walkLayout?.[sheet], image = manifest.assets.find((asset) => asset.key === key)
  if (manifest.walkLayout?.columns !== 6 || manifest.walkLayout?.rows !== 4 || image.width !== 1536 || image.height !== 1024
    || !validAnchors(layout?.footAnchors) || !(layout.scale >= .8 && layout.scale <= 1.4)) {
    throw new Error('Expected a 6 × 4 walking sheet with foot anchors and a draw scale: ' + sheet)
  }
  walk[sheet] = { scale: layout.scale, anchors: layout.footAnchors }
}
const officeImage = manifest.assets.find((asset) => asset.key === 'workshop-office-atlas')
const leisureLayout = manifest.leisureLayout
const leisureImage = manifest.assets.find((asset) => asset.key === 'workshop-leisure-atlas')
if (leisureLayout?.columns !== 6 || leisureLayout?.rows !== 4 || leisureImage.width !== 1536 || leisureImage.height !== 1024
  || !validAnchors(leisureLayout.footAnchors) || !(leisureLayout.scale >= .8 && leisureLayout.scale <= 1.4)) {
  throw new Error('Expected a 6 × 4 leisure sheet with foot anchors and a draw scale')
}
const leisure = { scale: leisureLayout.scale, anchors: leisureLayout.footAnchors }
if (officeImage.width !== officeImage.height) throw new Error('Expected a square workshop office image')
const workLayout = manifest.workstationLayout
const workImage = manifest.assets.find((asset) => asset.key === 'workshop-workstation-atlas')
if (workLayout?.columns !== 6 || workLayout?.rows !== 5 || workImage.width % 6 || workImage.height % 5) throw new Error('Expected a 6 × 5 workstation animation atlas')
const roomImage = manifest.assets.find((asset) => asset.key === 'workshop-room-atlas')
const publicImage = manifest.assets.find((asset) => asset.key === 'workshop-map-atlas')
if (manifest.roomLayout?.columns !== 3 || manifest.roomLayout?.rows !== 2 || roomImage.width % 3 || roomImage.height % 2) throw new Error('Expected a 3 × 2 themed room atlas')
if (manifest.atlasLayout?.columns !== 2 || manifest.atlasLayout?.rows !== 2 || publicImage.width % 2 || publicImage.height % 2) throw new Error('Expected a 2 × 2 public room atlas')
const decorImage = manifest.assets.find((asset) => asset.key === 'workshop-decor-atlas')
const decorBounds = manifest.decorLayout?.bounds
if (manifest.decorLayout?.columns !== 3 || manifest.decorLayout?.rows !== 2 || decorImage.width % 3 || decorImage.height % 2
  || !Array.isArray(decorBounds) || decorBounds.length !== 6
  || decorBounds.some((rect) => ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0 || rect.x + rect.width > 1 || rect.y + rect.height > 1)) {
  throw new Error('Expected a 3 × 2 decoration atlas with six normalized sprite bounds')
}
writeFileSync(resolve(root, 'src/client/workshop.generated.ts'), '// Generated by scripts/embed-workshop-art.mjs; do not edit.\nexport const WORKSHOP_ART: Record<string, string> = {\n' + entries.join('\n') + '\n}\nexport const WORKSHOP_SPRITE_ANCHORS = ' + JSON.stringify(anchors) + '\nexport const WORKSHOP_WALK = ' + JSON.stringify(walk) + '\nexport const WORKSHOP_LEISURE = ' + JSON.stringify(leisure) + '\nexport const WORKSHOP_WORK_ACTIVITIES: Record<string, string> = ' + JSON.stringify(workLayout.activities) + '\nexport const WORKSHOP_DECOR_BOUNDS = ' + JSON.stringify(decorBounds) + '\n', 'utf8')
console.log(`Embedded ${entries.length} generated workshop atlases.`)
