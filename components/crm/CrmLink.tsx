'use client'

import Link, { useLinkStatus } from 'next/link'
import { createPortal } from 'react-dom'
import type { ComponentProps } from 'react'
import { CrmLoading } from './CrmLoading'

function PendingLeads() {
  const { pending } = useLinkStatus()
  return pending ? createPortal(<CrmLoading />, document.body) : null
}

export function CrmLink({ children, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props}>{children}<PendingLeads /></Link>
}
