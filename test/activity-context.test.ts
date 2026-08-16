import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ACTIVITY_MENTION_COOLDOWN_MS,
  activityCgTheme,
  activitySystemInstruction,
  collectHarnessActivities,
  nextUnseenActivity,
  normalizeActivityMemory,
  rememberActivity,
} from '../src/activity-context.ts'

const root = 'E:\\workspace\\demo'
const now = 2_000_000_000_000

function userEvent(seq: number, time: number, text: string, source: any = { kind: 'user' }): any {
  return {
    type: 'user/message',
    seq,
    time,
    data: {
      id: 'user-message-' + seq,
      role: 'user',
      content: [{ type: 'text', text }],
      source,
    },
  }
}

test('collects classified activities across same-workspace sessions and ignores other workspaces', () => {
  const sessions = [
    {
      id: 'debug-session',
      header: { id: 'debug-session', cwd: root, createdAt: now - 20_000 },
      events: [
        { type: 'turn/start', seq: 0, time: now - 20_000, data: { turn: 1 } },
        userEvent(1, now - 19_000, '帮我排查 TypeScript 插件的报错，测试一直失败'),
        { type: 'tool/call', seq: 2, time: now - 18_000, data: { turn: 1, name: 'exec_command', arguments: '{}' } },
        { type: 'turn/end', seq: 3, time: now - 17_000, data: { turn: 1, reason: { kind: 'completed' } } },
      ],
    },
    {
      id: 'story-session',
      header: { id: 'story-session', cwd: root.toLowerCase(), createdAt: now - 10_000 },
      events: [
        { type: 'turn/start', seq: 0, time: now - 10_000, data: { turn: 4 } },
        userEvent(1, now - 9_000, '继续写这个海底世界的短篇小说，让人物关系更自然'),
        { type: 'turn/end', seq: 2, time: now - 8_000, data: { turn: 4, reason: { kind: 'completed' } } },
      ],
    },
    {
      id: 'other-workspace',
      header: { id: 'other-workspace', cwd: 'E:\\private', createdAt: now - 5_000 },
      events: [userEvent(0, now - 4_000, '总结一份秘密文档')],
    },
  ]

  const activities = collectHarnessActivities(sessions, root, now)
  assert.deepEqual(activities.map((activity) => activity.category), ['literary-creation', 'code-debug'])
  assert.equal(activities[0].status, 'completed')
  assert.equal(activities[1].label, '代码调试')
})

test('ignores injected user-role context and raw tool output', () => {
  const sessions = [{
    id: 'synthetic',
    header: { id: 'synthetic', cwd: root, createdAt: now - 5_000 },
    events: [
      userEvent(0, now - 4_000, 'debug secret project', { kind: 'plugin', plugin: 'test-context' }),
      { type: 'tool/result', seq: 1, time: now - 3_000, data: { turn: 1, message: { role: 'tool', content: '代码报错' } } },
    ],
  }]
  assert.deepEqual(collectHarnessActivities(sessions, root, now), [])
})

test('prompt and CG theme contain only the safe category cue', () => {
  const sessions = [{
    id: 'safe',
    header: { id: 'safe', cwd: root, createdAt: now - 5_000 },
    events: [userEvent(0, now - 4_000, '修复 C:\\Users\\name\\secret.ts 的 bug，token sk-secret123456789')],
  }]
  const activity = collectHarnessActivities(sessions, root, now)[0]
  const prompt = activitySystemInstruction(activity)
  const cg = activityCgTheme(activity)
  assert.match(prompt, /代码调试/)
  assert.match(cg, /代码调试/)
  assert.doesNotMatch(prompt + cg, /secret|Users|sk-/i)
})

