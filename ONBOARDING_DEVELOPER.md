# 🚀 Opina+ | Developer Onboarding & Audit Guide

Bienvenido al equipo. Este documento está diseñado para darte el contexto técnico, visual y estratégico necesario para realizar una auditoría profunda de **Opina+** y preparar la arquitectura para escalar al próximo nivel.

---

## 1. Visión y Filosofía del Producto
Opina+ no es solo un panel de encuestas; es una plataforma de **inteligencia y gamificación** diseñada para capturar "señales" (datos, opiniones, tendencias) con una fricción extremadamente baja. 

El producto debe sentirse **premium, rápido e inteligente**. La estética es innegociable: no construimos interfaces de administrador genéricas, construimos experiencias inmersivas con altos estándares editoriales y visuales.

---

## 2. Stack Tecnológico (High-Level)
El proyecto está construido sobre un stack moderno y serverless:

* **Frontend:** React 18, Vite, TypeScript (Strict Mode).
* **Estilos:** Tailwind CSS (con variables y utilidades corporativas extendidas).
* **Backend & BaaS:** Supabase (Postgres, Realtime, Storage).
* **Seguridad de Datos:** Row Level Security (RLS) en Supabase.
* **Infraestructura Serverless:** Supabase Edge Functions (Deno).
* **Integraciones Core:** WhatsApp Cloud API (Webhooks & Templates), OpenAI API (Automatización y análisis).

---

## 3. Módulos Core (La Arquitectura)
Antes de auditar el código, debes entender las piezas más pesadas del ecosistema:

1. **Signals Hub & Pulse:** El motor de captura de datos. Permite a los usuarios registrar su estado ('Tu Pulso') y reaccionar a la actualidad. Requiere alta resiliencia en la persistencia de datos.
2. **Motor 'Versus' (Gamificación):** Un sistema complejo de colas seriales finitas e infinitas que presenta comparaciones A/B a los usuarios. Maneja categorización jerárquica de industrias y marcas.
3. **Loyalty & Missions:** Sistema de fidelización que calcula puntos, niveles (Bronce a Platino) y misiones interactivas.
4. **WhatsApp Cloud API Integration:** Edge functions que envían invitaciones y reciben feedback bidireccional mediante webhooks directamente conectados con Meta Business Manager.
5. **AI Editorial Bot:** Automatización que genera contenido de 'Actualidad' procesando noticias diarias.

---

## 4. Estándares Visuales y UI/UX (Innegociables)
El diseño en Opina+ es un ciudadano de primera clase. Durante tu desarrollo/auditoría, respeta estas reglas:

* **Paleta Corporativa:** No uses colores genéricos de Tailwind (ej. `bg-blue-500`) para elementos principales. Utiliza nuestras clases corporativas configuradas (tonos Brand, acentos Emerald, gradientes canónicos).
* **Interacciones (Micro-animations):** Los botones, tarjetas y elementos interactivos deben tener estados `hover:`, `active:` y transiciones suaves (`transition-all duration-300`).
* **Jerarquía y Limpieza:** Mantén interfaces minimalistas, con mucho *white-space*, sombras premium y cristalismo (glassmorphism) donde corresponda.

---

## 5. Objetivos de la Auditoría y Pain Points Conocidos
Queremos escalar, pero primero debemos estabilizar. Por favor, centra tu auditoría en las siguientes áreas donde sabemos que hay margen de mejora:

### A. Seguridad de Tipos (Type Safety)
* Hemos estado erradicando prácticas inseguras. **Prohibido** el uso de `as unknown as Type` o el abuso de `any`.
* Asegurar que las interfaces del Frontend coincidan exactamente con el schema de Postgres generado por Supabase.

### B. Rendimiento y Base de Datos (Supabase)
* **N+1 Queries:** Identificar y refactorizar componentes o servicios que estén haciendo múltiples llamadas a la base de datos dentro de bucles. Queremos usar joins de Supabase (`select="*, relation(*)"`) o `Promise.all`.
* **Resiliencia en Persistencia:** Recientemente tuvimos errores de `400 Bad Request` en la inserción de 'Signals' debido a desajustes en el esquema (ej. columnas faltantes como `origin_module`). Audita las funciones RPC y las tablas principales para asegurar consistencia.

### C. Manejo de Errores (Error Handling)
* Faltan fronteras de error globales (`ErrorBoundaries`) robustas que eviten que la app colapse "en blanco" si falla un renderizado o una llamada de red.
* Estandarizar el logging y el feedback al usuario (Toasts) en operaciones asíncronas.

---

## 6. Siguientes Pasos
1. Familiarízate con el árbol de directorios (especialmente `src/features`, `src/lib/supabase` y las Edge Functions).
2. Levanta el proyecto localmente (`npm run dev`).
3. Revisa las políticas RLS actuales en Supabase para entender el modelo de permisos.
4. **Presenta un reporte técnico de tus hallazgos antes de iniciar refactorizaciones masivas.**

¡Mucho éxito y gracias por sumarte a llevar Opina+ al siguiente nivel!
