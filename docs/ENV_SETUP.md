# ENV Setup (Opina+)

## 1) Frontend (Vite)
- Copia: .env.example -> .env.local (NO se commitea)
- Completa:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_ACCESS_GATE_*
  - VITE_FEEDBACK_WHATSAPP_*

## 2) Scripts/Admin/Edge (Service Role)
- Copia: env.server.example -> env.server.local (NO se commitea)
- Completa:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - (WhatsApp) WHATSAPP_* si aplica

## 3) Scripts útiles
- Crear admin:
  npm run create:admin -- --email "admin@tu-dominio.com" --password "TuPasswordFuerte"
