const fs = require('fs');
const path = require('path');

const basePath = '/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V13';
const outPath = path.join(basePath, 'Documentacion_Home.md');

const sectionsDir = path.join(basePath, 'src/features/home/sections');
const homePath = path.join(basePath, 'src/features/home/pages/Home.tsx');

let markdown = `# Documentación Completa: Página Home (Opina+)

Este archivo consolida **todo** lo relacionado a la página Home: la estructura principal, los textos, las descripciones visuales e ilustraciones, y todo el código de cada bloque.

---

## 1. Estructura Principal (\`Home.tsx\`)

Aquí se orquestan y agrupan todas las secciones que conforman la página principal.

\`\`\`tsx
${fs.readFileSync(homePath, 'utf-8')}
\`\`\`

---

## 2. Secciones de la Home

`;

const filesToInclude = [
  {
    name: 'InteractiveHeroSection.tsx',
    title: 'Interactive Hero Section',
    texts: ['Tus señales construyen esto.', 'Cada decisión suma valor real...', 'Tu racha diaria está activa'],
    visuals: ['Diseño 3D interactivo con redes satelitales', 'Anillos orbitales (glassmorphism) y núcleo brillante', 'Etiquetas flotantes con iconos (Versus, Torneos, Actualidad, Productos, Profundidad, Lugares)']
  },
  {
    name: 'WhatIsOpinaSection.tsx',
    title: 'What Is Opina Section',
    texts: ['¿Qué es Opina+?', '1. Participa', '2. Descubre', '3. Gana'],
    visuals: ['Iconos Material Symbols animados (touch_app, donut_small, redeem)', 'Cards interactivas con glow effects on hover']
  },
  {
    name: 'LiveTrendsSection.tsx',
    title: 'Live Trends Section',
    texts: ['¡Boom! El pulso de la comunidad.', 'Consenso Destacado', 'Radar de Tendencias Top', 'Señales por Categoría', 'Red Activa'],
    visuals: ['Bento Box Grid layout', 'Odómetro interactivo para las señales globales', 'Progress bars de categorías', 'Iconos Lucide de actividad y estadísticas']
  },
  {
    name: 'ChallengesMenuSection.tsx',
    title: 'Challenges Menu Section',
    texts: ['Aumenta tu impacto', 'La final de marcas', 'El debate de la semana', 'Desbloquea tu lectura'],
    visuals: ['Tres tarjetas con gradientes que responden al mouse', 'Iconos Lucide (Trophy, Flame, Search) rotando o ampliándose on-hover']
  },
  {
    name: 'RewardsValuePropsSection.tsx',
    title: 'Rewards Value Props Section',
    texts: ['Valor B2C', 'Tu opinión es oro. Literalmente.', 'Señales', 'Radiografías Únicas', 'Sube tu Rango'],
    visuals: ['Fondo oscuro (stardust) premium', 'Secciones de Glassmorphism con halos de colores detrás en hover', 'Iconos interactivos Lucide (Coins, Eye, ShieldCheck, Sparkles)']
  },
  {
    name: 'CommunityPulseSection.tsx',
    title: 'Community Pulse Section',
    texts: ['Un ecosistema en constante movimiento', 'Cada señal alimenta la red en tiempo real.', 'Categorías Activas', 'Comparaciones Hoy'],
    visuals: ['Radar central rotando y emitiendo pulsos', 'Cards flotantes anidadas en los bordes simulando nodos de data', 'Simulación de señales "luciérnagas" asíncronas con Tooltips (bg-emerald, bg-primary, etc)']
  },
  {
    name: 'GamifiedCTASection.tsx',
    title: 'Gamified CTA Section',
    texts: ['No pierdas tu impacto.', 'Guarda tus señales gratis'],
    visuals: ['Teléfono móvil creado con puro CSS (notch, shadow)', 'Barras de datos animadas renderizándose dentro de la "pantalla"', 'Elementos interactivos flotantes saltando afuera del móvil', 'Botón de "Guardar Señales" estilo shiny animate shimmer']
  }
];

filesToInclude.forEach(fileInfo => {
  const code = fs.readFileSync(path.join(sectionsDir, fileInfo.name), 'utf-8');
  
  markdown += `### 2.${filesToInclude.indexOf(fileInfo) + 1} ${fileInfo.title}\n\n`;
  markdown += `**Textos Principales:**\n`;
  fileInfo.texts.forEach(t => markdown += `- "${t}"\n`);
  markdown += `\n**Visuales e Ilustraciones:**\n`;
  fileInfo.visuals.forEach(v => markdown += `- ${v}\n`);
  markdown += `\n**Código (\`src/features/home/sections/${fileInfo.name}\`):**\n`;
  markdown += `\`\`\`tsx\n${code}\n\`\`\`\n\n---\n\n`;
});

fs.writeFileSync(outPath, markdown);
console.log('Documentacion_Home.md creado exitosamente.');
