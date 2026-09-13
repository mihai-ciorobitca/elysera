export const STORAGE_KEY = 'elysera:admin:whatsapp-workspace:v1';
export const DEFAULT_TEMPLATE = 'Hallo {firstName} {lastName},\n\nwie können wir dir heute weiterhelfen?\n\nLiebe Grüße\ndein ELYSERA Team';
export const SAMPLE = '[\n  { "firstName": "Example", "secondName": "Contact", "email": "example@example.invalid", "phone": "+12025550123", "orderId": "DEMO", "total": "" }\n]';
export function normalizePhone(value) {
  if (typeof value !== 'string' || !/^\+?[1-9][\d ()-]*$/.test(value.trim())) return '';
  const digits = value.replace(/\D/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : '';
}
export function parseContacts(raw) {
  if (!raw.trim()) throw new Error('Bitte zuerst ein JSON-Array einfügen.');
  if (raw.length > 1000000) throw new Error('Der Import muss kleiner als 1 MB sein.');
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('Ungültiges JSON. Anführungszeichen, Kommas und eckige Klammern prüfen.'); }
  if (!Array.isArray(data)) throw new Error('JSON muss ein Array mit Kontaktobjekten sein.');
  if (data.length > 1000) throw new Error('Maximal 1.000 Kontakte pro Import.');
  const seen = new Set(); let duplicates = 0;
  const contacts = [];
  data.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Eintrag ${index + 1} muss ein Kontaktobjekt sein.`);
    const contact = {};
    for (const field of ['firstName','secondName','email','phone','orderId','total']) {
      const v = row[field];
      if (v != null && typeof v !== 'string' && !(field === 'total' && typeof v === 'number' && Number.isFinite(v))) throw new Error(`Eintrag ${index + 1}: ${field} muss Text sein${field === 'total' ? ' oder eine Zahl' : ''}.`);
      contact[field] = v == null ? '' : String(v).trim();
      if (contact[field].length > 2000) throw new Error(`Eintrag ${index + 1}: ${field} ist zu lang.`);
    }
    const phone = normalizePhone(contact.phone);
    const key = phone ? `phone:${phone}` : contact.email ? `email:${contact.email.toLowerCase()}` : `row:${JSON.stringify(contact)}`;
    if (seen.has(key)) { duplicates++; return; }
    seen.add(key); contacts.push({ ...contact, key });
  });
  return { contacts, duplicates };
}
export function buildMessage(template, contact) {
  const values = { firstName: contact.firstName, lastName: contact.secondName, orderId: contact.orderId, total: contact.total };
  return template.replace(/\{(firstName|lastName|orderId|total)\}/gi, (token) => String(values[Object.keys(values).find(k => `{${k}}`.toLowerCase() === token.toLowerCase())] ?? ''));
}
export function waLink(contact, template) {
  const phone = normalizePhone(contact.phone);
  if (!phone || !template.trim()) return null;
  // TextEncoder replaces malformed surrogate code points before URI encoding.
  const message = new TextDecoder().decode(new TextEncoder().encode(buildMessage(template, contact)));
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
