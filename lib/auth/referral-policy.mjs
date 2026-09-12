export const referralCookie='elysera-referral'
export function referralCode(value){return typeof value==='string'&&/^[a-zA-Z0-9_-]{3,64}$/.test(value.trim())?value.trim():null}
export function referralLink(origin,code){const valid=referralCode(code);return valid?`${origin}/auth/register?ref=${encodeURIComponent(valid)}`:''}

export function referralInput(value){
 if(typeof value!=='string')return null;
 const text=value.trim();
 if(!text.includes('://'))return referralCode(text);
 try{const url=new URL(text);if(url.protocol!=='https:'||!['elysera.org','www.elysera.org'].includes(url.hostname))return null;return referralCode(url.searchParams.get('ref'))}catch{return null}
}
