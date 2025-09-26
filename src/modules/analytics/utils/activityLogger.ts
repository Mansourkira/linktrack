import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ActivityAction } from "../types"

interface LogActivityParams {
    action: ActivityAction
    details: string
    shortCode?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    referrer?: string
}

export async function logActivity(params: LogActivityParams): Promise<void> {
    try {
        const supabase = createSupabaseBrowserClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn('Cannot log activity: User not authenticated')
            return
        }

        // Insert activity log
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: user.id,
                action: params.action,
                details: params.details,
                short_code: params.shortCode || null,
                metadata: params.metadata || {},
                ip_address: params.ipAddress || null,
                user_agent: params.userAgent || navigator.userAgent,
                referrer: params.referrer || document.referrer || null
            })

        if (error) {
            console.error('Error logging activity:', error)
        }
    } catch (error) {
        console.error('Error logging activity:', error)
    }
}

// Helper function to get client info
export function getClientInfo() {
    return {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    }
}

// Common activity logging functions
export const ActivityLogger = {
    // Link activities
    linkCreated: (shortCode: string, originalUrl: string) =>
        logActivity({
            action: 'link_created',
            details: `Link "${shortCode}" created for ${originalUrl}`,
            shortCode,
            metadata: { originalUrl }
        }),

    linkUpdated: (shortCode: string, changes: Record<string, any>) =>
        logActivity({
            action: 'link_updated',
            details: `Link "${shortCode}" was updated`,
            shortCode,
            metadata: { changes }
        }),

    linkDeleted: (shortCode: string) =>
        logActivity({
            action: 'link_deleted',
            details: `Link "${shortCode}" was deleted`,
            shortCode
        }),

    linkClicked: (shortCode: string, metadata?: Record<string, any>) =>
        logActivity({
            action: 'link_clicked',
            details: `Link "${shortCode}" was clicked`,
            shortCode,
            metadata: metadata || {}
        }),

    linkActivated: (shortCode: string) =>
        logActivity({
            action: 'link_activated',
            details: `Link "${shortCode}" was activated`,
            shortCode
        }),

    linkDeactivated: (shortCode: string) =>
        logActivity({
            action: 'link_deactivated',
            details: `Link "${shortCode}" was deactivated`,
            shortCode
        }),

    // Domain activities
    domainAdded: (domain: string) =>
        logActivity({
            action: 'domain_added',
            details: `Domain "${domain}" was added`,
            metadata: { domain }
        }),

    domainVerified: (domain: string) =>
        logActivity({
            action: 'domain_verified',
            details: `Domain "${domain}" was verified`,
            metadata: { domain }
        }),

    domainDeleted: (domain: string) =>
        logActivity({
            action: 'domain_deleted',
            details: `Domain "${domain}" was deleted`,
            metadata: { domain }
        }),

    // User activities
    userLogin: () =>
        logActivity({
            action: 'login',
            details: 'User logged in'
        }),

    userLogout: () =>
        logActivity({
            action: 'logout',
            details: 'User logged out'
        }),

    profileUpdated: (changes: Record<string, any>) =>
        logActivity({
            action: 'profile_updated',
            details: 'User profile was updated',
            metadata: { changes }
        })
}
