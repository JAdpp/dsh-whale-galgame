const RIFF = Buffer.from('RIFF', 'ascii')
const WEBP = Buffer.from('WEBP', 'ascii')

// Chunks that carry pixels. Everything else (ICCP, EXIF, XMP ) is provenance
// metadata we refuse to ship with the bundled art.
export const visualChunks = new Set(['VP8X', 'ALPH', 'VP8 ', 'VP8L', 'ANIM', 'ANMF'])

// VP8X flag bits for ICC profile, Exif and XMP payloads.
const metadataFlags = 0x20 | 0x08 | 0x04

export function readWebpChunks(buffer, fileName) {
  if (buffer.length < 12 || !buffer.subarray(0, 4).equals(RIFF) || !buffer.subarray(8, 12).equals(WEBP)) {
    throw new Error(`${fileName} is not a WebP file.`)
  }
  const chunks = []
  let offset = 12
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4)
    const length = buffer.readUInt32LE(offset + 4)
    const end = offset + 8 + length + (length % 2)
    if (end > buffer.length) throw new Error(`${fileName} has a truncated WebP chunk ${type}.`)
    chunks.push({ type, start: offset, end, payloadStart: offset + 8, length })
    offset = end
  }
  if (!chunks.length) throw new Error(`${fileName} has no WebP chunks.`)
  return chunks
}

export function readWebpDimensions(buffer, fileName) {
  const chunks = readWebpChunks(buffer, fileName)
  const extended = chunks.find((chunk) => chunk.type === 'VP8X')
  if (extended) {
    if (extended.length < 10) throw new Error(`${fileName} has a short VP8X chunk.`)
    const at = extended.payloadStart
    return {
      width: buffer.readUIntLE(at + 4, 3) + 1,
      height: buffer.readUIntLE(at + 7, 3) + 1,
    }
  }
  const lossless = chunks.find((chunk) => chunk.type === 'VP8L')
  if (lossless) {
    if (lossless.length < 5 || buffer[lossless.payloadStart] !== 0x2f) {
      throw new Error(`${fileName} has a malformed VP8L chunk.`)
    }
    const bits = buffer.readUInt32LE(lossless.payloadStart + 1)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  const lossy = chunks.find((chunk) => chunk.type === 'VP8 ')
  if (!lossy) throw new Error(`${fileName} has no VP8/VP8L image data.`)
  const at = lossy.payloadStart
  if (lossy.length < 10 || buffer[at + 3] !== 0x9d || buffer[at + 4] !== 0x01 || buffer[at + 5] !== 0x2a) {
    throw new Error(`${fileName} has a malformed VP8 keyframe header.`)
  }
  return {
    width: buffer.readUInt16LE(at + 6) & 0x3fff,
    height: buffer.readUInt16LE(at + 8) & 0x3fff,
  }
}

export function findMetadataChunks(buffer, fileName) {
  return readWebpChunks(buffer, fileName)
    .filter((chunk) => !visualChunks.has(chunk.type))
    .map((chunk) => chunk.type)
}

export function stripWebpMetadata(buffer, fileName) {
  const chunks = readWebpChunks(buffer, fileName)
  const kept = chunks.filter((chunk) => visualChunks.has(chunk.type))
  if (kept.length === chunks.length) return buffer

  const body = Buffer.concat(kept.map((chunk) => buffer.subarray(chunk.start, chunk.end)))
  const output = Buffer.concat([buffer.subarray(0, 12), body])
  output.writeUInt32LE(output.length - 8, 4)

  // The surviving VP8X must stop advertising the payloads we just dropped.
  let offset = 12
  for (const chunk of kept) {
    if (chunk.type === 'VP8X') {
      output[offset + 8] &= ~metadataFlags
      break
    }
    offset += chunk.end - chunk.start
  }
  return output
}
