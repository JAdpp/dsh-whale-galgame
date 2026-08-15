import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npmExecPath = process.env.npm_execpath

const expectedArtFiles = {
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
  'claude-amber-manuscript-mediator-v5': 'claude-amber-manuscript-mediator-v5.png',
  'gemini-dual-prism-translator-v4': 'gemini-dual-prism-translator-v4.png',
  'gpt-recursive-weaver-v7': 'gpt-recursive-weaver-v7.png',
  'grok-cosmic-signal-ranger-v5': 'grok-cosmic-signal-ranger-v5.png',
  'kimi-lunar-scroll-navigator-v5': 'kimi-lunar-scroll-navigator-v5.png',
}
const expectedArtKeys = Object.keys(expectedArtFiles)

const artSource = readFileSync(resolve(root, 'src/client/art.generated.ts'), 'utf8')
const artEntries = new Map(
  [...artSource.matchAll(/^\s*'([^']+)'\s*:\s*'data:image\/(png|webp);base64,([^']+)'/gm)]
    .map((match) => [match[1], { subtype: match[2], data: match[3] }]),
)
const bundledKeys = [...artEntries.keys()]
if (bundledKeys.length !== expectedArtKeys.length || expectedArtKeys.some((key) => !bundledKeys.includes(key))) {
  throw new Error(`Bundled art mismatch: found ${bundledKeys.join(', ')}`)
}
if (/PUBLIC PLACEHOLDER|characterPlaceholder|nightBackground\(\)|petSpriteSheet\(\)/.test(artSource)) {
  throw new Error('Placeholder art code is still present.')
}

const artDir = resolve(root, 'assets/default')
const listRelativeFiles = (directory, prefix = '') => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory()
      ? listRelativeFiles(resolve(directory, entry.name), relativePath)
      : [relativePath]
  })
  .sort()
const expectedArtTree = [
  'README.md',
  ...Object.values(expectedArtFiles),
  'licenses/dsh-deep-whale-LICENSE.txt',
  'licenses/dsh-deep-whale-NOTICE.txt',
  'licenses/dsh-deepseek-girl-pet-LICENSE.txt',
].sort()
const actualArtTree = listRelativeFiles(artDir)
if (actualArtTree.length !== expectedArtTree.length || expectedArtTree.some((name, index) => actualArtTree[index] !== name)) {
  throw new Error(`Public art tree contains missing or unexpected files: ${actualArtTree.join(', ')}`)
}
const exportedImages = readdirSync(artDir).filter((name) => /\.(?:png|webp)$/i.test(name)).sort()
const expectedImages = Object.values(expectedArtFiles).sort()
if (exportedImages.length !== expectedImages.length || expectedImages.some((name, index) => exportedImages[index] !== name)) {
  throw new Error(`Exported art mismatch: found ${exportedImages.join(', ')}`)
}
for (const [key, fileName] of Object.entries(expectedArtFiles)) {
  const entry = artEntries.get(key)
  const expectedSubtype = fileName.endsWith('.webp') ? 'webp' : 'png'
  if (entry.subtype !== expectedSubtype) throw new Error(`${key} uses image/${entry.subtype}; expected image/${expectedSubtype}`)
  const exported = readFileSync(resolve(artDir, fileName))
  if (!exported.equals(Buffer.from(entry.data, 'base64'))) throw new Error(`${fileName} does not match the embedded runtime art.`)
}
const petHash = createHash('sha256').update(readFileSync(resolve(artDir, 'pet-spritesheet.webp'))).digest('hex')
if (petHash !== '234f24a97c18195a00c6093da0090773e675993c169e92e7e13a24c37b323fa2') {
  throw new Error(`Desktop-pet atlas hash mismatch: ${petHash}`)
}

const packCommand = npmExecPath?.endsWith('.js')
  ? [process.execPath, [npmExecPath, 'pack', '--dry-run', '--json']]
  : process.platform === 'win32'
    ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd pack --dry-run --json']]
    : ['npm', ['pack', '--dry-run', '--json']]
const packResult = JSON.parse(execFileSync(packCommand[0], packCommand[1], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}))[0]
const packPaths = packResult.files.map((file) => file.path.replaceAll('\\', '/'))
const forbiddenPackPaths = packPaths.filter((path) => (
  path.endsWith('.map')
  || path.includes('node_modules/')
  || path.includes('.whale-girl-save')
  || path.includes('/.env')
  || path.includes('assets/private/')
  || path.includes('screenshots/private/')
  || /(?:api[-_.]?key|credential|private[-_.]?key)/i.test(path)
))
if (forbiddenPackPaths.length) {
  throw new Error(`Forbidden files in package: ${forbiddenPackPaths.join(', ')}`)
}
const duplicatedRawArt = packPaths.filter((path) => /^assets\/default\/.*\.(?:png|webp)$/i.test(path))
if (duplicatedRawArt.length) {
  throw new Error(`Raw art is duplicated in the npm package: ${duplicatedRawArt.join(', ')}`)
}

for (const required of [
  'lib/index.js',
  'lib/client.js',
  'src/client/art.generated.ts',
  'LICENSE.md',
  'NOTICE.md',
  'THIRD_PARTY_LICENSES.md',
  'assets/default/README.md',
  'assets/default/licenses/dsh-deep-whale-LICENSE.txt',
  'assets/default/licenses/dsh-deep-whale-NOTICE.txt',
  'assets/default/licenses/dsh-deepseek-girl-pet-LICENSE.txt',
]) {
  if (!packPaths.includes(required)) throw new Error(`Package is missing ${required}`)
}
if (packResult.size > 40 * 1024 * 1024) {
  throw new Error(`Package is unexpectedly large: ${packResult.size} bytes`)
}

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  cwd: root,
  encoding: 'utf8',
}).split('\0').filter(Boolean)
const textExtensions = new Set(['.cjs', '.js', '.json', '.md', '.mjs', '.ts', '.txt', '.yaml', '.yml'])
const secretPatterns = [
  /sk-proj-[A-Za-z0-9_-]{12,}/,
  /(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{12,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /[A-Za-z]:\\Users\\[^\\\r\n]+/i,
  /E:\\AI\\/i,
]
const secretHits = []
for (const relativePath of tracked) {
  const filePath = resolve(root, relativePath)
  if (!existsSync(filePath) || !textExtensions.has(extname(relativePath).toLowerCase()) || statSync(filePath).size > 64 * 1024 * 1024) continue
  const text = readFileSync(filePath, 'utf8')
  if (secretPatterns.some((pattern) => pattern.test(text))) secretHits.push(relativePath)
}
if (secretHits.length) throw new Error(`Potential secret or personal path in tracked files: ${secretHits.join(', ')}`)

console.log(`Release audit passed: ${bundledKeys.length} art keys, ${packPaths.length} package files, ${packResult.size} packed bytes.`)
