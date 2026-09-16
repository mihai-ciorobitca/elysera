import { RefreshCw } from 'lucide-react'
import s from './DiamondCrm.module.css'

export function CrmLoading() {
  return <div className={s.routeLoading} role="status" aria-live="polite" aria-busy="true">
    <div>
      <RefreshCw className={s.loadingSpin} aria-hidden="true" />
      <h1>Opening your leads…</h1>
      <p>Loading your workspace. Please wait.</p>
    </div>
  </div>
}
