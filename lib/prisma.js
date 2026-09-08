import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function datasourceUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    url.searchParams.set('schema', 'public')
    url.searchParams.set('pgbouncer', 'true')
    if (!url.searchParams.has('connection_limit') || url.searchParams.get('connection_limit') === '1') {
      url.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT || '5')
    }
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '30')
    if (!url.searchParams.has('sslmode')) url.searchParams.set('sslmode', 'require')
    return url.toString()
  } catch {
    return raw
  }
}

export const prisma = globalForPrisma.elyseraPrisma ?? new PrismaClient({
  datasources: datasourceUrl() ? { db: { url: datasourceUrl() } } : undefined,
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.elyseraPrisma = prisma
