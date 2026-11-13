import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findMetadataChunks, readWebpDimensions } from './webp.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npmExecPath = process.env.npm_execpath

function captureCommand(command, args) {
  try {
    return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (error) {
    if (error.code !== 'EPERM') throw error
    // Some managed Windows environments deny child-process pipe handles.
    // Capture the same real command through a temporary file instead.
    const directory = mkdtempSync(resolve(tmpdir(), 'whg-release-audit-'))
    const output = resolve(directory, 'stdout.txt')
    let fd
    try {
      fd = openSync(output, 'w')
      execFileSync(command, args, { cwd: root, stdio: ['ignore', fd, 'inherit'] })
      closeSync(fd)
      fd = undefined
      return readFileSync(output, 'utf8')
    } finally {
      if (fd !== undefined) closeSync(fd)
      rmSync(directory, { recursive: true, force: true })
    }
  }
}

const expectedArtFiles = {
  'pet-dafeiyu': 'pet-dafeiyu.webp',
  'maid-left': 'maid-left.webp',
  'whale-cheerful': 'whale-cheerful.webp',
  'whale-shy': 'whale-shy.webp',
  'whale-serious': 'whale-serious.webp',
  'whale-confused': 'whale-confused.webp',
  'whale-angry': 'whale-angry.webp',
  'whale-frightened': 'whale-frightened.webp',
  'whale-exasperated': 'whale-exasperated.webp',
  'whale-starry': 'whale-starry.webp',
  'palace-night': 'palace-night.webp',
  'bg-deepseek-seaside-study': 'bg-deepseek-seaside-study.webp',
  'bg-claude-writing-study': 'bg-claude-writing-study.webp',
  'bg-gpt-collaboration-workshop': 'bg-gpt-collaboration-workshop.webp',
  'bg-gemini-twin-creative-studio': 'bg-gemini-twin-creative-studio.webp',
  'bg-kimi-moonlit-reading-study': 'bg-kimi-moonlit-reading-study.webp',
  'bg-grok-electronics-studio': 'bg-grok-electronics-studio.webp',
  'claude-zipzippipe': 'claude-zipzippipe.webp',
  'gemini-dual-prism-translator-v4': 'gemini-dual-prism-translator-v4.webp',
  'gpt-zipzippipe': 'gpt-zipzippipe.webp',
  'grok-zipzippipe': 'grok-zipzippipe.webp',
  'kimi-lunar-scroll-navigator-v5': 'kimi-lunar-scroll-navigator-v5.webp',
}
const expectedArtKeys = Object.keys(expectedArtFiles)
const expectedArtHashes = {
  'bg-claude-writing-study.webp': 'fc45e575fc1922fc48db8b7a3d1976e330405ba8afa1b46dd107a431e5eb74e3',
  'bg-deepseek-seaside-study.webp': '35cfd0190aad1aaf1b2e08a1653879cbd86257a5a99e4cfaeb33645f6f054534',
  'bg-gemini-twin-creative-studio.webp': '5107cf6d599b0b2ab8053d4f7e1a21a820c0b02d545fded6bb89e9b25250a9ee',
  'bg-gpt-collaboration-workshop.webp': '971c9f8473ea196d8159b19314e3b909d49bad165e87009306dc3d48830a6040',
  'bg-grok-electronics-studio.webp': '967f77f97343512876d55a9bfa53e934703860e4884e07539392091f62ceb9b7',
  'bg-kimi-moonlit-reading-study.webp': '59a18e6f03abfd11aa31079c2fee1d41ef25da277546b3823a0661c32ef0e71b',
  'claude-zipzippipe.webp': 'd85403607bc7fcc167e964b1a8a0f918d8355025f833eb364ea1fc99476099c2',
  'gemini-dual-prism-translator-v4.webp': '9c7842d4d7d122480d5e5e5cee668eb40675480ffedceea25fcd22a4b9166bba',
  'gpt-zipzippipe.webp': 'f61f587e9eec4f193097b755c7309daedf5ff26398b181661c0f289caa00f2e5',
  'grok-zipzippipe.webp': '87354ed70771f8354d7929f0be29aeeb75510faff0c78b9d5bdee458669d74b2',
  'kimi-lunar-scroll-navigator-v5.webp': 'c6f07e2430a4d102abf4356ac3f785124a894cbf1213e05eec1738204d3943f9',
  'maid-left.webp': 'af7bfd2e18505fc9d6f94cefd9febc92b31c1b2b66c756982d91fc7b93fb184c',
  'palace-night.webp': 'ae6917bb1aafa71e6a10cfcaa1289f13e265aa7f32d3fb7c1988004bf50f8983',
  'pet-dafeiyu.webp': '3a83057aa89c39bf2b4f93ef87ec69caeeb69eaace1613b8c1de52b88f61dcad',
  'whale-angry.webp': '63bb54126cf3acc785b251a19d465a8e388865badbdc7baf17bbad4b68057a02',
  'whale-cheerful.webp': '117ed691623da550075056963764cee7a4cd14318d5ab87ce63d11926b83aa4b',
  'whale-confused.webp': 'f879656eeec7d02e07543774efcf93a62f03d5b73e577a4c5440d855b942d436',
  'whale-exasperated.webp': 'c627bea1c000d304a538f1d63a2cf244f73824496ca585e0bda91a91450b67aa',
  'whale-frightened.webp': 'a74c7b1afd6b6deaa60d3bbceeaf079dd2379b6b8be3da6265c492921522867b',
  'whale-serious.webp': '2974cc4a814f6b1f95d907d22f62d9e0094dd7e538b6145e7c8a1dbb6154de34',
  'whale-shy.webp': '87dea8920f550d75e68d189a816856fcc77379532a79c169cc766f02aeeb80f4',
  'whale-starry.webp': '65a3bd1eb9ad4f8cb357af4825311f84e91be4f7f57deb5357fb79116bcad774',
}
const defaultArtDimensions = {
  'pet-dafeiyu.webp': [2304, 3584],
  'whale-cheerful.webp': [935, 1682],
  'whale-shy.webp': [935, 1682],
  'whale-serious.webp': [935, 1682],
  'whale-confused.webp': [935, 1683],
  'whale-angry.webp': [935, 1683],
  'whale-frightened.webp': [935, 1683],
  'whale-exasperated.webp': [935, 1682],
  'whale-starry.webp': [935, 1682],
}
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
for (const [fileName, [expectedWidth, expectedHeight]] of Object.entries(defaultArtDimensions)) {
  const { width, height } = readWebpDimensions(readFileSync(resolve(artDir, fileName)), fileName)
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`${fileName} dimensions changed: ${width} × ${height}; expected ${expectedWidth} × ${expectedHeight}`)
  }
}
for (const fileName of Object.values(expectedArtFiles)) {
  const metadata = findMetadataChunks(readFileSync(resolve(artDir, fileName)), fileName)
  if (metadata.length) {
    throw new Error(`${fileName} contains non-visual WebP metadata chunk ${metadata.join(', ')}.`)
  }
}

