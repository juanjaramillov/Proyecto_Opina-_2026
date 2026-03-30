import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.development.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

async function runTests() {
  console.log('--- Empezando tests de autorización en Edge Functions (Bloque 2) ---')

  const adminEmail = 'test_cooldown_admin@opina.plus'
  const normalEmail = 'test_normal_user@opina.plus'
  const password = 'TestNormal123!_seguro'

  // Create edge-function test users robustly
  let adminId;
  const adminRes = await supabaseAdmin.auth.admin.createUser({ email: adminEmail, password, email_confirm: true })
  if (adminRes.error && adminRes.error.message.includes("already exist")) {
     // Retrieve user
     const page = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
     adminId = page.data.users.find(u => u.email === adminEmail)?.id
     if (adminId) await supabaseAdmin.auth.admin.updateUserById(adminId, { password })
  } else {
     adminId = adminRes.data?.user?.id
     if (adminId) await supabaseAdmin.from('users').update({ role: 'admin' }).eq('user_id', adminId)
  }

  let normalId;
  const normalRes = await supabaseAdmin.auth.admin.createUser({ email: normalEmail, password, email_confirm: true })
  if (normalRes.error && normalRes.error.message.includes("already exist")) {
     const page = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
     normalId = page.data.users.find(u => u.email === normalEmail)?.id
     if (normalId) {
         await supabaseAdmin.auth.admin.updateUserById(normalId, { password })
         await supabaseAdmin.from('users').update({ role: 'member' }).eq('user_id', normalId)
     }
  } else {
     normalId = normalRes.data?.user?.id
     if (normalId) await supabaseAdmin.from('users').update({ role: 'member' }).eq('user_id', normalId)
  }

  if (normalId) {
      // Pre-seed del perfil para asegurar que inicie en nivel mínimo 1 (evita bug de renderizado vacío en CompleteProfile)
      await new Promise(r => setTimeout(r, 500)) // esperar a trigger de DB
      await supabaseAdmin.from('user_profiles').update({ profile_stage: 1, nickname: 'E2ETester' }).eq('user_id', normalId)
  }

  // 1. Iniciar sesión con Normal User
  const { data: normalSession, error: err1 } = await supabaseAnon.auth.signInWithPassword({ email: normalEmail, password })
  if (err1 || !normalSession.session) {
      console.error('Fallo login normal user:', err1)
      process.exit(1)
  }
  const normalJwt = normalSession.session.access_token

  // 2. Iniciar sesión con Admin User
  const { data: adminSession, error: err2 } = await supabaseAnon.auth.signInWithPassword({ email: adminEmail, password })
  if (err2 || !adminSession.session) {
      console.error('Fallo login admin user:', err2)
      process.exit(1)
  }
  const adminJwt = adminSession.session.access_token

  // Target function to test: actualidad-bot (which requires openAI key, etc).
  // We can just use raw fetch to clearly see the HTTP statuses.
  const fnUrl = `${supabaseUrl}/functions/v1/actualidad-bot`

  console.log('\n--- Probando actualidad-bot ---')

  // A) ESCENARIO A: Sin Token -> 401
  const reqA = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
  })
  if (reqA.status === 401) {
      console.log('✅ Escenario A (Sin token): Retornó 401 correctamente.')
  } else {
      console.log(`❌ Escenario A falló. Esperaba 401, obtuvo ${reqA.status}`)
  }

  // B) ESCENARIO B: Usuario NORMAL -> 403
  const reqB = await fetch(fnUrl, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${normalJwt}`
    },
    body: JSON.stringify({})
  })
  if (reqB.status === 403) {
    console.log('✅ Escenario B (Token Normal User): Retornó 403 (Forbidden) correctamente.')
  } else {
    console.log(`❌ Escenario B falló. Esperaba 403, obtuvo ${reqB.status}`, await reqB.text())
  }

  // C) ESCENARIO C: Usuario ADMIN -> Debería retornar != 401 y != 403. Puede fallar en OpenAI (500/400) o pasar (200), pero PASÓ el middleware admin.
  const reqC = await fetch(fnUrl, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminJwt}`
    },
    body: JSON.stringify({})
  })
  
  if (reqC.status !== 401 && reqC.status !== 403) {
    console.log(`✅ Escenario C (Token ADMIN): Pasó la autorización (Retornó HTTP ${reqC.status}).`)
  } else {
    console.log(`❌ Escenario C falló. Esperaba pasar la autorización, obtuvo ${reqC.status}`, await reqC.text())
  }
}

runTests().catch(console.error)
