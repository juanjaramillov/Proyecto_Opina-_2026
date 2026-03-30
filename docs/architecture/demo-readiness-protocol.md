# Protocolo Demo Readiness: Operación Anti-Cold Start (Certificado)

Este documento establece el procedimiento estricto, formal y documentado para inicializar un entorno de Staging o Demostración de Opina+ previo a su uso comercial ante terceros.

El objetivo central de este protocolo es liquidar la práctica de improvisar o sembrar manualmente datos antes de una Demo, asegurando que las pantallas operen sobre el "modelo de negocio" real del software y pasen una auditoría de umbrales en código, previniendo fallos gráficos por volumen ausente (Cold Start).

---

## 1. Comandos Exactos Creados en `package.json`

Los comandos de Terminal oficiales y definitivos para administrar la Demo Layer son:

### 1a. Comandos de Siembras (Prepare)
```bash
# Preparar simulador Bancario
npm run demo:prepare:banking -- --allow-demo-seed

# Preparar simulador de Telecomunicaciones
npm run demo:prepare:telecom -- --allow-demo-seed
```
*   *(Nota: Se requiere doble guión `--` para inyectar flags adyacentes a un script `tsx` embebido en `npm run`)*

### 1b. Comandos de Auditoría (Validate)
```bash
# Auditar simulador Bancario
npm run demo:validate:banking

# Auditar simulador de Telecomunicaciones
npm run demo:validate:telecom
```

---

## 2. Protección Anti-Producción Exacta (Hardened Security)

Para evitar la contaminación accidental de la base de datos real visible a consumidores públicos, el script `scripts/ops/demo/seed_demo.ts` incorpora tres cortafuegos "Hard-Stop" antes de procesar una sola fila:

| MECANISMO | CONDICIÓN EVALUADA | RESPUESTA / COMPORTAMIENTO SI FALLA |
| :--- | :--- | :--- |
| **Peligro de Entorno Variable** | Revisa si `process.env.VITE_APP_ENV === 'production'` o `NODE_ENV === 'production'` | Lanza `process.exit(1)`: `"🚨 [FATAL ERROR] Intento de sembrado en entorno de PRODUCCIÓN..."` |
| **Peligro de URL Host** | Inspecciona `process.env.VITE_SUPABASE_URL` buscando IDs exclusivos del Production-ProjectRef | Lanza idéntico `process.exit(1)` con aborto silencioso. |
| **Flag Manual Obligatorio** | Comprueba el string `--allow-demo-seed` contenido nativamente en los procesadores `process.argv` | Lanza `process.exit(1)`: `"🚨 [ERROR] Falta el flag obligatorio..."`. Bloquea la acción asumiendo toque accidental en la CLI. |
| **Bypass Obligatorio (RLS)** | Evalúa la presencia obligatoria de la variable `SUPABASE_SERVICE_ROLE_KEY` | Lanza `process.exit(1)`: Informa que la herramienta es exclusivamenter CLI y que requiere el token para sortear RLS y evitar uso desde frontends o clientes anónimos con llaves débiles. |

Cualquier vulneración de estos cuatro candados detiene la ejecución inmediatamente evitando daños irreversibles.

---

## 3. Gobernanza Explícita de Catálogos (Regla Global / Sync UUID)

Para evitar la divergencia de bases de datos producto del uso de tablas compartidas, Opina+ V15 mantiene una estricta gobernanza con la siguiente jerarquía sobre los registros, impuesta como una **Regla Global de Operación** que abarca tanto a la Demo Readiness Layer como a las herramientas de escritura del Panel Administrativo (`/admin/entities` y `adminEntitiesService.ts`):

- **Catálogo Canónico Mestro (`signal_entities`)**: Es la única fuente de la verdad para V15. Todos los dashboards, *Read Models* (b2c/b2b) y reportes transaccionales dependen estrictamente de los IDs de estas marcas. Todo lo nuevo lee desde aquí.
- **Tabla de Compatibilidad Heredada (`entities`)**: Ejerce como catálogo Legacy y soporte temporal de Módulos con llaves foráneas antiguas (e.g. `battle_options.brand_id`) y dependencias metadata UI vinculadas a la versión V14.

Dado que sembrar o crear entidades independientemente en cualquiera de los dos corrompería la identidad analítica, todos los writre paths oficiales del sistema (Seed Script y Admin Service) consumen ahora un **Motor Único de Escritura Dual (`src/lib/catalogGovernance.ts`)**. Este servicio actúa como la aduana obligatoria para la sincronización cross-tabla.

