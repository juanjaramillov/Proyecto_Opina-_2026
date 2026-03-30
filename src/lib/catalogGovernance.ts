import { SupabaseClient } from '@supabase/supabase-js';

export interface CatalogEntitySyncData {
  id: string; // Obligatorio para forzar el mismo UUID
  slug: string;
  name: string; // Mapea a 'name' en entities y 'display_name' en signal_entities
  is_active: boolean;
  category?: string | null;
  [key: string]: unknown; // Catch-all para legacy variables (metadata, logo_path, type, etc)
}

export const catalogGovernance = {
  /**
   * Motor Único de Escritura Dual para Opina+ V15
   * Garantiza la sincronización obligatoria entre el catálogo maestro y el espejo de compatibilidad.
   * Usado por: /admin/entities y seed_demo.ts
   */
  async upsertDualCatalogEntity(supabase: SupabaseClient, payload: CatalogEntitySyncData): Promise<string> {
    const { id, slug, name, is_active, category, ...restLegacyFields } = payload;
    
    // 1. Maestro Canónico (V15) -> Define la verdad analítica
    const { error: signalError } = await supabase.from('signal_entities').upsert({
      id: id,
      slug: slug,
      display_name: name,
      is_active: is_active,
      primary_category: category || null,
      entity_type_id: 1 // Default for Brands
    }, { onConflict: 'id' });

    if (signalError) throw new Error(`[Governance] Sincronización fallida en signal_entities: ${signalError.message}`);

    // 2. Espejo de Compatibilidad (Legacy) -> Satisface dependencias FK
    const { error: legacyError } = await supabase.from('entities').upsert({
      id: id,
      slug: slug,
      name: name,
      is_active: is_active,
      category: category || null,
      ...restLegacyFields
    }, { onConflict: 'id' });

    if (legacyError) throw new Error(`[Governance] Sincronización fallida en entities: ${legacyError.message}`);

    return id;
  },

  /**
   * Motor centralizado para cambios de estado de visibilidad.
   */
  async updateEntityStatus(supabase: SupabaseClient, id: string, isActive: boolean): Promise<void> {
     const { error: signalErr } = await supabase.from('signal_entities').update({ is_active: isActive }).eq('id', id);
     if (signalErr) throw new Error(`[Governance] Actualización de estado maestro fallida: ${signalErr.message}`);

     const { error: legacyErr } = await supabase.from('entities').update({ is_active: isActive }).eq('id', id);
     if (legacyErr) throw new Error(`[Governance] Actualización de estado legacy fallida: ${legacyErr.message}`);
  }
};
