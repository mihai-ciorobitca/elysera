'use client'

import { useEffect, useState } from 'react'
import { Check, Search, Users } from 'lucide-react'
import s from './DiamondCrm.module.css'

type Member = { id: string; name: string; email: string; eligible: boolean; approved: boolean; reason: string }
type Props = { busy: boolean; approvedIds: string[]; onAdd: (userId: string) => Promise<void> }

export function CrmMemberPicker({ busy, approvedIds, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<Member[]>([])
  const [selected, setSelected] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setUsers([]); setError(''); setSelected(null)
    if (query.trim().length < 2) { setLoading(false); return () => controller.abort() }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/diamond-crm?${new URLSearchParams({ action: 'search-members', q: query })}`, { signal: controller.signal, cache: 'no-store' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to search users.')
        if (!controller.signal.aborted) setUsers(result.users)
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to search users.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])
  const isApproved = (user: Member) => user.approved || approvedIds.includes(user.id)
  return <form className={s.edit} onSubmit={async e => {
    e.preventDefault()
    if (selected && selected.eligible && !isApproved(selected)) await onAdd(selected.id)
  }}>
    <label>Search existing users<input type="search" autoComplete="off" value={query} maxLength={120} onChange={e => { setQuery(e.target.value); setSelected(null); setUsers([]) }} placeholder="Name or email address" disabled={busy} aria-describedby="crm-member-search-help" /></label>
    <p id="crm-member-search-help" className={s.muted}>Search by name or email, then select an active Diamond Club member. Up to 20 matches are shown.</p>
    <div aria-live="polite">
      {loading ? <p className={s.muted}>Searching users…</p> : error ? <p role="alert" className={s.muted}>{error}</p> : query.trim().length < 2 ? <p className={s.muted}>Enter at least 2 characters.</p> : !users.length ? <p className={s.muted}>No users found. Try another name or email.</p> : <ul className={s.memberResults} aria-label="Matching users">{users.map(user => <li key={user.id}>
        <button type="button" className={s.memberResult} aria-pressed={selected?.id === user.id} disabled={busy || !user.eligible || isApproved(user)} onClick={() => setSelected(user)}>
          <span><strong>{user.name}</strong><span className={s.muted}>{user.email}</span><small>{isApproved(user) ? 'Already approved' : user.reason || 'Eligible for CRM access'}</small></span>
          {selected?.id === user.id || isApproved(user) ? <Check aria-hidden /> : <Search aria-hidden />}
        </button>
      </li>)}</ul>}
    </div>
    {selected && <p className={s.muted}>Selected: <strong>{selected.name}</strong> · {selected.email}</p>}
    <button className={s.primary} disabled={busy || loading || !selected || isApproved(selected)}><Users />{selected && isApproved(selected) ? 'Member added' : busy ? 'Adding member…' : 'Add selected member'}</button>
  </form>
}
