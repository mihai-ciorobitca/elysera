import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { currentAdmin, currentUser } from '@/lib/auth/server'
import { canAccessDiamondClub, isDiamondClubCandidateRole } from '@/lib/diamond-club-access'
import { crmDay, CRM_BATCH_SIZE, allocationBatchSize, type CrmSnapshot, type CrmStatus } from '@/lib/diamond-crm'
import { verifyCrmUnlock } from '@/lib/diamond-crm-token'

export const CRM_COOKIE = 'elysera-crm-unlock'
export class CrmError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export async function crmIdentity() {
  const administrator = await currentAdmin()
  if (administrator) return { userId: administrator.id as string, admin: true, accessVersion: 'admin' }
  const principal = await currentUser()
  const userId = principal?.id as string | undefined
  if (!userId) throw new CrmError('Sign in to access the CRM.', 401)
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { crmMembership: true } })
  if (!user || user.blocked) throw new CrmError('CRM access is unavailable for this account.', 403)
  if (!isDiamondClubCandidateRole(user.role) || !canAccessDiamondClub({ role: user.role, membership: user.membership, membershipExpiresAt: user.membership_expires_at }) || !user.crmMembership?.enabled) {
    throw new CrmError('Your administrator must enable CRM access for your active Diamond Club account.', 403)
  }
  return { userId, admin: false, accessVersion: user.crmMembership.updatedAt.toISOString() }
}

export async function requireCrmAccess(adminOnly = false) {
  const identity = await crmIdentity()
  if (adminOnly && !identity.admin) throw new CrmError('Administrator access required.', 403)
  // Admin uses its existing protected admin session. Members additionally unlock the CRM.
  if (!identity.admin) {
    const settings = await prisma.crmSettings.findUnique({ where: { id: 1 } })
    const secret = process.env.ELYSERA_RATE_LIMIT_SECRET || process.env.NEXTAUTH_SECRET
    const token = (await cookies()).get(CRM_COOKIE)?.value ?? ''
    if (!settings?.passwordHash || !secret || !verifyCrmUnlock(token, identity.userId, identity.accessVersion, settings.passwordHash, secret)) {
      throw new CrmError('Enter the CRM password to continue.', 423)
    }
  }
  return identity
}

