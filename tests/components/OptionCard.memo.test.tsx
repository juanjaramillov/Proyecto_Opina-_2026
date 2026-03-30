import '@testing-library/jest-dom';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import OptionCard, { areOptionCardPropsEqual } from '../../src/features/signals/components/OptionCard';

describe('OptionCard Memoization', () => {
  afterEach(() => {
    cleanup();
  });

  const baseOption = {
    id: 'op-1',
    label: 'Option Alpha',
    type: 'brand' as const,
    image_url: 'https://example.com/logo.png',
    stats: {
      onlineCount: 10,
      totalAnswers: 50
    }
  };

  const defaultProps = {
    option: baseOption,
    onClick: vi.fn(),
    disabled: false,
    isSelected: false,
    showResult: false,
    showPercentage: true,
    percent: null,
    momentum: null,
    isChampion: false,
    layout: 'versus' as const
  };

  describe('Render verification', () => {
    it('renders correctly initial stats', () => {
        render(<OptionCard {...defaultProps} />);
        expect(screen.getByText('Option Alpha')).toBeInTheDocument();
        expect(screen.getByText('10 online')).toBeInTheDocument();
    });
  });

  describe('areOptionCardPropsEqual Contract', () => {
    it('NO re-renderiza (returns true) cuando cambian props irrelevantes', () => {
        // Here we change the 'onClick' reference which is the main culprit in VersusGame
        const nextProps = {
            ...defaultProps,
            onClick: vi.fn(), // completely new function
            option: {
                ...baseOption,
                created_at: '2026-01-01' // An irrelevant backend prop
            }
        };
        // Expect the comparator to say they ARE equal (thus blocking re-render)
        expect(areOptionCardPropsEqual(defaultProps, nextProps as any)).toBe(true);
    });

    it('SÍ re-renderiza (returns false) cuando cambia una prop visual', () => {
        const nextPropsVisuals = {
            ...defaultProps,
            isSelected: true
        };
        expect(areOptionCardPropsEqual(defaultProps, nextPropsVisuals)).toBe(false);

        const nextPropsOptionLabel = {
            ...defaultProps,
            option: { ...baseOption, label: 'Option Beta' }
        };
        expect(areOptionCardPropsEqual(defaultProps, nextPropsOptionLabel)).toBe(false);
    });

    it('SÍ re-renderiza (returns false) cuando cambian stats en tiempo real', () => {
        const nextPropsStats = {
            ...defaultProps,
            option: {
                ...baseOption,
                stats: {
                    onlineCount: 42,
                    totalAnswers: 50
                }
            }
        };
        // Must return false so React knows it has to re-render the card with new stats
        expect(areOptionCardPropsEqual(defaultProps, nextPropsStats)).toBe(false);
    });
  });

  describe('onClick Stale Closure Safety Proof (Feature context)', () => {
    it('Demuestra que los cambios en handleVote siempre disparan re-render por acoplamiento de estado', () => {
        // En VersusGame, handleVote de regenera si isCurrentlySubmitting cambia.
        // Pero isCurrentlySubmitting se pasa como prop `disabled` a OptionCard.
        // Simulamos ese ciclo del motor:
        
        const nextPropsCycle = {
            ...defaultProps,
            onClick: vi.fn(), // "Nuevo" closure generado por VersusGame
            disabled: true    // Acoplado a isCurrentlySubmitting = true
        };
        
        // Al cambiar disabled a true, el comparator ROMPE el memo y permite el re-render.
        // Al permitirse el re-render, la OptionCard SÍ asimila el nuevo onClick!
        // Esto demuestra que omitir onClick en el comparator NO causa Stale Closures en este sistema.
        expect(areOptionCardPropsEqual(defaultProps, nextPropsCycle)).toBe(false);
    });

    it('ejecuta el callback nuevo tras un ciclo visual de re-render (prueba conductual real de DOM)', () => {
        // Esta prueba monta el componente en el DOM virtual y simula clics reales.
        const handlerA = vi.fn();
        const handlerB = vi.fn();

        const { rerender } = render(
            <OptionCard {...defaultProps} onClick={handlerA} disabled={false} />
        );

        // 1. Click inicial ejecuta el handler A
        screen.getByTestId('versus-option-op-1').click();
        expect(handlerA).toHaveBeenCalledTimes(1);
        expect(handlerB).toHaveBeenCalledTimes(0);

        // 2. Entramos a estado "submitting". VersusGame inyecta un nuevo handleVote congelado
        // y pone disabled en true. El comparator se rompe legítimamente.
        rerender(<OptionCard {...defaultProps} onClick={handlerB} disabled={true} />);
        
        // (Durante el disabled no comprobamos clicks porque el CSS lo bloquea a nivel de UI, 
        // pero validaremos cuando vuelva a estar activo).
        
        // 3. Pasamos al siguiente turno (o se liberó el submit). 
        // Generamos un Handler B fresco, y disabled=false. El comparator vuelve a romperse.
        rerender(<OptionCard {...defaultProps} onClick={handlerB} disabled={false} />);

        // 4. Hacemos click y verificamos a quién llama.
        screen.getByTestId('versus-option-op-1').click();
        
        // Efectivamente, se ejecuta el Handler B. 
        // Si el memo hubiera atrapado un stale closure por excluir onClick y no haber mapeado bien `disabled`,
        // handler A habría sido ejecutado de nuevo.
        expect(handlerA).toHaveBeenCalledTimes(1);
        expect(handlerB).toHaveBeenCalledTimes(1);
    });
  });
});
