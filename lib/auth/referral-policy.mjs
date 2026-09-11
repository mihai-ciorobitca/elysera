export const referralCookie='elysera-referral'
export function referralCode(value){return typeof value==='string'&&/^[a-zA-Z0-9_-]{3,64}$/.test(value.trim())?value.trim():null}
export function referralLink(origin,code){const valid=referralCode(code);return valid?`${origin}/auth/register?ref=${encodeURIComponent(valid)}`:''}
