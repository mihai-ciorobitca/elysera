const {chromium,webkit}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const out='outputs/jessica-review';fs.mkdirSync(out,{recursive:true});const results=[];
 for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch();
 try {
 for(const width of [320,390,460,768,1440]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 for(const route of ['/','/about']){
 await page.goto('http://localhost:3003'+route,{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const section=page.locator('#jessica-winterholler');
 assert.equal(await section.count(),1);assert.equal(await page.locator('#bettina-mattheus').count(),1);
 assert.equal(await section.locator('.founder-copy > p').count(),4);
 assert.equal(await section.locator('.founder-role').textContent(),'Mitgründerin · Markenstrategie & Vision');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await section.scrollIntoViewIfNeeded();
 for(let i=0;i<3;i++){
 await section.getByRole('button',{name:`Porträt ${i+1} anzeigen`,exact:true}).click();
 const active=section.locator('img.is-active');assert.equal(await active.count(),1);
 assert(await active.evaluate(async e=>{await e.decode();return e.naturalWidth>0}));
 assert.equal(await section.locator('img[aria-hidden=false]').count(),1);
 }
 await section.getByRole('button',{name:'Nächstes Porträt',exact:true}).click();
 assert((await section.locator('img.is-active').getAttribute('src')).includes('confident'));
 await section.getByRole('button',{name:'Vorheriges Porträt',exact:true}).click();
 assert((await section.locator('img.is-active').getAttribute('src')).includes('conversation'));
 await section.getByRole('button',{name:'Porträt 1 anzeigen',exact:true}).click();
 if(engine==='chromium'&&[390,1440].includes(width))await section.screenshot({path:`${out}/${route==='/'?'home':'about'}-${width}.png`});
 results.push({engine,width,route,passed:true});console.log(engine,width,route);
 }
 await page.close();
 }
 }finally{await browser.close()}
 }
 fs.writeFileSync(out+'/checks.json',JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
