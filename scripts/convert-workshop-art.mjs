// Derives the embedded WebP atlases from the PNG masters in assets/workshop.
// sharp is not a project dependency: run `npm i --no-save sharp` first.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const { default: sharp } = await import('sharp').catch(() => {
  throw new Error('sharp is missing. Run: npm i --no-save sharp')
})
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../assets/workshop')
// Opaque room paintings compress well at high quality; sprites keep exact alpha edges.
const room = { quality: 92, effort: 6 }
const sprite = { nearLossless: true, quality: 60, effort: 6 }
const targets = {
  'public-rooms-atlas': room,
  'themed-rooms-atlas': room,
  'residents-atlas-builtin': sprite,
  'workstations-rpg-atlas': sprite,
  'decor-atlas-builtin': sprite,
}
for (const [name, options] of Object.entries(targets)) {
  const bytes = await sharp(readFileSync(resolve(directory, name + '.png'))).webp(options).toBuffer()
  writeFileSync(resolve(directory, name + '.webp'), bytes)
  console.log(name + '.webp', bytes.length, createHash('sha256').update(bytes).digest('hex'))
}
