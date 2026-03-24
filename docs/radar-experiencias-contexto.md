# Contexto Técnico: Radar de Experiencias

Este documento consolida el estado actual (técnico, estructural y visual) de la sección "Radar de Experiencias" en la aplicación Opina+ V13. Su objetivo es servir como puente documental para que equipos o diseñadores externos puedan intervenir el componente con total visibilidad, sin necesidad de navegar el proyecto entero.

---

## 1. Resumen Estructural

*   **Nombre de la página:** SignalsHub (Hub de Señales).
*   **Ruta exacta del archivo principal que renderiza el Radar:** `src/features/feed/pages/SignalsHub.tsx`
*   **Explicación de entrada:** El Hub de Señales orquesta la experiencia principal de la app. El "Radar de Experiencias" se inserta como un bloque secundario de navegación transversal (`HubSecondaryTracks.tsx`) justo debajo del panel de actividad actual (el Versus que esté corriendo o la pantalla de cooldown). Permite al usuario "deslizar" y elegir saltar a áreas paralelas del ecosistema (Torneos, Actualidad, etc.).

---

## 2. Mapa de Dependencias

1.  `src/features/feed/components/hub/HubSecondaryTracks.tsx`
    *   **Rol:** Archivo crítico. Contiene puramente la UI del carrusel y las Cards editoriales.
2.  `src/features/feed/pages/SignalsHub.tsx`
    *   **Rol:** Crítico. Es la página padre que invoca el Radar y controla la navegación mayor del layout.
3.  `src/features/feed/hooks/useExperienceMode.ts`
    *   **Rol:** Secundario. El hook que provee la función `setMode` y el estado `mode` ("torneo", "actualidad", etc.) al Radar para ejecutar la navegación.
4.  `src/index.css`
    *   **Rol:** Secundario/Accesorio. Contiene la clase de utilidad `.hide-scrollbar` y definiciones de colores/sombras base.

---

## 3. Jerarquía Real de Render

*   Página: `SignalsHub.tsx`
    *   `<div id="hub-tracks">`
        *   Sección: `HubSecondaryTracks.tsx`
            *   Header Corto (Título "Radar de Experiencias" y "Desliza")
            *   Carrusel (`div.flex.overflow-x-auto.snap-x`)
                *   Card "Torneos" (`button.group`)
                    *   Zona 1: Header Visual (Íconos, Título, KPIs)
                    *   Zona 2: Beneficios (*Value Prop* y Checkmarks)
                    *   Zona 3: Preview (Mockup UI del Torneo insertado como bloque "hijo" flotante)
                *   Card "Actualidad" (Estructura base lista, Preview en blanco)
                *   Card "Lugares" (Estructura base lista, Preview en blanco)
                *   Card "Profundidad" (Estructura base lista, Preview en blanco)
                *   Card "Servicios" (En formato Locked/Coming Soon)
                *   Card "Publicidad" (En formato Locked/Coming Soon)

---

## 4. Props y Datos

*   **SignalsHub.tsx:** Se encarga de la lógica pesada del dominio (conexión con Supabase, Auth, límites, cargas). Sin embargo, no le pasa ninguno de esos dominios vivos al Radar.
*   **HubSecondaryTracks.tsx:** 
    *   **Props:** `{ setMode: (mode: [...]) => void }`. Solo recibe el setter de estado para enrutar.
    *   **Datos:** Todos los textos, *badges*, avatares, y beneficios de las *cards* actualmente **son mocks duros (hardcoded)** definidos directamente en el JSX. Las métricas (ej. "4.2k participantes", "1 Llave activa") son visuales para diagramación.
    *   Las imágenes de perfil que salen como preview en Torneos se extraen usando **Dicebear API estática** (ej: `https://api.dicebear.com/7.x/shapes/svg?seed=A`).

---

## 5. Estado Actual del Diseño

