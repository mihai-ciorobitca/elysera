'use client'
import { useEffect, useRef, useState } from 'react'
import { contactLinks, contactMessage, DEFAULT_CONTACT_TEMPLATES, emailDraft, type ContactTemplates } from '@/lib/crm-contact'
import type { CrmLeadView } from '@/lib/diamond-crm'
import s from './DiamondCrm.module.css'

export function MessageTemplates({ viewerId, templates, onChange }: { viewerId?: string; templates: ContactTemplates; onChange: (value: ContactTemplates) => void }) {
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (!viewerId) return
    try {
      const saved = JSON.parse(localStorage.getItem(`elysera-crm-templates:${viewerId}`) || 'null')
      if (saved && Object.keys(DEFAULT_CONTACT_TEMPLATES).every(key => typeof saved[key] === 'string' && saved[key].length <= 4000)) {
        if (saved.whatsapp === 'Hallo {name}, ich bin auf dein Profil über {keyword} aufmerksam geworden. Darf ich dir ELYSERA vorstellen?') {
          saved.whatsapp = DEFAULT_CONTACT_TEMPLATES.whatsapp
          localStorage.setItem('elysera-crm-templates:' + viewerId, JSON.stringify(saved))
        }
        if (saved.instagram === 'Hallo {name}, ich habe dein Profil über {keyword} entdeckt. Darf ich dir mehr über ELYSERA erzählen?') {
          saved.instagram = DEFAULT_CONTACT_TEMPLATES.instagram
          localStorage.setItem('elysera-crm-templates:' + viewerId, JSON.stringify(saved))
        }
        onChange(saved)
      }
      else onChange({ ...DEFAULT_CONTACT_TEMPLATES })
    } catch { setNotice('Saved templates could not be loaded. You can still edit messages for this session.') }
  }, [viewerId, onChange])
  return <details className={s.panel}><summary>Message templates</summary><div className={s.panelBody}>
    <p className={s.muted}>Edit your WhatsApp, Instagram and email messages. Use {'{name}'}, {'{username}'} and {'{keyword}'} for individual leads. Saved templates belong to your account in this browser.</p>
    <div className={s.templateGrid}>{(Object.keys(DEFAULT_CONTACT_TEMPLATES) as (keyof ContactTemplates)[]).map(key => <div key={key}><label htmlFor={'crm-template-' + key}>{({ whatsapp: 'WhatsApp message', instagram: 'Instagram message', emailSubject: 'Email subject', emailBody: 'Email message' })[key]}</label>{key === 'emailSubject' ? <input id={'crm-template-' + key} value={templates[key]} maxLength={200} onChange={e => { onChange({ ...templates, [key]: e.target.value }); setNotice('Unsaved changes') }} /> : <textarea id={'crm-template-' + key} rows={4} value={templates[key]} maxLength={4000} onChange={e => { onChange({ ...templates, [key]: e.target.value }); setNotice('Unsaved changes') }} />}</div>)}</div>
    <div className={s.actions}><button type="button" disabled={!viewerId} onClick={() => { try { localStorage.setItem(`elysera-crm-templates:${viewerId}`, JSON.stringify(templates)); setNotice('Templates saved.') } catch { setNotice('Browser storage is unavailable. Templates remain usable for this session.') } }}>Save templates</button><button type="button" onClick={() => { onChange({ ...DEFAULT_CONTACT_TEMPLATES }); setNotice('Defaults restored. Save to keep them.') }}>Restore defaults</button>{notice && <span role="status" className={s.copyNotice}>{notice}</span>}</div>
  </div></details>
}

export function ContactActions({ lead, templates }: { lead: CrmLeadView; templates: ContactTemplates }) {
  const [notice, setNotice] = useState('')
  const messageDrawer = useRef<HTMLDetailsElement>(null)
  if (lead.status === 'DO_NOT_CONTACT') return <p className={s.muted}>Do not contact this lead.</p>
  const links = contactLinks(lead, templates)
  async function copyInstagram(openChat = false) {
    const text = contactMessage(templates.instagram, lead)
    let copied = false
    try { await navigator.clipboard.writeText(text); copied = true } catch {
      // Local phone testing uses HTTP, where the Clipboard API is unavailable.
      const field = document.createElement('textarea')
      field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0'
      document.body.appendChild(field); field.focus(); field.select(); field.setSelectionRange(0, text.length)
      try { copied = document.execCommand('copy') } catch { copied = false } finally { field.remove() }
    }
    if (copied) {
      setNotice('Message copied. Paste it into Instagram to send.')
      if (openChat && links.instagramDm) window.location.assign(links.instagramDm)
    } else {
      setNotice('Select and copy the message below, then open Instagram DM.')
      if (messageDrawer.current) messageDrawer.current.open = true
    }
  }
  return <div className={s.contactTools}><div className={s.quickContact}>
    {([
      { label: 'Call', href: links.call, external: false, missing: 'No phone number available' },
      { label: 'WhatsApp', href: links.whatsapp, external: true, missing: 'No international phone number available' },
      { label: 'Email', href: links.email, external: false, missing: 'No email address available' },
      { label: 'Instagram profile', href: links.instagram, external: true, missing: 'No Instagram username available' },
      { label: 'Instagram DM', href: links.instagramDm, external: true, missing: 'No Instagram username available' },
    ]).map(action => action.href ? <a key={action.label} className={s.button} href={action.href} onClick={action.label === 'Instagram DM' ? e => { e.preventDefault(); void copyInstagram(true) } : undefined} title={action.label === 'Instagram DM' ? 'Copy preset message and open Instagram — paste to send' : undefined} target={action.external ? '_blank' : undefined} rel={action.external ? 'noopener noreferrer' : undefined}>{action.label}</a> : <button key={action.label} type="button" disabled title={action.missing}>{action.label}</button>)}
  </div>{links.instagramDm && <details ref={messageDrawer} className={s.messageDrawer}><summary>Instagram message · copy & paste</summary><textarea className={s.instagramCopyText} aria-label="Instagram message to copy" readOnly rows={4} value={contactMessage(templates.instagram, lead)} onFocus={e => e.currentTarget.select()} /><button type="button" onClick={() => void copyInstagram()}>Copy message</button><a className={s.button} href={links.instagramDm} target="_blank" rel="noopener noreferrer">Open Instagram DM</a><p className={s.instagramHint}>Paste the copied message into the chat.</p></details>}<span role="status">{notice}</span></div>
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
