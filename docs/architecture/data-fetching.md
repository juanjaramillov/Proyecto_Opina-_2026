# Data Fetching — TanStack Query (React Query)

**Estado:** FASE 1 cerrada el 2026-04-26. Foundation instalada, 0 hooks migrados todavía.

## Por qué

Cierra 4 hallazgos de la auditoría Drimo de un golpe:
- Datos repetidos refetchados en cada navegación entre pantallas (ALTO)
- Refetch innecesario al volver de blur a focus (MEDIO)
- Falta de paralelización entre queries independientes (MEDIO)
- Spinner eterno parcial cuando una query falla y no se reintenta (MEDIO)

Reemplaza el patrón casero `useEffect + setLoading + setError + supabase.from(...)` que está copiado en ~22 archivos del proyecto.

## Cómo se usa

El cliente está en [`src/lib/queryClient.ts`](../../src/lib/queryClient.ts) con defaults:
- `staleTime: 5 min` — datos frescos por 5 min sin refetch.
- `gcTime: 10 min` — caché en memoria 10 min.
- `retry: 1` — un solo reintento ante error.
- `refetchOnWindowFocus: false` — el patrón Opina+ es admin/lector, refetch en cada foco mete carga inútil.
- `refetchOnReconnect: true` — sí refetcheamos al volver de offline.

Mutations no se reintentan automáticamente (un POST duplicado puede ser destructivo).

El provider está montado en [`src/index.tsx`](../../src/index.tsx) envolviendo `<BrowserRouter>` para que toda la app tenga acceso. Devtools solo en DEV (lazy-imported, no entra al bundle de prod).

## Patrón estándar para nuevos hooks

```ts
// src/features/admin/hooks/useAdminUsers.ts
import { useQuery } from '@tanstack/react-query';
import { adminUsersService } from '../services/adminUsersService';

export function useAdminUsers(searchTerm: string) {
    return useQuery({
        queryKey: ['admin', 'users', searchTerm],
        queryFn: () => adminUsersService.searchUsers(searchTerm),
    });
}
```

Para mutaciones:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            adminUsersService.updateRole(userId, role),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
}
```

## Roadmap de migración

- **FASE 1** ✅ (2026-04-26) — instalar `@tanstack/react-query` + devtools, crear `queryClient`, wrap App. Nada se rompe — los 22 hooks caseros siguen funcionando en paralelo. Devtools en DEV.
- **FASE 2** ⏳ — migrar 3-5 hooks visibles (Hub, Profile, Admin Users). Aquí Juan siente el cambio: volver al Hub no recarga si la última fetch fue hace <5min.
- **FASE 3** ⏳ — migrar el resto (17 hooks) a goteo, sin urgencia. Cada migración elimina un patrón casero y sus 4-5 líneas de boilerplate.

## Convenciones de queryKey

Usar arrays con jerarquía: `['domain', 'resource', ...filters]`.

Ejemplos:
- `['admin', 'users', searchTerm]`
- `['admin', 'invites', statusFilter, page]`
- `['profile', userId]`
- `['signals', 'trending', topicId]`

Esto permite invalidar a granularidad variable:
- `qc.invalidateQueries({ queryKey: ['admin'] })` invalida todo lo admin.
- `qc.invalidateQueries({ queryKey: ['admin', 'users'] })` invalida solo users.
- `qc.invalidateQueries({ queryKey: ['admin', 'users', 'jose'] })` invalida la búsqueda específica.

## Cosas que NO hacer

- **No usar `staleTime: 0`** salvo necesidad real (live dashboards). El default de 5min es deliberado.
- **No invalidar todo el caché** en logout. Hacer `qc.clear()` solo si estamos cambiando de usuario; sino las invalidaciones quirúrgicas son suficientes.
- **No mezclar** React Query con `useEffect + setState` para el mismo recurso. Migrar entero el hook o dejarlo entero como antes — el híbrido confunde.
