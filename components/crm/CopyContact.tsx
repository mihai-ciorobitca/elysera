'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import s from './DiamondCrm.module.css'

export function CopyContact({ label, value }: { label: 'email' | 'phone'; value: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  async function copy() {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
      timer.current = setTimeout(() => setState('idle'), 2200)
    } catch { setState('manual') }
  }
  return <div className={s.copyContact}>
    <div className={s.copyValue}><small>{label === 'email' ? 'Email' : 'Phone'}</small><span>{value}</span></div>
    <button type="button" className={s.copyButton} onClick={() => void copy()} aria-label={`Copy ${label}: ${value}`} title={`Copy ${label}`}>
      {state === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />}
    </button>
    <span className={s.copyFeedback} role="status">{state === 'copied' ? `${label === 'email' ? 'Email' : 'Phone'} copied` : state === 'manual' ? 'Copy unavailable. Select the value below to copy manually.' : ''}</span>
    {state === 'manual' && <input className={s.manualCopy} readOnly value={value} aria-label={`Select ${label} to copy`} onFocus={e => e.currentTarget.select()} />}
  </div>
}
