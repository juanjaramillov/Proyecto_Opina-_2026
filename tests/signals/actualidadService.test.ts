import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actualidadService } from '../../src/features/signals/services/actualidadService';

// Mock dependencias externas
vi.mock('../../src/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  }
}));

vi.mock('../../src/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

// Mock del signalService
const mockSaveSignalEvent = vi.fn().mockResolvedValue(undefined);
vi.mock('../../src/features/signals/services/signalService', () => ({
    signalService: {
        saveSignalEvent: mockSaveSignalEvent
    }
}));


describe('actualidadService.submitAnswers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSaveSignalEvent.mockResolvedValue(undefined);
    });

    it('debe construir peticiones separadas con un context_id diferente para cada respuesta', async () => {
        const topicId = 'topic-123';
        const answers = [
            { question_id: 'q1', answer_value: 'val1' },
            { question_id: 'q2', answer_value: 'val2' },
            { question_id: 'q3', answer_value: 'val3' },
        ];

        const result = await actualidadService.submitAnswers(topicId, answers);

        expect(result).toBe(true);
        expect(mockSaveSignalEvent).toHaveBeenCalledTimes(3);

        // Validar orden y construcción
        expect(mockSaveSignalEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({
            entity_id: topicId,
            context_id: 'q1',
            value_text: 'val1',
            meta: expect.objectContaining({ source: 'actualidad' })
        }));

        expect(mockSaveSignalEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({
            entity_id: topicId,
            context_id: 'q2',
            value_text: 'val2'
        }));

        expect(mockSaveSignalEvent).toHaveBeenNthCalledWith(3, expect.objectContaining({
            entity_id: topicId,
            context_id: 'q3',
            value_text: 'val3'
        }));
    });

    it('debe detenerse y asociar el error a la pregunta correcta si falla una peticion central', async () => {
        const topicId = 'topic-123';
        const answers = [
            { question_id: 'q1', answer_value: 'val1' },
            { question_id: 'q2', answer_value: 'val2' }, // Esta fallará
            { question_id: 'q3', answer_value: 'val3' },
        ];

        // Simulamos que la segunda llamada lanza excepcion
        mockSaveSignalEvent.mockResolvedValueOnce(undefined);
        mockSaveSignalEvent.mockRejectedValueOnce(new Error('Auth failed'));

        const { logger } = await import('../../src/lib/logger');

        let caughtError;
        try {
            await actualidadService.submitAnswers(topicId, answers);
        } catch (e) {
            caughtError = e;
        }

        expect(caughtError).toBeDefined();
        // Promise.all despacha las 3 promesas concurrentemente, por lo que mockSaveSignalEvent 
        // será llamado 3 veces independientemente de si la segunda falla rápido.
        expect(mockSaveSignalEvent).toHaveBeenCalledTimes(3);

        // El logger debió registrar la pregunta exacta que falló (q2)
        expect(logger.error).toHaveBeenCalledWith(
            '[ActualidadService] Failed to submit answer for question_id: q2',
            expect.any(Object)
        );
    });
});
