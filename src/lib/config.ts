// src/lib/config.ts

export const config = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.vbxvtexvxtvewuuspdwo:123456789Azertyuiop12wx@aws-0-eu-north-1.pooler.supabase.com:6543/postgres"',
  },

  // Feature flags
  features: {
    showComingSoon: process.env.NEXT_PUBLIC_SHOW_COMING_SOON === 'true' || false,
  },

  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbxvtexvxtvewuuspdwo.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieHZ0ZXh2eHR2ZXd1dXNwZHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzIwNjYsImV4cCI6MjA2OTc0ODA2Nn0.42jxkTtEPF-YQIWm0N_3VRsoXnkl84jS3jOrHnFTx10',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieHZ0ZXh2eHR2ZXd1dXNwZHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE3MjA2NiwiZXhwIjoyMDY5NzQ4MDY2fQ.x5Yo6fz0mgropjXIigC5nZMj4YewGM09UFyIoKSmsj4',
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'linktrack-app',
      },
    },
  },

  // App configuration
  app: {
    name: 'LinkTrack',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
} as const; 