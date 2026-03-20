import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useResultsExperience } from './useResultsExperience';
import { getCuratedMasterHubSnapshot } from '../data/getCuratedMasterHubSnapshot';
import { trackPage } from '../../telemetry/track';

// 1. Mock Auth
let mockProfile: Record<string, unknown> | null = null;
vi.mock('../../auth', () => ({
    useAuth: () => ({ profile: mockProfile })
}));

// 2. Mock Data Provider (Curated Master Hub)
vi.mock('../data/getCuratedMasterHubSnapshot', () => ({
    getCuratedMasterHubSnapshot: vi.fn()
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
        (getCuratedMasterHubSnapshot as import('vitest').Mock).mockReturnValue(mockSnapshot);

        // Since getCuratedMasterHubSnapshot is synchronous, loading finishes immediately in the first effect
        const { result } = renderHook(() => useResultsExperience());

        expect(result.current.loading).toBe(false);
        expect(result.current.snapshot).toEqual(mockSnapshot);
        expect(getCuratedMasterHubSnapshot).toHaveBeenCalledWith('test-user-id', {});
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
        (getCuratedMasterHubSnapshot as import('vitest').Mock).mockImplementation((_userId: string, filters: Record<string, unknown>) => {
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

    it('manages activeTab and filters state', async () => {
        (getCuratedMasterHubSnapshot as import('vitest').Mock).mockReturnValue({});

        const { result } = renderHook(() => useResultsExperience());

        // Defaults
        expect(result.current.activeTab).toBe('versus');
        expect(result.current.filters).toEqual({});

        // Set Tab
        act(() => {
            result.current.setActiveTab('torneo');
        });
        expect(result.current.activeTab).toBe('torneo');

        // Set Filters
        act(() => {
            result.current.setFilters({ gender: 'female' });
        });
        expect(result.current.filters).toEqual({ gender: 'female' });
    });

    it('does not load data if profile is not available', async () => {
        mockProfile = null; // Unauthenticated
        
        const { result } = renderHook(() => useResultsExperience());

        // Effect runs but returns early
        expect(getCuratedMasterHubSnapshot).not.toHaveBeenCalled();
        
        // It initializes with loading true, but won't change snapshot
        expect(result.current.snapshot).toBeNull();
    });
});
