import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { allocateCrmLeads, CrmError, CRM_COOKIE, crmIdentity, crmSnapshot, requireCrmAccess } from '@/lib/diamond-crm-server'
import { CRM_IMPORT_FIELDS, CRM_DEFAULT_IMPORT_FIELDS, type CrmImportField, isCrmStatus, parseHarvestCsv } from '@/lib/diamond-crm'
import { crmUnlockToken } from '@/lib/diamond-crm-token'
import { isSameOriginMutation } from '@/lib/same-origin-request'
import { checkDistributedRateLimit } from '@/lib/distributed-rate-limit'
import { isDiamondClubCandidateRole, canAccessDiamondClub } from '@/lib/diamond-club-access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })
function failure(error: unknown) {
  if (error instanceof CrmError) return json({ error: error.message }, error.status)
  console.error('[diamond-crm] request failed', error instanceof Error ? error.name : 'unknown')
  return json({ error: 'CRM is temporarily unavailable. Please try again.' }, 503)
}
export async function GET(request: NextRequest) {
  try {
    const identity = await requireCrmAccess()
    if (request.nextUrl.searchParams.get('action') === 'search-members') {
      if (!identity.admin) throw new CrmError('Administrator access required.', 403)
      const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120)
      if (q.length < 2) return json({ users: [] })
      const users = await prisma.user.findMany({
        where: { AND: q.split(/\s+/).slice(0, 6).map(term => ({ OR: ['email', 'firstName', 'secondName'].map(field => ({ [field]: { contains: term, mode: 'insensitive' as const } })) })) },
        select: { id: true, email: true, firstName: true, secondName: true, role: true, membership: true, membership_expires_at: true, blocked: true, crmMembership: { select: { enabled: true } } },
        orderBy: [{ firstName: 'asc' }, { email: 'asc' }], take: 20,
      })
      return json({ users: users.map(user => {
        const eligible = !user.blocked && isDiamondClubCandidateRole(user.role) && canAccessDiamondClub({ role: user.role, membership: user.membership, membershipExpiresAt: user.membership_expires_at })
        return { id: user.id, email: user.email, name: [user.firstName, user.secondName].filter(Boolean).join(' ') || user.email, eligible, approved: Boolean(user.crmMembership?.enabled), reason: user.blocked ? 'Account blocked' : !eligible ? 'Active Diamond Club membership required' : '' }
      }) })
    }
    return json(await crmSnapshot(identity, request.nextUrl.searchParams))
  } catch (error) { return failure(error) }
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new CrmError('JSON is required.', 415)
  const reader = request.body?.getReader()
  if (!reader) throw new CrmError('Request body is required.')
  const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 6 * 1024 * 1024) { await reader.cancel(); throw new CrmError('Upload is too large.', 413) }
    chunks.push(value)
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error()
    return parsed as Record<string, unknown>
  } catch { throw new CrmError('Invalid JSON request.') }
}
export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginMutation(request)) throw new CrmError('Invalid request origin.', 403)
    const identity = await crmIdentity()
    const body = await readBody(request)
    if (body.action === 'unlock') {
      const rate = await checkDistributedRateLimit(`crm-unlock:${identity.userId}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
      if (!rate.allowed) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec), 'Cache-Control': 'no-store' } })
      const settings = await prisma.crmSettings.findUnique({ where: { id: 1 } })
      const secret = process.env.ELYSERA_RATE_LIMIT_SECRET || process.env.NEXTAUTH_SECRET
      if (!settings?.passwordHash || !secret) throw new CrmError('Your administrator must configure the CRM password first.', 503)
      if (typeof body.password !== 'string' || Buffer.byteLength(body.password) > 72 || !await compare(body.password, settings.passwordHash)) throw new CrmError('Incorrect CRM password.', 403)
      const expires = Date.now() + 8 * 60 * 60 * 1000
      ;(await cookies()).set(CRM_COOKIE, crmUnlockToken(identity.userId, identity.accessVersion, settings.passwordHash, secret, expires), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 8 * 60 * 60 })
      return json({ ok: true })
    }
    if (body.action === 'lock') {
      ;(await cookies()).delete(CRM_COOKIE)
      return json({ ok: true })
    }
    await requireCrmAccess()
    if (body.action === 'allocate') return json(await allocateCrmLeads(identity.admin ? undefined : identity.userId))
    if (body.action === 'update') {
      if (typeof body.id !== 'string' || !isCrmStatus(body.status) || !Number.isInteger(body.version) || typeof body.notes !== 'string' || body.notes.length > 5000 || typeof body.called !== 'boolean') throw new CrmError('Invalid lead update.')
      const followUpAt = body.followUpAt === null || body.followUpAt === '' ? null : typeof body.followUpAt === 'string' ? new Date(body.followUpAt) : undefined
      if (followUpAt === undefined || (followUpAt && !Number.isFinite(followUpAt.getTime()))) throw new CrmError('Enter a valid follow-up date.')
      if (body.status === 'FOLLOW_UP' && !followUpAt) throw new CrmError('Choose a date for the follow-up.')
      const { id, status, notes, called, version } = body as { id: string; status: string; notes: string; called: boolean; version: number }
      await prisma.$transaction(async tx => {
        const lead = await tx.crmLead.findFirst({ where: { id, ...(identity.admin ? {} : { assignedToId: identity.userId }) } })
        if (!lead) throw new CrmError('Lead not found.', 404)
        if (lead.status === 'DO_NOT_CONTACT' && status !== 'DO_NOT_CONTACT' && !identity.admin) throw new CrmError('Only an administrator can reopen a do-not-contact lead.', 403)
        const result = await tx.crmLead.updateMany({ where: { id, version }, data: { status, notes, followUpAt: ['DO_NOT_CONTACT', 'NOT_INTERESTED', 'WON'].includes(status) ? null : followUpAt, calledAt: called || ['CALLED', 'NO_ANSWER'].includes(status) ? lead.calledAt ?? new Date() : lead.calledAt, version: { increment: 1 } } })
        if (!result.count) throw new CrmError('This lead changed in another session. Refresh before saving.', 409)
        await tx.crmActivity.create({ data: { leadId: id, actorId: identity.userId, status, note: notes } })
      })
      return json({ ok: true })
    }
    if (body.action === 'email-draft') {
      if (!Array.isArray(body.ids) || !body.ids.length || body.ids.length > 30 || body.ids.some(id => typeof id !== 'string')) throw new CrmError('Select between 1 and 30 leads.')
      const ids = [...new Set(body.ids as string[])]
      const leads = await prisma.crmLead.findMany({ where: { id: { in: ids }, ...(identity.admin ? {} : { assignedToId: identity.userId }), status: { not: 'DO_NOT_CONTACT' }, email: { not: null } }, select: { id: true, email: true, fullName: true } })
      if (leads.length !== ids.length) throw new CrmError('Some selected leads are no longer available for email. Refresh your selection.', 409)
      return json({ recipients: leads })
    }
    if (!identity.admin) throw new CrmError('Administrator access required.', 403)
    if (body.action === 'password') {
      if (typeof body.password !== 'string' || body.password.length < 12 || Buffer.byteLength(body.password) > 72) throw new CrmError('Use a CRM password of at least 12 characters and at most 72 bytes.')
      const passwordHash = await hash(body.password, 12)
      await prisma.crmSettings.upsert({ where: { id: 1 }, create: { id: 1, passwordHash }, update: { passwordHash } })
      return json({ ok: true })
    }
    if (body.action === 'member') {
      if ((typeof body.userId !== 'string' && typeof body.email !== 'string') || typeof body.enabled !== 'boolean') throw new CrmError('Select an existing member and access setting.')
      const user = typeof body.userId === 'string'
        ? await prisma.user.findUnique({ where: { id: body.userId } })
        : await prisma.user.findFirst({ where: { email: { equals: (body.email as string).trim(), mode: 'insensitive' } } })
      if (!user) throw new CrmError('No account matches that selection.', 404)
      if (body.enabled && (user.blocked || !isDiamondClubCandidateRole(user.role) || !canAccessDiamondClub({ role: user.role, membership: user.membership, membershipExpiresAt: user.membership_expires_at }))) throw new CrmError('Select an active Diamond Club member.')
      await prisma.crmMember.upsert({ where: { userId: user.id }, create: { userId: user.id, enabled: body.enabled }, update: { enabled: body.enabled, updatedAt: new Date() } })
      return json({ ok: true })
    }
    if (body.action === 'preview-import' || body.action === 'import') {
      if (typeof body.csv !== 'string' || typeof body.filename !== 'string' || body.filename.length > 200) throw new CrmError('Choose a CSV file.')
      let parsed: ReturnType<typeof parseHarvestCsv>
      if (body.fields !== undefined && (!Array.isArray(body.fields) || body.fields.some(field => !CRM_IMPORT_FIELDS.includes(field as CrmImportField)))) throw new CrmError('Invalid import columns.')
      try { parsed = parseHarvestCsv(body.csv, (body.fields ?? CRM_DEFAULT_IMPORT_FIELDS) as CrmImportField[]) } catch (error) { throw new CrmError(error instanceof Error ? error.message : 'Invalid CSV.') }
      if (body.action === 'preview-import') return json({ total: parsed.total, valid: parsed.rows.length, duplicates: parsed.duplicates, invalid: parsed.errors.length, errors: parsed.errors.slice(0, 20), sample: parsed.rows.slice(0, 5) })
      const result = await prisma.crmLead.createMany({ data: parsed.rows.map(row => ({ ...row, importName: body.filename as string })), skipDuplicates: true })
      return json({ imported: result.count, duplicates: parsed.duplicates + parsed.rows.length - result.count, invalid: parsed.errors.length })
    }
    throw new CrmError('Unknown CRM action.')
  } catch (error) { return failure(error) }
}
