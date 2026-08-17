import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'src/client/art.generated.ts')
const outputDir = resolve(root, 'assets/default')

const files = {
  'pet-spritesheet': ['image/webp', 'pet-spritesheet.webp'],
  'maid-left': ['image/webp', 'maid-left.webp'],
  'whale-cheerful': ['image/webp', 'whale-cheerful.webp'],
  'whale-shy': ['image/webp', 'whale-shy.webp'],
  'whale-serious': ['image/webp', 'whale-serious.webp'],
  'whale-confused': ['image/webp', 'whale-confused.webp'],
  'whale-angry': ['image/webp', 'whale-angry.webp'],
  'whale-frightened': ['image/webp', 'whale-frightened.webp'],
  'whale-exasperated': ['image/webp', 'whale-exasperated.webp'],
  'whale-starry': ['image/webp', 'whale-starry.webp'],
  'palace-night': ['image/webp', 'palace-night.webp'],
  'bg-deepseek-seaside-study': ['image/webp', 'bg-deepseek-seaside-study.webp'],
  'bg-claude-writing-study': ['image/webp', 'bg-claude-writing-study.webp'],
  'bg-gpt-collaboration-workshop': ['image/webp', 'bg-gpt-collaboration-workshop.webp'],
  'bg-gemini-twin-creative-studio': ['image/webp', 'bg-gemini-twin-creative-studio.webp'],
  'bg-kimi-moonlit-reading-study': ['image/webp', 'bg-kimi-moonlit-reading-study.webp'],
  'bg-grok-electronics-studio': ['image/webp', 'bg-grok-electronics-studio.webp'],
  'claude-amber-manuscript-mediator-v5': ['image/webp', 'claude-amber-manuscript-mediator-v5.webp'],
  'gemini-dual-prism-translator-v4': ['image/webp', 'gemini-dual-prism-translator-v4.webp'],
  'gpt-recursive-weaver-v7': ['image/webp', 'gpt-recursive-weaver-v7.webp'],
  'grok-cosmic-signal-ranger-v5': ['image/webp', 'grok-cosmic-signal-ranger-v5.webp'],
  'kimi-lunar-scroll-navigator-v5': ['image/webp', 'kimi-lunar-scroll-navigator-v5.webp'],
}

const source = readFileSync(sourcePath, 'utf8')
const pattern = /^\s*'([^']+)'\s*:\s*'data:([^;]+);base64,([^']+)'\s*,?\s*$/gm
const entries = new Map()
for (const match of source.matchAll(pattern)) {
  entries.set(match[1], { mime: match[2], data: match[3] })
}

const expectedKeys = Object.keys(files)
const missing = expectedKeys.filter((key) => !entries.has(key))
const unexpected = [...entries.keys()].filter((key) => !files[key])
if (missing.length || unexpected.length) {
  throw new Error(`Art manifest mismatch. Missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`)
}

mkdirSync(outputDir, { recursive: true })
for (const [key, [expectedMime, fileName]] of Object.entries(files)) {
  const entry = entries.get(key)
  if (entry.mime !== expectedMime) {
    throw new Error(`${key} uses ${entry.mime}; expected ${expectedMime}`)
  }
  writeFileSync(resolve(outputDir, fileName), Buffer.from(entry.data, 'base64'))
}

console.log(`Exported ${expectedKeys.length} bundled default art files to assets/default.`)
