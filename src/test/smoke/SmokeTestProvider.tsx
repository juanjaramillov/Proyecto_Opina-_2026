import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../features/auth';
import { SessionProvider } from '../../features/analytics/providers/SessionProvider';

interface SmokeTestProviderProps {
  children: ReactNode;
  initialRoute?: string;
}

/**
 * Wrapper mínimo y estandarizado para aislar la UI en tests de humo.
 * Evita la verbosidad de inyectar Helmet, Routers y Auth en cada test top-level.
 */
export function SmokeTestProvider({ children, initialRoute = '/' }: SmokeTestProviderProps) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <HelmetProvider>
        <AuthProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </AuthProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}
