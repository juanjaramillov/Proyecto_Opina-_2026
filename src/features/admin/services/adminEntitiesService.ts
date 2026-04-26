import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { catalogGovernance, CatalogEntitySyncData } from '../../../lib/catalogGovernance';
import toast from 'react-hot-toast';

export interface EntityMetadata {
  modules?: Record<string, boolean>;
  subcategory?: string;
  contact?: { address?: string; phone?: string };
  socials?: { instagram?: string; website?: string };
  image_source?: string;
  [key: string]: unknown;
}

export interface AdminEntity {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  type: string;
  vertical: string | null;
  is_active: boolean | null;
  elo_score: number | null;
  logo_path: string | null;
  logo_storage_path: string | null;
  metadata: EntityMetadata | null;
}

export const adminEntitiesService = {
  async getAdminEntities(): Promise<AdminEntity[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, slug, category, type, vertical, is_active, elo_score, logo_path, logo_storage_path, metadata')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Sincronización Estricta (Backfill en Lectura): 
      // Si existe un identificador canónico en Storage, se asegura que el frontend vea innegablemente su URL pública oficial.
      const entities = data.map(entity => ({
        ...entity,
        logo_path: entity.logo_storage_path 
            ? supabase.storage.from('entities-media').getPublicUrl(entity.logo_storage_path).data.publicUrl 
            : entity.logo_path
      }));

      return entities as AdminEntity[];
    } catch (e) {
      logger.error('Error al obtener entidades (Admin)', { error: e });
      return [];
    }
  },

  async updateEloModifier(_id: string, _newModifierPct: number): Promise<boolean> {
    // Deprecated in V14, elo modifiers handled directly by b2b rollups / db jobs
    return true;
  },

  async toggleEntityStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      await catalogGovernance.updateEntityStatus(supabase, id, isActive);
      return true;
    } catch (e: unknown) {
      logger.error(`Error al cambiar estado de la entidad ${id}`, { error: e });
      toast.error(`Error al cambiar el estado: ${e instanceof Error ? e.message : 'error desconocido'}`);
      return false;
    }
  },

  async uploadEntityImage(file: File, slug: string): Promise<{ publicUrl: string; storagePath: string }> {
    try {
      if (!slug) throw new Error("Entidad sin identificador (slug). Guarde primero la entidad.");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `logos/${slug}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('entities-media')
        .upload(filePath, file);

      if (error) {
        logger.error('Error uploading image to storage:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('entities-media')
        .getPublicUrl(filePath);

      return {
        publicUrl: publicUrlData.publicUrl,
        storagePath: filePath,
      };
    } catch (e) {
      logger.error('Unexpected error uploading image:', e);
      throw e;
    }
  },

  async upsertEntity(entity: AdminEntity): Promise<boolean> {
    try {
      const payload: CatalogEntitySyncData = {
        id: entity.id,
        slug: entity.slug,
        name: entity.name,
        is_active: entity.is_active !== false,
        category: entity.category,
        type: entity.type,
        vertical: entity.vertical,
        elo_score: entity.elo_score,
        logo_path: entity.logo_path,
        logo_storage_path: entity.logo_storage_path,
        metadata: entity.metadata
      };

      await catalogGovernance.upsertDualCatalogEntity(supabase, payload);

      return true;
    } catch (e: unknown) {
      logger.error(`Error al crear/actualizar la entidad`, { error: e });
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      toast.error(`No se pudo guardar la entidad: ${msg}`);
      return false;
    }
  }
};
