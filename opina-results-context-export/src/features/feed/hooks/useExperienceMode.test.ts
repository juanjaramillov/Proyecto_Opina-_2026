import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useExperienceMode } from './useExperienceMode';

// Mock signals service
vi.mock('../../signals/services/signalService', () => ({
    signalService: {
        getHubTopNow24h: vi.fn(),
        getHubLiveStats24h: vi.fn()
    }
}));

// Mock react-router-dom location
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockLocationState: any = null;
vi.mock('react-router-dom', () => ({
    useLocation: () => ({
        pathname: '/signals',
        state: mockLocationState
    })
}));

describe('useExperienceMode', () => {
    beforeEach(() => {
        mockLocationState = null;
    });

    it('defaults to menu when no state is provided', () => {
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('menu');
        expect(result.current.requestedBatch).toBeUndefined();
    });

    it('opens Versus when mode="versus" is provided', () => {
        mockLocationState = { mode: 'versus' };
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('versus');
    });

    it('opens Torneo when mode="torneo" is provided', () => {
        mockLocationState = { mode: 'torneo' };
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('torneo');
    });

    it('opens Actualidad when mode="actualidad" is provided', () => {
        mockLocationState = { mode: 'actualidad' };
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('actualidad');
    });

    it('opens Versus if nextBatch is provided without explicit mode (legacy fallback)', () => {
        mockLocationState = { nextBatch: 123 };
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('versus');
        expect(result.current.requestedBatch).toBe(123);
    });

    it('prioritizes explicit mode over nextBatch', () => {
        mockLocationState = { mode: 'torneo', nextBatch: 123 };
        const { result } = renderHook(() => useExperienceMode());
        expect(result.current.mode).toBe('torneo');
    });

    it('can reset to menu', () => {
        mockLocationState = { mode: 'versus' };
        const { result } = renderHook(() => useExperienceMode());
        
        expect(result.current.mode).toBe('versus');
        
        act(() => {
            result.current.resetToMenu();
        });
        
        expect(result.current.mode).toBe('menu');
    });
});
