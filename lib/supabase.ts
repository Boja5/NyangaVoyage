import { createClient } from '@supabase/supabase-js'
// createClient is the function that creates our Supabase connection

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// The URL of your Supabase project — loaded from .env.local
// The ! tells TypeScript "I guarantee this value exists"

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// The publishable API key — loaded from .env.local

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    // Don't try to save the session to localStorage
    // This prevents the "multiple GoTrueClient instances" warning
    autoRefreshToken: false,
    // Don't automatically refresh auth tokens
    // We don't need this for anonymous database reads
    detectSessionInUrl: false
    // Don't try to read auth tokens from the URL
  }
})