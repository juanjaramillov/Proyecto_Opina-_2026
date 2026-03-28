import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useResultsExperience } from './useResultsExperience';
import { resultsCommunityService } from '../services/resultsCommunityService';
import { analyticsService } from '../../analytics/services/analyticsService';

// 1. Mock Runtime Config
vi.mock('../config/resultsRuntime', () => ({
    isResultsRealMode: true
}));

// Mock Auth
let mockProfile: Record<string, unknown> | null = null;
vi.mock('../../auth', () => ({
    useAuth: () => ({ profile: mockProfile })
}));

// 2. Mock new service
vi.mock('../services/resultsCommunityService', () => ({
    resultsCommunityService: {
        getResultsCommunitySnapshot: vi.fn()
    }
}));

// 3. Mock Telemetry
vi.mock('../../analytics/services/analyticsService', () => ({
    analyticsService: {
        trackSystem: vi.fn(),
        trackBehavior: vi.fn()
    }
}));

// Basic mock snapshot for tests
const createMockSnapshot = (microdetailLocked = false, minimumCohortSize = true) => ({
    generatedAt: "2026-03-27T00:00:00.000Z",
    query: { period: "30D", module: "ALL", generation: "ALL" },
    modules: {
        versus: [],
        tournament: { categories: [], globalRanking: [] },
        actualidad: { trendingTopics: [] }
    },
    guardrails: { minimumCohortSize, microdetailLocked },
    technicalMeta: { precision: "estimated", mode: "synthetic" }
});

describe('useResultsExperience', () => {
    beforeEach(() => {
        mockProfile = { id: 'test-user-id' };
        vi.clearAllMocks();
    });

    it('loads snapshot consistently', async () => {
        const mockSnapshot = createMockSnapshot();
        (resultsCommunityService.getResultsCommunitySnapshot as import('vitest').Mock).mockResolvedValue(mockSnapshot);

        const { result } = renderHook(() => useResultsExperience());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.snapshot).toEqual(mockSnapshot);
        expect(resultsCommunityService.getResultsCommunitySnapshot).toHaveBeenCalledWith(
            { period: '30D', module: 'ALL', generation: 'ALL' }
        );
        expect(analyticsService.trackSystem).toHaveBeenCalledWith('user_opened_results', 'info');
    });

    it('handles guardrails correctly when cohort is small', async () => {
        const insufficientSnapshot = createMockSnapshot(true, false);
        (resultsCommunityService.getResultsCommunitySnapshot as import('vitest').Mock).mockImplementation((query) => {
            if (query.generation === 'GEN_Z') return Promise.resolve(insufficientSnapshot);
            return Promise.resolve(createMockSnapshot());
        });

        const { result } = renderHook(() => useResultsExperience());

        act(() => {
            result.current.setActiveGeneration('GEN_Z');
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.snapshot).toEqual(insufficientSnapshot);
        });
        
        expect(result.current.snapshot?.guardrails.minimumCohortSize).toBe(false);
    });

    it('manages activeModule and period state', async () => {
        (resultsCommunityService.getResultsCommunitySnapshot as import('vitest').Mock).mockResolvedValue(createMockSnapshot());

        const { result } = renderHook(() => useResultsExperience());

        // Defaults
        expect(result.current.activeModule).toBe('ALL');
        expect(result.current.activePeriod).toBe('30D');

        // Set Tab
        act(() => {
            result.current.setActiveModule('TOURNAMENT');
            result.current.setActivePeriod('7D');
        });
        
        expect(result.current.activeModule).toBe('TOURNAMENT');
        expect(result.current.activePeriod).toBe('7D');
    });

});
