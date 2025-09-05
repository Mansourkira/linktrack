// Test file to debug database issues
import { createSupabaseBrowserClient } from './supabase/client'

export async function testDatabaseConnection() {
    console.log('=== Testing Database Connection ===')

    try {
        // Test 1: Check if we can connect to Supabase
        console.log('1. Testing Supabase connection...')
        const supabase = createSupabaseBrowserClient()
        const { data: authData, error: authError } = await supabase.auth.getSession()
        console.log('Auth connection:', authError ? '❌ Failed' : '✅ Success')
        if (authError) console.error('Auth error:', authError)

        // Test 2: Check if profiles table exists and is accessible
        console.log('2. Testing profiles table access...')
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1)

        console.log('Profiles table access:', profileError ? '❌ Failed' : '✅ Success')
        if (profileError) console.error('Profile error:', profileError)

        // Test 3: Check table structure
        console.log('3. Checking table structure...')
        if (profileData !== null) {
            console.log('Profiles table columns:', Object.keys(profileData[0] || {}))
        }

        console.log('=== Database Test Complete ===')

    } catch (error) {
        console.error('Database test failed:', error)
    }
}
