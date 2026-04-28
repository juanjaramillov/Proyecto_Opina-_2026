import { ReactNode, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../features/auth';
import { SessionProvider } from '../../features/analytics/providers/SessionProvider';

interface SmokeTestProviderProps {
  children: ReactNode;
  initialRoute?: string;
}

/**
 * Wrapper mínimo y estandarizado para aislar la UI en tests de humo.
 * Evita la verbosidad de inyectar Helmet, Routers y Auth en cada test top-level.
 *
 * Incluye un QueryClient fresco por mount (gcTime:0, retry:false) para que
 * los tests sean deterministas y no compartan cache entre runs.
 */
export function SmokeTestProvider({ children, initialRoute = '/' }: SmokeTestProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  }));

  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}
