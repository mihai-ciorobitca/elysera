import { createHmac, timingSafeEqual } from 'node:crypto'

export function crmUnlockToken(userId: string, accessVersion: string, passwordHash: string, secret: string, expires: number): string {
  const signature = createHmac('sha256', secret).update(JSON.stringify(['diamond-crm-v1', userId, accessVersion, passwordHash, expires])).digest('hex')
  return `${expires}.${signature}`
}
export function verifyCrmUnlock(token: string, userId: string, accessVersion: string, passwordHash: string, secret: string, now = Date.now()): boolean {
  const expires = Number(token.split('.')[0])
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + 8 * 60 * 60 * 1000) return false
  const expected = Buffer.from(crmUnlockToken(userId, accessVersion, passwordHash, secret, expires))
  const actual = Buffer.from(token)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