**Contrato de Escritura Activa (Campos Mínimos Garantizados):**
El motor exige como mínimo para proceder que se inyecte: `UUID ID`, el identificador de dominio (`slug`), su visibilidad pública (`is_active`), y su titulación (`name` mapeando a `display_name`).

---

## 4. Certificación de Integridad con el Modelo Real

El seed (`seed_demo.ts`) NO utiliza paralelamente "mocks bonitos" inyectados en Front-End ni archivos JSON aislados. Emplea la interfaz Supabase SDK Real acoplándose nativamente al modelo subyacente de la plataforma B2C/B2B:

*   **Categorías y Entidades Curadas (`categories`, `signal_entities`, `entities`):** Ejecuta la inyección sobre el Master Catalog de V15 (`signal_entities`) y sincroniza con el legacy support (`entities`) garantizando que operan bajo un único UUID para el modelo base (`telecom` con 'Entel', 'Movistar', etc).
*   **Gestión de Batallas y Opciones (`battles`, `battle_options`):** Crea combinatorias 1vs1 exactas, vinculando a los `signal_entities` mediante llaves foráneas para que los `ResultsPlacesBlocks` y Rankings del Home consuman de algoritmos orgánicos.
*   **Huellas de Interacción en Base a Demografía (`profiles`, `user_demographics`, `signal_events`):** Es aquí donde se elimina el principal riesgo B2B. El script forja en backend temporalmente usuarios Fantasmas dotados deliberadamente de Edades Diferenciadas (18-24, 25-44, etc.) y Géneros para inyectar la selección canónica (`entity_id`, `option_id`, `battle_id`) y emitir *Señales Reales*. Cuando el Agente Analítico solicita el Módulo de Inteligencia, los Radares procesan estos eventos registrados en `signal_events` mediante las *Read Models* del Sistema Genuino e interactúan con ellos con precisión. Nada es paralelo ni legado.

---

## 5. Validación Precisa GO/NO-GO Evaluada por Superficie

El validador `validate_demo.ts` (CLI) y `AdminDemoLaunchpad.tsx` (UI) consumen estrictamente los mismos parámetros y thresholds de la **Única Fuente de Verdad** localizada en `src/config/demoProtocol.ts`. Esto garantiza el nulo riesgo de divergencia u overclaiming. Mapea la lectura directamente a las tres superficies visuales comprometedoras:

1.  **Módulo Signals Hub (B2C Landing):**
    *   **Validación Estricta:** Chequea la disponibilidad de Entidades (`≥ MIN_ENTITIES`, por defecto 3), status `'active'` en el catálogo maestro `signal_entities`.
    *   *Si Válida:* `"[PASS] Módulo Signals Hub: X entidades disponibles..."` - Confirmando que el "Swipe" mostrará data al evaluador.
2.  **Módulo Resultados y Torneos (Home B2C):**
    *   **Validación Estricta:** Chequea el volumen general transaccional. Debe ser `≥ MIN_SIGNALS` (por defecto 10) en tabla nativa `signal_events` para el módulo `versus` vinculado al escenario activo.
    *   *Si Válida:* `"[PASS] Módulo Resultados B2C: Threshold estadístico superado (N=X)]... Módulo operable sin advertencia de Volatilidad."`
3.  **Módulo Corporativo / Intelligence B2B:**
    *   **Validación Estricta:** Exige un `MIN_DEMOGRAPHICS_THRESHOLD` (por defecto 5) en `user_demographics` con perfiles partícipes en las señales evaluadas en el punto previo. Sin demografías pobladas localmente, el Radar analítico B2B renderizaría errores o nulos.
    *   *Si Válida:* `"[PASS] Módulo Intelligence B2B: Radares y Benchmarks listos con cruces demográficos..."`

El Terminal y el UI Launchpad solo expelerán **✅ VEREDICTO FINAL: GO** cuando y solo cuando **los tres sub-módulos** pasen la batería estricta de validación asincrónica, proscribiendo operativamente cualquier Demo defectuosa por error humano o discrepancias de reglas.

---

## 6. Gobernanza Comercial y Recorrido (SOP)

Cualquier Operador Comercial o Demo Presenter de Opina+ V15 consume el **Recorrido Oficial Único**, garantizado también en `src/config/demoProtocol.ts`. 

- **Escenario Oficial:** `telecom` (Telecomunicaciones Demo).
- **Recorrido:** `Home -> Access Gate -> Signals Hub -> Profile -> Results B2C -> Intelligence B2B`.
- **Zonas Excluidas:** `/admin/*` (Salvo Launchpad), Torneos vacíos, Recuperación de Password.
