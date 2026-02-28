const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('response', async response => {
        if (response.url().includes('/rpc/validate_invitation')) {
            console.log('RPC response status:', response.status());
            console.log('RPC response body:', await response.text());
        }
    });

    await page.goto('http://localhost:5173/access');
    await page.waitForSelector('input');
    await page.type('input', 'GRUPO1-C3CF6DBF');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    const errText = await page.evaluate(() => {
        const el = document.querySelector('p.text-red-600');
        return el ? el.innerText : 'No error';
    });
    console.log('Frontend error message:', errText);
    
    await browser.close();
})();
