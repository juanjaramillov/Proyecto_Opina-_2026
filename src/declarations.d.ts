/**
 * Fallback declarations for modules without official `@types/*` packages.
 *
 * Las librerías `framer-motion`, `lucide-react`, `chart.js` y `react-hot-toast`
 * traen sus propios tipos en sus respectivos `node_modules/<pkg>/dist/*.d.ts`
 * (verificado vía `package.json.types` en cada una). Antes teníamos aquí
 * `declare module 'xxx';` genéricos que silenciaban los tipos reales —
 * DEBT-001 los retiró y ahora TypeScript consume la API real.
 *
 * Dejar este archivo vacío-pero-presente evita que se recreen los stubs por
 * accidente: si alguien vuelve a añadir `declare module` sin tipos reales, el
 * PR debería justificar por qué y referenciar DEBT-001.
 */

export {};