const workshopManifest = JSON.parse(readFileSync(resolve(root, 'assets/workshop/manifest.json'), 'utf8'))
const workshopSource = readFileSync(resolve(root, 'src/client/workshop.generated.ts'), 'utf8')
const workshopEntries = new Map([...workshopSource.matchAll(/^\s*'([^']+)'\s*:\s*'data:image\/webp;base64,([^']+)'/gm)]
  .map((match) => [match[1], Buffer.from(match[2], 'base64')]))
const workshopKeys = ['workshop-map-atlas', 'workshop-office-atlas', 'workshop-room-atlas', 'workshop-resident-atlas', 'workshop-walk-atlas', 'workshop-walk-side-atlas', 'workshop-walk-mid-atlas', 'workshop-workstation-atlas', 'workshop-decor-atlas']
if (workshopEntries.size !== 9 || workshopManifest.assets.length !== 9) throw new Error('Expected exactly nine workshop images')
for (const key of workshopKeys) {
  const asset = workshopManifest.assets.find((item) => item.key === key)
  if (!asset || !/^[a-z0-9-]+\.png$/.test(asset.file)) throw new Error('Invalid workshop asset: ' + key)
  const bytes = readFileSync(resolve(root, 'assets/workshop', asset.file))
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256
    || bytes.readUInt32BE(16) !== asset.width || bytes.readUInt32BE(20) !== asset.height) throw new Error('Workshop image integrity failed: ' + key)
  const runtime = asset.runtime
  if (!runtime || !/^[a-z0-9-]+\.webp$/.test(runtime.file)) throw new Error('Invalid workshop runtime asset: ' + key)
  const runtimeBytes = readFileSync(resolve(root, 'assets/workshop', runtime.file))
  if (!runtimeBytes.equals(workshopEntries.get(key))) throw new Error('Workshop embedded image mismatch: ' + key)
  if (createHash('sha256').update(runtimeBytes).digest('hex') !== runtime.sha256) throw new Error('Workshop runtime image integrity failed: ' + key)
}
const logo = workshopManifest.logo
// The workshop manifest preserves the superseded PNG's generation record.
if (!logo || !/^docs\/brand\/[a-z0-9-]+\.png$/.test(logo.file)) throw new Error('Invalid project logo manifest')
const logoBytes = readFileSync(resolve(root, logo.file))
if (createHash('sha256').update(logoBytes).digest('hex') !== logo.sha256
  || logoBytes.readUInt32BE(16) !== logo.width || logoBytes.readUInt32BE(20) !== logo.height) throw new Error('Logo image integrity failed')
