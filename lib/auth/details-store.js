import 'server-only'
import {prisma} from '@/lib/prisma'
import {publicProfile} from './server'
export async function accountProfile(user){const rows=await prisma.$queryRaw`SELECT "details" FROM "ElyseraAccountProfile" WHERE "userId"=${user.id}`;return {...publicProfile(user),...rows[0]?.details,name:user.firstName||'',last:user.secondName||''}}
export async function storeDetails(tx,id,details){await tx.$executeRaw`INSERT INTO "ElyseraAccountProfile" ("userId","details","updatedAt") VALUES (${id},${JSON.stringify(details)}::jsonb,NOW()) ON CONFLICT ("userId") DO UPDATE SET "details"=EXCLUDED."details","updatedAt"=NOW()`}
