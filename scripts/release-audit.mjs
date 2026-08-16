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
const expectedArtKeys = Object.keys(expectedArtFiles)
const expectedArtHashes = {
  'bg-claude-writing-study.png': 'df6d700dfb4185240ba99c280bb4fe98c667826bfa9d3cbfb79dbc31be73b4e0',
  'bg-deepseek-seaside-study.png': '5d7c63d9999d3684fa3aef839c41a49c704f54c846f8558921833030adb67c6d',
  'bg-gemini-twin-creative-studio.png': 'd6a291550a1535d184975025495323af3dd6ad62dda457bb1ce8597ba17e09c2',
  'bg-gpt-collaboration-workshop.png': '516918a353d143bd7166e1629222592c1a358167329a61975a0e2cb6440aceff',
  'bg-grok-electronics-studio.png': 'c5a9eac7b1744615cc4c0e38ab7107b0f9a63f033fcd9175585f36b68821b926',
  'bg-kimi-moonlit-reading-study.png': 'be328c3fb9011f31c586440cffd7f45c5a94948352199c763f58eb338e9c95da',
  'claude-amber-manuscript-mediator-v5.png': 'b27c346b9bc18afd773586b60b9f674f8d812dfb0187072228b8359d529b5f58',
  'gemini-dual-prism-translator-v4.png': '1a34a6581a6795f3acd387676c335b7b87113fd6412b80a36c17132c5639e33d',
  'gpt-recursive-weaver-v7.png': 'e697d8226f1aa93fbcfca7a640d75b44655d32b35229fd4248a7e13e15450663',
  'grok-cosmic-signal-ranger-v5.png': '0830266b694ed1db5f0036f3475914d5406b49026c1f99f8a48fbdf960da867b',
  'kimi-lunar-scroll-navigator-v5.png': '1d6e702d50961ba8be019e0da4772476aa969623696e27a9a8ca813f2d4a04a7',
  'maid-left.webp': 'af7bfd2e18505fc9d6f94cefd9febc92b31c1b2b66c756982d91fc7b93fb184c',
  'palace-night.webp': 'ae6917bb1aafa71e6a10cfcaa1289f13e265aa7f32d3fb7c1988004bf50f8983',
  'pet-spritesheet.webp': '234f24a97c18195a00c6093da0090773e675993c169e92e7e13a24c37b323fa2',
  'whale-angry.png': '1b039bdf8125f32a45444912c5778c09166bb99baad36e92979aa84491baac6b',
  'whale-cheerful.png': '95e1aebcbc2bd58ed75e512bce88d796198b6070a3b0a1025ced3b9cae2fd7de',
  'whale-confused.png': 'd722a6d60d5531d88efe76a4f4f685827964957424accf672584a7daaba60b14',
  'whale-exasperated.png': '99a31f3593a08dee4b82229e26f2dd6c0985025b9ab5fe605c317a578171b195',
  'whale-frightened.png': 'e1c309af2a69e22de7edb7585e846feeb912d3ae3d5fb9cb33a44fa26f063676',
  'whale-serious.png': 'af0d68e7805b7eeb0b849c925cf6f9d24752a5f85cf3f1a29747de471506a85f',
  'whale-shy.png': '575148e26095de46c3003b4a61d0d7948efdc1474665b7a67f3710ac2b414a95',
  'whale-starry.png': '9e9f92db628a9d80d468581e79589432f1d19bf9c9175f3e50ac1bbde7043869',
}
const roleBackgroundKeys = [
  'bg-deepseek-seaside-study',
  'bg-claude-writing-study',
  'bg-gpt-collaboration-workshop',
  'bg-gemini-twin-creative-studio',
  'bg-kimi-moonlit-reading-study',
  'bg-grok-electronics-studio',
]
const expectedHashFiles = Object.keys(expectedArtHashes).sort()
const expectedImageFiles = Object.values(expectedArtFiles).sort()
if (expectedHashFiles.length !== expectedImageFiles.length || expectedImageFiles.some((name, index) => expectedHashFiles[index] !== name)) {
  throw new Error(`Art hash manifest mismatch: found ${expectedHashFiles.join(', ')}`)
}

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
  const hash = createHash('sha256').update(exported).digest('hex')
  if (hash !== expectedArtHashes[fileName]) throw new Error(`${fileName} hash mismatch: ${hash}`)
}
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const allowedBackgroundChunks = new Set(['IHDR', 'PLTE', 'tRNS', 'IDAT', 'IEND'])
for (const key of roleBackgroundKeys) {
  const fileName = expectedArtFiles[key]
  const png = readFileSync(resolve(artDir, fileName))
  if (png.length < pngSignature.length || !png.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${fileName} is not a PNG file.`)
  }
  let offset = pngSignature.length
  let reachedEnd = false
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset)
    const end = offset + 12 + length
    if (end > png.length) throw new Error(`${fileName} has a truncated PNG chunk.`)
    const type = png.toString('ascii', offset + 4, offset + 8)
    if (!allowedBackgroundChunks.has(type)) {
      throw new Error(`${fileName} contains non-visual PNG metadata chunk ${type}.`)
    }
    offset = end
    if (type === 'IEND') {
      reachedEnd = true
      break
    }
  }
  if (!reachedEnd) throw new Error(`${fileName} is missing IEND.`)
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
if (packPaths.includes('src/client/art.generated.ts')) {
  throw new Error('Generated art source is duplicated in the npm package.')
}

for (const required of [
  'lib/index.js',
  'lib/client.js',
  'src/index.ts',
  'src/activity-context.ts',
  'src/client/index.ts',
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
