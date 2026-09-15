import test from 'node:test'
import assert from 'node:assert/strict'
import { CRM_DEFAULT_IMPORT_FIELDS, parseHarvestCsv, type CrmLeadView } from './diamond-crm'
import { contactLinks, contactMessage, DEFAULT_CONTACT_TEMPLATES, emailDraft } from './crm-contact'

test('wide exports use only checked fields and keep Instagram-only contacts and keywords', () => {
  const csv = 'source_username,username,full_name,public_email,email_source,phone,country,registration_date,former_usernames,is_business_account,is_professional_account,category_name,biography,external_url,follower_count,following_count,media_count,city,address,zip_code,user_id,profile_pic_url,is_private,is_verified,\n#kosmetik,beauty.test,Beauty Test,,,,Germany,,,,,Beauty,Ignored bio,https://example.com,100,200,30,Berlin,,,,,,,'
  const result = parseHarvestCsv(csv, CRM_DEFAULT_IMPORT_FIELDS)
  assert.equal(result.errors.length, 0)
  assert.equal(result.rows.length, 1)
  assert.equal(result.rows[0].source, '#kosmetik')
  assert.equal(result.rows[0].username, 'beauty.test')
  assert.equal(result.rows[0].country, '')
  assert.equal(result.rows[0].biography, '')
  assert.equal(parseHarvestCsv(csv, [...CRM_DEFAULT_IMPORT_FIELDS, 'country']).rows[0].country, 'Germany')
  assert.throws(() => parseHarvestCsv(csv, ['fullName', 'source']))
})

const lead = { fullName: 'Anna & Co', username: 'anna.beauty', source: '#kosmetik', phone: '+491234567890', email: 'anna@example.test', status: 'NEW' } as CrmLeadView
test('contact links encode personalized messages and suppress do-not-contact actions', () => {
  const links = contactLinks(lead, DEFAULT_CONTACT_TEMPLATES)
  assert.equal(links.call, 'tel:+491234567890')
  assert.equal(new URL(links.whatsapp!).hostname, 'wa.me')
  assert.match(new URL(links.whatsapp!).searchParams.get('text')!, /Anna & Co/)
  assert.equal(links.instagramDm, 'https://ig.me/m/anna.beauty')
  assert.equal(contactMessage('{name} {keyword} {username}', lead), 'Anna & Co #kosmetik anna.beauty')
  assert.deepEqual(contactLinks({ ...lead, status: 'DO_NOT_CONTACT' }, DEFAULT_CONTACT_TEMPLATES), {})
  assert.equal(contactLinks({ ...lead, phone: '123456789' }, DEFAULT_CONTACT_TEMPLATES).whatsapp, undefined)
})

test('email drafts enforce 30 recipients, deduplicate and keep recipients in BCC', () => {
  const addresses = Array.from({ length: 30 }, (_, i) => `lead${i}@example.test`)
  const draft = new URL(emailDraft(addresses, 'Hello\r\nBcc: fake', 'A & B\nTest'))
  assert.equal(draft.pathname, '')
  assert.equal(draft.searchParams.get('bcc')!.split(',').length, 30)
  assert.equal(draft.searchParams.get('body'), 'A & B\nTest')
  assert.ok(!draft.searchParams.get('subject')!.includes('\n'))
  assert.throws(() => emailDraft([...addresses, 'extra@example.test'], '', ''))
  assert.throws(() => emailDraft(['evil@example.test\r\nBcc:x@example.test'], '', ''))
  assert.throws(() => emailDraft([], '', ''))
  assert.equal(new URL(emailDraft(['A@example.test', 'a@example.test'], '', '')).searchParams.get('bcc'), 'a@example.test')
})
