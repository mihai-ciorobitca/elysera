import 'server-only'

import { prisma } from '@/lib/prisma'
import { distributedRateLimitKey } from '@/lib/distributed-rate-limit-key'

export type DistributedRateLimitOptions = {
  maxRequests: number
  windowMs: number
}

type RateLimitRow = {
  count: number
  retryAfterSec: number
}

export type DistributedRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number }

export class DistributedRateLimitError extends Error {
  constructor() {
    super('Distributed rate limit is unavailable.')
    this.name = 'DistributedRateLimitError'
  }
}

function rateLimitHashSecret() {
  return (
    process.env.ELYSERA_RATE_LIMIT_SECRET?.trim() || process.env.RATE_LIMIT_HASH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ''
  )
}

/**
 * PostgreSQL-backed fixed-window limiter. The upsert locks one key row, so
 * concurrent requests and separate server instances share the same counter.
 */
export async function checkDistributedRateLimit(
  rawKey: string,
  options: DistributedRateLimitOptions,
): Promise<DistributedRateLimitResult> {
  if (
    !Number.isFinite(options.maxRequests) ||
    options.maxRequests <= 0 ||
    !Number.isFinite(options.windowMs) ||
    options.windowMs < 1_000
  ) throw new DistributedRateLimitError()
  const maxRequests = Math.min(1_000_000, Math.floor(options.maxRequests))
  const windowMs = Math.min(
    30 * 24 * 60 * 60 * 1_000,
    Math.floor(options.windowMs),
  )
  const hashSecret = rateLimitHashSecret()
  if (!hashSecret) throw new DistributedRateLimitError()
  const key = distributedRateLimitKey(rawKey, hashSecret)

  let rows: RateLimitRow[]
  try {
    rows = await prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO public."AiRateLimitBucket" AS bucket
        ("key", "count", "resetAt", "createdAt", "updatedAt")
      VALUES (
        ${key},
        1,
        statement_timestamp() + (${windowMs}::double precision * INTERVAL '1 millisecond'),
        statement_timestamp(),
        statement_timestamp()
      )
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN bucket."resetAt" <= statement_timestamp() THEN 1
          ELSE LEAST(bucket."count", ${maxRequests}) + 1
        END,
        "resetAt" = CASE
          WHEN bucket."resetAt" <= statement_timestamp()
            THEN statement_timestamp() + (${windowMs}::double precision * INTERVAL '1 millisecond')
          ELSE bucket."resetAt"
        END,
        "updatedAt" = statement_timestamp()
      RETURNING
        "count",
        GREATEST(
          1,
          CEIL(EXTRACT(EPOCH FROM ("resetAt" - statement_timestamp())))::INTEGER
        ) AS "retryAfterSec"
    `
  } catch (error) {
    console.error('[distributed-rate-limit] database check failed', error)
    throw new DistributedRateLimitError()
  }

  const bucket = rows[0]
  if (!bucket) throw new DistributedRateLimitError()
  if (Math.random() < 1 / 256) {
    try {
      await prisma.$executeRaw`
        DELETE FROM public."AiRateLimitBucket"
        WHERE ctid IN (
          SELECT ctid
          FROM public."AiRateLimitBucket"
          WHERE "resetAt" < statement_timestamp() - INTERVAL '1 day'
          LIMIT 500
        )
      `
    } catch (error) {
      console.error('[distributed-rate-limit] expired bucket cleanup failed', error)
    }
  }
  if (bucket.count <= maxRequests) return { allowed: true }

  return {
    allowed: false,
    retryAfterSec: Math.max(1, bucket.retryAfterSec),
  }
}
