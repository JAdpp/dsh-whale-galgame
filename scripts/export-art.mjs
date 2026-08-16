import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'src/client/art.generated.ts')
const outputDir = resolve(root, 'assets/default')

const files = {
  'pet-spritesheet': ['image/webp', 'pet-spritesheet.webp'],
  'maid-left': ['image/webp', 'maid-left.webp'],
  'whale-cheerful': ['image/png', 'whale-cheerful.png'],
  'whale-shy': ['image/png', 'whale-shy.png'],
  'whale-serious': ['image/png', 'whale-serious.png'],
  'whale-confused': ['image/png', 'whale-confused.png'],
  'whale-angry': ['image/png', 'whale-angry.png'],
  'whale-frightened': ['image/png', 'whale-frightened.png'],
  'whale-exasperated': ['image/png', 'whale-exasperated.png'],
  'whale-starry': ['image/png', 'whale-starry.png'],
  'palace-night': ['image/webp', 'palace-night.webp'],
  'bg-deepseek-seaside-study': ['image/png', 'bg-deepseek-seaside-study.png'],
  'bg-claude-writing-study': ['image/png', 'bg-claude-writing-study.png'],
  'bg-gpt-collaboration-workshop': ['image/png', 'bg-gpt-collaboration-workshop.png'],
  'bg-gemini-twin-creative-studio': ['image/png', 'bg-gemini-twin-creative-studio.png'],
  'bg-kimi-moonlit-reading-study': ['image/png', 'bg-kimi-moonlit-reading-study.png'],
  'bg-grok-electronics-studio': ['image/png', 'bg-grok-electronics-studio.png'],
  'claude-amber-manuscript-mediator-v5': ['image/png', 'claude-amber-manuscript-mediator-v5.png'],
  'gemini-dual-prism-translator-v4': ['image/png', 'gemini-dual-prism-translator-v4.png'],
  'gpt-recursive-weaver-v7': ['image/png', 'gpt-recursive-weaver-v7.png'],
  'grok-cosmic-signal-ranger-v5': ['image/png', 'grok-cosmic-signal-ranger-v5.png'],
  'kimi-lunar-scroll-navigator-v5': ['image/png', 'kimi-lunar-scroll-navigator-v5.png'],
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
