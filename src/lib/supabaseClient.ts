import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Get Supabase configuration from centralized config
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

// Debug logging
console.log('=== Supabase Client Environment Check ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing')
console.log('========================================')

// Validate environment variables
if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your .env.local file.')
}

// Create and export Supabase client with configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: config.supabase.auth,
    realtime: config.supabase.realtime,
    global: config.supabase.global,
})
