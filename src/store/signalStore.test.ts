import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSignalStore } from './signalStore';

/**
 * Helper para resetear el store entre tests. Como Zustand mantiene estado
 * global y `persist` lee de localStorage, limpiamos ambos.
 */
function resetStore() {
    localStorage.clear();
    const today = new Date().toISOString().split('T')[0];
    useSignalStore.setState({
        signals: 0,
        signalsToday: 0,
        lastSignalDate: today,
        streakDays: 0,
        onboardingDone: false,
        dailyMission: {
            date: today,
            count: 0,
            goal: 3,
            completed: false,
            celebrated: false,
        },
        signalEvents: [],
    });
}

describe('signalStore', () => {
    beforeEach(() => {
        vi.useRealTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('starts with zeroed counters and empty events', () => {
            const s = useSignalStore.getState();
            expect(s.signals).toBe(0);
            expect(s.signalsToday).toBe(0);
            expect(s.streakDays).toBe(0);
            expect(s.onboardingDone).toBe(false);
            expect(s.signalEvents).toEqual([]);
        });

        it('initializes dailyMission with goal=3 and not completed', () => {
            const { dailyMission } = useSignalStore.getState();
            expect(dailyMission.goal).toBe(3);
            expect(dailyMission.count).toBe(0);
            expect(dailyMission.completed).toBe(false);
            expect(dailyMission.celebrated).toBe(false);
        });
    });

    describe('completeOnboarding', () => {
        it('flips onboardingDone to true', () => {
            useSignalStore.getState().completeOnboarding();
            expect(useSignalStore.getState().onboardingDone).toBe(true);
        });
    });

    describe('setSignalState', () => {
        it('merges partial state without dropping other fields', () => {
            useSignalStore.getState().setSignalState({ signals: 42 });
            const s = useSignalStore.getState();
            expect(s.signals).toBe(42);
            // Otros campos del estado inicial siguen intactos
            expect(s.streakDays).toBe(0);
            expect(s.dailyMission.goal).toBe(3);
        });
    });

    describe('markMissionCelebrated', () => {
        it('does nothing when mission is not completed', () => {
            useSignalStore.getState().markMissionCelebrated();
            expect(useSignalStore.getState().dailyMission.celebrated).toBe(false);
        });

        it('flips celebrated to true when mission is completed and not yet celebrated', () => {
            const today = new Date().toISOString().split('T')[0];
            useSignalStore.setState({
                dailyMission: { date: today, count: 3, goal: 3, completed: true, celebrated: false },
            });
            useSignalStore.getState().markMissionCelebrated();
            expect(useSignalStore.getState().dailyMission.celebrated).toBe(true);
        });

        it('is idempotent — calling again after celebrated stays true', () => {
            const today = new Date().toISOString().split('T')[0];
            useSignalStore.setState({
                dailyMission: { date: today, count: 3, goal: 3, completed: true, celebrated: true },
            });
            useSignalStore.getState().markMissionCelebrated();
            expect(useSignalStore.getState().dailyMission.celebrated).toBe(true);
        });
    });

    describe('addSignal — numeric input', () => {
        it('increments signals and signalsToday by delta', () => {
            useSignalStore.getState().addSignal(2);
            const s = useSignalStore.getState();
            expect(s.signals).toBe(2);
            expect(s.signalsToday).toBe(2);
        });

        it('does NOT push a SignalEvent when input is plain number (no eventDetail)', () => {
            useSignalStore.getState().addSignal(1);
            expect(useSignalStore.getState().signalEvents).toHaveLength(0);
        });

        it('clamps signals to 0 when delta would push it negative (Math.max guard)', () => {
            useSignalStore.setState({ signals: 1 });
            useSignalStore.getState().addSignal(-5);
            expect(useSignalStore.getState().signals).toBe(0);
        });
    });

    describe('addSignal — object input with eventDetail', () => {
        it('adds a SignalEvent with the given type and metadata', () => {
            useSignalStore.getState().addSignal({
                amount: 1,
                eventDetail: { type: 'vote', description: 'Votó en versus' },
            });
            const events = useSignalStore.getState().signalEvents;
            expect(events).toHaveLength(1);
            expect(events[0].type).toBe('vote');
            expect(events[0].description).toBe('Votó en versus');
            expect(events[0].amount).toBe(1);
            expect(events[0].id).toMatch(/^evt_/);
            expect(() => new Date(events[0].createdAt).toISOString()).not.toThrow();
        });

        it('defaults event type to "generic" when eventDetail.type is omitted', () => {
            useSignalStore.getState().addSignal({
                amount: 1,
                eventDetail: { description: 'sin tipo' },
            });
            expect(useSignalStore.getState().signalEvents[0].type).toBe('generic');
        });

        it('caps signalEvents log at 50 entries (newest first)', () => {
            // Empujamos 60 eventos
            for (let i = 0; i < 60; i++) {
                useSignalStore.getState().addSignal({
                    amount: 1,
                    eventDetail: { type: 'vote', description: `evento ${i}` },
                });
            }
            const events = useSignalStore.getState().signalEvents;
            expect(events).toHaveLength(50);
            // El primero (índice 0) debe ser el último insertado (evento 59)
            expect(events[0].description).toBe('evento 59');
            // El último (índice 49) debe ser el evento 10 (los 0-9 fueron descartados)
            expect(events[49].description).toBe('evento 10');
        });
    });

    describe('addSignal — streak logic', () => {
        it('starts streak at 1 when first signal of a fresh state on today', () => {
            useSignalStore.getState().addSignal(1);
            expect(useSignalStore.getState().streakDays).toBe(1);
        });

        it('increments streak when last signal was yesterday', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            // Estado: ayer 2026-04-27, streak 5
            useSignalStore.setState({
                lastSignalDate: '2026-04-27',
                streakDays: 5,
                signalsToday: 10,
            });
            useSignalStore.getState().addSignal(1);
            const s = useSignalStore.getState();
            expect(s.streakDays).toBe(6);
            expect(s.lastSignalDate).toBe('2026-04-28');
            // signalsToday se reseteó al cambio de día y luego sumó 1
            expect(s.signalsToday).toBe(1);
        });

        it('resets streak to 1 when last signal was MORE than 1 day ago', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            // Estado: hace 5 días, streak 12 (se rompe)
            useSignalStore.setState({
                lastSignalDate: '2026-04-23',
                streakDays: 12,
            });
            useSignalStore.getState().addSignal(1);
            expect(useSignalStore.getState().streakDays).toBe(1);
        });
    });

    describe('addSignal — mission logic', () => {
        it('resets dailyMission when its date is not today', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            useSignalStore.setState({
                lastSignalDate: '2026-04-28',
                dailyMission: {
                    date: '2026-04-27', // mission antigua
                    count: 5,
                    goal: 3,
                    completed: true,
                    celebrated: true,
                },
            });
            useSignalStore.getState().addSignal(1);
            const m = useSignalStore.getState().dailyMission;
            expect(m.date).toBe('2026-04-28');
            expect(m.count).toBe(1); // arranca de 0 + delta=1
            expect(m.goal).toBe(3);
            expect(m.completed).toBe(false);
            expect(m.celebrated).toBe(false);
        });

        it('marks mission as completed when count reaches goal', () => {
            useSignalStore.getState().addSignal(3); // count: 0 → 3, goal=3
            expect(useSignalStore.getState().dailyMission.completed).toBe(true);
        });

        it('does not mark completed when count is below goal', () => {
            useSignalStore.getState().addSignal(2); // count: 0 → 2, goal=3
            expect(useSignalStore.getState().dailyMission.completed).toBe(false);
        });

        it('keeps completed=true once reached even on additional signals', () => {
            useSignalStore.getState().addSignal(3);
            expect(useSignalStore.getState().dailyMission.completed).toBe(true);
            useSignalStore.getState().addSignal(1);
            expect(useSignalStore.getState().dailyMission.completed).toBe(true);
        });
    });
});
