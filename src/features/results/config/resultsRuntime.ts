import { PublicationMode } from '../../../read-models/analytics/analyticsTypes';

export const RESULTS_RUNTIME_MODE: PublicationMode = 'curated';

export const isResultsRealMode = (RESULTS_RUNTIME_MODE as string) === 'real';
