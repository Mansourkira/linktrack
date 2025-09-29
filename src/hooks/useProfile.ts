'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useUser } from './useUser'
import { toast } from 'sonner'

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
        if (!profile) {
            throw new Error('Profile not found')
        }

        try {
            setError(null)

            // Validate username if provided
            if (updates.username !== undefined) {
                if (updates.username && updates.username.length < 3) {
                    throw new Error('Username must be at least 3 characters long')
                }
                if (updates.username && !/^[a-zA-Z0-9_]+$/.test(updates.username)) {
                    throw new Error('Username can only contain letters, numbers, and underscores')
                }
            }

            // Validate website URL if provided
            if (updates.website !== undefined && updates.website) {
                try {
                    new URL(updates.website)
                } catch {
                    throw new Error('Please enter a valid URL')
                }
            }

            // Validate theme mode
            if (updates.themeMode && !['light', 'dark', 'system'].includes(updates.themeMode)) {
                throw new Error('Invalid theme mode')
            }

            const updateData: any = {
                ...updates,
                updatedAt: new Date().toISOString()
            }

            // Remove undefined values to avoid overwriting with null
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key]
                }
            })

            const { data, error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', profile.id)
                .select()
                .single()

            if (updateError) {
                console.error('Supabase update error:', updateError)

                // Handle specific error cases
                if (updateError.code === '23505') {
                    if (updateError.message.includes('username')) {
                        throw new Error('Username is already taken')
                    }
                    if (updateError.message.includes('email')) {
                        throw new Error('Email is already in use')
                    }
                }

                throw new Error(updateError.message || 'Failed to update profile')
            }

            setProfile(data)
            return data
        } catch (err) {
            console.error('Error updating profile:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
            setError(errorMessage)
            toast.error(errorMessage)
            throw err
        }
    }

    const uploadAvatar = async (file: File): Promise<string | null> => {
        if (!profile) {
            throw new Error('Profile not found')
        }

        try {
            setError(null)

            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select an image file')
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image size must be less than 5MB')
            }

            // Check if bucket exists, create if not
            const { data: buckets, error: listError } = await supabase.storage.listBuckets()
            if (listError) {
                console.error('Error listing buckets:', listError)
                throw new Error('Failed to access storage')
            }

            const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars')
            if (!avatarsBucket) {
                // Create the avatars bucket
                const { error: createError } = await supabase.storage.createBucket('avatars', {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                })

                if (createError) {
                    console.error('Error creating bucket:', createError)
                    throw new Error('Failed to create storage bucket. Please contact support.')
                }
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Avatar upload error:', uploadError)
                throw new Error(uploadError.message || 'Failed to upload avatar')
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (err) {
            console.error('Error uploading avatar:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
            setError(errorMessage)
            toast.error(errorMessage)
            throw err
        }
    }

    const removeAvatar = async (): Promise<void> => {
        if (!profile?.avatarUrl) {
            throw new Error('No avatar to remove')
        }

        try {
            setError(null)

            // Remove from storage if it's a custom upload
            if (profile.avatarUrl.includes('avatars/')) {
                const filePath = profile.avatarUrl.split('/').pop()
                if (filePath) {
                    const { error: removeError } = await supabase.storage
                        .from('avatars')
                        .remove([`avatars/${filePath}`])

                    if (removeError) {
                        console.error('Avatar removal error:', removeError)
                        // Don't throw here, just log - we still want to remove the URL from profile
                    }
                }
            }

            // Update profile to remove avatar URL
            await updateProfile({
                avatarUrl: null
            })

            toast.success('Avatar removed successfully')
        } catch (err) {
            console.error('Error removing avatar:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar'
            setError(errorMessage)
            toast.error(errorMessage)
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
        uploadAvatar,
        removeAvatar,
        refreshProfile
    }
}

