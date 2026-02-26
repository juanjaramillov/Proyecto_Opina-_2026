# WhatsApp Cloud API Setup & Webhook

Este documento detalla los pasos para configurar el webhook de Opina+ con la Cloud API de Meta para WhatsApp.
Esta integración permite recibir el feedback de los usuarios directamente en la base de datos y contestar automáticamente con un menú interactivo.

## 1. Secrets de Supabase Edge Function
Asegúrate de agregar los siguientes secretos al entorno de tu proyecto en Supabase (NO subas estos valores reales al repositorio de git):

*   `SUPABASE_URL`: La URL de tu proyecto Supabase.
*   `SUPABASE_SERVICE_ROLE_KEY`: La service role key (necesaria para sobrepasar RLS y poder insertar en la tabla `whatsapp_inbound_messages`).
*   `WHATSAPP_VERIFY_TOKEN`: Un token arbitrario inventado por ti (ej. `mi_token_secreto_123`). Deberás ingresar este mismo token en el panel de Meta al configurar el webhook.
*   `WHATSAPP_ACCESS_TOKEN`: El token de acceso permanente brindado por Meta Developer Portal para enviar mensajes.
*   `WHATSAPP_PHONE_NUMBER_ID`: El ID del número de teléfono remitente proveído por Meta en tu panel de App.

## 2. Configuración del Endpoint
En el panel de Meta Developer (sección Webhooks > WhatsApp), deberás proveer la siguiente URL para recibir los eventos:

`https://<PROJECT_REF>.functions.supabase.co/whatsapp-webhook`
*(Reemplaza `<PROJECT_REF>` por la referencia única de tu proyecto alojado).*

Cuando Meta te pida la verificación de Token, usa el mismo valor que estableciste en el secret `WHATSAPP_VERIFY_TOKEN`.

## 3. Suscripción a Campos
Asegúrate de suscribir tu webhook al evento `messages` para que Meta envíe los payloads POST a tu Edge Function.

---

## QA Local (Prueba de Inserción y Extracción)

Si quieres testear que tu Edge Function parsea bien el JSON y guarda los datos en tu entorno local (antes de conectar con Meta), puedes hacer un POST usando `curl` o Postman a tu servidor de funciones de Supabase CLI (`http://localhost:54321/functions/v1/whatsapp-webhook`).

**Para que el test pase, previamente necesitas:**
1. Arrancar los servicios locales (`npm run supabase start`).
2. Pasar los envs locales a la función de manera simulada o usar el archivo `.env.local` en tu carpeta `supabase`.

Ejemplo de Payload simulando lo que enviaría Meta:

```bash
curl -X POST 'http://localhost:54321/functions/v1/whatsapp-webhook' \
-H "Content-Type: application/json" \
--data-raw '{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "123456",
              "phone_number_id": "987654"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Prueba QA"
                },
                "wa_id": "56912345678"
              }
            ],
            "messages": [
              {
                "from": "56912345678",
                "id": "wamid.HBgLNTY5ODI1NTA3ODg...",
                "timestamp": "1706644002",
                "text": {
                  "body": "Opina+ | Feedback\ntoken: e4a6dc91-1111-4444-9999-56bf0a9a1d1d\n\nResumen (1 frase):\n- Hay un boton roto\n"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}'
```

Revisa luego en tu panel de base de datos (`http://localhost:54323/project/default/editor`) la tabla `whatsapp_inbound_messages` para confirmar que se extrajo correctamente el texto libre y que `token_text` / `invite_id` se aislaron de manera precisa.
