const { chromium, webkit } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.AUDIT_URL || 'http://localhost:3003';
const out = process.env.AUDIT_OUT || 'outputs/design-layout-review';
const engine = process.env.AUDIT_BROWSER || 'chromium';
const routes = ['/', '/shop', '/products/renewal-serum', '/products/balance-toner', '/products/contour-eye-cream', '/routine', '/science', '/about', '/faq', '/contact', '/presale', '/account', '/quiz', '/checkout', '/video-auswahl'];
(async () => {
 fs.mkdirSync(out, {recursive: true});
 const browser = await ({chromium, webkit}[engine]).launch();
 const results = [];
 for (const width of (process.env.AUDIT_WIDTHS || '320,390,460,768,1440').split(',').map(Number)) {
  const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
  for (const route of routes) {
   await page.goto(base + route, {waitUntil: 'domcontentloaded'});
   await page.locator('[data-store-ready=true]').waitFor();
   await page.evaluate(() => document.fonts.ready);
   const violations = await page.evaluate(() => {
    const issues = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('Page overflow');
    for (const row of document.querySelectorAll('.delivery-entry')) {
     const product = row.querySelector('.delivery-product').getBoundingClientRect();
     const status = row.querySelector('.delivery-status').getBoundingClientRect();
     const label = row.querySelector('.delivery-label').getBoundingClientRect();
     const copy = row.querySelector('.delivery-status p').getBoundingClientRect();
     const edge = row.getBoundingClientRect();
     if (innerWidth <= 700 && (status.width < edge.width - 2 || status.top < product.bottom + 10)) issues.push('Delivery mobile record is squeezed');
     if (Math.abs(label.left-copy.left) > 1 || copy.top < label.bottom + 5) issues.push('Delivery label and copy alignment');
     const link = row.querySelector('.delivery-link').getBoundingClientRect();
     if (link.width < 44 || link.height < 44 || link.right > edge.right+1 || link.bottom > edge.bottom+1) issues.push('Delivery action dimensions');
    }
    for (const card of document.querySelectorAll('.editorial-discover-card')) {
     const heading = card.querySelector('h2').getBoundingClientRect();
     const icon = card.querySelector('.editorial-discover-copy > svg').getBoundingClientRect();
     if (heading.right + 8 > icon.left) issues.push('Editorial heading overlaps icon');
    }
    const cards = [...document.querySelectorAll('.shop-grid .atelier-product')];
    for (const card of cards) {
     const fields = ['.product-photo','.product-card-meta','h3','.product-role','.atelier-price','.product-card-actions'].map(s => card.querySelector(s).getBoundingClientRect());
     for (let i = 1; i < fields.length; i++) if (fields[i].top < fields[i-1].bottom - 1) issues.push('Shop card fields overlap');
     if (fields[0].width < card.getBoundingClientRect().width - 3) issues.push('Shop image does not fill card');
     for (const other of cards) {
      if (Math.abs(other.getBoundingClientRect().top-card.getBoundingClientRect().top) > 2) continue;
      if (Math.abs(other.querySelector('.product-card-actions').getBoundingClientRect().top-fields[5].top) > 2) issues.push('Shop actions not aligned');
     }
    }
    for (const purchase of document.querySelectorAll('.purchase')) {
     const edge = purchase.getBoundingClientRect();
     for (const child of purchase.querySelectorAll('.quantity,.button')) {
      const r = child.getBoundingClientRect();
      if (r.right > edge.right + 1 || r.left < edge.left - 1) issues.push('Purchase control outside panel');
     }
    }
    for (const summary of document.querySelectorAll('.faq-list summary')) {
     const s = summary.getBoundingClientRect(), q = summary.querySelector('.faq-question').getBoundingClientRect(), i = summary.querySelector('.plus').getBoundingClientRect();
     if (q.width < s.width * .65) issues.push('FAQ question column too narrow');
     if (q.right + 10 > i.left) issues.push('FAQ text overlaps disclosure');
     if (i.right > s.right + 1 || q.left < s.left) issues.push('FAQ child outside row');
     if (s.height < 44) issues.push('FAQ touch target too small');
    }
    const groups = [...document.querySelectorAll('.footer-main nav > div')];
    if (groups.length === 2 && Math.abs(groups[0].getBoundingClientRect().width - groups[1].getBoundingClientRect().width) > 2) issues.push('Unequal footer columns');
    for (const group of groups) {
     const links = [...group.querySelectorAll('a')];
     const edge = group.getBoundingClientRect();
     for (const a of links) { const r = a.getBoundingClientRect(); if (r.height < 44 || r.right > edge.right + 1 || a.scrollWidth > a.clientWidth + 2) issues.push('Footer link dimensions'); }
    }
    return issues;
   });
   for (const summary of await page.locator('.faq-list summary').all()) {
    await summary.click();
    const ok = await summary.evaluate(s => {const q = s.querySelector('.faq-question').getBoundingClientRect(), i = s.querySelector('.plus').getBoundingClientRect();return s.parentElement.open && q.right + 10 <= i.left;});
    if (!ok) violations.push('Open FAQ geometry');
    await summary.click();
   }
   results.push({route,width,violations});
   if (width === 390) {
    const selector = route === '/' ? '.home-faq' : route === '/shop' ? '.shop-comparison' : route.startsWith('/products/') ? '.detail-copy' : route === '/routine' ? '.routine-detail' : route === '/science' ? '.knowledge-grid' : route === '/about' ? '.about-body' : route === '/faq' ? '.faq-list' : ['/account','/contact'].includes(route) ? '.account-destinations' : route === '/presale' ? '.delivery-overview' : route === '/quiz' ? '.quiz-body' : route === '/checkout' ? '.checkout' : '.film-option';
    const region = page.locator(selector).first();
    if (await region.count()) await region.screenshot({path: `${out}/${route === '/' ? 'home' : route.slice(1).replaceAll('/','-')}.png`});
   }
   if (route === '/' && [320,460,768,1440].includes(width)) {
    await page.locator('.compact-footer').screenshot({path:`${out}/footer-${width}.png`});
    await page.locator('.home-faq').screenshot({path:`${out}/faq-${width}.png`});
   }
   console.log(JSON.stringify({route,width,violations}));
  }
  await page.close();
 }
 await browser.close();
 fs.writeFileSync(`${out}/layout.json`, JSON.stringify(results,null,2));
 assert.equal(results.filter(r=>r.violations.length).length,0,'Layout violations; see layout.json');
})().catch(e=>{console.error(e);process.exitCode=1;});
