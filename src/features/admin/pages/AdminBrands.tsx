import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, BadgeAlert, TrendingUp, TrendingDown, Power, Search } from "lucide-react";
import { adminBrandsService, AdminBrand } from "../services/adminBrandsService";
import { logger } from '../../../lib/logger';
import { getAssetPathForOption } from '../../signals/config/brandAssets';
import BrandLogo from '../../../components/ui/BrandLogo';

export default function AdminBrands() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminBrandsService.getAdminBrands();
      setBrands(data);
    } catch (err) {
      logger.error("Error fetching brands", { domain: 'admin_actions', origin: 'AdminBrands', action: 'fetch_brands', state: 'failed' }, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    brands.forEach(b => { if (b.category) categories.add(b.category); });
    return Array.from(categories).sort();
  }, [brands]);

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(lowerQuery) || b.slug.toLowerCase().includes(lowerQuery));
    }

    if (categoryFilter !== 'all') {
      result = result.filter(b => b.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      const isActiveFilter = statusFilter === 'active';
      result = result.filter(b => b.is_active === isActiveFilter);
    }

    // Default sort by Published ELO descending, then by name
    result.sort((a, b) => {
      const eloPubA = (a.elo_score || 1500) * (1 + (a.elo_modifier_pct || 0) / 100);
      const eloPubB = (b.elo_score || 1500) * (1 + (b.elo_modifier_pct || 0) / 100);
      const eloDiff = eloPubB - eloPubA;
      if (eloDiff !== 0) return eloDiff;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [brands, searchQuery, categoryFilter, statusFilter]);

  const handleModifierChange = async (id: string, currentModifier: number | null, delta: number) => {
    const newModifier = (currentModifier || 0) + delta;
    
    // Optimistic update
    setBrands(prev => prev.map(b => b.id === id ? { ...b, elo_modifier_pct: newModifier } : b));
    
    try {
      const success = await adminBrandsService.updateEloModifier(id, newModifier);
      if (!success) {
        // Revert on error
        setBrands(prev => prev.map(b => b.id === id ? { ...b, elo_modifier_pct: currentModifier } : b));
        alert("Error al actualizar modificador");
      }
    } catch (err) {
      setBrands(prev => prev.map(b => b.id === id ? { ...b, elo_modifier_pct: currentModifier } : b));
      logger.error("Error updating modifier", err);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setBrands(prev => prev.map(b => b.id === id ? { ...b, is_active: newStatus } : b));

    try {
      const success = await adminBrandsService.toggleBrandStatus(id, newStatus);
      if (!success) {
        // Revert on error
        setBrands(prev => prev.map(b => b.id === id ? { ...b, is_active: currentStatus } : b));
        alert("Error al actualizar estado");
      }
    } catch (err) {
      setBrands(prev => prev.map(b => b.id === id ? { ...b, is_active: currentStatus } : b));
      logger.error("Error updating status", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
          <BadgeAlert className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 border border-primary-100/50">
               <BadgeAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión ELO y Marcas</h1>
          </div>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Administra el catálogo maestro de marcas, calibra manualmente las puntuaciones ELO y apaga marcas inactivas o inapropiadas.
          </p>
          
          <div className="flex gap-6 mt-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Marcas</span>
               <span className="text-2xl font-black text-slate-800">{loading ? '-' : brands.length}</span>
             </div>
             <div className="flex flex-col border-l border-slate-200 pl-6">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activas</span>
               <span className="text-2xl font-black text-emerald-600">{loading ? '-' : brands.filter(b => b.is_active).length}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center gap-3 w-full flex-wrap lg:flex-nowrap">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Buscar por nombre o slug..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative group/filter shrink-0">
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative group/filter shrink-0">
            <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Cargando catálogo maestro...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border text-center border-dashed border-slate-300 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto mt-12"
        >
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <BadgeAlert className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Sin Resultados</h3>
          <p className="text-slate-500 text-center max-w-sm">
            No se encontraron marcas para los filtros de búsqueda actuales.
          </p>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Marca</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">ELO Real</th>
                  <th className="px-6 py-4 text-center">Modificador</th>
                  <th className="px-6 py-4 text-center">ELO Pub.</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredBrands.map(brand => (
                    <motion.tr 
                      key={brand.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl shrink-0 overflow-hidden ${!brand.is_active ? 'opacity-50 grayscale' : 'border-slate-200 shadow-sm border'}`}>
                            {brand.logo_path ? (
                              <BrandLogo src={getAssetPathForOption(brand.name, brand.logo_path) || ""} alt={brand.name} variant="catalog" className="!w-full !h-full !min-h-0 !min-w-0" />
                            ) : (
                              <div className="w-full h-full bg-white flex items-center justify-center">
                                <span className="text-slate-300 font-bold text-xs">{brand.name.substring(0,2).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black text-sm ${brand.is_active ? 'text-slate-800' : 'text-slate-500'}`}>{brand.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{brand.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          {brand.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(brand.id, brand.is_active)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${brand.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-500'}`}
                          title={brand.is_active ? 'Desactivar Marca' : 'Activar Marca'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-slate-500 tabular-nums">
                          {Math.round(brand.elo_score || 1500)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${brand.elo_modifier_pct && brand.elo_modifier_pct > 0 ? 'bg-emerald-100 text-emerald-700' : brand.elo_modifier_pct && brand.elo_modifier_pct < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {brand.elo_modifier_pct ? (brand.elo_modifier_pct > 0 ? `+${brand.elo_modifier_pct}%` : `${brand.elo_modifier_pct}%`) : '0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-black tabular-nums ${(brand.elo_modifier_pct || 0) !== 0 ? 'text-primary-600' : 'text-slate-800'}`}>
                          {Math.round((brand.elo_score || 1500) * (1 + (brand.elo_modifier_pct || 0) / 100))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                             onClick={() => handleModifierChange(brand.id, brand.elo_modifier_pct, -15)}
                             className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 flex items-center gap-1"
                             title="Restar 15% al Modificador"
                          >
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">-15%</span>
                          </button>
                          <button
                             onClick={() => handleModifierChange(brand.id, brand.elo_modifier_pct, 15)}
                             className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 flex items-center gap-1"
                             title="Sumar 15% al Modificador"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">+15%</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
