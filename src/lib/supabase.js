import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As chaves do Supabase não foram encontradas no .env.local")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)