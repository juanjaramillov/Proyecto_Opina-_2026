import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, BadgeAlert, Power, Search, Plus, X, Edit2 } from "lucide-react";
import toast from 'react-hot-toast';
import { adminEntitiesService, AdminEntity } from "../services/adminEntitiesService";
import { logger } from '../../../lib/logger';
import { getAssetPathForOption } from '../../signals/config/brandAssets';
import BrandLogo from '../../../components/ui/BrandLogo';

const MODULES = [
  { id: 'versus', label: 'Versus', icon: 'swords' },
  { id: 'torneo', label: 'Torneo', icon: 'emoji_events' },
  { id: 'lugar', label: 'Lugares', icon: 'location_on' },
  { id: 'servicio', label: 'Servicios', icon: 'home_repair_service' },
  { id: 'profundidad', label: 'Profundidad', icon: 'query_stats' }
];

const ENTITIES_KEY = ['admin', 'entities'] as const;

/**
 * FASE 3D React Query (2026-04-26): listado de entidades como `useQuery`.
 * Toggle de status (single + bulk) hacen optimistic update con
 * `qc.setQueryData` y rollback en error. Save invalida la queryKey.
 * Form state (`editingEntity`, `selectedEntities`) se queda en useState
 * porque es state del modal, no server state.
 */
