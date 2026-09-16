export const SESSION_COOKIE='elysera-auth'
export function authConfig(){return {url:process.env.ELYSERA_SUPABASE_URL,key:process.env.ELYSERA_SUPABASE_ANON_KEY}}
export function cookieOptions(){return {name:SESSION_COOKIE,path:'/',httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*24*7}}
export function storageCookieOptions(options={}){const {name,...security}=cookieOptions();const {domain,...hostOptions}=options;return {...hostOptions,...security,maxAge:options.maxAge===0?0:security.maxAge}}
export function sameOrigin(request){
 try{
  const origin=new URL(request.headers.get('origin')),target=new URL(request.url)
  if(request.headers.get('sec-fetch-site')==='cross-site')return false
  if(origin.origin===target.origin)return true
  // Next dev normalizes LAN request URLs to localhost. Require the actual Host
  // and an explicitly configured development hostname before accepting it.
  const hosts=(process.env.ELYSERA_DEV_HOSTS||'').split(',').map(host=>host.trim()).filter(Boolean)
  return process.env.NODE_ENV==='development'&&['localhost','127.0.0.1','[::1]'].includes(target.hostname)&&hosts.includes(origin.hostname)&&origin.host===request.headers.get('host')&&origin.protocol===target.protocol&&origin.port===target.port
 }catch{return false}
}
export function validCredentials(body){return body&&typeof body==='object'&&!Array.isArray(body)&&typeof body.email==='string'&&body.email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())&&typeof body.password==='string'&&body.password.length>=1&&body.password.length<=1024}
export function eligibleAccount(authUser,user){return Boolean(authUser?.id&&authUser?.email_confirmed_at&&user&&!user.blocked&&user.emailVerified&&!['ADMIN','STAFF'].includes(user.role)&&authUser.email?.toLowerCase()===user.email.toLowerCase()&&(!user.supabaseUserId||user.supabaseUserId===authUser.id))}
export function fullName(user){return [user.firstName,user.secondName].filter(Boolean).join(' ')}
