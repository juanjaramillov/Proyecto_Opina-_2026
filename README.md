# Opina+

## Piloto cerrado (Access Gate)

### Variables Vercel (Production)
- VITE_ACCESS_GATE_ENABLED=true
- VITE_ACCESS_GATE_DAYS_VALID=30
- VITE_FEEDBACK_WHATSAPP_NUMBER=<numero_sin_+_ni_espacios>

### Rutas clave
- /access        => ingreso por código
- /admin-login   => login admin sin gate
- /admin/access-codes => panel admin para generar/revocar códigos

### Flujo de prueba (local o prod)
1) Admin:
   - Inicia sesión en /admin-login
   - Ve a /admin/access-codes y genera 5 códigos
   - Copia y guarda los códigos (solo se muestran una vez)

2) Usuario nuevo:
   - Abrir ventana incógnito y entrar a /
   - Debe redirigir a /access
   - Pegar un código generado => entra a Home

3) Feedback:
   - Presionar botón WhatsApp
   - Debe abrir chat con texto que incluya:
     token: <token_id>
     url: <url>
     ts: <timestamp>

4) Revocar:
   - Admin revoca el token desde /admin/access-codes
   - Usuario con ese token debe fallar al reingresar tras expirar/limpiar storage
