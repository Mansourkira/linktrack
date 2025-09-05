'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export interface Profile {
    id: string
    username: string | null
    email: string | null
    fullName: string | null
    avatarUrl: string | null
    website: string | null
    themeMode: string | null
    createdAt: string
    updatedAt: string
}

export function useProfile() {
    const { user, loading: authLoading } = useUser()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = createSupabaseBrowserClient()

    const fetchProfile = async () => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    // Profile doesn't exist, create one
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            username: null,
                            fullName: null,
                            avatarUrl: null,
                            website: null,
                            themeMode: 'system'
                        })
                        .select()
                        .single()

                    if (createError) {
                        throw createError
                    }

                    setProfile(newProfile)
                } else {
                    throw fetchError
                }
            } else {
                setProfile(data)
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch profile')
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!profile) return

        try {
            setError(null)

            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single()

            if (updateError) {
                throw updateError
            }

            setProfile(data)
            return data
        } catch (err) {
            console.error('Error updating profile:', err)
            setError(err instanceof Error ? err.message : 'Failed to update profile')
            throw err
        }
    }

    const refreshProfile = async () => {
        await fetchProfile()
    }

    useEffect(() => {
        if (!authLoading) {
            fetchProfile()
        }
    }, [user, authLoading])

    return {
        profile,
        loading: authLoading || loading,
        error,
        updateProfile,
        refreshProfile
    }
}

