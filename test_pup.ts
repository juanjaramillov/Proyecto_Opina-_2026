import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    page.on('response', async response => {
        if (response.url().includes('/rpc/')) {
            console.log('RPC URL:', response.url());
            console.log('RPC response status:', response.status());
            const text = await response.text();
            console.log('RPC response body:', text);
        }
    });

    console.log('Going to localhost:5173/access...');
    try {
        await page.goto('http://localhost:5173/access', { waitUntil: 'networkidle2' });

        console.log('Typing code GRUPO1-C3CF6DBF...');
        await page.waitForSelector('input');
        await page.type('input', 'GRUPO1-C3CF6DBF');

        console.log('Clicking button...');
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000); // give it time to display error

        const errText = await page.evaluate(() => {
            const el = document.querySelector('p.text-red-600');
            return el ? el.innerText : 'No error displayed';
        });
        console.log('Frontend error message:', errText);
    } catch (e) {
        console.error('Test error:', e);
    } finally {
        await browser.close();
    }
})();
