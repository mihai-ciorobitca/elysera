const {chromium}=require('playwright');
const fs=require('fs');
const routes={
 '/':'.collection-section', '/shop':'.shop-grid', '/products/renewal-serum':'.product-detail', '/products/balance-toner':'.product-detail', '/products/contour-eye-cream':'.product-detail', '/routine':'.routine-detail', '/science':'.science-feature', '/about':'.about-body', '/faq':'.faq-list', '/contact':'.account-destinations', '/presale':'.presale-steps', '/account':'.account-destinations', '/quiz':'.quiz-body', '/checkout':'.checkout', '/video-auswahl':'.film-option'
};
(async()=>{
 const out=process.env.CAPTURE_OUT||'outputs/masterprompt-before';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch(), record=[];
 for(const width of [390,1440]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 for(const [route,selector] of Object.entries(routes)){
 await p.goto('http://localhost:3003'+route,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
 const region=p.locator(selector).first();
 if(await region.count())await region.screenshot({path:`${out}/${width}-${route==='/'?'home':route.slice(1).replaceAll('/','-')}.png`});
 record.push({route,width,headings:await p.locator('main h1,main h2').allTextContents(),images:await p.locator('main img').evaluateAll(es=>es.map(e=>e.getAttribute('src'))),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 console.log(width,route);
 }
 await p.close();}
 fs.writeFileSync(out+'/inventory.json',JSON.stringify(record,null,2));await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
