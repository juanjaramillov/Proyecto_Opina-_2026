import { METRIC_CATALOG } from "./metricCatalog";
import { MetricSurface } from "./analyticsTypes";
import { resolveMetric, ResolutionContext } from "./metricResolvers";
import { evaluateMetricAvailability, MetricAvailabilityResult } from "./metricAvailability";

/**
 * Encargado de empaquetar los requerimientos de una UI B2C o B2B frente al motor de resolución,
 * limitando las promesas al catálogo autorizado, resolviendo y validando.
 */
export async function assembleSurfaceMetrics(
  surfaceId: MetricSurface,
  ctx: ResolutionContext,
  adminOverrides: Record<string, boolean> = {} // true = force active
): Promise<Record<string, MetricAvailabilityResult>> {
  
  // 1. Filtrar KPIs autorizados para esta superficie en el Master Catalog
  const candidates = Object.values(METRIC_CATALOG).filter(m => m.surfaces.includes(surfaceId));
  
  // 2. Resolver asincrónicamente los que apliquen
  // (Nota: Una optimización nivel "batch" requiere agrupar queries, pero para esta V14 resolvemos
  // unitariamente con Supabase connection pooling)
  const resolutionPromises = candidates.map(async (metric) => {
    // Si esta forzado como deshabilitado por admin, no gastamos I/O.
    if (adminOverrides[metric.id] === false) {
      return { 
          metricId: metric.id, 
          result: { state: "disabled", reason: "Disabled by global DB override", metricDefinition: metric, resolvedValue: null } as MetricAvailabilityResult
      };
    }

    // Resolvemos del Backend
    const rawVal = await resolveMetric(metric.id, ctx);
    
    // Obtenemos su rating de "availability"
    const isForced = adminOverrides[metric.id] === true;
    const finalAvail = evaluateMetricAvailability(metric, rawVal, isForced);

    return { metricId: metric.id, result: finalAvail };
  });

  const resolvedArray = await Promise.all(resolutionPromises);
  
  // 3. Serializar en Record/Dictionary
  const ensamblado: Record<string, MetricAvailabilityResult> = {};
  resolvedArray.forEach(item => {
    ensamblado[item.metricId] = item.result;
  });

  return ensamblado;
}
