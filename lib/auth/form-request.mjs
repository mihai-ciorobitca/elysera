export async function formRequest(url,body,{timeout=45000,fetcher=fetch}={}){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
  const result=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(typeof result?.error==='string'?result.error:
   response.status===429?'Zu viele Versuche. Bitte warte kurz und versuche es erneut.':'Der Dienst ist gerade nicht erreichbar. Bitte versuche es erneut.');
  if(!result||typeof result!=='object')throw new Error('Die Antwort konnte nicht verarbeitet werden. Bitte versuche es erneut.');
  return result;
 }catch(error){
  if(controller.signal.aborted)throw new Error('Die Anfrage dauert zu lange. Bitte prüfe deine Verbindung und versuche es erneut.');
  if(error instanceof TypeError)throw new Error('Keine Verbindung. Bitte prüfe deine Internetverbindung und versuche es erneut.');
  throw error;
 }finally{clearTimeout(timer)}
}
