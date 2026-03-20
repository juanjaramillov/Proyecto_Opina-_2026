import { signalReadService } from './signalReadService';
import { signalWriteService } from './signalWriteService';

export * from './signalTypes';

export const signalService = {
    ...signalReadService,
    ...signalWriteService
};
