import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('about:blank');
  
  const resultBlank = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `https://asset.brandfetch.io/apple.com/logo`;
    });
  });
  console.log('about:blank -> apple.com ->', resultBlank);

  await page.goto('http://localhost:5173');
  const resultLocalhost = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `https://asset.brandfetch.io/apple.com/logo`;
    });
  });
  console.log('localhost:5173 -> apple.com ->', resultLocalhost);

  await browser.close();
}
main();
