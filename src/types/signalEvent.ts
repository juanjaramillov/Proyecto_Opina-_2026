export type SignalEventType = 'versus' | 'review' | 'battle';
// Nota: 'battle' queda SOLO por compatibilidad hacia atrás (data vieja).
// Regla: el sistema debe ESCRIBIR 'versus' de aquí en adelante.

export interface SignalEvent {
  id: string; // eventId (antes voteId)
  createdAt: string; // ISO string

  // Tipo de fuente de la señal
  sourceType: SignalEventType;

  // Identificador del contenido (versusId, reviewId, etc.)
  sourceId: string;

  // Título human-readable (ej: "¿Con cuál te quedas?")
  title: string;

  // Label opcional de la elección (ej: "Coca-Cola")
  choiceLabel?: string;

  // Si existe un tracking de tendencia (opcional)
  trendId?: string;

  // Campos legacy para compatibilidad con UI existente
  kind?: string;
  amount?: number;
}
