"use server"

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerSideUser as getServerSideUserSSR } from './auth-status'

export function AuthStatus() {
    const { user, loading, error, fetchUser, clearAuth } = useAuthStore()

    useEffect(() => {
        // Fetch user on component mount
        fetchUser()
    }, [fetchUser])

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">Loading user...</div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Authentication Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchUser}>Retry</Button>
                </CardContent>
            </Card>
        )
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Not Authenticated</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Please sign in to continue.</p>
                    <Button onClick={fetchUser}>Check Auth Status</Button>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Authenticated User</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email || 'No email'}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <Button
                    onClick={clearAuth}
                    variant="outline"
                    className="mt-4"
                >
                    Clear Auth
                </Button>
            </CardContent>
        </Card>
    )
}

export async function getServerSideUser() {
    // This function should not be used in server contexts
    // Use getAuthenticatedUserWithProfile from @/lib/auth/server instead
    throw new Error('getServerSideUser is deprecated. Use getAuthenticatedUserWithProfile from @/lib/auth/server for server-side auth.')
}
