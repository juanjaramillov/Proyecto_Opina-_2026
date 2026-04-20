import { chromium } from 'playwright-core';
import path from 'path';
import url from 'url';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 2,
    });

    const filePath = url.pathToFileURL(path.resolve('./social_visual.html')).toString();
    await page.goto(filePath, { waitUntil: 'networkidle' });
    
    // Ensure all web fonts are loaded
    await page.evaluate(async () => {
        await document.fonts.ready;
    });

    // Short wait to ensure JS draws the generative paths
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'Opina_Plus_Social_Visual.png' });
    await browser.close();
    console.log("Success: Opina_Plus_Social_Visual.png generated successfully.");
  } catch(e) {
    console.error("Error generating snapshot: ", e);
    process.exit(1);
  }
})();
