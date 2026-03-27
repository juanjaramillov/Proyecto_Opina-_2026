import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';
import { HelmetProvider } from 'react-helmet-async';

// Componentes externos muy ruidosos o que crashean fuera del browser
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('App Runtime Smoke Test', () => {
  it('renders without crashing on default route', () => {
    // Si la App no puede montar su árbol de Routes principal, este test explotará.
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </MemoryRouter>
    );
    
    // Verificamos que contenga algo del DOM inicializado (no está totalmente vacío por un error fatal suspendido)
    expect(container).toBeDefined();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
