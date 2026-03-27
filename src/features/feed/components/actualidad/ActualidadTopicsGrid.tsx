import { ActualidadTopic } from "../../../signals/services/actualidadService";
import { ActualidadGridCard } from "./ActualidadGridCard";
import { EmptyState } from "../../../../components/ui/foundation";
import { Search } from "lucide-react";

interface ActualidadTopicsGridProps {
  gridTopics: ActualidadTopic[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectTopic: (topic: ActualidadTopic) => void;
}

export function ActualidadTopicsGrid({ 
  gridTopics, 
  selectedCategory, 
  setSelectedCategory, 
  onSelectTopic 
}: ActualidadTopicsGridProps) {

  if (gridTopics.length === 0) {
    return (
      <EmptyState 
        icon={Search}
        title={`Sin temas en ${selectedCategory}`}
        description="No hay debates activos clasificados bajo esta categoría actualmente."
        primaryAction={{
            label: "Explorar otras categorías",
            onClick: () => setSelectedCategory("Todos")
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
        {gridTopics.map((topic, i) => (
            <ActualidadGridCard
                key={topic.id}
                topic={topic}
                index={i}
                onSelectTopic={onSelectTopic}
            />
        ))}
    </div>
  );
}
