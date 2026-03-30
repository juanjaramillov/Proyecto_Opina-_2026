# Arquitectura y Operación del Panel de Entidades (Fase 3, Paso 3)

## 1. Ruta Admin Disponible
La gestión de entidades se encuentra localizada en la ruta `/admin/entities`.
Está protegida en dos capas:
1. **Frontend (UI Guards):** A nivel de enrutador mediante `<Gate module="admin">`, garantizando que la interfaz y botones solo rendericen para `role === 'admin'`.
2. **Backend (Infraestructura y Centralización):** Se creó la función SQL segura `public.is_admin()` que encapsula la comprobación de si `auth.uid()` posee efectivamente el rol de administrador en la tabla `users`. Esta función actúa como **Fuente de Verdad centralizada de autorización**.

### Endurecimiento Estricto de la Función `public.is_admin()`
Para evitar cualquier vulnerabilidad de suplantación de identidad o enmascaramiento de esquemas maliciosos, la función fue blindada con las siguientes características:
- **`SECURITY DEFINER`**: Otorga permisos del creador para asegurar que la lectura sobre la tabla `users` no sea obstruida por Row Level Security impuesta a los perfiles comunes.
- **`SET search_path = public`**: Desactiva el `search_path` dinámico para bloquear ataques de tipo "search_path hijacking" (donde un usuario podría inyectar sub-tablas falsas si no declaramos su alcance). Conectado a ello, todas las consultas refieren los objetos de forma absolutoria calificada (`FROM public.users WHERE public.users...`).

Esta función es el cimiento autorizado utilizado nativamente en las Policies de la tabla `entities` y el Storage para autorizar `INSERT/UPDATE/DELETE`. 

