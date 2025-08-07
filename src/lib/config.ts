export const config = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Feature flags
  features: {
    showComingSoon: process.env.NEXT_PUBLIC_SHOW_COMING_SOON === 'true',
  },
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
} as const; 