const currentWordmarks = [
  'docs/brand/logo-title.svg',
  'docs/brand/logo-title-dark.svg',
  'docs/brand/logo-inline.svg',
  'docs/brand/logo-inline-dark.svg',
]

// --ignore-scripts keeps the prepare script's stdout out of the --json payload;
// lib/ is already built by the time the audit runs.
const packCommand = npmExecPath?.endsWith('.js')
  ? [process.execPath, [npmExecPath, 'pack', '--dry-run', '--json', '--ignore-scripts']]
  : process.platform === 'win32'
    ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd pack --dry-run --json --ignore-scripts']]
    : ['npm', ['pack', '--dry-run', '--json', '--ignore-scripts']]
const packResult = JSON.parse(captureCommand(packCommand[0], packCommand[1]))[0]
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
const duplicatedRawArt = packPaths.filter((path) => /^assets\/(?:default|workshop)\/.*\.(?:png|webp)$/i.test(path))
if (duplicatedRawArt.length) {
  throw new Error(`Raw art is duplicated in the npm package: ${duplicatedRawArt.join(', ')}`)
}
if (packPaths.includes('src/client/art.generated.ts') || packPaths.includes('src/client/workshop.generated.ts')) {
  throw new Error('Generated art source is duplicated in the npm package.')
}

for (const required of [
  'lib/index.js',
  'lib/client.js',
  'src/index.ts',
  'src/activity-context.ts',
  'src/workshop-presence.ts',
  'src/client/index.ts',
  'src/client/pet-behavior.ts',
  'src/client/workshop-art.ts',
  'src/client/workshop-map.ts',
  'src/client/workshop-world.ts',
  logo.file,
  ...currentWordmarks,
  'docs/screenshots/workshop-map.jpg',
  'docs/screenshots/workshop-one-resident.jpg',
  'assets/workshop/README.md',
  'assets/workshop/manifest.json',
  'assets/workshop/generation-prompts.json',
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

const tracked = captureCommand('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)
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

console.log(`Release audit passed: ${bundledKeys.length} default art keys, ${workshopEntries.size} workshop atlases, ${packPaths.length} package files, ${packResult.size} packed bytes.`)
