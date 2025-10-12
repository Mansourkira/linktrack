"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    redirectTo?: string
}

export function AuthGuard({
    children,
    fallback,
    redirectTo = "/auth"
}: AuthGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push(redirectTo)
        }
    }, [user, loading, router, redirectTo])

    // Show loading state while checking authentication
    if (loading) {
        return fallback || <AuthGuardSkeleton />
    }

    // Don't render children if not authenticated (will redirect)
    if (!user) {
        return null
    }

    return <>{children}</>
}

// Default skeleton for auth guard loading
function AuthGuardSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="space-y-4 w-full max-w-md p-6">
                <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    )
}

