import { useAuth } from '@/components/auth/AuthProvider'

export function useUser() {
    const { user, session, loading } = useAuth()

    return {
        user,
        session,
        loading,
        isAuthenticated: !!user,
        // Helper methods
        email: user?.email,
        id: user?.id,
    }
}
