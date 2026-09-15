import type { CrmLeadView } from './diamond-crm'

export const CRM_EMAIL_LIMIT = 30
export type ContactTemplates = { whatsapp: string; instagram: string; emailSubject: string; emailBody: string }
export const DEFAULT_CONTACT_TEMPLATES: ContactTemplates = {
  whatsapp: 'Hallo {name},\n\nich bin auf dein Profil über {keyword} aufmerksam geworden.\n\nDarf ich dir ELYSERA vorstellen?\n\nLiebe Grüße',
  instagram: 'Hallo {name}, ich habe dein Profil über {keyword} entdeckt. Darf ich dir mehr über ELYSERA erzählen?',
  emailSubject: 'ELYSERA · Eine persönliche Einladung',
  emailBody: 'Hallo {name},\n\nich möchte dir ELYSERA vorstellen. Hast du Interesse an weiteren Informationen?\n\nLiebe Grüße',
}
export function contactMessage(template: string, lead: Pick<CrmLeadView, 'fullName' | 'username' | 'source'>) {
  const values: Record<string, string> = { name: lead.fullName || lead.username || 'zusammen', username: lead.username || '', keyword: lead.source === 'HarvestMyData' ? '' : lead.source || '' }
  return template.replace(/\{(name|username|keyword)\}/g, (_, key: string) => values[key])
}
export function contactLinks(lead: CrmLeadView, templates: ContactTemplates) {
  if (lead.status === 'DO_NOT_CONTACT') return {}
  const phone = lead.phone?.replace(/[\s().-]/g, '')
  const username = lead.username && /^[a-z0-9._]{1,30}$/i.test(lead.username) ? encodeURIComponent(lead.username) : null
  return {
    call: phone && /^\+?\d{7,15}$/.test(phone) ? `tel:${phone}` : undefined,
    whatsapp: phone && /^\+[1-9]\d{6,14}$/.test(phone) ? `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(contactMessage(templates.whatsapp, lead))}` : undefined,
    instagram: username ? `https://www.instagram.com/${username}/` : undefined,
    instagramDm: username ? `https://ig.me/m/${username}` : undefined,
    email: lead.email ? emailDraft([lead.email], contactMessage(templates.emailSubject, lead), contactMessage(templates.emailBody, lead), false) : undefined,
  }
}
export function emailDraft(emails: string[], subject: string, body: string, bulk = true) {
  const recipients = [...new Set(emails.map(email => email.trim().toLowerCase()))]
  if (!recipients.length || recipients.length > CRM_EMAIL_LIMIT) throw new Error('Select between 1 and 30 email recipients.')
  if (recipients.some(email => !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email))) throw new Error('Invalid recipient email.')
  const params = new URLSearchParams({ ...(bulk ? { bcc: recipients.join(',') } : {}), subject: subject.replace(/[\r\n]/g, ' '), body })
  return `mailto:${bulk ? '' : encodeURIComponent(recipients[0])}?${params.toString()}`
}
