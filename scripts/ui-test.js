const { chromium } = require('playwright');

(async () => {
  const url = process.env.URL || 'http://localhost:3000/menu/fallback-main-2';
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // Forward page console messages to the test runner
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err));
  try {
    console.log('Opening', url);
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('HTTP status:', resp && resp.status());

    // wait a bit for any client-side hydration
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // give more time for UI to appear
    const found = await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 20000 }).catch(() => null);
    if (!found) {
      console.error('Add to Cart not found; dumping page for debug');
      const html = await page.content();
      const fs = require('fs');
      fs.writeFileSync('temp_ui_test_page.html', html);
      await page.screenshot({ path: 'temp_ui_test_screenshot.png', fullPage: true });
      throw new Error('Add to Cart button missing after wait');
    }
    console.log('Add to Cart button found');

    // Try clicking variant buttons if present
    const half = await page.$('button:has-text("Half kg")');
    if (half) {
      await half.click();
      console.log('Clicked Half kg');
    } else {
      console.log('Half kg not found');
    }

    const full = await page.$('button:has-text("Full kg")');
    if (full) {
      await full.click();
      console.log('Clicked Full kg');
    } else {
      console.log('Full kg not found');
    }

    // Increase quantity (look for a button with an SVG plus or accessible label)
    const plusCandidates = await page.$$('button');
    let plusClicked = false;
    for (const b of plusCandidates) {
      const text = (await b.innerText()).trim();
      if (text === '+' || text === ' +') {
        await b.click();
        plusClicked = true;
        break;
      }
      const aria = await b.getAttribute('aria-label');
      if (aria && aria.toLowerCase().includes('increase')) {
        await b.click();
        plusClicked = true;
        break;
      }
    }
    console.log('Plus clicked?', plusClicked);

    const add = await page.$('button:has-text("Add to Cart")');
    if (add) {
      // Click and wait for possible navigation triggered by fallback script
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => null),
        add.click(),
      ]);
      console.log('Clicked Add to Cart (and waited for navigation)');
    } else {
      console.log('Add to Cart button not found at click time');
    }

    // Give a short moment for any storage writes to flush
    await page.waitForTimeout(1200);
    const cartRaw = await page.evaluate(() => localStorage.getItem('restaurant_cart'));
    console.log('restaurant_cart (localStorage):', cartRaw);

    // Visit cart page and capture a small snippet
    await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
    const bodyText = await page.textContent('body');
    console.log('Cart page snippet:', bodyText ? bodyText.slice(0, 200) : 'empty');
  } catch (e) {
    console.error('UI test failed:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
