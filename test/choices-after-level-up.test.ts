import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const server = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8')

test('level-up replies clear the pending flag before refilling choices', () => {
  // ensureReplyChoices() returns early while choiceGenerationPending holds the
  // character, so the flag must be cleared first or no choices follow a level-up.
  const refill = server.indexOf('if (committed.leveled) ensureReplyChoices(prepared.charId, c)')
  assert.notEqual(refill, -1, 'missing level-up choice refill')
  const clear = server.lastIndexOf('choiceGenerationPending.delete(prepared.charId)', refill)
  assert.ok(clear !== -1 && refill - clear < 200, 'pending flag must be cleared right before the refill')
})
