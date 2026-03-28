import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { getResultsCommunityReadModel } from "../../../read-models/b2c/resultsCommunityReadModel";

/**
 * Capa de servicio para aislar la vista B2C de la obtención de datos.
 */
export const resultsCommunityService = {
  getResultsCommunitySnapshot: async (query: ResultsCommunityQuery): Promise<ResultsCommunitySnapshot> => {
    return getResultsCommunityReadModel(query);
  }
};
