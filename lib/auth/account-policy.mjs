import {createHash,randomBytes} from 'node:crypto'
export const validEmail=email=>typeof email==='string'&&email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
export const validPassword=password=>typeof password==='string'&&password.length>=12&&password.length<=128
export const tokenDigest=(kind,token)=>`elysera:${kind}:`+createHash('sha256').update(token).digest('hex')
export const newToken=()=>randomBytes(32).toString('hex')
export const validToken=token=>typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)
export function siteOrigin(){const u=new URL(process.env.ELYSERA_SITE_URL||'http://localhost:3011');if(u.username||u.password||u.pathname!=='/'||u.search||u.hash||!(u.protocol==='https:'||(process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1'].includes(u.hostname))))throw Error('SITE_NOT_CONFIGURED');return u.origin}
