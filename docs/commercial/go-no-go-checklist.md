# Go / No-Go Checklist (Readiness Comercial)

Este checklist es de uso obligatorio para el Account Executive / Seller antes de conectarse a una reunión comercial o piloto B2B de Opina+. 

Si al menos uno de los puntos obligatorios (`GO`) no se cumple, la reunión debe ser pospuesta o la demo debe limitarse a una presentación en PDF.

---

## 🟢 1. Estabilidad de los Golden Records (Data Curada)
- [ ] **Demo Launcher Operativo:** Abriste `/admin` y el módulo "Pilot Demo Launcher" muestra el badge `Ready` en color verde.
- [ ] **Integridad de Datos:** Hiciste click en los 4 escenarios base (Battle, News, Brand, Trending) y en todos se levanta el modal (Drawer) correctamente, sin pantallas en blanco ni estados de carga perpetuos.
- [ ] **Scores Lógicos:** Al abrir la Batalla Competitiva (Versus), el OpinaScore no es `0.00` y existen votos en ambos lados de forma realista.

## 🟢 2. Blindaje Visual (Client-Facing)
- [ ] **Modo Demo Probado:** Al hacer clic en una tendencia, oprimiste el botón superior "Panel Técnico" para pasarlo a "Demo Activo". Verificaste que los controles de "Calcular IA", gráficas excesivas y basuras de debug desaparezcan.
- [ ] **Sin UUIDs rotos:** Confirmaste que las cards ejecutivas muestran nombres de marcas (ej. "Coca Cola") y no hashes como `uuid-83fa...`.
- [ ] **Fallo Gráfico:** Abriste la vista de impresión (CMD/CTRL + P) y verificaste que el CSS `@media print` rinde un PDF inmaculado (sin fondos negros ni menú lateral).

## 🟢 3. Narrativa Autónoma del Motor
- [ ] **Bullets Comerciales Activos:** En la zona inferior del Modo Demo ("Guía de Pitch Comercial"), el bloque azul/indigo muestra tu texto de anclaje (Presenter Notes) de manera correcta.
- [ ] **Autonarrativa Coherente:** Leíste los 3 bullets que generó el motor matemático solo para asegurar que no hay advertencias agresivas (ej. "Riesgo de Bots") activas en un Golden Record que planeabas vender como un "Caso de Éxito Seguro".

## 🟡 4. Fallbacks (Qué hacer si algo falla)
- [ ] **Cache Local:** Vaciaste cookies o entraste en modo Incógnito usando tu cuenta de Admin para evitar estados corruptos del cache.
- [ ] **Pestaña Auxiliar:** Tienes los PDFs pre-generados guardados en tu escritorio como Plan B si los servidores de Supabase / Vercel cayeran en el minuto exacto de la demo.

---

### Veredicto Final
**Si todo está marcado:** Inicia la reunión con confianza. El producto está blindado y tu narrativa está apoyada matemáticamente. Go-Live!
