import assert from 'node:assert/strict'
import test from 'node:test'
import { crmDay, parseHarvestCsv, readCrmCsv, remainingDailyLeads } from './diamond-crm'
import { crmUnlockToken, verifyCrmUnlock } from './diamond-crm-token'

test('HarvestMyData headers, quoted commas/newlines, BOM and phone normalization', () => {
  const parsed = parseHarvestCsv('\uFEFFsource_username,username,full_name,public_email,phone,category_name,biography,external_url\r\nsource,coach.one,"Coach, One",ONE@example.com,+49 (123) 456789,Fitness,"First line\nSays ""hello""",https://example.com\r\n')
  assert.equal(parsed.rows.length, 1)
  assert.deepEqual(parsed.rows[0], { source: 'source', username: 'coach.one', fullName: 'Coach, One', email: 'one@example.com', phone: '+49123456789', category: 'Fitness', biography: 'First line\nSays "hello"', website: 'https://example.com', country: '' })
})
test('blank and malformed rows excluded; duplicates detected across every contact key', () => {
  const result = parseHarvestCsv('username,email,phone\nfirst,a@example.com,+49123456789\nsecond,a@example.com,\nFIRST,b@example.com,\nthird,,49123456789\n,,\nbad,bad-email,\nextra,x@example.com,,oops')
  assert.equal(result.rows.length, 1)
  assert.equal(result.duplicates, 3)
  assert.equal(result.errors.length, 2)
})
test('invalid links are removed and malformed CSV rejected', () => {
  assert.equal(parseHarvestCsv('email,website\nx@example.com,javascript:alert(1)').rows[0].website, '')
  assert.throws(() => readCrmCsv('email\n"unfinished'))
  assert.throws(() => readCrmCsv('email\n"value"oops'))
  assert.throws(() => parseHarvestCsv('full_name\nName'))
  assert.throws(() => readCrmCsv('x'.repeat(5 * 1024 * 1024 + 1)))
})
test('daily limit and Berlin day boundary handle daylight saving time', () => {
  assert.equal(remainingDailyLeads(0), 50)
  assert.equal(remainingDailyLeads(49), 1)
  assert.equal(remainingDailyLeads(50), 0)
  assert.equal(remainingDailyLeads(100), 0)
  assert.equal(crmDay(new Date('2026-09-14T21:59:59Z')), '2026-09-14')
  assert.equal(crmDay(new Date('2026-09-14T22:00:00Z')), '2026-09-15')
  assert.equal(crmDay(new Date('2026-12-14T23:00:00Z')), '2026-12-15')
})
test('unlock tokens are bound to account, approval version, password and expiry', () => {
  const now = Date.now(); const expires = now + 60000
  const token = crmUnlockToken('alice', 'v1', 'password-hash', 'secret', expires)
  assert.ok(verifyCrmUnlock(token, 'alice', 'v1', 'password-hash', 'secret', now))
  assert.equal(verifyCrmUnlock(token, 'bob', 'v1', 'password-hash', 'secret', now), false)
  assert.equal(verifyCrmUnlock(token, 'alice', 'v2', 'password-hash', 'secret', now), false)
  assert.equal(verifyCrmUnlock(token, 'alice', 'v1', 'new-hash', 'secret', now), false)
  assert.equal(verifyCrmUnlock(token, 'alice', 'v1', 'password-hash', 'secret', expires), false)
  assert.equal(verifyCrmUnlock(token + 'x', 'alice', 'v1', 'password-hash', 'secret', now), false)
})
