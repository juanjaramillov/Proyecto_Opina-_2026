import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  is_active: boolean | null;
  elo_score: number | null;
  elo_modifier_pct: number | null;
  logo_path: string | null;
}

export const adminBrandsService = {
  async getAdminBrands(): Promise<AdminBrand[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, slug, category, is_active, elo_score, elo_modifier_pct, logo_path')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as AdminBrand[];
    } catch (e) {
      logger.error('Error al obtener marcas (Admin)', { error: e });
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
      logger.error(`Error al actualizar el modificador ELO para la marca ${id}`, { error: e });
      return false;
    }
  },

  async toggleBrandStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('entities')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      logger.error(`Error al cambiar estado de la marca ${id}`, { error: e });
      return false;
    }
  }
};
