"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { getBaseUrl } from "@/modules/links/config"

interface RedirectPageProps {
    params: {
        slug: string
    }
}

export default function RedirectPage({ params }: RedirectPageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Get the short code from the URL
                const shortCode = params.slug

                // Query the database for the link
                const { data: link, error: dbError } = await supabase
                    .from('links')
                    .select('*')
                    .eq('shortCode', shortCode)
                    .eq('isActive', true)
                    .single()

                if (dbError) {
                    if (dbError.code === 'PGRST116') {
                        setError('Link not found')
                    } else {
                        console.error('Database error:', dbError)
                        setError('Failed to load link')
                    }
                    return
                }

                if (!link) {
                    setError('Link not found')
                    return
                }

                // Increment click count
                await supabase
                    .from('links')
                    .update({ clickCount: link.clickCount + 1 })
                    .eq('id', link.id)

                // Set the redirect URL
                setRedirectUrl(link.originalUrl)

                // Redirect after a short delay to show loading state
                setTimeout(() => {
                    window.location.href = link.originalUrl
                }, 1000)

            } catch (err) {
                console.error('Redirect error:', err)
                setError('An error occurred while redirecting')
            } finally {
                setIsLoading(false)
            }
        }

        handleRedirect()
    }, [params.slug])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                    <h1 className="text-xl font-semibold">Redirecting...</h1>
                    <p className="text-muted-foreground">Please wait while we redirect you to your destination.</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-semibold text-destructive">Redirect Failed</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <p className="text-sm text-muted-foreground">
                        The link <code className="bg-muted px-2 py-1 rounded">{getBaseUrl()}/{params.slug}</code> could not be found or is inactive.
                    </p>
                </div>
            </div>
        )
    }

    if (redirectUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                    <h1 className="text-xl font-semibold">Redirecting...</h1>
                    <p className="text-muted-foreground">
                        Redirecting to: <span className="font-mono text-sm break-all">{redirectUrl}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        If you are not redirected automatically, <a href={redirectUrl} className="text-primary hover:underline">click here</a>.
                    </p>
                </div>
            </div>
        )
    }

    return null
}
