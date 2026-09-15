export function crmReturnPath(value: string | null | undefined) {
  return value === '/admin/crm' ? '/admin/crm' : '/dashboard/crm'
}
export function crmSignInPath(value: string | null | undefined) {
  const path = crmReturnPath(value)
  return `${path === '/admin/crm' ? '/auth/admin' : '/auth/signin'}?next=${encodeURIComponent(path)}`
}
