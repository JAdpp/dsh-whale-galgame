import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripWebpMetadata } from './webp.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const artDir = resolve(root, 'assets/default')
const files = [
  'bg-deepseek-seaside-study.webp',
  'bg-claude-writing-study.webp',
  'bg-gpt-collaboration-workshop.webp',
  'bg-gemini-twin-creative-studio.webp',
  'bg-kimi-moonlit-reading-study.webp',
  'bg-grok-electronics-studio.webp',
]

let stripped = 0
for (const fileName of files) {
  const filePath = resolve(artDir, fileName)
  const input = readFileSync(filePath)
  const output = stripWebpMetadata(input, fileName)
  if (output !== input) {
    writeFileSync(filePath, output)
    stripped += 1
  }
}

console.log(`Sanitized metadata from ${files.length} allowlisted role backgrounds (${stripped} rewritten) without recompressing image data.`)
