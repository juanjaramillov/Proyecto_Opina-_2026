import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.join(process.cwd(), 'ux_audit_screenshots');
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runAudit() {
    console.log("🚀 Iniciando Auditoria UX/UI E2E en localhost:5173");
    
    // Launch visible with a standard desktop viewport
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 60,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    try {
        // 1. HOME
        console.log("📍 Navegando a Home...");
        await page.goto('http://localhost:5173/');
        await page.waitForNetworkIdle();
        await page.screenshot({ path: path.join(OUT_DIR, '01_Home_Hero.png'), fullPage: true });

        // 2. Click 'Iniciar Sesión'
        console.log("👤 Navegando a Login...");
        await page.goto('http://localhost:5173/login');
        await page.waitForNetworkIdle();
        await page.screenshot({ path: path.join(OUT_DIR, '02_Login_Page.png'), fullPage: true });

        // 3. Login Flow (using existing admin to bypass email confirm)
        console.log("🔑 Ejecutando Login como Admin...");
        // Emulate human typing
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@opina.com', { delay: 50 });
        await page.type('input[type="password"]', 'admin123', { delay: 50 }); 
        await page.click('button[type="submit"]');
        
        // Wait for redirect to Signals Hub
        await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => console.log("Login form submit taking longer..."));

        // 4. SIGNALS HUB (The Bento Box)
        console.log("📡 Validando Signals Hub...");
        await page.goto('http://localhost:5173/signals');
        await page.waitForNetworkIdle();
        await new Promise(r => setTimeout(r, 2000)); // Esperar animaciones de bento
        await page.screenshot({ path: path.join(OUT_DIR, '03_Signals_Hub_Bento.png'), fullPage: true });

        // 5. VERSUS VIEW
        console.log("⚔️ Entrando a Versus Rápido y Torneo...");
        // Check local state or click through
        await page.goto('http://localhost:5173/signals', { waitUntil: 'networkidle0' });
        // Evaluate button presence
        const cards = await page.$$('.card-interactive');
        if (cards.length > 0) {
            await cards[0].click(); // El primero suele ser Versus
            await new Promise(r => setTimeout(r, 2000)); // Animación
            await page.screenshot({ path: path.join(OUT_DIR, '04_Versus_Game.png'), fullPage: true });
        }

        // 6. RESULTADOS
        console.log("📊 Navegando a Resultados (Unlocking Shell)...");
        await page.goto('http://localhost:5173/results');
        await page.waitForNetworkIdle();
        await new Promise(r => setTimeout(r, 3000)); // Wait for charts to animate
        await page.screenshot({ path: path.join(OUT_DIR, '05_Results_Shell.png'), fullPage: true });

        // 7. PERFIL
        console.log("👤 Navegando a Perfil...");
        await page.goto('http://localhost:5173/profile');
        await page.waitForNetworkIdle();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(OUT_DIR, '06_Profile.png'), fullPage: true });

        console.log("✅ Auditoría Visual Completada. Revisa la carpeta ux_audit_screenshots.");
    } catch (e) {
        console.error("❌ Error durante la auditoría:", e);
    } finally {
        await browser.close();
    }
}

runAudit();
