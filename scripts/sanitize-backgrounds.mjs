import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const artDir = resolve(root, 'assets/default')
const files = [
  'bg-deepseek-seaside-study.png',
  'bg-claude-writing-study.png',
  'bg-gpt-collaboration-workshop.png',
  'bg-gemini-twin-creative-studio.png',
  'bg-kimi-moonlit-reading-study.png',
  'bg-grok-electronics-studio.png',
]
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const visualChunks = new Set(['IHDR', 'PLTE', 'tRNS', 'IDAT', 'IEND'])

for (const fileName of files) {
  const filePath = resolve(artDir, fileName)
  const input = readFileSync(filePath)
  if (input.length < signature.length || !input.subarray(0, signature.length).equals(signature)) {
    throw new Error(`${fileName} is not a PNG file.`)
  }

  const output = [signature]
  let offset = signature.length
  let reachedEnd = false
  while (offset + 12 <= input.length) {
    const length = input.readUInt32BE(offset)
    const end = offset + 12 + length
    if (end > input.length) throw new Error(`${fileName} has a truncated PNG chunk.`)
    const type = input.toString('ascii', offset + 4, offset + 8)
    if (visualChunks.has(type)) output.push(input.subarray(offset, end))
    offset = end
    if (type === 'IEND') {
      reachedEnd = true
      break
    }
  }
  if (!reachedEnd) throw new Error(`${fileName} is missing IEND.`)
  writeFileSync(filePath, Buffer.concat(output))
}

console.log(`Sanitized metadata from ${files.length} allowlisted role backgrounds without recompressing IDAT data.`)
