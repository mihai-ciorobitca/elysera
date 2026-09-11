import 'server-only'
import {accountEmail} from './email-templates.mjs'
import {siteOrigin} from './account-policy.mjs'
export function requireMail(){siteOrigin();if(!process.env.ELYSERA_RESEND_API_KEY||!process.env.ELYSERA_EMAIL_FROM||/[\r\n]/.test(process.env.ELYSERA_EMAIL_FROM))throw Error('MAIL_NOT_CONFIGURED');const address=process.env.ELYSERA_EMAIL_FROM.match(/(?:<)?([^<>\s]+@[^<>\s]+)(?:>)?$/)?.[1],host=new URL(siteOrigin()).hostname.replace(/^www\./,'');if(!address||!(address.split('@')[1]===host||address.split('@')[1].endsWith('.'+host)))throw Error('SENDER_DOMAIN_MISMATCH')}
export async function sendAccountMail(email,kind,token){requireMail();const url=kind==='changed'?siteOrigin()+'/auth/forgot-password':siteOrigin()+`/auth/${kind==='verify'?'verify-email':'reset-password'}#token=${token}`;const body=accountEmail(kind,url);const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.ELYSERA_RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:'ELYSERA <'+process.env.ELYSERA_EMAIL_FROM.match(/(?:<)?([^<>\s]+@[^<>\s]+)(?:>)?$/)[1]+'>',to:[email],...body}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('MAIL_DELIVERY_FAILED')}

export async function passwordNotice(email){try{await sendAccountMail(email,'changed');return true}catch{return false}}