export default function AdminEntities() {
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Partial<AdminEntity> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Selection State
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  const entitiesQuery = useQuery<AdminEntity[], Error>({
    queryKey: ENTITIES_KEY,
    queryFn: async () => {
      try {
        return await adminEntitiesService.getAdminEntities();
      } catch (err) {
        logger.error("Error fetching entities", { domain: 'admin_actions', origin: 'AdminEntities', action: 'fetch_entities', state: 'failed' }, err);
        throw err;
      }
    },
  });

  const entities = entitiesQuery.data ?? [];
  const loading = entitiesQuery.isLoading;

  // Helper para parchar el array en cache (optimistic / rollback).
  const patchEntities = (updater: (list: AdminEntity[]) => AdminEntity[]) => {
    qc.setQueryData<AdminEntity[]>(ENTITIES_KEY, (prev) => updater(prev ?? []));
  };

  // Bulk actions
  const handleBulkStatusChange = async (newStatus: boolean) => {
    const idsSnapshot = [...selectedEntities];
    setIsSaving(true);
    // Optimistic local: reflejamos el cambio sobre los rows seleccionados.
    patchEntities(list => list.map(e => idsSnapshot.includes(e.id) ? { ...e, is_active: newStatus } : e));
    try {
      await Promise.all(idsSnapshot.map(id => adminEntitiesService.toggleEntityStatus(id, newStatus)));
      setSelectedEntities([]);
      // Refrescamos contra server por si el toggle normaliza otros campos.
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    } catch (err) {
      // Rollback al estado previo (refetch del server).
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
      logger.error("Error bulk updating status", err);
      toast.error("No se pudo actualizar el estado de algunas entidades");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntities(filteredEntities.map(e => e.id));
    } else {
      setSelectedEntities([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEntities(prev => [...prev, id]);
    } else {
      setSelectedEntities(prev => prev.filter(eId => eId !== id));
    }
  };


  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    entities.forEach(e => { if (e.category) categories.add(e.category); });
    return Array.from(categories).sort();
  }, [entities]);

  const uniqueSubcategories = useMemo(() => {
    const subcategories = new Set<string>();
    entities.forEach(e => { if (e.metadata?.subcategory) subcategories.add(e.metadata.subcategory); });
    return Array.from(subcategories).sort();
  }, [entities]);

  const filteredEntities = useMemo(() => {
    let result = [...entities];

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(lowerQuery) || e.slug.toLowerCase().includes(lowerQuery));
    }

    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }

    if (subcategoryFilter !== 'all') {
      result = result.filter(e => e.metadata?.subcategory === subcategoryFilter);
    }

    if (statusFilter !== 'all') {
      const isActiveFilter = statusFilter === 'active';
      result = result.filter(e => e.is_active === isActiveFilter);
    }

    result.sort((a, b) => {
      const eloA = a.elo_score || 1500;
      const eloB = b.elo_score || 1500;
      const eloDiff = eloB - eloA;
      if (eloDiff !== 0) return eloDiff;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [entities, searchQuery, categoryFilter, subcategoryFilter, statusFilter]);



  const handleStatusToggle = async (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus;
    // Optimistic local: ya parchamos la cache, el toggle del UI es instantáneo.
    patchEntities(list => list.map(e => e.id === id ? { ...e, is_active: newStatus } : e));
    try {
      const success = await adminEntitiesService.toggleEntityStatus(id, newStatus);
      if (!success) {
        // Rollback al estado original.
        patchEntities(list => list.map(e => e.id === id ? { ...e, is_active: currentStatus } : e));
        toast.error("No se pudo actualizar el estado");
      }
    } catch (err) {
      patchEntities(list => list.map(e => e.id === id ? { ...e, is_active: currentStatus } : e));
      logger.error("Error updating status", err);
    }
  };

  const openCreateModal = () => {
    setEditingEntity({
      name: '',
      slug: '',
      category: '',
      type: 'brand',
      vertical: '',
      logo_path: '',
      is_active: true,
      elo_score: 1500,
      metadata: {
        subcategory: '',
        contact: { address: '', phone: '' },
        socials: { instagram: '', website: '' },
        image_source: '',
        modules: {
          versus: true,
          torneo: true,
          lugar: true,
          servicio: true,
          profundidad: true
        }
      }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entity: AdminEntity) => {
    const defaultModules = { versus: true, torneo: true, lugar: true, servicio: true, profundidad: true };
    const entityModules = entity.metadata?.modules || {};
    
    setEditingEntity({
      ...entity,
      metadata: {
        ...entity.metadata,
        subcategory: entity.metadata?.subcategory || '',
        contact: entity.metadata?.contact || { address: '', phone: '' },
        socials: entity.metadata?.socials || { instagram: '', website: '' },
        image_source: entity.metadata?.image_source || '',
        modules: { ...defaultModules, ...entityModules }
      }
    });
    setIsModalOpen(true);
  };

  const handleSaveEntity = async () => {
    if (!editingEntity?.name || !editingEntity?.slug) {
      toast.error("Nombre y Slug son obligatorios");
      return;
    }
    setIsSaving(true);
    const success = await adminEntitiesService.upsertEntity(editingEntity as AdminEntity);
    setIsSaving(false);
    
    if (success) {
      setIsModalOpen(false);
      toast.success("Entidad guardada");
      qc.invalidateQueries({ queryKey: ENTITIES_KEY });
    } else {
      toast.error("No se pudo guardar la entidad");
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    if (!editingEntity) return;
    const currentModules = editingEntity.metadata?.modules || {};
    setEditingEntity({
      ...editingEntity,
      metadata: {
        ...editingEntity.metadata,
        modules: {
          ...currentModules,
          [moduleId]: !currentModules[moduleId]
        }
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDACIÓN: Límite de 2MB
    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo excede el límite de ${MAX_SIZE_MB}MB. Optimiza el logo antes de subirlo.`);
      e.target.value = '';
      return;
    }

    // VALIDACIÓN: Tipos MIME permitidos (Sin binarios extraños)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no admitido. Usa JPG, PNG, WEBP o SVG.");
      e.target.value = '';
      return;
    }

    if (!editingEntity?.slug) {
      toast.error("Escribí un Slug antes de subir el logo");
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await adminEntitiesService.uploadEntityImage(file, editingEntity.slug);
      
      if (response && response.publicUrl) {
        setEditingEntity({ 
          ...editingEntity, 
          logo_path: response.publicUrl,
          logo_storage_path: response.storagePath 
        });
      } else {
        toast.error("Error de Storage: revisá permisos o conectividad");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Permisos denegados por Supabase';
      toast.error(`Error al subir el logo: ${msg}`);
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Cleanup para permitir re-subida del mismo filename
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative bg-slate-50 min-h-screen">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
          <BadgeAlert className="w-64 h-64 rotate-12" />
        </div>
        
        {/* Top Info */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand/10 p-2.5 rounded-xl text-brand border border-brand-100/50">
                 <BadgeAlert className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Maestro de Entidades</h1>
            </div>
            <p className="text-slate-500 max-w-xl text-base leading-relaxed">
              Administra la base central de la plataforma. Crea y edita marcas, lugares, opciones, y define en qué módulos (Señales) están visibles.
            </p>
          </div>
          
          <div className="flex gap-6 items-center shrink-0">
               <div className="flex flex-col text-right">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Entidades</span>
                 <span className="text-2xl font-black text-slate-800">{loading ? '-' : entities.length}</span>
               </div>
               <div className="flex flex-col border-l border-slate-200 pl-6 text-right">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activas</span>
                 <span className="text-2xl font-black text-accent">{loading ? '-' : entities.filter(e => e.is_active).length}</span>
               </div>
          </div>
        </div>
        
        {/* Navigation / Actions Bar */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
           {/* Filters */}
           <div className="lg:col-span-8 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Buscar por nombre o slug..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all"
                />
              </div>

              <div className="relative shrink-0 min-w-[160px]">
                <select 
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all cursor-pointer"
                >
                  <option value="all">Todas Categorías</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative shrink-0 min-w-[160px]">
                <select 
                  value={subcategoryFilter} 
                  onChange={e => setSubcategoryFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all cursor-pointer"
                >
                  <option value="all">Todas Subcategorías</option>
                  {uniqueSubcategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative shrink-0 min-w-[160px]">
                <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all cursor-pointer"
                >
                  <option value="all">Todos Estados</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
           </div>

           {/* Actions / CTA */}
           <div className="lg:col-span-4 w-full flex items-center justify-end gap-2 relative z-50">
             <button 
               onClick={openCreateModal}
               className="shrink-0 inline-flex items-center gap-2 bg-brand hover:bg-brand text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-95"
             >
               <Plus className="w-4 h-4" />
               <span className="hidden sm:inline">Nueva Entidad</span>
             </button>
           </div>
        </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Cargando catálogo maestro...</p>
        </div>
      ) : filteredEntities.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border text-center border-dashed border-slate-300 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto mt-12"
        >
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <BadgeAlert className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Sin Resultados</h3>
          <p className="text-slate-500 text-center max-w-sm">
            No se encontraron entidades que coincidan con los filtros.
          </p>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand/50 cursor-pointer"
                      checked={filteredEntities.length > 0 && selectedEntities.length === filteredEntities.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-4 text-center">Entidad</th>
                  <th className="px-6 py-4 text-center">Tipo / Cat</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">ELO Score</th>
                  <th className="px-6 py-4 text-center">Módulos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredEntities.map(entity => (
                    <motion.tr 
                      key={entity.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand/50 cursor-pointer"
                          checked={selectedEntities.includes(entity.id)}
                          onChange={(e) => handleSelectOne(entity.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <div className={`w-10 h-10 rounded-xl shrink-0 overflow-hidden flex items-center justify-center ${!entity.is_active ? 'opacity-50 grayscale' : 'border-slate-200 shadow-sm border'}`}>
                            {entity.logo_path ? (
                              <BrandLogo src={getAssetPathForOption(entity.name, entity.logo_path) || ""} alt={entity.name} variant="catalog" className="!w-full !h-full !min-h-0 !min-w-0" />
                            ) : (
                              <div className="w-full h-full bg-white flex items-center justify-center">
                                <span className="text-slate-300 font-bold text-xs">{entity.name.substring(0,2).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-sm ${entity.is_active ? 'text-slate-800' : 'text-slate-500'}`}>{entity.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{entity.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{entity.type}</span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            {entity.category || 'N/A'}
                          </span>
                          {entity.metadata?.subcategory && (
                            <span className="text-[10px] font-medium text-slate-500">
                              {entity.metadata.subcategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(entity.id, entity.is_active)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${entity.is_active ? 'bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-500'}`}
                          title={entity.is_active ? 'Desactivar Entidad' : 'Activar Entidad'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-black tabular-nums text-slate-800">
                            {entity.elo_score || 1500}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-wrap justify-center gap-1 w-40 mx-auto">
                          {MODULES.map(m => {
                            // If explicit configuration missing, default to true
                            const modulesConfig = entity.metadata?.modules;
                            const isActive = modulesConfig ? modulesConfig[m.id] : true;
                            if (!isActive) return null;
                            return (
                              <div key={m.id} className="bg-brand/10 text-brand p-1 rounded-md" title={m.label}>
                                <span className="material-symbols-outlined text-[14px] aspect-square flex items-center justify-center">{m.icon}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(entity)}
                          className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors inline-flex"
                          title="Editar Entidad"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Menu */}
      <AnimatePresence>
        {selectedEntities.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[90] flex items-center gap-4 bg-slate-900/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl shadow-slate-900/20"
          >
            <div className="flex items-center gap-3 pr-4 border-r border-slate-700/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/20 text-brand">
                <span className="text-sm font-black">{selectedEntities.length}</span>
              </div>
              <span className="text-sm font-medium text-slate-300">Entidades seleccionadas</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={isSaving}
                onClick={() => handleBulkStatusChange(true)}
                className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent-400 px-4 py-2 rounded-xl transition-colors font-semibold text-sm"
              >
                <Power className="w-4 h-4" />
                <span>Activar Todas</span>
              </button>
              <button 
                disabled={isSaving}
                onClick={() => handleBulkStatusChange(false)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-2 rounded-xl transition-colors font-semibold text-sm"
              >
                <Power className="w-4 h-4 opacity-50" />
                <span>Desactivar Todas</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && editingEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-xl font-black text-slate-800">
                  {editingEntity.id ? 'Editar Ficha Maestra' : 'Nueva Entidad'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row overflow-y-auto flex-1">
                {/* Left Column: Media & Status */}
                <div className="w-full md:w-[320px] shrink-0 bg-slate-50 p-6 border-r border-slate-100 flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Media Principal</h3>
                    
                    {/* Logo Preview box */}
                    <div className="aspect-square bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-3 relative group">
                      {editingEntity.logo_path ? (
                        <BrandLogo src={getAssetPathForOption(editingEntity.name || '', editingEntity.logo_path) || ""} alt={editingEntity.name || ''} variant="catalog" className="!w-full !h-full object-contain p-4" />
                      ) : (
                        <div className="text-center text-slate-400 p-4">
                          <BadgeAlert className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <span className="text-xs font-medium">Sin imagen</span>
                        </div>
                      )}
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
                           {isUploadingImage ? <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                           Cambiar Logo
                           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {editingEntity.logo_storage_path ? (
                        <>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Enlace de Imagen (Storage)</label>
                          <div className="w-full border border-slate-100 bg-slate-50 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 truncate" title={editingEntity.logo_path || ''}>
                            {editingEntity.logo_path || 'No disponible'}
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-bold text-slate-500 mb-1">URL manual de Imagen</label>
                          <input type="text" value={editingEntity.logo_path || ''} onChange={e => setEditingEntity({...editingEntity, logo_path: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand/50 outline-none font-mono text-slate-600" placeholder="Ej: https://.../logo.png" />
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Fuente / Autor (Opcional)</label>
                      <input type="text" value={editingEntity.metadata?.image_source || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, image_source: e.target.value }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="Ej: Instagram oficial" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Estado General</h3>
                    <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-brand/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800">{editingEntity.is_active ? 'Entidad Activa' : 'Entidad Inactiva'}</span>
                        <span className="text-xs text-slate-500">Visible en la plataforma</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${editingEntity.is_active ? 'bg-brand' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${editingEntity.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={editingEntity.is_active || false} onChange={e => setEditingEntity({...editingEntity, is_active: e.target.checked})} />
                    </label>
                  </div>
                </div>

                {/* Right Column: Data & Settings */}
                <div className="w-full md:flex-1 p-6 flex flex-col gap-8">
                  
                  {/* Basic Info */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Información General</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nombre *</label>
                        <input type="text" value={editingEntity.name || ''} onChange={e => setEditingEntity({...editingEntity, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="El nombre público" />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Slug *
                          {editingEntity.logo_storage_path && (
                            <span className="text-warning ml-2 font-normal">(Bloqueado: Logo existente)</span>
                          )}
                        </label>
                        <input type="text" value={editingEntity.slug || ''} onChange={e => setEditingEntity({...editingEntity, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none font-mono ${editingEntity.logo_storage_path ? 'bg-slate-100/50 cursor-not-allowed text-slate-400' : ''}`} placeholder="identificador-unico" disabled={!!editingEntity.logo_storage_path} title={editingEntity.logo_storage_path ? "No puedes modificar el slug porque esta entidad ya tiene un logo persistido en Storage." : "Identificador único"} />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
                        <select value={editingEntity.type || 'brand'} onChange={e => setEditingEntity({...editingEntity, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none bg-white">
                          <option value="brand">Marca (Brand)</option>
                          <option value="place">Lugar (Place)</option>
                          <option value="service">Servicio (Service)</option>
                          <option value="option">Opción (Option)</option>
                        </select>
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                        <input type="text" value={editingEntity.category || ''} onChange={e => setEditingEntity({...editingEntity, category: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="Ej: Fast Food" />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Subcategoría</label>
                        <input type="text" value={editingEntity.metadata?.subcategory || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, subcategory: e.target.value }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="Ej: Hamburguesas" />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Vertical / Industria</label>
                        <input type="text" value={editingEntity.vertical || ''} onChange={e => setEditingEntity({...editingEntity, vertical: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="Ej: Gastronomía" />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">ELO Score Base</label>
                        <input type="number" value={editingEntity.elo_score || 1500} onChange={e => setEditingEntity({...editingEntity, elo_score: parseInt(e.target.value) || 1500})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none font-mono" />
                      </div>
                    </div>
                  </section>

                  {/* Extended Medatata: Contact & Socials */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contacto y Redes (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Dirección / Locación</label>
                        <input type="text" value={editingEntity.metadata?.contact?.address || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, contact: { ...editingEntity.metadata?.contact, address: e.target.value } }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="Ej: Av. Principal 123" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                        <input type="tel" value={editingEntity.metadata?.contact?.phone || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, contact: { ...editingEntity.metadata?.contact, phone: e.target.value } }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="+56 9 1234 5678" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Sitio Web</label>
                         <input type="url" value={editingEntity.metadata?.socials?.website || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, socials: { ...editingEntity.metadata?.socials, website: e.target.value } }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="https://www.ejemplo.com" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Instagram (@)</label>
                         <input type="text" value={editingEntity.metadata?.socials?.instagram || ''} onChange={e => setEditingEntity({...editingEntity, metadata: { ...editingEntity.metadata, socials: { ...editingEntity.metadata?.socials, instagram: e.target.value } }})} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand/50 outline-none" placeholder="usuario" />
                      </div>
                    </div>
                  </section>

                  {/* Modules */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Visibilidad en Módulos (Señales)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {MODULES.map(mdl => {
                        const isActive = editingEntity.metadata?.modules?.[mdl.id] ?? false;
                        return (
                          <button
                            key={mdl.id}
                            onClick={() => handleModuleToggle(mdl.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${isActive ? 'bg-brand/10 border-brand/30 text-brand shadow-sm ring-1 ring-brand-500/20' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                          >
                            <span className="material-symbols-outlined text-[24px]">{mdl.icon}</span>
                            <span className="text-xs font-bold">{mdl.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveEntity} disabled={isSaving} className="px-8 py-2.5 text-sm font-bold bg-brand text-white hover:bg-brand disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  {isSaving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {isSaving ? 'Guardando...' : 'Guardar Ficha'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
