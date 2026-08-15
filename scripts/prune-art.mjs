import { readFileSync } from 'node:fs'
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
  'claude-amber-manuscript-mediator-v5',
  'gemini-dual-prism-translator-v4',
  'gpt-recursive-weaver-v7',
  'grok-cosmic-signal-ranger-v5',
  'kimi-lunar-scroll-navigator-v5',
]

const source = readFileSync(target, 'utf8')
const missing = keep.filter((key) => !new RegExp(`['\"]${key}['\"]\\s*:`).test(source))
if (missing.length) throw new Error(`Missing generated art keys: ${missing.join(', ')}`)
console.log(`Verified ${keep.length} privacy-safe public art keys.`)
