import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "./resultsCommunityTypes";
import { getResultsCommunitySyntheticSnapshot } from "../../features/results/data/launch/resultsCommunitySyntheticSnapshot";

/**
 * Read Model B2C Principal.
 * Por ahora delega al Snapshot Sintético. En el futuro puede delegar 
 * a consultas SQL a Supabase si mode === 'real'.
 */
export async function getResultsCommunityReadModel(query: ResultsCommunityQuery): Promise<ResultsCommunitySnapshot> {
  // Aquí es donde en el futuro leeremos de:
  // public.results_publication_state (SQL)
  // Pero por ahora, usamos el fallback sintético.
  return Promise.resolve(getResultsCommunitySyntheticSnapshot(query));
}
