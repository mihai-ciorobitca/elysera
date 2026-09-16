'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown, ChevronUp, Eye, EyeOff, LockKeyhole, Mail, Phone, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { CRM_IMPORT_FIELDS, CRM_DEFAULT_IMPORT_FIELDS, type CrmImportField, CRM_STATUSES, CRM_STATUS_LABELS, type CrmLeadView, type CrmSnapshot, type CrmStatus } from '@/lib/diamond-crm'
import s from './DiamondCrm.module.css'
import { CrmMemberPicker } from './CrmMemberPicker'
import { ContactActions, MessageTemplates, BulkEmail } from './CrmContactTools'
import { DEFAULT_CONTACT_TEMPLATES, type ContactTemplates } from '@/lib/crm-contact'
import { CopyContact } from './CopyContact'
import { CrmOutcomeSelect, CrmStatusSelect } from './CrmOutcomeSelect'

type Props = { admin?: boolean; initialGate?: string; initialError?: string; preview?: CrmSnapshot }
type ImportPreview = { total: number; valid: number; duplicates: number; invalid: number; errors: { row: number; message: string }[]; sample: { fullName: string; username: string | null; email: string | null; phone: string | null; source?: string }[] }
async function request(body: Record<string, unknown>) {
  const response = await fetch('/api/diamond-crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'The action failed. Please try again.')
  return result
}
function dateInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
function LeadEditor({ lead, admin, busy, onSave, templates }: { lead: CrmLeadView; admin: boolean; busy: boolean; templates: ContactTemplates; onSave: (body: Record<string, unknown>) => Promise<void> }) {
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.notes)
  const [followUp, setFollowUp] = useState(dateInput(lead.followUpAt))
  const suppressed = lead.status === 'DO_NOT_CONTACT'
  return <div className={s.detail}>
    <div className={s.detailInfo}>
      <p className={s.sectionLabel}>Start a conversation</p>
      <ContactActions lead={lead} templates={templates} />
    </div>
    <form className={s.edit} onSubmit={async e => { e.preventDefault(); await onSave({ action: 'update', id: lead.id, version: lead.version, status, notes, called: Boolean(lead.calledAt), followUpAt: followUp ? new Date(followUp).toISOString() : null }) }}>
      <p className={s.sectionLabel}>Log the result</p>
      <div className={s.formRow}><CrmOutcomeSelect value={status} onChange={setStatus} disabled={busy || (suppressed && !admin)} />{(status === 'FOLLOW_UP' || followUp) && <label>Follow-up date<input type="datetime-local" value={followUp} onChange={e => setFollowUp(e.target.value)} required={status === 'FOLLOW_UP'} disabled={busy || ['DO_NOT_CONTACT', 'WON', 'NOT_INTERESTED'].includes(status)} /></label>}</div>
      <div><label htmlFor={'lead-notes-' + lead.id}>Notes (optional)</label><textarea id={'lead-notes-' + lead.id} rows={3} value={notes} maxLength={5000} onChange={e => setNotes(e.target.value)} placeholder="Add a short note or next step…" disabled={busy} /></div>
      <button className={s.primary + ' ' + s.saveLead} disabled={busy} type="submit"><Check />{busy ? 'Saving…' : 'Save outcome'}</button>
    </form>
    <details className={s.leadMore}><summary>Lead details & activity</summary><div className={s.moreBody}>
      {!![lead.category, lead.country].filter(Boolean).length && <p>{[lead.category, lead.country].filter(Boolean).join(' · ')}</p>}
      {lead.biography && <p>{lead.biography}</p>}
      {lead.username && <a href={'https://www.instagram.com/' + encodeURIComponent(lead.username) + '/'} target="_blank" rel="noopener noreferrer">Open Instagram profile <ArrowUpRight size={14} /></a>}
      {lead.assignedDay && <p>Assigned {lead.assignedDay}</p>}{lead.calledAt && <p>Called {new Date(lead.calledAt).toLocaleDateString()}</p>}
      {!!lead.activities?.length && <div className={s.history}><strong>Recent activity</strong>{lead.activities.map(a => <p key={a.id}><strong>{CRM_STATUS_LABELS[a.status as CrmStatus] ?? a.status}</strong> · {new Date(a.createdAt).toLocaleString()}{a.note && <><br />{a.note}</>}</p>)}</div>}
    </div></details>
  </div>
}