Actualmente, el Radar se despliega como un **Carrusel Horizontal** (1 sola línea) utilizando scroll magnético CSS (*Snapping*), descartando grillas irregulares para privilegiar la estandarización y una visual premium.

*   **Medidas:** Las *cards* miden exactamente `w-[320px]` (Mobile) a `w-[340px]` (Desktop), por un alto muy pronunciado de `h-[480px]`.
*   **Estructura de 3 Zonas:**
    *   **Zona 1 (Arriba):** Ícono cuadrado flotante a la izquierda, badges descriptivos en píldoras a la derecha. Abajo el H3 gigante con el nombre del track.
    *   **Zona 2 (Medio):** Separador sutil gradient de 1px. Frase de propuesta de valor en negro/gris oscuro, acompañada de un sistema de lista *check* en texto reducido (12px).
    *   **Zona 3 (Abajo):** Integrada al fondo de la base de la tarjeta (`mt-auto`), se trata de un marco con color base distinto que anida dentro de sí misma una "Mini UI" del módulo de destino que funge de simulación de interacción.
*   **Micro-interacciones (Hover):** Completamente delegadas a hover con selectores CSS anidados (`group` de Tailwind). Al hacer Hover en la tarjeta principal:
    1.  La tarjeta principal hace Translate-Y arriba.
    2.  Surge una sombra teñida del color central del track (indigo, esmeralda, etc.).
    3.  Revela desenfoques abstractos (glow/blurs) de background simulando "focos".
    4.  Los iconos de la Zona 1 escalan y rotan independientemente.
    5.  La "Mini UI" de la zona 3 realiza su propio rebote secundario superior generándole un efecto Multi-Capa / Parallax vertical súper *High-End*.

---

## 6. Clases Visuales Relevantes (Tailwind)

*   **Layout del Carrusel:** `flex overflow-x-auto snap-x snap-mandatory hide-scrollbar shrink-0`
*   **Glass y Fondos:** `bg-white` (tarjeta base), `bg-slate-50/80` (contenedor de preview inferior).
*   **Orquestación de animación CSS (vital):** Patrón `.group` en el botón base para accionar la cascada a `.group-hover:scale-110`, `.group-hover:-translate-y-2`, `.group-hover:shadow-[rgba(...)]`.
*   **Transiciones:** `transition-all duration-500 ease-out`.
*   **Acentos Específicos:** Se utilizan variables tonales específicas de tailwind por cada track. Ejemplo en Torneos es el Indigo: `from-indigo-50`, `border-indigo-100`, `text-indigo-600`. En Actualidad es Esmeralda.

---

## 7. Dependencias Externas Involucradas

1.  **TailwindCSS** (Estilos completos).
2.  **Google Material Symbols Outlined** (Sistema de Íconos, invocados mediante `span.material-symbols-outlined`).
3.  No existen dependencias de Motion (Framer), Splide, Swiper ni ninguna librería de terceros para el carrusel. Es 100% nativo (lo que exige ser muy cuidadoso manipulando CSS).

---

## 8. Notas de Riesgo y Limitaciones

1.  **Flex Shrink:** Como todo carrusel nativo en flex, las *cards* **deben** tener imperativamente la clase `shrink-0`. Si se omite, o se intenta hacer un width porcentual (`w-full`), Flexbox las comprimirá rompiendo todo.
2.  **Efecto Multi Hover:** Romper la convención del macro `group` en la etiqueta de navegación superior dejará ciegos a los elementos internos, rompiendo toda la complejidad de animación.
3.  **Reflow del Preview:** La "Zona 3" debe cuidarse de no superar la altura límite designada (`h-[150px]`) usando overflow hidden inteligentemente o padding, de lo contrario empujará contenido superponiendo el botón base.
4.  **No hay lazy load:** Al estar todo quemado actualmente, el DOM pinta los 6 módulos completos (con sus avatares, SVG, sombras complejas). Si el diseño demanda texturas o blur extremos que afecten rendimiento general de pintura del explorador, en módulos complejos como Torneos con animaciones `.animate-pulse`, se deberá revisar en móvil gama baja.

