import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: entities, error } = await supabase.from('entities').select('*').limit(2)
  if (error) {
    console.error('Error fetching entities:', error)
  }
  
  const { data: options, error: optError } = await supabase.from('battle_options').select('*').limit(5)
  if (optError) {
    console.error('Error fetching options:', optError)
  }
  
  console.log('Sample entities:', JSON.stringify(entities, null, 2))
  console.log('Sample options:', JSON.stringify(options, null, 2))
}
main()
