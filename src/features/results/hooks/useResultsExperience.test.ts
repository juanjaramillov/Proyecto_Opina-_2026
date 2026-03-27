import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useResultsExperience } from './useResultsExperience';
import { getLaunchSyntheticMasterHubSnapshot } from '../data/launch/resultsLaunchSyntheticData';
import { trackPage } from '../../telemetry/track';

// 1. Mock Runtime Config
vi.mock('../config/resultsRuntime', () => ({
    isResultsLaunchSyntheticMode: true,
    isResultsRealMode: false
}));

// 1. Mock Auth
let mockProfile: Record<string, unknown> | null = null;
vi.mock('../../auth', () => ({
    useAuth: () => ({ profile: mockProfile })
}));

// 2. Mock Data Provider (Launch Synthetic)
vi.mock('../data/launch/resultsLaunchSyntheticData', () => ({
    getLaunchSyntheticMasterHubSnapshot: vi.fn()
}));

// 3. Mock Telemetry
vi.mock('../../telemetry/track', () => ({
    trackPage: vi.fn()
}));

describe('useResultsExperience', () => {
    beforeEach(() => {
        mockProfile = { id: 'test-user-id' };
        vi.clearAllMocks();
    });

    it('loads snapshot consistently for a given profile', async () => {
        const mockSnapshot = {
            modules: {
                versus: { state: 'available', total_answers: 10, unplayed_count: 0 },
                torneo: { state: 'available', total_answers: 5, pending_signals: 0 }
            }
        };
        (getLaunchSyntheticMasterHubSnapshot as import('vitest').Mock).mockReturnValue(mockSnapshot);

        // Since getLaunchSyntheticMasterHubSnapshot is synchronous, loading finishes immediately in the first effect
        const { result } = renderHook(() => useResultsExperience());

        expect(result.current.loading).toBe(false);
        expect(result.current.snapshot).toEqual(mockSnapshot);
        expect(getLaunchSyntheticMasterHubSnapshot).toHaveBeenCalledWith('test-user-id', {});
        expect(trackPage).toHaveBeenCalledWith('results_hub_b2c');
    });

    it('handles "insufficient_cohort" state when filters are extreme', async () => {
        const insufficientSnapshot = {
            modules: {
                versus: { state: 'insufficient_cohort', total_answers: 2, unplayed_count: 0 },
                torneo: { state: 'insufficient_cohort', total_answers: 1, pending_signals: 0 }
            },
            cohortState: {
                isFiltered: true,
                cohortSize: 2,
                privacyState: 'insufficient_cohort' as const
            }
        };
        (getLaunchSyntheticMasterHubSnapshot as import('vitest').Mock).mockImplementation((_userId: string, filters: Record<string, unknown>) => {
            if (filters.ageRange === '18-24' && filters.region === 'north') {
                return insufficientSnapshot;
            }
            return {};
        });

        const { result } = renderHook(() => useResultsExperience());

        act(() => {
            result.current.setFilters({ ageRange: '18-24', region: 'north' });
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.snapshot).toEqual(insufficientSnapshot);
        });
        
        expect(result.current.snapshot?.cohortState?.privacyState).toBe('insufficient_cohort');
    });

    it('manages activeModule and filters state', async () => {
        (getLaunchSyntheticMasterHubSnapshot as import('vitest').Mock).mockReturnValue({});

        const { result } = renderHook(() => useResultsExperience());

        // Defaults
        expect(result.current.activeModule).toBe('ALL');
        expect(result.current.filters).toEqual({});

        // Set Tab
        act(() => {
            result.current.setActiveModule('TOURNAMENT');
        });
        expect(result.current.activeModule).toBe('TOURNAMENT');

        // Set Filters
        act(() => {
            result.current.setFilters({ gender: 'female' });
        });
        expect(result.current.filters).toEqual({ gender: 'female' });
    });

    it('loads synthetic data with fallback id if profile is not available in launch mode', async () => {
        mockProfile = null; // Unauthenticated
        const mockSnapshot = {
            modules: { versus: { state: 'available', total_answers: 0, unplayed_count: 0 } }
        };
        (getLaunchSyntheticMasterHubSnapshot as import('vitest').Mock).mockReturnValue(mockSnapshot);
        
        const { result } = renderHook(() => useResultsExperience());

        // Effect runs and calls synthetic data with fallback id
        expect(getLaunchSyntheticMasterHubSnapshot).toHaveBeenCalledWith('launch-anonymous-user', {});
        
        // Stops loading and sets snapshot
        expect(result.current.loading).toBe(false);
        expect(result.current.snapshot).toEqual(mockSnapshot);
    });
});
