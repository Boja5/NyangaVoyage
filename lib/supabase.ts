
/*
 * ============================================================
 * FILE: lib/supabase.ts
 * WHAT THIS FILE DOES:
 *   This file creates the CONNECTION to our Supabase database.
 *   Supabase is our backend — it stores all trips, seats, bookings,
 *   and agencies in a PostgreSQL database hosted in the cloud.
 *
 *   This file exports a single "supabase" object that every other
 *   file imports to read/write data. Think of it as the phone line
 *   to the database — you only set it up once.
 *
 * HOW IT WORKS:
 *   createClient(URL, KEY) connects to our Supabase project.
 *   The URL and KEY come from .env.local (never committed to GitHub).
 *   persistSession: false — we don't need user login sessions
 *   autoRefreshToken: false — we don't use auth tokens
 *
 * USAGE EXAMPLE:
 *   import { supabase } from '@/lib/supabase'
 *   const { data } = await supabase.from('trips').select('*')
 *   // data now contains all trips from the database
 * ============================================================
 */

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