import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Supabase bilgileri eksik! Lütfen projeye .env dosyası ekleyin. Şu an sayfa çökmesin diye sahte verilerle çalışıyor, giriş/kayıt işlemleri başarısız olacaktır.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
