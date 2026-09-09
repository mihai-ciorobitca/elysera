const browsers = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AUDIT_URL || 'http://localhost:3001';
const out = process.env.AUDIT_OUT || 'outputs/mobile-release';
const routes = ['/', '/shop', '/products/renewal-serum', '/products/balance-toner', '/products/contour-eye-cream', '/routine', '/science', '/about', '/faq', '/contact', '/presale', '/account', '/quiz', '/checkout', '/video-auswahl'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await browsers[process.env.AUDIT_BROWSER || 'chromium'].launch({ headless: true });
  const report = [];
  for (const width of (process.env.AUDIT_WIDTHS || '320,390,768').split(',').map(Number)) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: width < 700, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      const start = errors.length;
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      const state = await page.evaluate(() => {
        const visible = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('dialog:not([open])');
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          heading: document.querySelector('h1')?.textContent,
          brokenImages: [...document.images].filter(visible).filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
          clippedText: [...document.querySelectorAll('h1,h2,h3,p,.button')].filter(visible).filter(e => e.scrollWidth > e.clientWidth + 3 && e.clientWidth > 0).map(e => ({ text: e.textContent.slice(0, 65), class: e.className, w: e.clientWidth, scroll: e.scrollWidth })),
          smallButtons: [...document.querySelectorAll('button')].filter(visible).filter(e => e.getBoundingClientRect().height < 40).map(e => ({ label: e.getAttribute('aria-label') || e.textContent.slice(0, 45), h: Math.round(e.getBoundingClientRect().height) })),
          links: [...new Set([...document.querySelectorAll('main a[href]')].map(a => a.getAttribute('href')).filter(h => h.startsWith('/')))]
        };
      });
      const row = { route, width, status: response.status(), ...state, errors: errors.slice(start) };
      report.push(row);
      if (width === 390) await page.screenshot({ path: path.join(out, (route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')) + '.png'), fullPage: true });
      console.log(JSON.stringify({ route, width, status: row.status, overflow: row.overflow, broken: row.brokenImages.length, clipped: row.clippedText, errors: row.errors }));
    }
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(report, null, 2));
  await browser.close();
  if (report.some(r => r.status !== 200 || r.overflow || r.brokenImages.length || r.clippedText.length || r.errors.length)) process.exitCode = 1;
})().catch(e => { console.error(e); process.exit(1); });
