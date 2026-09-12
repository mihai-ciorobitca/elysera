import 'server-only'
import {authClient} from './server'
import {ensureGoogleAccount} from './google-account'
export async function pendingGoogle(){
 const client=await authClient();const {data,error}=await client.auth.getUser();
 if(error||!data.user)return null;
 const {data:level,error:mfa}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(mfa||!level||(level.nextLevel==='aal2'&&level.currentLevel!=='aal2'))return null;
 return await ensureGoogleAccount(data.user)==='pending'?data.user:null;
}
