const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: 2 }
    });
    const page = await browser.newPage();
    await page.goto('file://' + path.resolve(__dirname, 'social_post.html'), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    // Explicitly target the social post exact dimensions bounds to avoid edge bleed if any
    await page.screenshot({ path: path.resolve(__dirname, 'Opina_Final_Visual.png'), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    await browser.close();
    console.log("SUCCESS");
  } catch(e) {
    console.error(e);
  }
})();
