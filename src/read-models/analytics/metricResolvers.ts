import { supabase } from "../../supabase/client";

// Contexto mínimo para resolver una métrica
export interface ResolutionContext {
  entityId?: string;
  topicId?: string;
  segmentType?: string;
  segmentValue?: string;
  timeWindowDays: number;
}

// Representa el valor en crudo de la métrica y su validez matemática
export interface ResolvedMetricValue {
  metricId: string;
  valueNumeric: number;
  valueString?: string;
  sampleSize: number;
  dataUpdatedAsOf: string;
}

// Mapa de resolutores asincrónicos por cada ID de métrica
type MetricResolverFn = (ctx: ResolutionContext) => Promise<ResolvedMetricValue>;

export const metricResolvers: Record<string, MetricResolverFn> = {
  // ============================================
  // B2C Resolvers
  // ============================================
  
  "preference_share": async (ctx) => {
    if (!ctx.entityId) throw new Error("Métrica preference_share requiere entityId");
    
    // Obtenemos del rollup diario (ej: ultimios N dias sumados)
    // Para simplificar esta Mv1 transaccional, traemos el snapshot actual usando get_b2b_battle_analytics si aplica, 
    // o consultando el rollup
    
    const { data } = await supabase
      .from("analytics_daily_entity_rollup")
      .select("preference_share, total_battles, updated_at:created_at")
      .eq("entity_id", ctx.entityId)
      .order("summary_date", { ascending: false })
      .limit(1)
      .single();
      
    return {
      metricId: "preference_share",
      valueNumeric: data?.preference_share || 0,
      sampleSize: data?.total_battles || 0,
      dataUpdatedAsOf: data?.updated_at || new Date().toISOString()
    };
  },

  "active_signals_24h": async () => {
    // Cuenta señales brutas en 24h
    const { count } = await supabase
      .from("signal_events")
      .select("*", { count: "exact", head: true })
      .gt("created_at", new Date(Date.now() - 86400000).toISOString());

    return {
      metricId: "active_signals_24h",
      valueNumeric: count || 0,
      sampleSize: count || 0,
      dataUpdatedAsOf: new Date().toISOString()
    };
  },
  
  // ============================================
  // B2B Resolvers (wilson score, etc)
  // ============================================
  
  "wilson_lower_bound": async (ctx) => {
    if (!ctx.entityId) throw new Error("wilson_lower_bound requiere entityId");
    
    // Supongamos que nos basamos en un cálculo general del wilson_score 
    // reutilizando la data de victorias o lo traemos si el RPC ya lo da.
    // Usaremos un hack local si el RPC no lo devuelve exactamente así.
    const { data: rollupData } = await supabase.from('analytics_daily_entity_rollup')
        .select('wins, total_battles')
        .eq('entity_id', ctx.entityId)
        .order('summary_date', { ascending: false }).limit(1).single();

    // Call opina_math_wilson_score via rpc since TS shouldn't duplicate it:
    let wilson = 0;
    if (rollupData && rollupData.total_battles > 0) {
       const wRes = await supabase.rpc('opina_math_wilson_score', {
           positive_votes: rollupData.wins,
           total_votes: rollupData.total_battles
       });
       if(typeof wRes.data === 'number') wilson = wRes.data;
    }

    return {
      metricId: "wilson_lower_bound",
      valueNumeric: wilson,
      sampleSize: rollupData?.total_battles || 0,
      dataUpdatedAsOf: new Date().toISOString()
    };
  },

  "topic_heat_index": async (ctx) => {
    if (!ctx.topicId) throw new Error("topic_heat_index requiere topicId");

    const { data } = await supabase
      .from("analytics_daily_topic_rollup")
      .select("heat_index, total_signals, updated_at")
      .eq("topic_id", ctx.topicId)
      .order("summary_date", { ascending: false })
      .limit(1)
      .single();

    return {
      metricId: "topic_heat_index",
      valueNumeric: data?.heat_index || 0,
      sampleSize: data?.total_signals || 0,
      dataUpdatedAsOf: data?.updated_at || new Date().toISOString()
    };
  }

  // Notas:
  // Se deben agregar o expandir más resolutores según demande la UI (time_decay_momentum, n_eff, etc).
  // La orquestación master agrupará estos request.
};

export async function resolveMetric(metricId: string, ctx: ResolutionContext): Promise<ResolvedMetricValue | null> {
    const fn = metricResolvers[metricId];
    if (!fn) return null; // No implementada o pending_instrumentation
    
    try {
      return await fn(ctx);
    } catch(e) {
      console.warn(`Error resolving metric ${metricId}:`, e);
      return null;
    }
}
