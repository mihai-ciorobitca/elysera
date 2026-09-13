export const settingsDefaults=Object.freeze({supportEmail:'',supportPhone:'',whatsapp:'',instagram:'',facebook:'',youtube:'',tiktok:'',linkedin:'',x:'',maintenance:false,maintenanceMessage:''})
const hosts={instagram:['instagram.com','www.instagram.com'],facebook:['facebook.com','www.facebook.com'],youtube:['youtube.com','www.youtube.com','youtu.be'],tiktok:['tiktok.com','www.tiktok.com'],linkedin:['linkedin.com','www.linkedin.com'],x:['x.com','www.x.com','twitter.com','www.twitter.com']}
export class SettingsError extends Error{constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export function settingsInput(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['actorId','requestId','expectedVersion',...Object.keys(settingsDefaults)].includes(k)))throw new SettingsError('Ungültige Einstellungsfelder.')
 if(typeof raw.actorId!=='string'||!raw.actorId||typeof raw.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(raw.requestId)||!Number.isSafeInteger(raw.expectedVersion)||raw.expectedVersion<0)throw new SettingsError('Anfragekennung oder Version ungültig.')
 const out={actorId:raw.actorId,requestId:raw.requestId,expectedVersion:raw.expectedVersion}
 for(const key of Object.keys(settingsDefaults)){
  const v=raw[key];if(key==='maintenance'){if(typeof v!=='boolean')throw new SettingsError('Wartungsstatus ungültig.');out[key]=v;continue}
  if(typeof v!=='string'||v.length>(key==='maintenanceMessage'?500:500)||/[\u0000-\u001f\u007f]/.test(v))throw new SettingsError(`${key}: ungültige Eingabe.`)
  out[key]=v.trim();const value=out[key];if(!value)continue
  if(key==='supportEmail'&&(value.length>254||value.split('@')[0].length>64||value.startsWith('.')||value.includes('..')||value.includes('.@')||! /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(value)))throw new SettingsError('Support-E-Mail ungültig.')
  if(['supportPhone','whatsapp'].includes(key)&&!/^\+[1-9]\d{6,14}$/.test(value))throw new SettingsError('Telefon und WhatsApp benötigen internationales Format, z. B. +49123456789.')
  if(hosts[key]){let url;try{url=new URL(value)}catch{throw new SettingsError(`${key}: gültige HTTPS-Adresse erforderlich.`)}if(url.protocol!=='https:'||url.username||url.password||url.port||!hosts[key].includes(url.hostname)||url.pathname==='/')throw new SettingsError(`${key}: öffentliche Profiladresse der passenden Plattform erforderlich.`);out[key]=url.href}
 }
 if(out.maintenance&&!out.maintenanceMessage)throw new SettingsError('Bitte öffentliche Wartungsnachricht eingeben.')
 return out
}
export function maintenanceDecision(pathname,settings){
 if(!settings?.maintenance)return false
 let path;try{path=decodeURIComponent(pathname).toLowerCase().replace(/\\/g,'/').replace(/\/{2,}/g,'/')}catch{return false}
 if(/^\/(?:admin(?:-preview)?|api|auth|_next|maintenance)(?:\/|$)/.test(path)||/\.[a-z0-9]+$/i.test(path)||['/login','/register','/signup','/forgot-password','/reset-password','/complete-profile'].some(p=>path===p||path.startsWith(p+'/')))return false
 return true
}
