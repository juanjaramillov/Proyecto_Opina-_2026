import { APP_DATA_MODE } from '../../../config/dataMode';

export type ResultsRuntimeMode = 'launch_synthetic' | 'real';

export const RESULTS_RUNTIME_MODE: ResultsRuntimeMode =
  APP_DATA_MODE === 'real' ? 'real' : 'launch_synthetic';

export const isResultsLaunchSyntheticMode = RESULTS_RUNTIME_MODE === 'launch_synthetic';
export const isResultsRealMode = RESULTS_RUNTIME_MODE === 'real';
