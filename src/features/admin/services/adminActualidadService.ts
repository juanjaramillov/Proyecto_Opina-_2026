import { adminActualidadCrudService } from './adminActualidadCrudService';
import { adminActualidadAiService } from './adminActualidadAiService';

export const adminActualidadService = {
  ...adminActualidadCrudService,
  ...adminActualidadAiService
};
