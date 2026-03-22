import { useAdminActualidad } from "../hooks/useAdminActualidad";
import { AdminActualidadHeader } from "../components/actualidad/AdminActualidadHeader";
import { AdminActualidadTabs } from "../components/actualidad/AdminActualidadTabs";
import { AdminActualidadFilters } from "../components/actualidad/AdminActualidadFilters";
import { AdminActualidadList } from "../components/actualidad/AdminActualidadList";

export default function AdminActualidad() {
  const {
    topics,
    loading,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    uniqueSources,
    filteredAndSortedTopics,
    updateStatus,
    openEditor,
    triggerExtraction,
    extracting
  } = useAdminActualidad();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative bg-slate-50 min-h-screen">
      <AdminActualidadHeader 
        totalTopics={topics.length} 
        loading={loading} 
        onExtract={triggerExtraction}
        isExtracting={extracting}
      />

      <div className="flex flex-col gap-6 mb-6">
        <AdminActualidadTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          loading={loading} 
          totalTopics={topics.length} 
        />
        <AdminActualidadFilters 
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          uniqueSources={uniqueSources}
        />
      </div>

      <AdminActualidadList 
        loading={loading}
        filteredAndSortedTopics={filteredAndSortedTopics}
        activeTab={activeTab}
        onUpdateStatus={updateStatus}
        onOpenEditor={openEditor}
      />
    </div>
  );
}