/** Serializes allocation across cron, admins and member claims, including multiple instances. */
export async function allocateCrmLeads(onlyUserId?: string, adminOverride = false) {
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73190452)`
    const day = crmDay()
    const members = await tx.crmMember.findMany({
      where: { enabled: true, ...(onlyUserId ? { userId: onlyUserId } : {}), user: { blocked: false } },
      include: { user: { select: { role: true, membership: true, membership_expires_at: true } } },
      orderBy: { userId: 'asc' },
    })
    const eligible = members.filter(m => isDiamondClubCandidateRole(m.user.role) && canAccessDiamondClub({ role: m.user.role, membership: m.user.membership, membershipExpiresAt: m.user.membership_expires_at }))
    const counts = await tx.crmLead.groupBy({ by: ['assignedToId'], where: { assignedToId: { in: eligible.map(m => m.userId) }, status: 'NEW' }, _count: true })
    const remaining = new Map(eligible.map(member => [member.userId, allocationBatchSize(counts.find(c => c.assignedToId === member.userId)?._count ?? 0, adminOverride)]))
    const totalNeeded = Array.from(remaining.values()).reduce((sum, count) => sum + count, 0)
    if (!totalNeeded) return { day, allocated: 0 }
    const pool = await tx.crmLead.findMany({ where: { assignedToId: null, assignedDay: null, status: 'NEW' }, select: { id: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: totalNeeded })
    const assignments = new Map(eligible.map(member => [member.userId, [] as string[]]))
    let cursor = 0
    // Share a short pool evenly instead of exhausting it for the first user.
    for (let round = 0; round < CRM_BATCH_SIZE && cursor < pool.length; round++) {
      for (const [userId, needed] of Array.from(remaining)) {
        if (round < needed && cursor < pool.length) assignments.get(userId)!.push(pool[cursor++].id)
      }
    }
    for (const [userId, ids] of Array.from(assignments)) {
      if (ids.length) await tx.crmLead.updateMany({ where: { id: { in: ids }, assignedToId: null }, data: { assignedToId: userId, assignedDay: day, assignedAt: new Date() } })
    }
    return { day, allocated: cursor }
  }, { timeout: 30000, maxWait: 10000 })
}

export async function crmSnapshot(identity: Awaited<ReturnType<typeof crmIdentity>>, params: URLSearchParams): Promise<CrmSnapshot> {
  const day = crmDay()
  const page = Math.min(100000, Math.max(1, Number(params.get('page')) || 1)) | 0
  const q = (params.get('q') ?? '').trim().slice(0, 200)
  const status = params.get('status')
  const assignee = params.get('assignee')
  const base = identity.admin ? (assignee ? { assignedToId: assignee === 'unassigned' ? null : assignee } : {}) : { assignedToId: identity.userId }
  const where = {
    ...base,
    ...(status ? { status } : {}),
    ...(params.get('scope') === 'today' ? { assignedDay: day } : {}),
    ...(params.get('scope') === 'followup' ? { followUpAt: { lte: new Date() }, AND: [{ status: { notIn: ['DO_NOT_CONTACT', 'WON', 'NOT_INTERESTED'] } }] } : {}),
    ...(q ? { OR: ['fullName', 'username', 'email', 'phone', 'country', 'source'].map(field => ({ [field]: { contains: q, mode: 'insensitive' as const } })) } : {}),
  }
  const [leads, total, pool, assignedToday, grouped, members] = await Promise.all([
    prisma.crmLead.findMany({ where, take: 50, skip: (page - 1) * 50, orderBy: [{ assignedAt: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }], include: { activities: { take: 5, orderBy: { createdAt: 'desc' } } } }),
    prisma.crmLead.count({ where }),
    identity.admin ? prisma.crmLead.count({ where: { assignedToId: null, assignedDay: null, status: 'NEW' } }) : Promise.resolve(0),
    prisma.crmLead.count({ where: { ...base, assignedDay: day } }),
    prisma.crmLead.groupBy({ by: ['status'], where: base, _count: true }),
    identity.admin ? prisma.crmMember.findMany({ include: { user: { select: { email: true, firstName: true, secondName: true } } }, orderBy: { createdAt: 'asc' } }) : Promise.resolve([]),
  ])
  const memberStats = identity.admin ? await prisma.crmLead.groupBy({ by: ['assignedToId', 'assignedDay', 'status'], where: { assignedToId: { in: members.map(m => m.userId) } }, _count: true }) : []
  const workedToday = identity.admin ? await prisma.crmLead.groupBy({ by: ['assignedToId'], where: { assignedDay: day, assignedToId: { in: members.map(m => m.userId) }, OR: [{ status: { not: 'NEW' } }, { calledAt: { not: null } }] }, _count: true }) : []
  return {
    viewerId: identity.userId,
    passwordConfigured: identity.admin ? Boolean((await prisma.crmSettings.findUnique({ where: { id: 1 }, select: { passwordHash: true } }))?.passwordHash) : true,
    day, total, page, pool, assignedToday, counts: Object.fromEntries(grouped.map(group => [group.status, group._count])),
    leads: leads.map(lead => ({ ...lead, status: lead.status as CrmStatus, calledAt: lead.calledAt?.toISOString() ?? null, followUpAt: lead.followUpAt?.toISOString() ?? null, activities: lead.activities.map(a => ({ id: a.id, status: a.status, note: a.note, createdAt: a.createdAt.toISOString() })) })),
    members: members.map(m => {
      const stats = memberStats.filter(s => s.assignedToId === m.userId)
      return { userId: m.userId, email: m.user.email, name: [m.user.firstName, m.user.secondName].filter(Boolean).join(' ') || m.user.email, enabled: m.enabled,
        assignedTotal: stats.reduce((sum, s) => sum + s._count, 0),
        pending: stats.filter(s => s.status === 'NEW').reduce((sum, s) => sum + s._count, 0),
        assignedToday: stats.filter(s => s.assignedDay === day).reduce((sum, s) => sum + s._count, 0),
        workedToday: workedToday.find(s => s.assignedToId === m.userId)?._count ?? 0,
        interested: stats.filter(s => s.status === 'INTERESTED').reduce((sum, s) => sum + s._count, 0) }
    }),
  }
}
