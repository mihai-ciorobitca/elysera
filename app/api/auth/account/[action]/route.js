import {NextResponse} from 'next/server'
import {requireMail,passwordNotice} from '@/lib/auth/account-mail'
import {createClient} from '@supabase/supabase-js'
import {sameOrigin,authConfig} from '@/lib/auth/policy.mjs'
import {validEmail,validPassword,validToken} from '@/lib/auth/account-policy.mjs'
import {loginRateLimit} from '@/lib/auth/rate-limit'
import {registerAccount,findAccount,allowedAccount,issueToken,verifyEmail,resetPassword} from '@/lib/auth/account-service'
import {authClient,principalFor} from '@/lib/auth/server'
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export async function POST(request,{params}){
 if(!sameOrigin(request))return reply({error:'Diese Anfrage ist nicht zulässig.'},403)
 const {action}=await params;if(!['register','resend','forgot','verify','reset','password'].includes(action))return reply({error:'Nicht gefunden.'},404)
 try{const raw=await request.text();if(raw.length>8192)return reply({error:'Ungültige Eingabe.'},400);let b;try{b=JSON.parse(raw)}catch{return reply({error:'Ungültige Eingabe.'},400)}if(!b||typeof b!=='object'||Array.isArray(b))return reply({error:'Ungültige Eingabe.'},400)
 const email=validEmail(b.email)?b.email.trim().toLowerCase():''
 if(['register','resend','forgot'].includes(action)&&!email)return reply({error:'Bitte eine gültige E-Mail-Adresse eingeben.'},400)
 if(['register','reset','password'].includes(action)&&!validPassword(b.password))return reply({error:'Das Passwort muss 12 bis 128 Zeichen enthalten.'},400)
 if(['verify','reset'].includes(action)&&!validToken(b.token))return reply({error:'Dieser Link ist ungültig. Bitte einen neuen anfordern.'},400)
 if(!await loginRateLimit(request,email,action))return reply({error:'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.'},429)
 if(action==='register'){if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.last!=='string'||b.last.length>80)return reply({error:'Bitte deinen Namen eingeben.'},400);await registerAccount(email,b.password,b.name.trim(),b.last.trim());return reply({message:'Falls dein Konto noch bestätigt werden muss, erhältst du eine E-Mail. Bei einem bestehenden Konto kannst du dich anmelden oder dein Passwort zurücksetzen.'})}
 if(action==='forgot'||action==='resend'){requireMail();const user=await findAccount(email);if(allowedAccount(user)&&user.supabaseUserId&&(action==='forgot'?user.emailVerified:!user.emailVerified))await issueToken(user,action==='forgot'?'reset':'verify');return reply({message:'Wenn die Adresse zu einem passenden Konto gehört, erhältst du eine E-Mail. Prüfe auch deinen Spam-Ordner.'})}
 if(action==='verify'){if(!await verifyEmail(b.token))return reply({error:'Dieser Link ist ungültig oder abgelaufen. Bitte einen neuen anfordern.'},400);return reply({message:'Deine E-Mail-Adresse ist bestätigt. Du kannst dich jetzt anmelden.'})}
 if(action==='reset'){const result=await resetPassword(b.token,b.password);if(!result)return reply({error:'Dieser Link ist ungültig oder abgelaufen. Bitte einen neuen anfordern.'},400);return reply({message:'Dein Passwort wurde geändert. Melde dich mit deinem neuen Passwort an.'})}
 const client=await authClient(),user=await principalFor(client);if(!user)return reply({error:'Bitte anmelden.'},401)
 if(typeof b.currentPassword!=='string'||b.currentPassword.length>1024)return reply({error:'Bitte dein aktuelles Passwort eingeben.'},400)
 const {url,key}=authConfig(),check=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {error}=await check.auth.signInWithPassword({email:user.email,password:b.currentPassword});if(error)return reply({error:'Das aktuelle Passwort stimmt nicht.'},400);await check.auth.signOut({scope:'local'});
 const {error:updateError}=await client.auth.updateUser({password:b.password});if(updateError)return reply({error:'Das Passwort konnte nicht geändert werden. Bitte erneut anmelden und versuchen.'},400)
 await client.auth.signOut({scope:'local'});const notificationSent=await passwordNotice(user.email);return reply({message:'Dein Passwort wurde geändert. Bitte erneut anmelden.',notificationSent})
 }catch{return reply({error:'Der Vorgang ist vorübergehend nicht möglich. Bitte später erneut versuchen.'},503)}
}
