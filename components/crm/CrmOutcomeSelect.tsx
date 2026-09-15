'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { CRM_STATUSES, CRM_STATUS_LABELS, type CrmStatus } from '@/lib/diamond-crm'
import s from './DiamondCrm.module.css'

export function CrmOutcomeSelect({ value, onChange, disabled }: { value: CrmStatus; onChange: (value: CrmStatus) => void; disabled: boolean }) {
  return <CrmStatusSelect value={value} onChange={value => onChange(value as CrmStatus)} disabled={disabled} />
}

export function CrmStatusSelect({ value, onChange, disabled = false, includeAll = false, label = "Outcome" }: { value: string; onChange: (value: string) => void; disabled?: boolean; includeAll?: boolean; label?: string }) {
  const options: string[] = includeAll ? ["", ...CRM_STATUSES] : [...CRM_STATUSES]
  const text = (status: string) => status === "" ? "All statuses" : CRM_STATUS_LABELS[status as CrmStatus]
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  useEffect(() => { if (disabled) setOpen(false) }, [disabled])
  useEffect(() => {
    if (open) root.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])
  function choose(index: number) { onChange(options[index]); setOpen(false) }
  return <div ref={root} className={s.outcomeField} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
    <label htmlFor={id}>{label}</label>
    <button id={id} type="button" role="combobox" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open ? `${id}-${active}` : undefined} disabled={disabled} className={s.outcomeTrigger}
      onClick={() => { setActive(options.indexOf(value)); setOpen(!open) }}
      onKeyDown={e => {
        if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); return }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (!open) { setActive(options.indexOf(value)); setOpen(true) }
          else setActive(n => (n + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
        } else if (open && (e.key === 'Home' || e.key === 'End')) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : options.length - 1) }
        else if (open && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose(active) }
      }}>
      <span className={s.outcomeValue}><i className={s.outcomeDot} data-status={value} />{text(value)}</span><ChevronDown aria-hidden className={open ? s.chevronOpen : undefined} />
    </button>
    {open && <div id={`${id}-options`} role="listbox" aria-label={label} className={s.outcomeOptions}>
      {options.map((status, index) => <div key={status} id={`${id}-${index}`} role="option" aria-selected={value === status} data-option-index={index} data-active={active === index} className={s.outcomeOption} onPointerMove={() => setActive(index)} onMouseDown={e => e.preventDefault()} onClick={() => choose(index)}>
        <span className={s.outcomeValue}><i className={s.outcomeDot} data-status={status} />{text(status)}</span>{value === status && <Check aria-hidden />}
      </div>)}
    </div>}
  </div>
}