test('ordinary forks ignore the inherited seed prefix', () => {
  const inherited = [
    { type: 'turn/start', seq: 0, time: now - 20_000, data: { turn: 1 } },
    userEvent(1, now - 19_000, '帮我 debug 这个 bug'),
    { type: 'turn/end', seq: 2, time: now - 18_000, data: { turn: 1, reason: { kind: 'completed' } } },
  ]
  const sessions = [{
    id: 'ordinary-fork',
    header: {
      id: 'ordinary-fork',
      cwd: root,
      createdAt: now - 20_000,
      parentSession: 'parent-session',
      seedLength: inherited.length,
    },
    events: [
      ...inherited,
      { type: 'session/end-seed', seq: 3, time: now - 17_000, data: {} },
      { type: 'turn/start', seq: 4, time: now - 10_000, data: { turn: 2 } },
      userEvent(5, now - 9_000, '继续写海底世界的短篇小说'),
      { type: 'turn/end', seq: 6, time: now - 8_000, data: { turn: 2, reason: { kind: 'completed' } } },
    ],
  }]

  assert.deepEqual(collectHarnessActivities(sessions, root, now).map((activity) => activity.category), ['literary-creation'])
})

test('generic document errors do not become code-debug activities', () => {
  const sessions = [{
    id: 'document-error',
    header: { id: 'document-error', cwd: root, createdAt: now - 10_000 },
    events: [
      { type: 'turn/start', seq: 0, time: now - 10_000, data: { turn: 1 } },
      userEvent(1, now - 9_000, '总结失败的原因，并修复报告里的错误措辞'),
      { type: 'tool/call', seq: 2, time: now - 8_000, data: { turn: 1, step: 0, callId: 'call-1', name: 'apply_patch', arguments: '{}' } },
      { type: 'turn/end', seq: 3, time: now - 7_000, data: { turn: 1, reason: { kind: 'completed' } } },
    ],
  }]

  const activities = collectHarnessActivities(sessions, root, now)
  assert.equal(activities[0]?.category, 'document-writing')
  assert.equal(activities.some((activity) => activity.category === 'code-debug'), false)
})

test('explicit debug signals classify without additional code keywords', () => {
  const sessions = [{
    id: 'standalone-debug',
    header: { id: 'standalone-debug', cwd: root, createdAt: now - 5_000 },
    events: [userEvent(0, now - 4_000, 'Please debug this bug for me')],
  }]
  assert.equal(collectHarnessActivities(sessions, root, now)[0]?.category, 'code-debug')
})

test('each character memory consumes an activity once and throttles every unseen event', () => {
  const activities: any[] = [
    { fingerprint: 'activity-new', category: 'code-debug', time: now, label: '代码调试', status: 'active', chatHint: '', cgHint: '' },
    { fingerprint: 'activity-old', category: 'research', time: now - 60_000, label: '资料调研', status: 'completed', chatHint: '', cgHint: '' },
  ]
  const initial = { seen: [], lastMentionedAt: 0 }
  assert.equal(nextUnseenActivity(activities, initial, now)?.fingerprint, 'activity-new')
  const remembered = rememberActivity(initial, activities[0], now)
  assert.equal(nextUnseenActivity(activities, remembered, now + 1_000), null)
  const newerDuringCooldown = [
    { ...activities[1], fingerprint: 'activity-newer', time: now + 500 },
    ...activities,
  ]
  assert.equal(nextUnseenActivity(newerDuringCooldown, remembered, now + 1_000), null)
  assert.equal(nextUnseenActivity(activities, remembered, now + ACTIVITY_MENTION_COOLDOWN_MS + 1)?.fingerprint, 'activity-old')
  assert.equal(nextUnseenActivity(activities, initial, now)?.fingerprint, 'activity-new')
})

test('activity memory deduplicates before applying the retention limit', () => {
  const memory = normalizeActivityMemory({
    seen: ['activity-keep', ...Array.from({ length: 300 }, () => 'activity-repeat')],
    lastMentionedAt: now,
  })
  assert.deepEqual(memory.seen, ['activity-keep', 'activity-repeat'])
})
