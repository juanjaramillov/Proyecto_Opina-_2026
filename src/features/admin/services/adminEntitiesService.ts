import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface AdminEntity {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  type: string;
  vertical: string | null;
  is_active: boolean | null;
  elo_score: number | null;
  elo_modifier_pct: number | null;
  logo_path: string | null;
  metadata: any | null; // For module toggles: { modules: { versus: true, torneo: true, lugar: true, servicio: true, profundidad: true } }
}

export const adminEntitiesService = {
  async getAdminEntities(): Promise<AdminEntity[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, slug, category, type, vertical, is_active, elo_score, elo_modifier_pct, logo_path, metadata')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as AdminEntity[];
    } catch (e) {
      logger.error('Error al obtener entidades (Admin)', { error: e });
      return [];
    }
  },

  async updateEloModifier(id: string, newModifierPct: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('entities')
        .update({ elo_modifier_pct: newModifierPct })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      logger.error(`Error al actualizar el modificador ELO para la entidad ${id}`, { error: e });
      return false;
    }
  },

  async toggleEntityStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('entities')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e: any) {
      logger.error(`Error al cambiar estado de la entidad ${id}`, { error: e });
      alert(`Error DB [Estado]: ${e?.message || JSON.stringify(e)}`);
      return false;
    }
  },

  async uploadEntityImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error } = await supabase.storage
        .from('entities-media')
        .upload(filePath, file);

      if (error) {
        logger.error('Error uploading image to storage:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('entities-media')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (e) {
      logger.error('Unexpected error uploading image:', e);
      return null;
    }
  },

  async upsertEntity(entity: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('entities')
        .upsert(entity, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (e: any) {
      logger.error(`Error al crear/actualizar la entidad`, { error: e });
      alert(`Error DB [Guardar Módulo]: ${e?.message || JSON.stringify(e)}`);
      return false;
    }
  }
};
