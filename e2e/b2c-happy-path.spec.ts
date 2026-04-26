import { test, expect } from '@playwright/test';

test.describe('B2C Happy Path', () => {
  test('Login and complete 3 signals in Versus/Signals Hub', async ({ page }) => {
    // 0. Setear origin. El access gate se desactiva vía
    //    VITE_ACCESS_GATE_ENABLED=false en playwright.config.ts → webServer.
    await page.goto('/');

    // Mock validate_invitation por si algún flujo del AuthContext lo consulta
    await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
        await route.fulfill({ json: [{ is_valid: true }] });
    });

    // Mock bootstrap para que el consumo automático del token "admin" no falle
    await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
        await route.fulfill({ json: { success: true } });
    });

    // Mock active battles para que el SignalsHub renderice el VersusGame y no el estado vacío
    await page.route('**/rest/v1/rpc/get_active_battles*', async route => {
        const mockBattles = [
            {
                id: 'b1-uuid', slug: 'b1', title: 'Battle 1', category: 'test', industry: 'test', options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
            },
            {
                id: 'b2-uuid', slug: 'b2', title: 'Battle 2', category: 'test', industry: 'test', options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
            },
            {
                id: 'b3-uuid', slug: 'b3', title: 'Battle 3', category: 'test', industry: 'test', options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
            }
        ];
        await route.fulfill({ json: mockBattles });
    });

    // 1. Navegar a /login con intención de ir a /signals
    await page.goto('/login?next=/signals');

    // 2. Llenar credenciales de prueba
    await page.locator('input[type="email"]').fill('test_normal_user@opina.plus');
    await page.locator('input[type="password"]').fill('TestNormal123!_seguro');
    
    // Clic en el botón de login
    await page.locator('button[type="submit"]').click();

    // Debugging temporal: esperar a que no esté loading, y si hay error atraparlo
    await page.waitForTimeout(2000); // Dar chance a que la peticion termine
    await page.screenshot({ path: 'test-results/debug-login.png' });


    // 3. Esperar a que la página cargue, ya sea el Hub o el Profile Wizard
    console.log('[Routing] Esperando resolución de Gate...');
    
    // Promesa que se resuelve si aparece el Hub
    const hubReady = page.getByTestId('versus-container').waitFor({ state: 'visible', timeout: 15000 }).then(() => 'hub');
    
    // Promesas que se resuelven si aparece alguna fase del Wizard
    const wizardStep2 = page.getByTestId('profile-wizard-step-basic').waitFor({ state: 'visible', timeout: 15000 }).then(() => 'wizard');
    const wizardStep3 = page.getByTestId('profile-wizard-step-professional').waitFor({ state: 'visible', timeout: 15000 }).then(() => 'wizard');
    const wizardStep4 = page.getByTestId('profile-wizard-step-home').waitFor({ state: 'visible', timeout: 15000 }).then(() => 'wizard');
    
    // Si ninguna aparece en 15s saldrá por timeout, de lo contrario nos dirá dónde estamos realmente
    const pageDest = await Promise.race([hubReady, wizardStep2, wizardStep3, wizardStep4]).catch(e => {
        console.log("Timeout esperando Hub o Wizard");
        return null;
    });

    console.log(`[Routing] Destino resuelto: ${pageDest}`);

    if (pageDest === 'wizard') {
      // Loop dinámico para resolver los pasos faltantes del Profile Wizard
      let isWizardDone = false;
      let maxAttempts = 5;
      
      while (!isWizardDone && maxAttempts > 0) {
        maxAttempts--;
        await page.waitForTimeout(2000); // Dar más tiempo a animaciones

        if (page.url().includes('/signals') && !page.url().includes('complete-profile')) {
            isWizardDone = true;
            break;
        }

        const isStep2 = await page.getByTestId('profile-wizard-step-basic').isVisible();
        const isStep3 = await page.getByTestId('profile-wizard-step-professional').isVisible();
        const isStep4 = await page.getByTestId('profile-wizard-step-home').isVisible();

        
        console.log(`[Wizard Loop] maxAttempts=${maxAttempts}, s2=${isStep2}, s3=${isStep3}, s4=${isStep4}, url=${page.url()}`);

        if (!isStep2 && !isStep3 && !isStep4) {
           console.log("[Wizard Loop] NOTHING MATCHED. DOM Dump:");
           console.log((await page.locator('body').innerText()).substring(0, 500));
        }

        if (isStep2) {
          await page.getByTestId('profile-wizard-age-input').fill('1990');
          await page.getByTestId('profile-wizard-step-basic').getByRole('button', { name: 'Hombre', exact: true }).click();
          await page.getByTestId('profile-wizard-step-basic').locator('select').first().selectOption({ index: 2 }); // Región
          await page.getByRole('button', { name: /Guardar/i }).click();
          continue;
        }

        if (isStep3) {
          const step3Container = page.getByTestId('profile-wizard-step-professional');
          await step3Container.locator('select').nth(0).selectOption({ index: 1 }); 
          await step3Container.locator('select').nth(1).selectOption({ index: 1 }); 
          await step3Container.locator('select').nth(2).selectOption({ index: 1 }); 
          await page.getByRole('button', { name: /Guardar/i }).click();
          continue;
        }

        if (isStep4) {
          const step4Container = page.getByTestId('profile-wizard-step-home');
          await step4Container.locator('select').nth(0).selectOption({ index: 1 }); 
          await step4Container.locator('select').nth(1).selectOption({ index: 1 }); 
          await step4Container.locator('select').nth(2).selectOption({ index: 1 }); 
          await page.getByRole('button', { name: /Listo/i }).click();
          isWizardDone = true; // Fin
          break;
        }
      }

      // 3. Esperar a que el Wizard mande a / o /signals
      try {
          await page.waitForURL(/\/|\/signals/);
      } catch (e) {
          console.log("[Wizard Loop] STUCK! Final DOM timeout Dump:");
          console.log((await page.locator('body').innerText()).substring(0, 1000));
          throw e;
      }
      
      // Si nos redirigió al Home (comportamiento de ProfileWizard isSkip), saltar al hub
      if (page.url() === 'http://localhost:5173/') {
          await page.goto('/signals');
      }
      await expect(page).toHaveURL(/.*\/signals.*/, { timeout: 15000 });
    }

    // 4. Asegurar que la UI principal del HUB de señales/batallas carga
    console.log('--- SIGNALS HUB DOM DUMP ---');
    console.log(await page.locator('main').innerHTML());
    console.log('-----------------------------');

    // Esperamos a que el primer botón dentro del contenedor de VersusCard esté visible
    // Esto atrapará la primera opción renderizada del VersusGame
    const firstOption = page.getByTestId('versus-option-opt1').first();
    await expect(firstOption).toBeVisible({ timeout: 15000 });

    // Mínimo 3 interacciones orgánicas
    for (let i = 0; i < 3; i++) {
        // En V15, la opción de batallas mockeadas tiene id opt1 y opt2
        const cardButton = page.getByTestId('versus-option-opt1').first();
        
        // Esperamos que sea visible e interactuable
        await expect(cardButton).toBeVisible({ timeout: 10000 });
        await expect(cardButton).toBeEnabled();

        // Emitir señal por la opción izquierda
        await cardButton.click();

        // Tras emitir la señal, el sistema debe mostrar porcentajes y eventualmente pasar a la siguiente
        // Ocultar temporalmente el botón de Saltar si es que hay delay 
        // y esperar que el DOM cambie para la nueva señal
        await page.waitForTimeout(2000); // 1.2s del timer de VersusGame + margen
    }

    // 5. Tras 3 iteraciones de señal exitosas sin crash, el test culmina validando que 
    // seguimos vivos en la app y no estamos trabados en pantallas de error.
    const hasError = await page.locator('text=/error/i').count();
    expect(hasError).toBe(0);
  });
});
