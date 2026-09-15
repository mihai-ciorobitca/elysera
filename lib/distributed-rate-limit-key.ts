import { createHmac } from 'node:crypto'

export function distributedRateLimitKey(value: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`peptiking-rate-limit-v1\0${value}`)
    .digest('hex')
}
