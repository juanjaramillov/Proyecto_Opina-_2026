# Fase 1 / Paso 1: Integridad Analítica en BattlePage

**Fecha:** 30 Mar 2026
**Objetivo:** Eliminar el generador sintético de estadísticas "en vivo" en la ruta pública de señales para garantizar integridad de muestreo de cara a operaciones B2B.

## 1. Métrica u Objeto Encontrado
Durante la auditoría de `src/features/signals/pages/BattlePage.tsx` se detectó un bloque de generación sintética de "Live Stats". Específicamente, la variable `activeStats` estaba generándose vía `useMemo` iterando sobre el `battleSlug` para calcular un pseudo-hash numérico y retornar una cantidad falsa pero verosímil de "usuarios señalando ahora" y "señales total", base + modulación aleatoria determinística.

## 2. Líneas y Lógica Removida
Se eliminó por completo el siguiente bloque de código (aprox. líneas 91-104 en `BattlePage.tsx`):
```typescript
    // Generate credible but static "live" stats based on battleSlug hash
    const activeStats = useMemo(() => {
        if (!battleSlug) return { users: 0, signals: 0 };
        let hash = 0;
        for (let i = 0; i < battleSlug.length; i++) {
            hash = battleSlug.charCodeAt(i) + ((hash << 5) - hash);
        }
        const base = Math.abs(hash) % 1000;
        return {
            users: 45 + (base % 300),
            signals: 4500 + (base * 12)
        };
    }, [battleSlug]);

    const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);
```

También se depuraron las etiquetas falsas del Head/Eyebrow del UI:
- Etiqueta roja parpadeante de "Debate Activo" transformada a un estado netamente modular sin pretensión en vivo.
- Badges con `{activeStats.users} señalando ahora` y `{fmt(activeStats.signals)} señales total`.

## 3. Solución Final Aplicada al Bloque
Se preservó estrictamente la estructura flexbox del layout para no romper la estética *premium* ni la jerarquía visual del contenedor, reemplazando la métrica cuantitativa falsa por **microcopy cualitativo editorial** congruente con la marca de Opina+.

## 4. Conexión de Datos (Real vs Variable Neutra)
No habiendo un webhook en el cliente o una suscripción Supabase lista para proveer el dato verdadero con latencia nula, se decidió optar por la **variante no cuantitativa neutral**.

El bloque quedó conformado por dos capsulas cualitativas de confianza del usuario:
1. `Evaluación rápida` (ícono bolt, color primary-500)
2. `100% Anónimo` (ícono lock, color emerald-500)

También se neutralizó el badge superior "Debate Activo" y su marcador rojo simulador de "Live", cambiándolo por una variante descriptiva "Módulo de Señales" de color primario sin connotación de "tiempo real engañoso".

## 5. Confirmación de Integridad
Se confirma explícitamente que tras este commit, **ya no persisten métricas sintéticas disfrazadas de reales en la vista final de BattlePage**. Todo el flujo expuesto al usuario responde a propiedades estáticas y no simula actividad. Se verificó que el cambio pasa el `tsc` (TypeCheck) sin problemas y compila exitosamente.
