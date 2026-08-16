import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = resolve(root, 'assets/default')
const target = resolve(root, 'src/client/art.generated.ts')

const files = {
  'pet-spritesheet': 'pet-spritesheet.webp',
  'maid-left': 'maid-left.webp',
  'whale-cheerful': 'whale-cheerful.png',
  'whale-shy': 'whale-shy.png',
  'whale-serious': 'whale-serious.png',
  'whale-confused': 'whale-confused.png',
  'whale-angry': 'whale-angry.png',
  'whale-frightened': 'whale-frightened.png',
  'whale-exasperated': 'whale-exasperated.png',
  'whale-starry': 'whale-starry.png',
  'palace-night': 'palace-night.webp',
  'bg-deepseek-seaside-study': 'bg-deepseek-seaside-study.png',
  'bg-claude-writing-study': 'bg-claude-writing-study.png',
  'bg-gpt-collaboration-workshop': 'bg-gpt-collaboration-workshop.png',
  'bg-gemini-twin-creative-studio': 'bg-gemini-twin-creative-studio.png',
  'bg-kimi-moonlit-reading-study': 'bg-kimi-moonlit-reading-study.png',
  'bg-grok-electronics-studio': 'bg-grok-electronics-studio.png',
  'claude-amber-manuscript-mediator-v5': 'claude-amber-manuscript-mediator-v5.png',
  'gemini-dual-prism-translator-v4': 'gemini-dual-prism-translator-v4.png',
  'gpt-recursive-weaver-v7': 'gpt-recursive-weaver-v7.png',
  'grok-cosmic-signal-ranger-v5': 'grok-cosmic-signal-ranger-v5.png',
  'kimi-lunar-scroll-navigator-v5': 'kimi-lunar-scroll-navigator-v5.png',
}

const entries = Object.entries(files).map(([key, fileName]) => {
  const subtype = extname(fileName).slice(1).toLowerCase()
  if (subtype !== 'png' && subtype !== 'webp') throw new Error(`Unsupported art type: ${fileName}`)
  const encoded = readFileSync(resolve(sourceDir, fileName)).toString('base64')
  return `  '${key}': 'data:image/${subtype};base64,${encoded}',`
})

const output = `// Generated whale-girl galgame art (build-time inlined data URLs).\nexport const WHALE_ART: Record<string, string> = {\n${entries.join('\n')}\n}\n`
writeFileSync(target, output, 'utf8')

console.log(`Embedded ${entries.length} allowlisted default art files from assets/default.`)
