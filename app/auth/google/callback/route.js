import {NextResponse} from 'next/server'
import {authClient,principalFor} from '@/lib/auth/server'
import {ensureGoogleAccount} from '@/lib/auth/google-account'
export async function GET(request){const params=new URL(request.url).searchParams;const go=path=>{const response=NextResponse.redirect(new URL(path,request.url));response.headers.set('Cache-Control','private, no-store');response.headers.set('Referrer-Policy','no-referrer');return response};
 if(params.has('error'))return go('/auth/signin?google=cancelled');const code=params.get('code');if(!code||code.length>4096)return go('/auth/signin?google=failed');
 try{const client=await authClient();const {error}=await client.auth.exchangeCodeForSession(code);if(error)return go('/auth/signin?google=failed');const {data:identity,error:identityError}=await client.auth.getUser();if(identityError||!await ensureGoogleAccount(identity.user)){await client.auth.signOut({scope:'local'});return go('/auth/signin?google=account')}
 const {data:assurance,error:mfaError}=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(!mfaError&&assurance?.nextLevel==='aal2'&&assurance.currentLevel!=='aal2')return go('/auth/signin?mfa=1');if(mfaError||!await principalFor(client)){await client.auth.signOut({scope:'local'});return go('/auth/signin?google=account')}
 return go('/dashboard')
 }catch{return go('/auth/signin?google=failed')}
}
