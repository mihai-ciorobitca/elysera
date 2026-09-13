import test from 'node:test';
import assert from 'node:assert/strict';
import { parseContacts, buildMessage, waLink, normalizePhone } from './whatsapp-model.mjs';
test('rejects malformed imports and nested data without coercing phone numbers', () => {
  for (const value of ['', '{', '{}', '[null]', '[[]]', '[{"phone":12025550123}]', '[{"firstName":{}}]']) assert.throws(() => parseContacts(value));
  assert.deepEqual(parseContacts('[]'), {contacts:[],duplicates:0});
});
test('deduplicates normalized international phones and preserves first contact', () => {
  const result = parseContacts(JSON.stringify([{firstName:'First',phone:'+1 (202) 555-0123'}, {firstName:'Second',phone:'12025550123'}, {email:'A@example.invalid'}, {email:'a@example.invalid'}]));
  assert.equal(result.contacts.length,2); assert.equal(result.duplicates,2); assert.equal(result.contacts[0].firstName,'First');
});
test('rejects schemes, letters, local leading zero, misplaced plus and excessive digits', () => {
  for (const phone of ['javascript:12025550123','abc12025550123','012025550123','1+2025550123','1234567890123456']) assert.equal(normalizePhone(phone),'');
  assert.equal(normalizePhone('+1 (202) 555-0123'),'12025550123');
});
test('replacement is literal and single pass; unsafe text stays URL encoded', () => {
  const contact = {phone:'+12025550123',firstName:'$& {total}<script>',secondName:'A&B',total:0};
  const message = buildMessage('{FIRSTNAME} {lastName} {total} {unknown}', contact);
  assert.equal(message,'$& {total}<script> A&B 0 {unknown}');
  const url = new URL(waLink(contact,'{firstName} & more'));
  assert.equal(url.origin,'https://wa.me'); assert.equal(url.pathname,'/12025550123');
  assert.equal(url.searchParams.get('text'),'$& {total}<script> & more');
  assert.equal(waLink({...contact,phone:'javascript:bad'},'text'),null);
  assert.equal(waLink(contact,'   '),null);
  assert.doesNotThrow(() => waLink(contact,'\ud800'));
});
