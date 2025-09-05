import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

// Extended user interface that includes profile data
interface UserProfile {
    id: string
    username: string | null
    fullName: string | null
    avatarUrl: string | null
    website: string | null
    themeMode: string | null
    createdAt: string
    updatedAt: string
}

interface ExtendedUser extends User {
    profile?: UserProfile
}

interface AuthState {
    user: ExtendedUser | null
    loading: boolean
    error: string | null
    fetchUser: () => Promise<void>
    setUser: (user: ExtendedUser | null) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearAuth: () => void
    refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: false,
    error: null,

    fetchUser: async () => {
        try {
            set({ loading: true, error: null })

            // Import supabase client dynamically to avoid SSR issues
            const { supabase } = await import('@/lib/supabase/client')
            const { data: { user }, error } = await supabase.auth.getUser()
            console.log('user', user)
            if (error) {
                set({ user: null, error: error.message, loading: false })
                return
            }

            if (!user) {
                set({ user: null, error: null, loading: false })
                return
            }

            // Fetch profile data from the database
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.warn('Profile fetch error:', profileError)
                // Don't fail completely if profile fetch fails, just use auth user
            }

            // Create extended user with profile data
            const extendedUser: ExtendedUser = {
                ...user,
                profile: profile || undefined
            }

            set({ user: extendedUser, error: null, loading: false })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
            set({ user: null, error: errorMessage, loading: false })
        }
    },

    setUser: (user: ExtendedUser | null) => {
        set({ user, error: null })
    },

    setLoading: (loading: boolean) => {
        set({ loading })
    },

    setError: (error: string | null) => {
        set({ error })
    },

    clearAuth: () => {
        set({ user: null, loading: false, error: null })
    },

    refreshProfile: async () => {
        const currentUser = get().user
        if (!currentUser) return

        try {
            const { supabase } = await import('@/lib/supabase/client')

            // Fetch updated profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single()

            if (profileError && profileError.code !== 'PGRST116') {
                console.warn('Profile refresh error:', profileError)
                return
            }

            // Update user with new profile data
            const updatedUser: ExtendedUser = {
                ...currentUser,
                profile: profile || undefined
            }

            set({ user: updatedUser })
        } catch (err) {
            console.error('Failed to refresh profile:', err)
        }
    },
})) 