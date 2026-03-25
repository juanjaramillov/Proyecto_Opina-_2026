import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

const pagesToCapture = [
  { name: 'home', path: '/', dir: 'home' },
  { name: 'signals', path: '/signals', dir: 'signals' },
  { name: 'results', path: '/results', dir: 'results' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812, isMobile: true },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  for (const pageInfo of pagesToCapture) {
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile || false });
      
      console.log(`Navigating to ${BASE_URL}${pageInfo.path} for ${vp.name}...`);
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for animations
        
        const baseDir = path.join(process.cwd(), 'opina-results-context-export', 'screenshots', pageInfo.dir);
        fs.mkdirSync(baseDir, { recursive: true });
        
        // Full page screenshot
        const savePathFull = path.join(baseDir, `${pageInfo.name}_${vp.name}_full.png`);
        await page.screenshot({ path: savePathFull, fullPage: true });
        console.log(`Saved screenshot to ${savePathFull}`);
        
        // If it's signals or results, also take partial sections
        if (pageInfo.name === 'signals' || pageInfo.name === 'results') {
          const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
          const viewportHeight = vp.height;
          
          if (bodyHeight > viewportHeight) {
            let currentOffset = 0;
            let sectionIndex = 1;
            
            while (currentOffset < bodyHeight) {
                await page.evaluate((y) => window.scrollTo(0, y), currentOffset);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for scroll
                
                const savePathPartial = path.join(baseDir, `${pageInfo.name}_${vp.name}_0${sectionIndex}.png`);
                await page.screenshot({ path: savePathPartial, fullPage: false });
                console.log(`Saved partial screenshot to ${savePathPartial}`);
                
                currentOffset += viewportHeight * 0.9; // Scroll 90% of viewport
                sectionIndex++;
            }
            // Scroll back to top
            await page.evaluate(() => window.scrollTo(0, 0));
          }
        }
      } catch (err) {
        console.error(`Error capturing ${pageInfo.name} ${vp.name}:`, err.message);
      }
      await page.close();
    }
  }
  
  await browser.close();
}

capture().catch(console.error);
