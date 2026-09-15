'use client'
import { useEffect, useState } from 'react'
import { contactLinks, contactMessage, DEFAULT_CONTACT_TEMPLATES, emailDraft, type ContactTemplates } from '@/lib/crm-contact'
import type { CrmLeadView } from '@/lib/diamond-crm'
import s from './DiamondCrm.module.css'

export function MessageTemplates({ viewerId, templates, onChange }: { viewerId?: string; templates: ContactTemplates; onChange: (value: ContactTemplates) => void }) {
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (!viewerId) return
    try {
      const saved = JSON.parse(localStorage.getItem(`elysera-crm-templates:${viewerId}`) || 'null')
      if (saved && Object.keys(DEFAULT_CONTACT_TEMPLATES).every(key => typeof saved[key] === 'string' && saved[key].length <= 4000)) onChange(saved)
      else onChange({ ...DEFAULT_CONTACT_TEMPLATES })
    } catch { setNotice('Saved templates could not be loaded. You can still edit messages for this session.') }
  }, [viewerId, onChange])
  return <details className={s.panel}><summary>Message templates</summary><div className={s.panelBody}>
    <p className={s.muted}>Edit your WhatsApp, Instagram and email messages. Use {'{name}'}, {'{username}'} and {'{keyword}'} for individual leads. Saved templates belong to your account in this browser.</p>
    <div className={s.templateGrid}>{(Object.keys(DEFAULT_CONTACT_TEMPLATES) as (keyof ContactTemplates)[]).map(key => <div key={key}><label htmlFor={'crm-template-' + key}>{({ whatsapp: 'WhatsApp message', instagram: 'Instagram message', emailSubject: 'Email subject', emailBody: 'Email message' })[key]}</label>{key === 'emailSubject' ? <input id={'crm-template-' + key} value={templates[key]} maxLength={200} onChange={e => { onChange({ ...templates, [key]: e.target.value }); setNotice('Unsaved changes') }} /> : <textarea id={'crm-template-' + key} rows={4} value={templates[key]} maxLength={4000} onChange={e => { onChange({ ...templates, [key]: e.target.value }); setNotice('Unsaved changes') }} />}</div>)}</div>
    <div className={s.actions}><button type="button" disabled={!viewerId} onClick={() => { try { localStorage.setItem(`elysera-crm-templates:${viewerId}`, JSON.stringify(templates)); setNotice('Templates saved.') } catch { setNotice('Browser storage is unavailable. Templates remain usable for this session.') } }}>Save templates</button><button type="button" onClick={() => { onChange({ ...DEFAULT_CONTACT_TEMPLATES }); setNotice('Defaults restored. Save to keep them.') }}>Restore defaults</button><span role="status">{notice}</span></div>
  </div></details>
}

export function ContactActions({ lead, templates }: { lead: CrmLeadView; templates: ContactTemplates }) {
  const [notice, setNotice] = useState('')
  if (lead.status === 'DO_NOT_CONTACT') return <p className={s.muted}>Do not contact this lead.</p>
  const links = contactLinks(lead, templates)
  return <div className={s.contactTools}><div className={s.actions}>
    {links.call && <a className={s.button} href={links.call}>Call</a>}
    {links.whatsapp && <a className={s.button} href={links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
    {links.email && <a className={s.button} href={links.email}>Email</a>}
    {links.instagram && <a className={s.button} href={links.instagram} target="_blank" rel="noopener noreferrer">Instagram profile</a>}
    {links.instagramDm && <a className={s.button} href={links.instagramDm} target="_blank" rel="noopener noreferrer">Instagram DM</a>}
  </div>{links.instagramDm && <details><summary>Instagram preset message</summary><p className={s.messagePreview}>{contactMessage(templates.instagram, lead)}</p><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(contactMessage(templates.instagram, lead)); setNotice('Message copied. Open Instagram DM and paste it.') } catch { setNotice('Select and copy the message above.') } }}>Copy Instagram message</button><p className={s.muted}>Paste this message after opening the DM. If Instagram cannot open the conversation, use the profile’s Message button.</p></details>}<span role="status">{notice}</span></div>
}

type Recipient = { id: string; email: string; fullName: string }
export function BulkEmail({ ids, templates, onClear, preview = false }: { ids: string[]; templates: ContactTemplates; onClear: () => void; preview?: boolean }) {
  const [recipients, setRecipients] = useState<Recipient[] | null>(null)
  const [subject, setSubject] = useState(''), [body, setBody] = useState('')
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { setRecipients(null); setError('') }, [ids])
  async function review() {
    setBusy(true); setError(''); setRecipients(null)
    try {
      if (preview) throw new Error('Use the live CRM to prepare a draft.')
      const response = await fetch('/api/diamond-crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'email-draft', ids }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to check recipients.')
      const generic = { fullName: 'zusammen', username: null, source: '' }
      setSubject(contactMessage(templates.emailSubject, generic)); setBody(contactMessage(templates.emailBody, generic)); setRecipients(result.recipients)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to prepare email.') }
    finally { setBusy(false) }
  }
  let href = ''
  if (recipients) { try { href = emailDraft(recipients.map(r => r.email), subject, body) } catch { /* Unusable recipients never produce a link. */ } }
  return <section className={s.bulkEmail} aria-label="Bulk email"><div className={s.actions}><strong>{ids.length}/30 emails selected</strong><button type="button" disabled={!ids.length || ids.length > 30 || busy} onClick={() => void review()}>{busy ? 'Checking recipients…' : 'Review email draft'}</button><button type="button" disabled={!ids.length || busy} onClick={onClear}>Clear selection</button></div><p className={s.muted}>Select up to 30 leads on this page. Your mail app opens a draft with recipients in BCC.</p>
    {error && <p role="alert">{error}</p>}{recipients && <div className={s.panelBody}><h3>Review {recipients.length} recipients</h3><ul>{recipients.map(r => <li key={r.id}>{r.fullName || r.email} · {r.email}</li>)}</ul><label>Subject<input maxLength={200} value={subject} onChange={e => setSubject(e.target.value)} /></label><label>Message for all selected recipients<textarea rows={6} maxLength={4000} value={body} onChange={e => setBody(e.target.value)} /></label><p className={s.muted}>All recipients receive the same message. Review the greeting before opening your mail app.</p>{href && <a className={`${s.button} ${s.primary}`} href={href}>Open email draft</a>}</div>}
  </section>
}
