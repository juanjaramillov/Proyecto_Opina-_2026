import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signalService } from '../../src/features/signals/services/signalService';
import * as signalOutbox from '../../src/features/signals/services/signalOutbox';

// Mock dependencias externas
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

describe('signalService.saveSignalEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate valid uuid in localStorage
    localStorage.setItem('opina_device_hash', '1234-abcd');
  });

  it('debe fallar si es un módulo no-battle y no trae entity_id', async () => {
    const payload = {
      meta: { source: 'pulse' } as const
    };
    await expect(signalService.saveSignalEvent(payload)).rejects.toThrow('Invalid signal payload: missing entity_id');
  });

  it('debe fallar si es modulo multirespuesta (depth) y falta context_id', async () => {
    const payload = {
      entity_id: 'ent-123',
      meta: { source: 'depth' } as const
    };
    await expect(signalService.saveSignalEvent(payload)).rejects.toThrow('Invalid signal payload: missing context_id for multi-response signal');
  });

  it('debe arrojar error con el mensaje exacto para context_id faltante', async () => {
    const payload = {
      entity_id: 'ent-123',
      meta: { source: 'actualidad' } as const
    };
    await expect(signalService.saveSignalEvent(payload)).rejects.toThrow('Invalid signal payload: missing context_id for multi-response signal');
  });

  it('NO debe exigir context_id si el source es versus o battle', async () => {
    const payload = {
      battle_id: 'bat-123',
      option_id: 'opt-123',
      meta: { source: 'versus' } as const
    };
    
    await signalService.saveSignalEvent(payload);
    expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalled();
  });

  it('debe preservar value_numeric = 0 y enviarlo al outbox', async () => {
    const payload = {
      entity_id: 'ent-123',
      context_id: 'ctx-123',
      value_numeric: 0,
      meta: { source: 'actualidad' } as const
    };
    
    await signalService.saveSignalEvent(payload);
    
    expect(signalOutbox.enqueueInsertSignalEvent).toHaveBeenCalledWith(
        expect.objectContaining({
            p_value_numeric: 0,
            p_entity_id: 'ent-123',
            p_context_id: 'ctx-123'
        })
    );
  });
});
