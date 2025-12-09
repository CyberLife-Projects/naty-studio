import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação de variáveis de ambiente obrigatórias
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel')
  throw new Error('Supabase configuration missing. Check environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
