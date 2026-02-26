# QA Access Gate (Piloto Cerrado)

Este documento contiene la lista de verificación (checklist) completa para asegurar que el flujo del Access Gate funciona correctamente de principio a fin.

## Flujo de Prueba (Local o Producción)

### 1) Preparación y Generación (Admin)
- [ ] Inicia sesión como administrador en `/admin-login` (o asegúrate de ya tener la sesión activa).
- [ ] Navega a la ruta protegida `/admin/access-codes`.
- [ ] Genera un lote de códigos (ej. 5 códigos) con la configuración deseada.
- [ ] **Resultado Esperado:** Se muestran los códigos generados en claro por una única vez en la pantalla. Cópialos a un lugar seguro.

### 2) Prueba de Ingreso (Nuevo Usuario)
- [ ] Abre una ventana en modo incógnito.
- [ ] Ingresa a la raíz de la aplicación (`/`).
- [ ] **Resultado Esperado:** El sistema debe redirigirte automáticamente a `/access`.
- [ ] En la pantalla de `/access`, pega uno de los códigos recién generados.
- [ ] **Resultado Esperado:** El código es validado y el sistema te permite el acceso, dirigiéndote a la pantalla principal (`Home`).

### 3) Feedback vía WhatsApp
- [ ] Estando dentro de la aplicación como el nuevo usuario, presiona el botón de contacto por WhatsApp.
- [ ] **Resultado Esperado:** Se abre la aplicación de WhatsApp (o WhatsApp Web) con un mensaje pre-llenado.
- [ ] Verifica el contenido del mensaje.
- [ ] **Resultado Esperado:** El mensaje debe incluir el `token_id` truncado, la URL actual y el timestamp correspondiente.

### 4) Revocación de Acceso (Admin)
- [ ] Regresa a la ventana donde tienes la sesión de Administrador (no incógnito).
- [ ] En `/admin/access-codes`, localiza el token que acabas de utilizar. Si es necesario, recarga la tabla.
- [ ] Haz clic en **Revocar** para ese token en específico (esto cambiará `is_active` a `false`).
- [ ] **Resultado Esperado:** La tabla se actualiza indicando que el token ya no está activo.

### 5) Verificación de Revocación
- [ ] Vuelve a la sesión de incógnito donde habías ingresado con el código recién revocado.
- [ ] Limpia el `sessionStorage` y `localStorage` (o alternativamente, cierra la ventana de incógnito, abre una nueva e intenta usar el mismo código).
- [ ] **Resultado Esperado:** Si intentas reingresar con el mismo código, el sistema no debería permitir el acceso, indicando que el código es inválido o expiró.
