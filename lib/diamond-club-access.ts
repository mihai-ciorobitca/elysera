/** Roles that can intentionally enter the Diamond Performance Club sales portal. */
const DIAMOND_CLUB_ROLES = new Set([
  'ADMIN',
  'AFFILIATE',
  'AFFILIATE_TEST',
  'SUPER_USER',
  'ULTRA_USER',
])

export type DiamondClubAccessUser = {
  role: string | null | undefined
  membership?: string | null
  membershipExpiresAt?: Date | string | null
}

/** Lightweight check used immediately after login. */
export function isDiamondClubCandidateRole(role: string | null | undefined): boolean {
  return DIAMOND_CLUB_ROLES.has(role ?? '') || role === 'AFFILIATE_TRIAL'
}

/** Active members, including time-limited trials, use the gold dashboard. */
export function canAccessDiamondClub(user: DiamondClubAccessUser): boolean {
  if (!user.membership || user.membership === 'NONE') return false

  if (user.membershipExpiresAt) {
    const expiresAt = new Date(user.membershipExpiresAt)
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return false
    }
  }

  return true
}
