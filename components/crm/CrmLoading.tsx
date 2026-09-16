import { RefreshCw } from 'lucide-react'
import s from './DiamondCrm.module.css'

export function CrmLoading() {
  return <main className={s.portal} aria-busy="true"><div className={s.workspace}>
    <div className={s.empty} role="status" aria-live="polite">
      <RefreshCw className={s.loadingSpin} aria-hidden="true" />
      <h1>Opening your leads…</h1>
      <p>Loading your workspace. Please wait.</p>
    </div>
  </div></main>
}
