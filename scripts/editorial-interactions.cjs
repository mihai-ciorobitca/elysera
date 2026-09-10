const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.AUDIT_URL||'http://localhost:3003';
(async()=>{
 const out='outputs/editorial-details';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch();
 try {
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await p.goto(base+'/',{waitUntil:'networkidle'});
 await p.evaluate(()=>document.fonts.ready);
 const hero=await p.locator('.cosmedix-hero').evaluate(e=>[e,...e.querySelectorAll('*')].map(n=>{const s=getComputedStyle(n);return [n.tagName,n.className,...['width','height','fontSize','color','backgroundColor','padding','margin','display','position'].map(k=>s[k])]}));
 // The baseline is a local artifact, optional in a fresh checkout.
 const baseline='outputs/hero-before-polish.json';
 if(fs.existsSync(baseline))assert.deepEqual(hero,JSON.parse(fs.readFileSync(baseline)));
 await p.locator('.editorial-discover').scrollIntoViewIfNeeded();
 for(const img of await p.locator('.editorial-discover img').all())assert(await img.evaluate(async e=>{await e.decode();return e.naturalWidth>0&&/-(640|1280)\.webp$/.test(e.currentSrc)}),'Responsive image must decode');
 assert.equal(await p.locator('.editorial-discover-image img').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await p.locator('.editorial-discover-card').first().focus();
 assert.notEqual(await p.locator('.editorial-discover-card').first().evaluate(e=>getComputedStyle(e).outlineStyle),'none');
 await p.keyboard.press('Enter');await p.waitForURL('**/science');
 await p.goto(base+'/presale',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.delivery-entry').count(),3);
 await p.locator('.delivery-link').first().click();await p.waitForURL('**/products/renewal-serum');
 await p.setViewportSize({width:1440,height:1000});await p.emulateMedia({reducedMotion:'no-preference'});
 await p.goto(base+'/presale',{waitUntil:'networkidle'});
 const link=p.locator('.delivery-link').first();await link.hover();await p.waitForTimeout(280);
 assert.notEqual(await link.locator('svg').evaluate(e=>getComputedStyle(e).transform),'none');
 await p.locator('.editorial-discover').screenshot({path:out+'/editorial-desktop-final.png'});
 const results={heroUnchanged:fs.existsSync(baseline)?true:'baseline unavailable',imagesLoaded:true,reducedMotion:true,keyboardNavigation:true,deliveryRecords:true,productNavigation:true,hoverAnimation:true};
 fs.writeFileSync(out+'/interaction-results.json',JSON.stringify(results,null,2));console.log(results);
 } finally {await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
