import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/schemas/schema'

export async function GET(request: NextRequest) {
    try {
        console.log('=== Test DB Route ===')

        // Test 1: Check if we can connect to the database
        console.log('Testing database connection...')
        const [testProfile] = await db
            .select()
            .from(profiles)
            .limit(1)

        console.log('Database connection successful')
        console.log('Sample profile:', testProfile ? 'Found' : 'None')

        // Test 2: Check if we can get cookies
        console.log('Request cookies:', request.cookies.getAll())

        return NextResponse.json({
            success: true,
            message: 'Database connection working',
            hasProfiles: !!testProfile,
            cookieCount: request.cookies.getAll().length
        })

    } catch (error) {
        console.error('Test DB route error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
