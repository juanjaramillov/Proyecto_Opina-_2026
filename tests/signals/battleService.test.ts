import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signalService } from '../../src/features/signals/services/signalService';
import * as signalOutbox from '../../src/features/signals/services/signalOutbox';

vi.mock('../../src/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

vi.mock('../../src/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('../../src/features/signals/services/signalOutbox', () => ({
  enqueueInsertSignalEvent: vi.fn().mockReturnValue({ id: 'test-uuid-123' }),
  flushSignalOutbox: vi.fn().mockResolvedValue(undefined),
  removeOutboxJob: vi.fn(),
  isNonRetriableSignalErrorMessage: vi.fn().mockReturnValue(false)
}));

vi.mock('../../src/features/telemetry/track', () => ({
  track: vi.fn()
}));

describe('Battle / Versus Non-Regression', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('opina_device_hash', '1234-abcd');
    });

    it('saveVersusSignal debe componer un payload válido que eludiere comprobaciones de context_id', async () => {
        await signalService.saveVersusSignal({
            battle_uuid: 'uuid-battle-123',
            battle_id: 'slug-battle-123',
            battle_title: 'Title',
            selected_option_id: 'opt-win',
            loser_option_id: 'opt-lose',
            selected_option_name: 'Win',
            loser_option_name: 'Lose'
        });

        // La inserción outbox debió ser llamada exitosamente
        expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalledTimes(1);
        expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                p_battle_id: 'uuid-battle-123',
                p_option_id: 'opt-win',
                p_signal_type_code: 'VERSUS_SIGNAL', // Debe setear el tipo internamente
                p_value_json: expect.objectContaining({
                    source: 'versus',
                    loser_option_id: 'opt-lose'
                })
            })
        );
    });

    it('saveTorneoSignal debe actuar similar y estar exento de exigencias de entidad base', async () => {
        await signalService.saveTorneoSignal({
            battle_uuid: 'uuid-torn-123',
            battle_id: 'slug-torn-123',
            instance_id: 'inst-123',
            title: 'Torn',
            selected_option_id: 'opt-win',
            loser_option_id: 'opt-lose',
            selected_option_name: 'Win',
            loser_option_name: 'Lose',
            stage: 2
        });

        expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalledTimes(1);
        expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                p_battle_id: 'uuid-torn-123',
                p_option_id: 'opt-win',
                p_signal_type_code: 'PROGRESSIVE_SIGNAL', 
                p_value_json: expect.objectContaining({
                    source: 'progressive',
                    stage: 2
                })
            })
        );
    });
});