---

## 9. Código Completo de los Archivos Relevantes

### A) Componente Presentacional del Carrusel: `HubSecondaryTracks.tsx`
Ubicación: `src/features/feed/components/hub/HubSecondaryTracks.tsx`

```tsx
interface HubSecondaryTracksProps {
    setMode: (mode: 'menu' | 'versus' | 'torneo' | 'profundidad' | 'actualidad' | 'lugares') => void;
}

export function HubSecondaryTracks({ setMode }: HubSecondaryTracksProps) {
    return (
        <div className="w-full relative bg-slate-50/50 pb-20">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-12 pt-8 md:pt-12">
                
                {/* Header Corto y Funcional */}
                <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                            Radar de Experiencias
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 font-medium mt-1">Explora otras dinámicas activas en la comunidad.</p>
                    </div>
                    {/* Scroll Hint */}
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-200/50 px-3.5 py-1.5 rounded-full border border-slate-200 self-start md:self-auto shadow-sm animate-pulse">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Desliza</span>
                        <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                    </div>
                </div>
                
                {/* ACTIVE MODULES - Symmetric Horizontal Carousel (Opción A) */}
                <div className="w-full flex overflow-x-auto gap-4 md:gap-5 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:-mx-6 md:px-6">
                    
                    {/* 1. TORNEOS (Master Template - 3 Zonas) */}
                    <button 
                        onClick={() => setMode('torneo')}
                        className="group relative flex flex-col shrink-0 snap-center md:snap-start w-[320px] md:w-[340px] h-[480px] p-0 rounded-[32px] bg-white border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out text-left overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-[32px] group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full w-full">
                            
                            {/* ZONA 1: Header Visual */}
                            <div className="px-6 pt-6 pb-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-[16px] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                                            1 Llave activa
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-200">
                                            <span className="material-symbols-outlined text-[12px]">group</span>
                                            4.2k
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-black text-slate-800 text-2xl group-hover:text-indigo-600 transition-colors tracking-tight">Torneos</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1 leading-snug">
                                        Batallas 1v1 eliminatorias.
                                    </p>
                                </div>
                            </div>

                            {/* Separador Suave */}
                            <div className="mx-6 h-px bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100"></div>

                            {/* ZONA 2: Beneficios */}
                            <div className="px-6 py-4 flex flex-col gap-2">
                                <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                    Elige a tus favoritos y descubre quién domina la comunidad.
                                </p>
                                <ul className="flex flex-col gap-1.5 mt-1">
                                    <li className="flex items-start gap-1.5 text-[12px] text-slate-600">
                                        <span className="material-symbols-outlined text-[14px] text-indigo-400 mt-0.5">check_circle</span>
                                        Vota en duelos directos
                                    </li>
                                    <li className="flex items-start gap-1.5 text-[12px] text-slate-600">
                                        <span className="material-symbols-outlined text-[14px] text-indigo-400 mt-0.5">check_circle</span>
                                        Sigue eliminatorias en tiempo real
                                    </li>
                                </ul>
                            </div>

                            {/* ZONA 3: Preview Interactivo */}
                            <div className="mt-auto relative w-full h-[150px] bg-slate-50/80 border-t border-slate-100 overflow-hidden flex items-end justify-center px-4 pt-4 transition-colors duration-500 group-hover:bg-indigo-50/50">
                                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white to-transparent opacity-80 z-10 pointer-events-none"></div>
                                
                                <div className="relative w-full h-[120px] bg-white rounded-t-[20px] border border-b-0 border-slate-200/80 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] flex flex-col p-4 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_-8px_20px_-5px_rgba(99,102,241,0.15)]">
                                    <div className="w-full flex items-center justify-between mt-1 px-1">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                <img src="https://api.dicebear.com/7.x/shapes/svg?seed=A" alt="Mock" className="w-full h-full object-cover opacity-60" />
                                            </div>
                                            <div className="w-10 h-1.5 bg-slate-200 rounded-full"></div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">VS</span>
                                            <div className="w-14 h-[3px] bg-indigo-100 mt-1.5 rounded-full relative overflow-hidden">
                                                <div className="absolute left-0 top-0 h-full w-[65%] bg-indigo-500 rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                <img src="https://api.dicebear.com/7.x/shapes/svg?seed=B" alt="Mock" className="w-full h-full object-cover opacity-60" />
                                            </div>
                                            <div className="w-10 h-1.5 bg-slate-200 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex items-center justify-center gap-1.5 pb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Final en vivo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 2. ACTUALIDAD (Estructura adaptada) */}
                    <button 
                        onClick={() => setMode('actualidad')}
                        className="group relative flex flex-col shrink-0 snap-center md:snap-start w-[320px] md:w-[340px] h-[480px] p-0 rounded-[32px] bg-white border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out text-left overflow-hidden"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-[32px] group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full w-full">
                            {/* ZONA 1 */}
                            <div className="px-6 pt-6 pb-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                        <span className="material-symbols-outlined text-2xl">campaign</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                                            En vivo
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-2xl group-hover:text-emerald-600 transition-colors tracking-tight">Actualidad</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1 leading-snug">
                                        Reacciona a noticias de última hora.
                                    </p>
                                </div>
                            </div>

                            <div className="mx-6 h-px bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100"></div>

                            {/* ZONA 2 */}
                            <div className="px-6 py-4 flex flex-col gap-2">
                                <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                    Mide el pulso de la comunidad frente a lo que importa hoy.
                                </p>
                                <ul className="flex flex-col gap-1.5 mt-1">
                                    <li className="flex items-start gap-1.5 text-[12px] text-slate-600">
                                        <span className="material-symbols-outlined text-[14px] text-emerald-400 mt-0.5">check_circle</span>
                                        Noticias y tendencias
                                    </li>
                                </ul>
                            </div>

                            {/* ZONA 3: Template Estructural */}
                            <div className="mt-auto relative w-full h-[150px] bg-slate-50/80 border-t border-slate-100 overflow-hidden flex items-end justify-center px-4 pt-4 transition-colors duration-500 group-hover:bg-emerald-50/50">
                                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white to-transparent opacity-80 z-10 pointer-events-none"></div>
                                <div className="relative w-full h-[120px] bg-white rounded-t-[20px] border border-b-0 border-slate-200/80 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] flex flex-col p-4 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_-8px_20px_-5px_rgba(16,185,129,0.15)] items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">dashboard_customize</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Preview Layout</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 3. LUGARES (Estructura adaptada) */}
                    <button 
                        onClick={() => setMode('lugares')}
                        className="group relative flex flex-col shrink-0 snap-center md:snap-start w-[320px] md:w-[340px] h-[480px] p-0 rounded-[32px] bg-white border border-slate-200 hover:border-orange-400 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.25)] hover:-translate-y-2 transition-all duration-500 ease-out text-left overflow-hidden"
                    >
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                            <div className="w-full h-full rounded-full border-[2px] border-orange-500 scale-150" />
                            <div className="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full border-[2px] border-orange-500" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full w-full">
                            {/* ZONA 1 */}
                            <div className="px-6 pt-6 pb-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-[16px] bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm transition-transform duration-500 group-hover:-translate-y-1.5">
                                        <span className="material-symbols-outlined text-2xl">place</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                            <span className="material-symbols-outlined text-[12px] text-orange-500">near_me</span>
                                            Cerca de ti
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-2xl group-hover:text-orange-600 transition-colors tracking-tight">Lugares</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1 leading-snug">
                                        Evalúa sucursales y espacios físicos.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mx-6 h-px bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100"></div>

                            {/* ZONA 2 */}
                            <div className="px-6 py-4 flex flex-col gap-2">
                                <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                    Encuentra y valora el servicio real de miles de sedes en tu ciudad.
                                </p>
                            </div>

                            {/* ZONA 3: Template Estructural */}
                            <div className="mt-auto relative w-full h-[150px] bg-slate-50/80 border-t border-slate-100 overflow-hidden flex items-end justify-center px-4 pt-4 transition-colors duration-500 group-hover:bg-orange-50/50">
                                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white to-transparent opacity-80 z-10 pointer-events-none"></div>
                                <div className="relative w-full h-[120px] bg-white rounded-t-[20px] border border-b-0 border-slate-200/80 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] flex flex-col p-4 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_-8px_20px_-5px_rgba(249,115,22,0.15)] items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">dashboard_customize</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Preview Layout</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 4. PROFUNDIDAD, 5. SERVICIOS, 6. PUBLICIDAD */}
                    {/* ... Componentes con idéntica estructura omitidos en muestra para no sobre-verbosar, con mismos identificadores de zonas ... */}
                </div>
            </div>
        </div>
    );
}
```

