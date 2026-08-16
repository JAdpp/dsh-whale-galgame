import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, 'src/client/art.generated.ts')

const keep = [
  'pet-spritesheet',
  'maid-left',
  'whale-cheerful',
  'whale-shy',
  'whale-serious',
  'whale-confused',
  'whale-angry',
  'whale-frightened',
  'whale-exasperated',
  'whale-starry',
  'palace-night',
  'bg-deepseek-seaside-study',
  'bg-claude-writing-study',
  'bg-gpt-collaboration-workshop',
  'bg-gemini-twin-creative-studio',
  'bg-kimi-moonlit-reading-study',
  'bg-grok-electronics-studio',
  'claude-amber-manuscript-mediator-v5',
  'gemini-dual-prism-translator-v4',
  'gpt-recursive-weaver-v7',
  'grok-cosmic-signal-ranger-v5',
  'kimi-lunar-scroll-navigator-v5',
]

const source = readFileSync(target, 'utf8')
const entries = new Map()
const pattern = /^\s*'([^']+)'\s*:\s*('(?:\\.|[^'\\])*')\s*,?\s*$/gm
for (const match of source.matchAll(pattern)) entries.set(match[1], match[2])

const missing = keep.filter((key) => !entries.has(key))
if (missing.length) throw new Error(`Missing generated art keys: ${missing.join(', ')}`)

const body = keep.map((key) => `  '${key}': ${entries.get(key)},`).join('\n')
const output = `// Generated whale-girl galgame art (build-time inlined data URLs).\nexport const WHALE_ART: Record<string, string> = {\n${body}\n}\n`
writeFileSync(target, output, 'utf8')

console.log(`Kept ${keep.length} referenced art entries; removed ${entries.size - keep.length}.`)
