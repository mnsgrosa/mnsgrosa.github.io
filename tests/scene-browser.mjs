import assert from 'node:assert/strict';

export async function verifyScenes(browser, origin, artifacts, errors) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const scene = page.locator('scene-navigator');
  // Wait for the scene to arrive *and* for the rotation to stop moving.
  const settleOn = async (target, index) => {
    await target.waitForFunction(i => document.querySelector('scene-navigator')?.dataset.index === String(i), index);
    await target.waitForFunction(() => {
      const el = document.querySelector('.scene-ring');
      const now = getComputedStyle(el).transform;
      const settled = el.dataset.settled === now;
      el.dataset.settled = now;
      return settled;
    });
  };
  const settle = index => settleOn(page, index);
  try {
    await page.goto(origin);
    await page.locator('scene-navigator[data-enabled="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await scene.getAttribute('data-index'), '0');
    assert.equal(await page.locator('.scene-panel:not([inert])').count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Previous scene', exact: true }).isDisabled(), true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'desktop document does not scroll');
    await page.screenshot({ path: `${artifacts}/scene-knowledge-1440.png` });
    const introSize = await page.locator('[data-scene="knowledge"]').evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight }));
    assert.ok(introSize.scroll <= introSize.client + 1, `intro fits scene: ${JSON.stringify(introSize)}`);
    const ring = page.locator('.scene-ring');
    const initial = await ring.evaluate(el => getComputedStyle(el).transform);
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 140);
    await page.waitForFunction(() => document.querySelector('scene-navigator').dataset.moving === 'true');
    await page.waitForTimeout(120);
    assert.notEqual(await ring.evaluate(el => getComputedStyle(el).transform), initial, 'wheel advances the scene');
    await page.screenshot({ path: `${artifacts}/scene-turn.png` });
    await page.waitForTimeout(140);
    await page.screenshot({ path: `${artifacts}/scene-turn-late.png` });
    await settle(1);
    assert.equal(await page.evaluate(() => scrollY), 0, 'wheel does not scroll the document');
    assert.equal(await page.locator('.scene-panel[data-scene="knowledge"]').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.locator('.scene-panel[data-scene="articles"]').getAttribute('aria-hidden'), null);
    if (await page.locator('.topic-toggle').getAttribute('aria-expanded') === 'false') await page.locator('.topic-toggle').click();
    assert.equal(await page.locator('.article-node').count(), 2);
    const transform = await page.locator('[data-camera]').getAttribute('transform');
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    assert.notEqual(await page.locator('[data-camera]').getAttribute('transform'), transform);
    assert.equal(await scene.getAttribute('data-index'), '1', 'map controls never turn the scene');
    await page.screenshot({ path: `${artifacts}/scene-articles.png` });

    await page.locator('.scene-panel[data-scene="articles"]').focus();
    await page.keyboard.press('ArrowRight');
    await settle(2);
    assert.equal(await page.locator('.scene-panel[data-scene="about"]').evaluate(el => el.contains(document.activeElement)), true, 'focus follows keyboard turn');
    await page.keyboard.press('ArrowLeft');
    await settle(1);
    await page.getByRole('button', { name: 'Next scene', exact: true }).click();
    await settle(2);
    await page.locator('.home-header a[href="#experience"]').click();
    await settle(3);
    assert.equal(new URL(page.url()).hash, '#experience');
    const experience = page.locator('.scene-panel[data-scene="experience"]');
    assert.ok(await experience.evaluate(el => el.scrollHeight > el.clientHeight), 'long text has an inner scrolling area');
    await experience.evaluate(el => el.scrollTop = 0);
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 300);
    await page.waitForFunction(() => document.querySelector('[data-scene="experience"]').scrollTop > 0);
    assert.equal(await scene.getAttribute('data-index'), '3', 'wheel reads long content before rotating away');
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.screenshot({ path: `${artifacts}/scene-experience.png` });
    await experience.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, 140);
    await settle(4);
    assert.equal(await page.getByRole('button', { name: 'Next scene', exact: true }).isDisabled(), true);
    await page.mouse.wheel(0, 140);
    await page.waitForTimeout(650);
    assert.equal(await scene.getAttribute('data-index'), '4', 'end does not wrap unexpectedly');

    // A deep link into a fresh document must open the requested scene.
    const deep = await context.newPage();
    deep.on('pageerror', error => errors.push(error.message));
    await deep.goto(`${origin}/#explore`);
    await deep.locator('scene-navigator[data-enabled="true"]').waitFor();
    await settleOn(deep, 1);
    assert.equal(await deep.locator('.scene-panel[data-scene="articles"]').getAttribute('aria-hidden'), null);
    if (await deep.locator('.topic-toggle').getAttribute('aria-expanded') === 'false') await deep.locator('.topic-toggle').click();
    const beforeArticle = await deep.locator('[data-camera]').getAttribute('transform');
    await deep.locator('.topic-articles a').first().click();
    assert.ok(await deep.locator('.post-content').isVisible());
    await deep.goBack();
    await deep.locator('knowledge-map[data-ready="true"]').waitFor();
    await settleOn(deep, 1);
    assert.equal(await deep.locator('[data-camera]').getAttribute('transform'), beforeArticle, 'Back restores graph view and scene together');
    assert.equal(await deep.locator('.article-node').count(), 2);
    await deep.close();

    // Scene shortcuts are real links: they push history, and Back walks the
    // scenes the reader actually visited.
    await page.locator('.scene-links a[href="#explore"]').click();
    await settle(1);
    await page.locator('.scene-links a[href="#profile"]').click();
    await settle(2);
    assert.equal(new URL(page.url()).hash, '#profile');
    await page.goBack();
    await settle(1);
    assert.equal(new URL(page.url()).hash, '#explore', 'Back returns to the previous scene');

    await page.getByRole('button', { name: 'Use page scroll', exact: true }).click();
    assert.equal(await scene.getAttribute('data-enabled'), 'false');
    assert.equal(await page.locator('.scene-panel[inert]').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight));
    await page.getByRole('button', { name: 'Use scene view', exact: true }).click();
    await settle(1);
    assert.equal(await scene.getAttribute('data-enabled'), 'true');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('scene-navigator').dataset.enabled === 'false');
    assert.equal(await page.locator('.scene-panel[inert]').count(), 0);
    assert.equal(await ring.evaluate(el => getComputedStyle(el).transform), 'none');
    await page.mouse.move(700, 500);
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(() => scrollY) > scrollBefore, 'reduced motion gets native scroll');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('scene-navigator[data-enabled="true"]').waitFor();
    await page.setViewportSize({ width: 375, height: 900 });
    await page.waitForFunction(() => document.querySelector('scene-navigator').dataset.enabled === 'false');
    assert.equal(await page.locator('.scene-panel[inert]').count(), 0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('scene-navigator[data-enabled="true"]').waitFor();
    assert.equal(await page.locator('.scene-panel:not([inert])').count(), 1, 'resize reapplies enhancement once');
  } finally {
    await context.close();
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const plain = await noJS.newPage();
    await plain.goto(origin);
    assert.equal(await plain.locator('.scene-panel[inert]').count(), 0);
    assert.equal(await plain.locator('.topic-articles a:visible').count(), 2);
    assert.ok(await plain.evaluate(() => document.documentElement.scrollHeight > innerHeight));
    await plain.locator('.scene-links a[href="#experience"]').click();
    assert.ok(await plain.evaluate(() => scrollY > 0));
  } finally {
    await noJS.close();
  }
}