## 2. Seguridad Real en Supabase Storage
La gestión sube los archivos visuales hacia **Supabase Storage**, puntualmente al bucket `entities-media`.
- **Lectura:** El bucket está configurado oficialmente como `public = true`. La política de acceso permite `SELECT` sin restricciones.
- **Escritura Transaccional Restrictiva:** La escritura es vigilada rigurosamente. Primero exige pasar por la validación positiva de `public.is_admin()`. Segundo, **limita exhaustivamente el path operativo real**: el administrador solo tiene permiso si el path respeta estrictamente la sintaxis de organización predefinida. No se tolera la inyección en la raíz `logos/` ni en ubicaciones ajenas a logos. La aserción que rige es imperativa: `(name SIMILAR TO 'logos/[^/]+/.+')`. Esto implica que solo se admiten strings que empiezan con *logos/* , pasen un *segmento/slug específico*, y luego terminen con el *archivo válido*.

## 3. Alinear el Servicio al Path Oficial
Del lado del Frontend (`adminEntitiesService.ts`), el método `uploadEntityImage(file, slug)` genera estrictamente el objeto limitándose a esta única trayectoria obligatoria impuesta por Supabase Storage.
El *path exacto* generado por Reac y exigido por la Base coincide plenamente como convención universal: `logos/<slug>/<timestamp>_<hash>.<ext>`.
Para prevenir errores humanos y subidas anómalas, la UI bloquea la carga si el administrador aún no le ha rellenado un identificador (`slug`) a la entidad nueva que está fabricando, negando transacciones si el objeto resultase de la forma `logos//file.png`.

## 4. Estricta Validación de Archivos (MIME/Shape)
No se aceptan binarios extraños en la UI.
1. Se deniega subir formatos no explícitos (se admiten netamente `image/jpeg`, `image/png`, `image/webp` o `image/svg+xml`).
2. **Bloqueo Inteligente de Peso:** El controlador frena subidas en caliente (sin llamar a DB) de imágenes que excedan **2MB**.

## 5. Manejo del Reemplazo y Consistencia Transaccional
**5.1 Estrategia de Sustitución:** Se optó por la **Estrategia A (Histórico Conservado)**. Al subir un logo de recambio:
- El nuevo logo adopta un hash y ruta indexada hacia la sub-carpeta de slug: `logos/mc-donalds/...`.
- La BDD anida la nueva URL en `logo_path`.
- El objeto viejo en Supabase Storage **no se elimina**. Esto previene purgas irreversibles durante periodos de prueba administrativa; protegiendo también rollbacks de catálogo. 

**5.2 Fallos de Sincronía (Upload vs Guardado en DB):**
- Si la imagen se sube al Bucket pero falla el guardado final dentro de `entities`, el sistema reactivo frena el modal y notifica vía alerta explícita y visible que el registro ha fallado.

## 6. Resolución Legacy vs Flujo Principal
- **Qué dejó de ser el flujo principal:** Carpetas locales `public/logos/entities/`.
- **Qué quedó de legado histórico operativo (Fallback):** En caso de que una entidad antigua carezca por completo de registro `logo_path` en Supabase o un error transitorio afecte el Bucket, el componente `<EntityLogo />` intentará buscar en cascada la versión local empaquetada.

## 7. Gobierno Estricto del Slug
El `slug` de una entidad ha dejado de ser un simple campo de texto descriptivo y ha sido elevado a un **identificador operativo**.
- **Validación y Unicidad:** A nivel de la base de datos (PostgreSQL), la tabla `entities` ha reforzado la integridad del campo `slug` añadiendo un `CHECK` que tolera exclusivamente el patrón alfanumérico en minúsculas dividido por guiones (`^[a-z0-9]+(-[a-z0-9]+)*$`). Adicionalmente la unicidad del mismo es ley con `UNIQUE (slug)`.
- **Bloqueo Operativo (Inmutabilidad Relativa):** Se ha diseñado e inyectado un Trigger (`trg_protect_entity_slug_trigger`) que detiene silenciosamente e impide cualquier `UPDATE` en donde se modifique el `slug` si la entidad ya cuenta con un identificador de archivo en Storage (es decir, cuando `logo_storage_path IS NOT NULL`). Replicando esta protección de manera gráfica, el Frontend inhabilita el campo (*disabled/readonly*) exhibiendo la nota preventiva: *"Bloqueado: Logo existente"*.
Esto evita la inconsistencia crítica de mantener entidades cuyo `slug` cambie aleatoriamente abandonando directorios sin control de gobernanza en Supabase.

## 8. Trazabilidad Real de Assets Históricos y Fuente Única de Verdad
A fin de erradicar la ambigüedad respecto de sobre cómo se persisten los históricos y se distingue el objeto vigente frente a probables "huérfanos", el **Storage Path Canónico** ha sido introducido formalmente en el ecosistema, estableciéndose como la única fuente de verdad real y originaria para la existencia de logos.

1. **Fuente de Verdad Única:** Ha dejado de dependerse de la "URL Pública" (`logo_path`) como verdad independiente. La base de datos asume que si el activo está almacenado en el ecosistema, `logo_storage_path` (ej. `logos/mcdonalds/1234.png`) es su identidad innegable. 
2. **Sincronización Transaccional Obligatoria y Backfill:** Históricamente coexistieron URLs sueltas, por lo que se diseñó y corrió un **Backfill a nivel SQL (20260330000004_admin)** que recolectó todos los paths preexistentes en `logo_path` y forjó su `logo_storage_path` retroactivo, protegiendo así a las entidades viejas mediante el trigger del slug. Además, se implementó un `TRIGGER (trg_sync_entity_logos)` que rechaza cualquier escritura en base de datos si la URL pública intentada enviar hacia `logo_path` no encierra literalmente el subpath marcado por `logo_storage_path`.
3. **Lectura Derivada en Frontend:** Fieles a la unicidad, el **Admin lee únicamente la variable de entorno y el storage path al hidratar su listado**, calculando en caliente la URL pública final mostrada al B2C usando el SDK de Supabase. A su vez, el editor deshabilitó las cajas de texto que antes permitían inyectar a mano "URLs independientes" a entidades que ahora deben respeto a su asset físico (Storage).
4. **Plataforma base para Limpieza (Orphan Detection):** Esta medida es el cimiento definitivo para Garbage Collection. Para identificar histórico vs huérfano explícito, solo se requerirá iterar sobre los objetos vivos en el bucket `entities-media` cruzándolos exlusiva e implacablemente contra el inventario relacional indexado bajo la columna `logo_storage_path`. Nada dependiente de parsing de URLs o de `logo_path` definirá la vida de un archivo en Supabase.
