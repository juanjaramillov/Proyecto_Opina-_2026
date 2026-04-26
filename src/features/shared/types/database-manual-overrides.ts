// import { Database, Json } from '../../../supabase/database.types';

/**
 * MANUAL OVERRIDES PARA SUPABASE AST
 *
 * Utiliza este archivo EXCLUSIVAMENTE para añadir tablas, vistas o columnas
 * que han sido provisionadas en migraciones recientes pero que aún no han sido
 * propagadas a través de \`supabase gen types\`.
 *
 * Todos los aportes en este archivo se consideran TRANSITORIOS y deben
 * borrarse una vez que CLI genere la actualización.
 *
 * ESTADO ACTUAL (Auditoría Bloque 3.5):
 * Este archivo se encuentra VACÍO POR DISEÑO. Todas las extensiones 
 * (app_sessions, behavior_events, signal_events expansiones) ya han 
 * sido reconocidas nativamente por el CLI y provienen directamente de 
 * database.types.ts. No añadir contenido a menos que se diagnostique 
 * un nuevo drift en Supabase CLI.
 */

export type DatabaseManualOverrides = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Tables: {
    // Espacio reservado para futuros fallbacks inestables.
  }
}
