/* Regresión de los controles del carrusel sobre una instalación local. No modifica datos. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.PISCO_BASE_URL || 'http://127.0.0.1:8083';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw Error('Solo pruebas locales.');

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
  let checked = 0;
  try {
    const context = await browser.newContext({reducedMotion: 'reduce'});
    await context.route('https://**/*', route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [390, 768, 1280, 1440]) {
      await page.setViewportSize({width, height: 1000});
      await page.goto(base + '/', {waitUntil: 'domcontentloaded'});
      if (await page.locator('.modal-x').isVisible()) await page.locator('.modal-x').click();
      const dots = page.locator('[data-dot]');
      const count = await dots.count();
      assert.ok(count > 1, 'Se necesitan al menos dos diapositivas publicadas.');
      assert.ok(await page.locator('.quick a').count(), 'Se necesitan accesos rápidos para reproducir el solapamiento.');
      for (let index = 0; index < count; index++) {
        const dot = dots.nth(index);
        await dot.scrollIntoViewIfNeeded();
        const hit = await dot.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
          return {reachable: target === element || element.contains(target), covering: target?.closest('a')?.getAttribute('href') || target?.tagName};
        });
        assert.ok(hit.reachable, `${width}px: indicador ${index + 1} tapado por ${hit.covering}`);
        await dot.click();
        assert.equal(await dot.getAttribute('aria-current'), 'true');
        assert.equal(await page.locator('.slide.on').getAttribute('aria-label'), `${index + 1} de ${count}`);
        checked++;
      }
      if (width > 640) {
        await page.locator('[data-sl="1"]').click();
        assert.equal(await dots.first().getAttribute('aria-current'), 'true');
        await page.locator('[data-sl="-1"]').click();
        assert.equal(await dots.last().getAttribute('aria-current'), 'true');
        checked += 2;
      }
      if (width === 1440) {
        await dots.first().focus();
        await dots.first().press('Enter');
        assert.equal(await dots.first().getAttribute('aria-current'), 'true');
        await page.mouse.move(0, 0);
        await page.waitForFunction(() => document.querySelector('[data-dot="0"]').getAttribute('aria-current') === 'false', null, {timeout: 9000});
        checked += 2;
      }
      const slideLink = page.locator('.slide.on a[href^="#/"]').first();
      assert.ok(await slideLink.count(), 'La diapositiva de prueba necesita un botón con destino interno.');
      const slideHref = await slideLink.getAttribute('href');
      await slideLink.click();
      await page.waitForURL(url => url.hash === slideHref);
      checked++;
      await page.goto(base + '/', {waitUntil: 'domcontentloaded'});
      const quickLink = page.locator('.quick a[href^="#/"]').first();
      const quickHref = await quickLink.getAttribute('href');
      await quickLink.click();
      await page.waitForURL(url => url.hash === quickHref);
      checked++;
      console.log(`OK carrusel, botones y accesos rápidos a ${width}px`);
    }
    assert.deepEqual(errors, []);
    console.log(`${checked} comprobaciones del carrusel aprobadas; sin errores JavaScript.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
