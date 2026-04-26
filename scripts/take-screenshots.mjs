import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    console.log('Starting screenshot capture...');
    const browser = await chromium.launch();
    
    // Create folders
    const outDir = 'screenshots_para_claude';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const routes = [
        { path: '/', name: '01_Home', fullPage: true },
        { path: '/about', name: '02_About', fullPage: true },
        { path: '/intelligence', name: '03_Intelligence', fullPage: true },
        { path: '/login', name: '04_Login', fullPage: false },
        { path: '/register', name: '05_Register', fullPage: false },
        { path: '/forgot-password', name: '06_ForgotPassword', fullPage: false }
    ];

    const captureContext = async (width, height, deviceName) => {
        const context = await browser.newContext({
            viewport: { width, height }
        });
        const page = await context.newPage();

        for (const route of routes) {
            console.log(`Capturing ${route.name} on ${deviceName}...`);
            await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1500); // give it time for animations to settle
            await page.screenshot({ 
                path: `${outDir}/${route.name}_${deviceName}.png`, 
                fullPage: route.fullPage !== false 
            });
        }
        
        // Atempt to capture the Signals Hub using the same mock strategy as E2E
        console.log(`Capturing 07_SignalsHub on ${deviceName}...`);
        
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/get_active_battles*', async route => {
            const mockBattles = [
                {
                    id: 'b1-uuid', slug: 'b1', title: 'Battle 1', category: 'test', industry: 'test', 
                    options: [{ id: 'opt1', label: 'Marca A' }, { id: 'opt2', label: 'Marca B' }]
                }
            ];
            await route.fulfill({ json: mockBattles });
        });

        // NOTE: arranca el dev-server con VITE_ACCESS_GATE_ENABLED=false antes
        // de correr este script para desactivar el access gate (el viejo bypass
        // via localStorage.opina_access_pass se retiró al cerrar la vulnerabilidad
        // crítica #2 de la auditoría Drimo).
        await page.goto('http://localhost:5173/');
        await page.evaluate(() => {
            // Fake mock session por si auth la lee desde localStorage
            localStorage.setItem('sb-supabase-auth-token', JSON.stringify({
                access_token: 'fake',
                user: { id: 'fake-id', email: 'test@opina.plus', user_metadata: { first_name: 'Usuario' } }
            }));
        });

        await page.goto('http://localhost:5173/signals', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: `${outDir}/07_SignalsHub_${deviceName}.png`, 
            fullPage: false 
        });

        await context.close();
    };

    await captureContext(1440, 900, 'Desktop');
    await captureContext(375, 812, 'Mobile');

    await browser.close();
    console.log('Screenshots captured successfully!');
})();
