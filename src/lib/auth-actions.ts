'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from './supabaseClient'

export function useAuthActions() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')

    const register = async (email: string, password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.")
        }

        setIsLoading(true)
        setLoadingMessage('Creating your account...')

        try {
            console.log('Starting signup process...')
            const { data, error } = await supabase.auth.signUp({ email, password })

            console.log('Signup response:', { data, error })
            console.log('Session exists:', !!data.session)
            console.log('User exists:', !!data.user)
            console.log('Email confirmation required:', !data.session && !!data.user)

            if (error) {
                console.error('Signup error details:', error)
                throw error
            }

            if (data.session) {
                // Email confirmations are disabled, user is automatically logged in
                console.log('User logged in automatically, redirecting to dashboard')
                setLoadingMessage('Account created! Redirecting...')
                router.replace("/dashboard")
            } else if (data.user) {
                // Email confirmations are enabled, but let's try to auto-login anyway
                console.log('Email confirmation required, attempting auto-login...')
                setLoadingMessage('Logging you in...')

                try {
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    })
                    console.log("loginData is ", loginData)
                    console.log("loginError is ", loginError)
                    if (loginError) {
                        console.log('Auto-login failed, redirecting to verify-email')
                        setLoadingMessage('Redirecting to email verification...')
                        router.replace("/auth/verify-email")
                    } else {
                        console.log('Auto-login successful, redirecting to dashboard')
                        setLoadingMessage('Login successful! Redirecting...')
                        router.replace("/dashboard")
                    }
                } catch (loginErr) {
                    console.log('Auto-login error, redirecting to verify-email')
                    setLoadingMessage('Redirecting to email verification...')
                    router.replace("/auth/verify-email")
                }
            } else {
                // Something unexpected happened
                console.error('Unexpected signup response - no session and no user')
                throw new Error('Signup failed - unexpected response')
            }
        } catch (err) {
            console.error('Signup failed:', err)
            throw err
        } finally {
            setIsLoading(false)
            setLoadingMessage('')
        }
    }

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setLoadingMessage('Signing you in...')

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })

            if (error) throw error

            setLoadingMessage('Login successful! Redirecting...')
            router.replace("/dashboard")
        } finally {
            setIsLoading(false)
            setLoadingMessage('')
        }
    }

    const logout = async () => {
        setIsLoading(true)
        setLoadingMessage('Signing you out...')

        try {
            const { error } = await supabase.auth.signOut()

            if (error) throw error

            setLoadingMessage('Redirecting...')
            router.replace("/auth")
        } finally {
            setIsLoading(false)
            setLoadingMessage('')
        }
    }

    return {
        register,
        login,
        logout,
        isLoading,
        loadingMessage
    }
}
