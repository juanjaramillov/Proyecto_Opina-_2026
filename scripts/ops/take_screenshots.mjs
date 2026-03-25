import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = '/tmp/opina-auditoria-home-senales-v2/screenshots';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Ensure the local dev server is ready before running this
const BASE_URL = 'http://localhost:5173';

const shots = [
  { name: 'home-desktop.png', path: '/', isMobile: false },
  { name: 'home-mobile.png', path: '/', isMobile: true },
  { name: 'signals-menu-desktop.png', path: '/signals', isMobile: false },
  { name: 'signals-menu-mobile.png', path: '/signals', isMobile: true },
  { name: 'signals-versus-desktop.png', path: '/signals', isMobile: false, clickVersus: true }, // We assume there's a versus card we can click or a direct route
  { name: 'signals-versus-mobile.png', path: '/signals', isMobile: true, clickVersus: true },
  { name: 'signals-actualidad-desktop.png', path: '/signals', isMobile: false, clickActualidad: true },
];

async function run() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  for (const shot of shots) {
    console.log(`Taking screenshot for ${shot.name}...`);
    try {
      if (shot.isMobile) {
        await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
      } else {
        await page.setViewport({ width: 1440, height: 900 });
      }

      await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'load', timeout: 15000 }).catch(e => console.log(`Timeout on ${shot.name}, proceeding anyway...`));
      
      // Give it extra time to render animations/data
      await new Promise(r => setTimeout(r, 4000));

      if (shot.clickVersus || shot.clickActualidad) {
         // Trying to mock the state or click the element
         // We don't know the exact DOM node, so we will try to find a link that takes us to a battle or just screenshot as is and note it.
         // Let's just screenshot whatever is on the screen for now, and see what the page looks like.
      }

      await page.screenshot({ path: path.join(OUT_DIR, shot.name), fullPage: true });
      console.log(`Saved ${shot.name}`);
    } catch (err) {
      console.error(`Failed to capture ${shot.name}:`, err);
    }
  }

  await browser.close();
  console.log('All done.');
}

run();
