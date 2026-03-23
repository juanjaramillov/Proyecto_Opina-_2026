import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173');
  } catch (e) {
    await page.goto('about:blank');
  }

  const domains = ['apple.com', 'google.com', 'amphora.cl'];
  
  const results = await page.evaluate(async (chunkUrls: string[]) => {
    return Promise.all(chunkUrls.map(domain => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `https://asset.brandfetch.io/${domain}/logo`;
      });
    }));
  }, domains);
  
  console.log('Results:', results);
  await browser.close();
}
main();
