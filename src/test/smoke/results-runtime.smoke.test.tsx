import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmokeTestProvider } from './SmokeTestProvider';
import ResultsPage from '../../features/results/pages/Results';

// 1. Mockeamos la configuración del runtime para FORZAR que el test 
// corra en modo real
vi.mock('../../features/results/config/resultsRuntime', () => ({
  isResultsRealMode: true
}));

// Mock del trackPage para evitar fallos de telemetría sin init de mixpanel
vi.mock('../../features/telemetry/track', () => ({
  trackPage: vi.fn(),
}));

// Mock de useAuth para simular sesión en modo real
vi.mock('../../features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../features/auth')>();
  return {
    ...actual,
    useAuth: () => ({ profile: { id: 'smoke-test-user-id' } })
  };
});

describe('Results Runtime Smoke Test (Real Mode)', () => {
  
  beforeEach(() => {
    // Resetear mocks si es necesario
    vi.clearAllMocks();
    
    // Polyfill simple para window.scrollTo que usa el useEffect de Results.tsx
    window.scrollTo = vi.fn();
  });

  it('renders Results resolving the real loading state without freezing', async () => {
    render(
      <SmokeTestProvider initialRoute="/results">
        <ResultsPage />
      </SmokeTestProvider>
    );

    // Initial state might be loading (the spin div)
    // Wait for the main `<main>` container of Results content to appear
    await waitFor(() => {
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Asserts compliance de no-carga infinita: al resolver synthetic, 
    // debe estar el render final de secciones modulares
    const mainElement = screen.getByRole('main');
    expect(mainElement.className).toContain('z-10'); // Basic CSS stability smoke check
  });
});
