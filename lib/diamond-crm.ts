export const CRM_BATCH_SIZE = 50
export function allocationBatchSize(pending: number, adminOverride = false): number {
  return adminOverride || pending === 0 ? CRM_BATCH_SIZE : 0
}
export const CRM_TIMEZONE = 'Europe/Berlin'
export const CRM_STATUSES = ['NEW', 'CONTACTED', 'CALLED', 'NO_ANSWER', 'INTERESTED', 'FOLLOW_UP', 'NOT_INTERESTED', 'WON', 'DO_NOT_CONTACT'] as const
export type CrmStatus = typeof CRM_STATUSES[number]
export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  NEW: 'New', CONTACTED: 'Contacted', CALLED: 'Called', NO_ANSWER: 'No answer', INTERESTED: 'Interested',
  FOLLOW_UP: 'Follow-up', NOT_INTERESTED: 'Not interested', WON: 'Converted', DO_NOT_CONTACT: 'Do not contact',
}
export function crmDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CRM_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}
export function isCrmStatus(value: unknown): value is CrmStatus {
  return typeof value === 'string' && CRM_STATUSES.includes(value as CrmStatus)
}
export type CrmImportRow = {
  username: string | null; fullName: string; email: string | null; phone: string | null
  source?: string; biography: string; country: string; category: string; website: string
}
export type CrmLeadView = CrmImportRow & {
  id: string; status: CrmStatus; assignedToId: string | null; assignedDay: string | null
  calledAt: string | null; notes: string; followUpAt: string | null; version: number
  activities?: { id: string; status: string; note: string; createdAt: string }[]
}
export type CrmSnapshot = {
  viewerId?: string
  passwordConfigured: boolean
  day: string; leads: CrmLeadView[]; total: number; page: number; pool: number; assignedToday: number
  counts: Record<string, number>; members: { userId: string; name: string; email: string; enabled: boolean; assignedTotal?: number; pending?: number; assignedToday: number; workedToday: number; interested: number }[]
}

/** RFC 4180 quoting, including newlines in Instagram biographies. */
export function readCrmCsv(text: string): string[][] {
  if (new TextEncoder().encode(text).length > 5 * 1024 * 1024) throw new Error('CSV must be smaller than 5 MB.')
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false; let closed = false
  const source = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') { field += '"'; i++ } else { quoted = false; closed = true }
      } else field += char
    } else if (char === ',' || char === '\n' || char === '\r') {
      row.push(field); field = ''; closed = false
      if (char !== ',') {
        if (row.some(value => value.trim())) rows.push(row)
        row = []
        if (char === '\r' && source[i + 1] === '\n') i++
      }
    } else if (char === '"' && !field && !closed) quoted = true
    else {
      if (closed || char === '"') throw new Error('Malformed CSV quoting. Export a UTF-8 CSV with comma separators.')
      field += char
    }
    if (rows.length > 10001) throw new Error('Upload at most 10,000 rows per file.')
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted field.')
  row.push(field)
  if (row.some(value => value.trim())) rows.push(row)
  if (rows.length > 10001) throw new Error('Upload at most 10,000 rows per file.')
  return rows
}

export const CRM_IMPORT_FIELDS = ['fullName', 'phone', 'email', 'username', 'source', 'country', 'category', 'biography', 'website'] as const
export type CrmImportField = typeof CRM_IMPORT_FIELDS[number]
export const CRM_DEFAULT_IMPORT_FIELDS: CrmImportField[] = ['fullName', 'phone', 'email', 'username', 'source']
export function parseHarvestCsv(text: string, selectedFields: readonly CrmImportField[] = CRM_IMPORT_FIELDS) {
  const [header, ...data] = readCrmCsv(text)
  if (!header || !data.length) throw new Error('Include a header row and at least one lead.')
  const names = header.map(value => value.trim().toLowerCase().replace(/[\s-]+/g, '_'))
  const index = (aliases: string[]) => aliases.map(value => names.indexOf(value)).find(value => value >= 0) ?? -1
  const columns = {
    username: index(['username', 'user_name', 'instagram_username']), fullName: index(['full_name', 'name']),
    email: index(['public_email', 'email', 'email_address']), phone: index(['phone', 'phone_number', 'public_phone_number']),
    biography: index(['biography', 'bio']), country: index(['country']), category: index(['category_name', 'category']),
    website: index(['external_url', 'website', 'url']), source: index(['source_username', 'keyword', 'source']),
  }
  if (!(['email', 'phone', 'username'] as const).some(key => selectedFields.includes(key) && columns[key] >= 0)) throw new Error('Select an email, phone or Instagram username column.')
  const rows: CrmImportRow[] = []; const errors: { row: number; message: string }[] = []
  const seen = new Set<string>(); let duplicates = 0
  data.forEach((values, i) => {
    const value = (key: keyof typeof columns) => selectedFields.includes(key) ? (values[columns[key]] ?? '').trim() : ''
    const reject = (message: string) => { errors.push({ row: i + 2, message }) }
    if (values.length !== header.length) return reject('Column count does not match the header.')
    if (values.some(v => v.length > 10000)) return reject('A field exceeds 10,000 characters.')
    const username = value('username').replace(/^@/, '').toLowerCase() || null
    const email = value('email').toLowerCase() || null
    const rawPhone = value('phone')
    const phone = rawPhone ? rawPhone.replace(/[\s().-]/g, '').replace(/^00/, '+') : null
    if (!email && !phone && !username) return reject('No email, phone or Instagram username.')
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) return reject('Invalid email address.')
    if (phone && !/^\+?\d{7,15}$/.test(phone)) return reject('Invalid phone number; use the full country code.')
    if (username && !/^[a-z0-9._]{1,30}$/.test(username)) return reject('Invalid Instagram username.')
    let website = value('website')
    if (website) {
      try { const parsed = new URL(website); if (!['http:', 'https:'].includes(parsed.protocol)) website = '' }
      catch { website = '' }
    }
    const keys = [username && `u:${username}`, email && `e:${email}`, phone && `p:${phone.replace(/^\+/, '')}`].filter(Boolean) as string[]
    if (keys.some(key => seen.has(key))) { duplicates++; return }
    keys.forEach(key => seen.add(key))
    rows.push({ source: value('source'), username, email, phone: phone ? `+${phone.replace(/^\+/, '')}` : null, fullName: value('fullName'), biography: value('biography'), country: value('country'), category: value('category'), website })
  })
  return { rows, errors, duplicates, total: data.length }
}
