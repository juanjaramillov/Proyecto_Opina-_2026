# Fase 1 / Paso 2: Mapeo de Gobernanza de Datos (Data Governance Mapping)

*Fecha: 30 Mar 2026*

## Propósito del Mapeo
Este documento sirve como puente metodológico entre el inventario de datos y las políticas de verdad establecidas en la Fase 1. Enlista formalmente las principales contradicciones halladas en el ecosistema Frontend/Backend de Opina+ y certifica la base técnica para la purga y consolidación en el Paso 3.

## 1. Mapeo de Contradicciones Estructurales Detectadas

Durante la inspección de la arquitectura (Hooks, Read-Models y Componentes), se hallaron las siguientes disonancias críticas:

### 1A. Contradicción Runtime vs Read Model (Falso Real-Mode)
- **Ubicación:** `src/features/results/config/resultsRuntime.ts` vs `src/read-models/analytics/metricResolvers.ts`.
- **Descripción:** El flag de configuración de entorno impone `RESULTS_RUNTIME_MODE = 'real'`. Sin embargo, los *resolvers* estadísticos inyectan valores literales estáticos (ej: `most_contested_category` devuelve "Categoría Principal", `integrity_score` devuelve `95`) cuando no existe volumen real procesado.
- **Riesgo:** Un analista B2B verificando la red puede interpretar estos "cálculos analíticos" estáticos como salidas del motor verdaderas, creando una brecha de confianza.

### 1B. Componente "CrownedChampionView" como Máquina de Falsificación Abierta
- **Ubicación:** `src/features/signals/components/runner/CrownedChampionView.tsx`.
- **Descripción:** Al completarse un torneo, el ganador es proyectado con un componente UI llamado "AI Insight Progresivo". El texto de victoria clama: *El `[Math.floor(Math.random()*20)+40]%` de la comunidad Opina+ también respaldó a esta opción*. Además usa insignias duras *Confianza: Alta* y *Global Reach: 78%*.
- **Riesgo:** Extremadamente alto/Crítico. Constituye simulación determinística-aleatoria explícitamente prohibida en los lineamientos B2B del proyecto. Todo insight debe ser trazable o, en su defecto, curado explícitamente sin inventar "apoyos del 52%".

### 1C. Hash Semántico en Nombres de Torneo
- **Ubicación:** `src/features/signals/components/TorneoRunner.tsx`.
- **Descripción:** Para evitar repetición léxica, la UI interviene un título como "Guerra del Canal" aplicando un hash sobre `rawTitle.length` y modula una matriz de afijos ("Dilema de", "Sínodo de"). 
- **Riesgo:** Bajo. Es un embellecimiento estético (*CURADO TÉCNICO*) prohibido si se pretendiera que son nombres dictaminados por catálogo, pero tolerado si se define puramente como un variador estético inofensivo.

## 2. Decisiones de Transición hacia el Paso 3

### En relación a `Resultados`
Dada la política imperante de que **La página Resultados debe funcionar con valores ficticios curados**, no se intervendrán de forma destructiva los *metricResolvers* que devuelven strings estáticos. Serán clasificados y marcados para su eventual conexión en Fases posteriores, pero no bloquean la auditoría B2B temporal siempre y cuando no simulen porcentajes falsos con algoritmos matemáticos en la UI.

### En relación a `Señales / Torneos`
Cualquier generador numérico en el cliente (Hooks / Componentes), especialmente el hallazgo crítico en `CrownedChampionView.tsx`, debe ser erradicado sin piedad ni concesión durante la refactorización profunda. Debe ser transformado en un editorial **neutro cualitativo**.

## 3. Conclusión de la Etapa de Gobernanza
El mapa de la superficie está trazado. Conocemos exactamente dónde reside el dato real, dónde el dato curado tolerado, y dónde habita el dato sintético prohibido (falsificación estética). El entorno está clasificado, la política está escrita y el equipo queda metodológicamente habilitado y preparado para iniciar la corrección estructural (Paso 3).
