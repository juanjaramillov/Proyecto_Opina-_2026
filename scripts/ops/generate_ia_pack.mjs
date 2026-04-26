import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PACK_DIR = 'gemini-analysis-pack';
const BASE_URL = 'http://localhost:5173';

const VIEWS = [
  { name: 'home', route: '/', file: 'src/features/home/pages/Home.tsx' },
  { name: 'results', route: '/results', file: 'src/features/results/pages/Results.tsx' },
  { name: 'signals', route: '/signals', file: 'src/features/feed/pages/SignalsHub.tsx' },
  { name: 'b2b-overview', route: '/b2b/overview', file: 'src/features/b2b/pages/OverviewB2B.tsx' },
  { name: 'profile', route: '/profile', file: 'src/features/profile/pages/Profile.tsx' }
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(PACK_DIR)) {
    fs.mkdirSync(PACK_DIR);
  }

  console.log('Iniciando navegador Puppeteer...');
  const browser = await puppeteer.launch({ 
      headless: "new",
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  // Opcional: Intentar Log In si es necesario (asumimos usuario de prueba estándar)
  console.log('Intentando login automático...');
  try {
      // Arranca el dev-server con VITE_ACCESS_GATE_ENABLED=false para que el
      // gate no redirija (el viejo bypass client-side opina_access_pass se
      // retiró al cerrar la vulnerabilidad crítica #2 de la auditoría Drimo).
      await page.goto(`${BASE_URL}/admin-login`, { waitUntil: 'networkidle2' });
      await page.type('input[type="email"]', 'test_cooldown_admin@opina.plus');
      await page.type('input[type="password"]', 'TestNormal123!_seguro');
      await page.click('button[type="submit"]');
      await delay(4000); // Wait for React Router transition instead of network navigation
      console.log('Login completado (o ignorado por auth status).');
  } catch(e) {
      console.log('Login omitido o fallido, continuaremos con capturas (puede redirigir).', e.message);
  }

  for (const view of VIEWS) {
    console.log(`\nProcesando vista: ${view.name} (${view.route})`);
    try {
        await page.goto(`${BASE_URL}${view.route}`, { waitUntil: 'networkidle2' });
        await delay(2000); // Esperar a que animaciones/datos carguen

        // Captura Desktop
        await page.setViewport({ width: 1440, height: 900 });
        const destDesktop = path.join(PACK_DIR, `${view.name}-desktop.png`);
        await page.screenshot({ path: destDesktop, fullPage: true });
        console.log(`✓ Screenshot Desktop: ${destDesktop}`);

        // Captura Mobile
        await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
        await delay(500); // Wait for responsive re-render
        const destMobile = path.join(PACK_DIR, `${view.name}-mobile.png`);
        await page.screenshot({ path: destMobile, fullPage: true });
        console.log(`✓ Screenshot Mobile: ${destMobile}`);

        // Extracción de Código
        const codeDest = path.join(PACK_DIR, `${view.name}-codigo.txt`);
        let codeContent = `/* Código fuente para la vista: ${view.name} */\n/* Ruta: ${view.file} */\n\n`;
        
        if (fs.existsSync(view.file)) {
            const fileData = fs.readFileSync(view.file, 'utf8');
            codeContent += fileData;
        } else {
            codeContent += `// ERROR: Archivo no encontrado en ${view.file}\n`;
        }

        fs.writeFileSync(codeDest, codeContent);
        console.log(`✓ Código exportado: ${codeDest}`);

    } catch(err) {
        console.error(`Error procesando ${view.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n✅ Proceso completado. La carpeta gemini-analysis-pack está lista.');
}

run().catch(console.error);
