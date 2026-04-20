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
    await new Promise(r => setTimeout(r, 2000)); // Need slightly more time for 35,000 paths to render completely
    await page.screenshot({ path: path.resolve(__dirname, 'Opina_Final_Visual_V2.png'), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    await browser.close();
    console.log("SUCCESS");
  } catch(e) {
    console.error(e);
  }
})();