### B) Archivo Orquestador Superior: `SignalsHub.tsx` (Fragmento que usa el Radar)
Ubicación: `src/features/feed/pages/SignalsHub.tsx`

```tsx
// Imports principales...
import { useExperienceMode } from "../hooks/useExperienceMode";
import HubSecondaryTracks from "../components/hub/HubSecondaryTracks";

export default function SignalsHub() {
    // Hook que rige qué modo está activado en el usuario de esta pantalla
    const { mode, setMode } = useExperienceMode();
    const { currentState: hubState } = useHubSession();
    // ... Lógicas omitidas
    
    // Flujo Principal de Sesión (Cuando el usuario entra al Hub en "menú" base)
    if (mode === "menu") {
        return (
            <div className="w-full pb-24 md:pb-0 relative min-h-[calc(100vh-80px)] md:min-h-[85vh] bg-slate-50 md:bg-transparent">
                <ModuleErrorBoundary moduleName={hubState === 'ACTIVE' ? "HubActiveState" : "HubCooldownState"}>
                    {hubState === 'ACTIVE' ? (
                        <HubActiveState battles={(battles as unknown as Battle[])} onBatchComplete={handleBatchComplete} />
                    ) : (
                        <HubCooldownState />
                    )}
                </ModuleErrorBoundary>

                {/* AQUÍ SE INYECTA EL RADAR DE EXPERIENCIAS */}
                <div id="hub-tracks">
                    <HubSecondaryTracks setMode={setMode} />
                </div>
            </div>
        );
    }
    
    // Si cambió de mode a "torneo" (al presionar la card del Hub), re-renderiza con el módulo Torneo 
    if (mode === "torneo") {
        return (
           <TorneoView battles={(battles as unknown as Battle[])} onBack={resetToMenu} /> 
        )
    }
    // ... etc para el resto de vistas anidadas.
}
```

### C) Clases CSS Complementarias y Configuración: `index.css`
Ubicación: `src/index.css`

```css
@layer utilities {
  /* Oculta la barra de scroll inferior nativa a los contenedores deslizables como el Radar */
  .hide-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}
```

### D) Dependencia Lógica del Router: `useExperienceMode.ts`
Ubicación: `src/features/feed/hooks/useExperienceMode.ts`

```typescript
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad" | "lugares";

export function useExperienceMode() {
    const location = useLocation();
    
    // Inicializa prioridades, donde "menu" significa root del hub
    const initialMode: ExperienceMode = ...;
    
    const [mode, setMode] = useState<ExperienceMode>(initialMode);

    const resetToMenu = () => setMode("menu");

    return {
        mode,
        setMode,
        resetToMenu
    };
}
```

---

*Documento generado con la finalidad exclusiva de comprender la vista `Radar de Experiencias` / `HubSecondaryTracks` sin alteraciones de funcionalidad.*