export function DiamondCrm({ admin = false, initialGate = '', initialError = '', preview }: Props) {
  const [data, setData] = useState<CrmSnapshot | null>(preview ?? null)
  const [gate, setGate] = useState(initialGate)
  const [error, setError] = useState(initialError)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(!preview && !initialGate)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [allocationQuantities, setAllocationQuantities] = useState<Record<string, string>>({})
  const [scope, setScope] = useState('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [assignee, setAssignee] = useState('')
  const directoryRef = useRef<HTMLElement>(null)
  function viewMemberLeads(userId: string) {
    setAssignee(userId); setScope('all'); setStatus(''); setSearch(''); setQuery(''); setPage(1); setOpen(null)
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    directoryRef.current?.focus({ preventScroll: true })
  }
  const [page, setPage] = useState(1)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [templates, setTemplates] = useState<ContactTemplates>({ ...DEFAULT_CONTACT_TEMPLATES })
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectingEmails, setSelectingEmails] = useState(false)
  const [importFields, setImportFields] = useState<CrmImportField[]>([...CRM_DEFAULT_IMPORT_FIELDS])
  useEffect(() => { setSelectedEmails([]) }, [data, scope, query, status, assignee, page])
  const [csv, setCsv] = useState('')
  const [filename, setFilename] = useState('')
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const sequence = useRef(0)
  const load = useCallback(async () => {
    if (preview) return
    const id = ++sequence.current
    setLoading(true)
    try {
      const response = await fetch(`/api/diamond-crm?${new URLSearchParams({ scope, q: query, status, assignee, emailOnly: String(selectingEmails), page: String(page) })}`, { cache: 'no-store' })
      const result = await response.json()
      if (id !== sequence.current) return
      if (response.status === 423) { setData(null); setGate('password'); return }
      if ([401, 403].includes(response.status)) { setData(null); setGate(response.status === 401 ? 'signin' : 'denied'); setError(response.status === 401 ? '' : result.error); return }
      if (!response.ok) throw new Error(result.error)
      setData(result); setError('')
    } catch (e) { if (id === sequence.current) setError(e instanceof Error ? e.message : 'Unable to load leads.') }
    finally { if (id === sequence.current) setLoading(false) }
  }, [scope, query, status, assignee, page, preview, selectingEmails])
  useEffect(() => { if (!gate) void load(); return () => { sequence.current++ } }, [load, gate])
  const mutate = async (body: Record<string, unknown>, success = 'Changes saved.') => {
    setBusy(true); setError(''); setMessage('')
    try {
      if (preview) { setMessage('Design preview only. No live data was changed.'); return }
      const result = await request(body)
      if (body.action === 'unlock') { setGate(''); setPassword(''); setShowPassword(false) }
      else if (body.action === 'lock') { setData(null); setGate('password') }
      else if (body.action === 'preview-import') setImportPreview(result)
      else {
        setMessage(body.action === 'allocate' ? `${result.allocated} new leads allocated. Existing assignments stay with their member.` : body.action === 'import' ? `${result.imported} leads imported · ${result.duplicates} duplicates skipped · ${result.invalid} invalid rows skipped.` : success)
        if (body.action === 'password') { setPassword(''); setShowPassword(false) }

        if (body.action === 'import') { setCsv(''); setFilename(''); setImportPreview(null); if (fileRef.current) fileRef.current.value = '' }
        await load()
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save. Please try again.') }
    finally { setBusy(false) }
  }
  const submit = (action: string, extra: Record<string, unknown>) => (e: FormEvent) => { e.preventDefault(); void mutate({ action, ...extra }) }
  const totalCount = Object.values(data?.counts ?? {}).reduce((sum, n) => sum + n, 0)
  const visibleLeads = preview ? data!.leads.filter(l => (!selectingEmails || Boolean(l.email?.trim())) && (!status || l.status === status) && (scope !== 'followup' || l.followUpAt) && (scope !== 'today' || l.assignedDay === data!.day) && (!query || `${l.fullName} ${l.email} ${l.username}`.toLowerCase().includes(query.toLowerCase()))) : data?.leads ?? []
  return <main className={s.workspace} data-theme={admin ? 'admin' : 'diamond'}>
    <header className={s.header}><div className={s.heading}><p className={s.eyebrow}>{admin ? 'ELYSERA · Administration' : 'ELYSERA · Diamond Club'}</p><h1>{admin ? 'Lead management' : 'Your lead workspace'}</h1><p className={s.muted}>{admin ? 'Build the lead pool. Choose your team. Follow every conversation.' : 'Your leads stay with you. Save an outcome for each lead to unlock your next batch.'}</p></div><div className={s.actions}><span className={s.badge}><ShieldCheck />Protected CRM</span>{!gate && !admin && <button onClick={() => void mutate({ action: 'lock' })} disabled={busy}><LockKeyhole />Lock</button>}</div></header>
    {preview && <div className={s.notice}>Design preview · fictional leads · actions do not change live data.</div>}
    {error && <div role="alert" className={`${s.notice} ${s.feedback}`} data-error="true">{error}</div>}
    {message && <div role="status" className={`${s.notice} ${s.feedback}`}><Check />{message}</div>}
    {gate === 'unavailable' ? <section className={s.gate}><RefreshCw /><h2>CRM unavailable</h2><p className={s.muted}>We could not check your access. Please try again shortly.</p><a className={`${s.button} ${s.primary}`} href={admin ? '/admin/crm' : '/dashboard/crm'}>Try again</a></section> : gate ? <section className={s.gate}><LockKeyhole /><div><p className={s.eyebrow}>Private access</p><h2>{gate === 'password' ? 'Unlock your CRM' : gate === 'signin' ? 'Welcome to your CRM' : 'Access by invitation'}</h2></div><p className={s.muted}>{gate === 'password' ? 'Enter the CRM password provided by your administrator. Your unlock lasts up to eight hours.' : gate === 'signin' ? (admin ? 'Sign in with your ELYSERA administrator account to manage leads and your team.' : 'Sign in with your ELYSERA account to continue to your Elysera lead workspace.') : 'CRM access is available to active Club members selected by an administrator.'}</p>{gate !== 'password' && <a className={`${s.button} ${s.primary}`} href={`/api/crm-auth/start?returnTo=${admin ? '/admin/crm' : '/dashboard/crm'}`}>Continue with ELYSERA</a>}{gate === 'password' && <form onSubmit={submit('unlock', { password })}><div className={s.passwordField}><label htmlFor="crm-unlock-password">CRM password</label><div className={s.passwordControl}><input id="crm-unlock-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" className={s.passwordToggle} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="crm-unlock-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={busy}>{showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</button></div></div><button className={s.primary} disabled={busy || !password}>{busy ? 'Unlocking…' : 'Unlock workspace'}</button></form>}</section> : <>
      <div className={s.stats} aria-label="CRM summary">{[
        [admin ? 'Unassigned leads' : 'Assigned to you', admin ? data?.pool : totalCount],
        ['Awaiting outcome', data?.counts.NEW ?? 0], ['Interested', data?.counts.INTERESTED ?? 0], [admin ? 'Approved members' : 'Converted', admin ? data?.members.filter(m => m.enabled).length : data?.counts.WON ?? 0],
      ].map(([label, value]) => <div className={s.stat} key={label}><span>{label}</span><strong>{data ? value : '—'}</strong></div>)}</div>
      {admin && data && !data.passwordConfigured && <div className={s.notice}><LockKeyhole />Set the CRM password under access settings before inviting members.</div>}
      {admin && <div className={`${s.tools} ${s.sectionGap}`}>
        <details className={s.panel} open><summary>Import from HarvestMyData</summary><div className={s.panelBody}><p className={s.muted}>Upload the CSV delivered by HarvestMyData. Review the contacts before adding them to your pool.</p><label>CSV file · up to 5 MB / 10,000 rows<input ref={fileRef} type="file" accept=".csv,text/csv" disabled={busy} onChange={async e => { const file = e.target.files?.[0]; setImportPreview(null); setCsv(''); setFilename(''); if (!file) return; if (file.size > 5 * 1024 * 1024) { setError('Choose a CSV smaller than 5 MB.'); return } try { const text = await file.text(); setCsv(text); setFilename(file.name) } catch { setError('Unable to read the selected file.') } }} /></label><fieldset className={s.importColumns}><legend>Columns to import</legend>{CRM_IMPORT_FIELDS.map(field => <label key={field}><input type="checkbox" checked={importFields.includes(field)} disabled={busy} onChange={e => { setImportFields(current => e.target.checked ? [...current, field] : current.filter(f => f !== field)); setImportPreview(null) }} />{({ fullName: 'Name', phone: 'Phone', email: 'Email', username: 'Instagram username', source: 'Keyword (source_username)', country: 'Country', category: 'Category', biography: 'Biography', website: 'Website' })[field]}</label>)}</fieldset><p className={s.muted}>Your full CSV export is supported. Only checked fields are imported; extra columns are ignored.</p><div className={s.actions}><button disabled={busy || !csv} onClick={() => void mutate({ action: 'preview-import', csv, filename, fields: importFields })}><ArrowDownToLine />Review import</button><a href="https://harvestmydata.com/#tool" target="_blank" rel="noopener noreferrer" className={s.button}>Open HarvestMyData<ArrowUpRight /></a></div>
          {importPreview && <section className={s.importReview} aria-label="Import review">
            <header className={s.reviewHeading}><div><p className={s.eyebrow}>Ready to review</p><h3>Import preview</h3></div><span className={s.reviewFilename} title={filename}>{filename}</span></header>
            <dl className={s.reviewCounts}>{[[importPreview.valid, 'Valid contacts'], [importPreview.duplicates, 'File duplicates'], [importPreview.invalid, 'Invalid rows']].map(([count, label]) => <div key={label}><dd>{Number(count).toLocaleString('en-US')}</dd><dt>{label}</dt></div>)}</dl>
            <div className={s.reviewCaption}><strong>Contact sample</strong><span>First {importPreview.sample.length} of {importPreview.valid.toLocaleString('en-US')} valid contacts</span></div>
            <div className={s.reviewTableWrap}><table className={s.reviewTable}><thead><tr><th scope="col">Contact</th><th scope="col">Email & phone</th><th scope="col">Keyword</th></tr></thead><tbody>{importPreview.sample.map((row, i) => <tr key={i}><td data-label="Contact"><strong>{row.fullName || row.username || 'Unnamed contact'}</strong>{row.username && <span className={s.reviewHandle}>@{row.username}</span>}</td><td data-label="Email & phone"><span className={row.email ? s.reviewValue : s.reviewMissing}>{row.email || 'No email'}</span><span className={row.phone ? s.reviewValue : s.reviewMissing}>{row.phone || 'No phone'}</span></td><td data-label="Keyword">{row.source ? <span className={s.reviewKeyword}>{row.source}</span> : <span className={s.reviewMissing}>Not provided</span>}</td></tr>)}</tbody></table></div>
            {!!importPreview.errors.length && <details className={s.reviewErrors}><summary>View invalid rows ({importPreview.invalid})</summary><ul>{importPreview.errors.map(e => <li key={e.row}><strong>Row {e.row}</strong> — {e.message}</li>)}</ul>{importPreview.invalid > importPreview.errors.length && <p>Showing the first {importPreview.errors.length} errors.</p>}</details>}
            <footer className={s.reviewFooter}><p>Existing contacts are skipped. Saved conversations stay unchanged.</p><button className={s.primary} disabled={busy || !importPreview.valid} onClick={() => void mutate({ action: 'import', csv, filename, fields: importFields })}>{busy ? 'Importing…' : 'Import ' + importPreview.valid.toLocaleString('en-US') + ' contacts'}</button></footer>
          </section>}
          <p className={s.muted}>Rows need an email, phone or Instagram username. Instagram-only leads are included. Imports never overwrite existing conversations.</p></div></details>
        <details className={s.panel}><summary>Member access & CRM password</summary><div className={s.panelBody}><CrmMemberPicker busy={busy} approvedIds={(data?.members ?? []).filter(member => member.enabled).map(member => member.userId)} onAdd={userId => mutate({ action: 'member', userId, enabled: true }, 'Member added to CRM.')} /><form className={s.edit} onSubmit={submit('password', { password })}><div className={s.passwordField}><label htmlFor="crm-new-password">Set or replace the shared CRM password</label><div className={s.passwordControl}><input id="crm-new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" className={s.passwordToggle} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="crm-new-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={busy}>{showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</button></div></div><p className={s.muted}>At least 12 characters. Replacing it locks all member sessions. Share it privately with approved members.</p><button disabled={busy}>Save CRM password</button></form></div></details>
      </div>}
      <MessageTemplates viewerId={data?.viewerId} templates={templates} onChange={setTemplates} />
      {admin && <section className={s.panel}><div className={s.panelHead}><div><h2>Lead allocation</h2><p className={s.muted}>Choose how many leads to assign to each member. Members request batches of 50 after saving outcomes; you can add any available quantity anytime.</p></div><button className={s.primary} disabled={busy || loading || !data?.members.some(m => m.enabled)} onClick={() => void mutate({ action: 'allocate' })}>Allocate to ready members</button></div><div className={s.panelBody}>{!data?.members.length ? <p className={s.muted}>No members approved yet. Add a member under access settings.</p> : data.members.map(m => <div key={m.userId} className={s.member}><div><strong>{m.name}</strong><p>{m.email}</p><p>{m.assignedTotal ?? 0} assigned · {m.pending ?? 0} awaiting outcome · {m.interested} interested</p></div><div className={s.actions}><button type="button" className={s.primary} disabled={busy} onClick={() => viewMemberLeads(m.userId)} aria-label={'View allocated leads for ' + m.name}>View allocated leads</button><form className={s.allocateForm} onSubmit={e => { e.preventDefault(); void mutate({ action: 'allocate', userId: m.userId, override: true, quantity: Number(allocationQuantities[m.userId]) }) }}><label>Number of leads<input aria-label={'Leads to assign to ' + m.name} type="number" inputMode="numeric" min={1} max={data?.pool || 1} step={1} required placeholder="Quantity" value={allocationQuantities[m.userId] ?? ''} onChange={e => setAllocationQuantities(current => ({ ...current, [m.userId]: e.target.value }))} disabled={busy || !m.enabled} /></label><button type="submit" disabled={busy || loading || !m.enabled || !data?.pool || !allocationQuantities[m.userId]}>Assign leads</button></form><button disabled={busy} onClick={() => void mutate({ action: 'member', email: m.email, enabled: !m.enabled })}>{m.enabled ? 'Revoke access' : 'Restore access'}</button></div><progress aria-label={`Leads with outcomes for ${m.name}`} className={s.progress} value={(m.assignedTotal ?? 0) - (m.pending ?? 0)} max={Math.max(1, m.assignedTotal ?? 0)} /></div>)}</div></section>}
      {!admin && data && <div className={s.notice}><div><strong>{(data.counts.NEW ?? 0) > 0 ? (data.counts.NEW + ' leads awaiting an outcome') : 'Ready for your next batch'}</strong><p className={s.muted}>Save a contacted or other outcome for every new lead to get up to 50 more. Your administrator can give you extra leads anytime. Existing leads stay here.</p></div><button disabled={busy || loading || (data.counts.NEW ?? 0) > 0} onClick={() => void mutate({ action: 'allocate' })}>Get 50 more leads</button></div>}
      <section ref={directoryRef} tabIndex={-1} className={s.panel} aria-label="Lead directory" aria-busy={loading}><div className={s.panelHead}><div><h2>{admin ? (assignee && assignee !== 'unassigned' ? 'Allocated leads · ' + (data?.members.find(m => m.userId === assignee)?.name || 'Selected member') : 'Lead directory') : 'Your conversations'}</h2><p className={s.muted}>{totalCount} leads {admin ? (assignee ? assignee === 'unassigned' ? 'unassigned' : 'assigned to this member' : 'in the workspace') : 'assigned to you'} · {data?.day ?? 'Today'} (Berlin)</p></div><div className={s.tabs}>{[['all', 'All leads'], ['today', 'Assigned today'], ['followup', 'Follow-ups']].map(([v, label]) => <button key={v} aria-label={v === 'followup' ? 'Follow-ups due' : label} title={v === 'followup' ? 'Follow-ups due' : undefined} aria-pressed={scope === v} onClick={() => { setScope(v); setPage(1); setOpen(null) }}>{label}</button>)}</div></div>
        {admin && assignee && <div className={s.memberFilter}><span>Showing {assignee === 'unassigned' ? 'unassigned leads' : 'leads allocated to ' + (data?.members.find(m => m.userId === assignee)?.name || 'selected member')}</span><button type="button" onClick={() => viewMemberLeads('')}>Show everyone</button></div>}
        <form className={s.filters} onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1) }}><label className={s.search}>Search contacts<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, username, email, phone or keyword" /></label><CrmStatusSelect label="Status" includeAll value={status} onChange={value => { setStatus(value); setPage(1) }} />{admin && <label>Assigned to<select value={assignee} onChange={e => { setAssignee(e.target.value); setPage(1) }}><option value="">Everyone</option><option value="unassigned">Unassigned</option>{data?.members.map(m => <option value={m.userId} key={m.userId}>{m.name}</option>)}</select></label>}<button disabled={loading}>Search</button><button type="button" aria-label="Refresh leads" disabled={loading || busy} onClick={() => void load()}><RefreshCw /></button></form>
        <div className={s.emailMode}><button type="button" aria-pressed={selectingEmails} onClick={() => { setSelectingEmails(value => !value); setSelectedEmails([]); setPage(1); setOpen(null) }}>{selectingEmails ? 'Done selecting' : 'Select for bulk email'}</button></div>
        {selectingEmails && <BulkEmail ids={selectedEmails} templates={templates} onClear={() => setSelectedEmails([])} preview={Boolean(preview)} />}
        {loading ? <div className={s.empty} role="status"><RefreshCw className={s.loadingSpin} aria-hidden /><h3>Loading your leads…</h3><p>Getting the latest assignments and outcomes.</p></div> : !visibleLeads.length ? <div className={s.empty}><Users /><h3>{error ? 'Leads could not be loaded' : 'No leads in this view'}</h3><p>{error ? 'Use refresh to try again.' : 'Try All leads or a different search. New uploads are distributed to approved members.'}</p></div> : <ul className={s.list}>{visibleLeads.map(lead => <li className={s.lead} key={lead.id}><div className={s.leadRow} data-selecting={selectingEmails}>{selectingEmails && <label className={s.emailSelect}><input type="checkbox" aria-label={'Select email for ' + (lead.fullName || lead.username || lead.email || 'lead')} checked={selectedEmails.includes(lead.id)} disabled={!lead.email || lead.status === 'DO_NOT_CONTACT' || (!selectedEmails.includes(lead.id) && selectedEmails.length >= 30)} onChange={e => setSelectedEmails(current => e.target.checked ? current.length < 30 ? [...current, lead.id] : current : current.filter(id => id !== lead.id))} /></label>}<div className={s.identity}><span className={s.avatar}>{(lead.fullName || lead.username || 'L').slice(0, 2).toUpperCase()}</span><div><strong>{lead.fullName || lead.username || 'Unnamed contact'}</strong><small>{lead.username ? `@${lead.username}` : 'Imported contact'}{lead.country ? ` · ${lead.country}` : ''}</small><small>Keyword: {lead.source && lead.source !== 'HarvestMyData' ? lead.source : 'Not provided'}</small></div></div><div className={s.contact}><CopyContact label="email" value={lead.email} /><CopyContact label="phone" value={lead.phone} />{lead.calledAt && <span>Called</span>}{lead.followUpAt && <span>Follow-up: {new Date(lead.followUpAt).toLocaleString()}</span>}</div><span className={s.badge} data-status={lead.status}>{CRM_STATUS_LABELS[lead.status]}</span><button aria-expanded={open === lead.id} aria-controls={`crm-${lead.id}`} onClick={() => setOpen(open === lead.id ? null : lead.id)}>Open{open === lead.id ? <ChevronUp /> : <ChevronDown />}</button></div>{open === lead.id && <div id={`crm-${lead.id}`}><LeadEditor key={`${lead.id}-${lead.version}`} lead={lead} admin={admin} busy={busy} templates={templates} onSave={body => mutate(body, 'Lead outcome saved.')} /></div>}</li>)}</ul>}
        <div className={s.pagination}><span className={s.muted}>{data?.total ?? 0} matching leads · Page {page} of {Math.max(1, Math.ceil((data?.total ?? 0) / 50))}</span><div className={s.actions}><button disabled={loading || page <= 1} onClick={() => { setPage(p => p - 1); setOpen(null) }}>Previous</button><button disabled={loading || page * 50 >= (data?.total ?? 0)} onClick={() => { setPage(p => p + 1); setOpen(null) }}>Next</button></div></div>
      </section><p className={s.footnote}>Persistent assignments · Batches of 50 after outcomes are saved, or allocated by your administrator · {admin ? 'HarvestMyData CSV import' : 'Only your assigned leads are visible'}</p>
    </>}
  </main>
}
