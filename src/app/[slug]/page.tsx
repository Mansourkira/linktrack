import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { PasswordPromptCard } from "./components/password-prompt-card"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params

    try {
        const supabase = await createSupabaseServerClient()
        const { data: link, error } = await supabase
            .from('links')
            .select('originalUrl, isPasswordProtected')
            .eq('shortCode', slug)
            .eq('isActive', true)
            .is('deletedAt', null)  // Exclude soft-deleted links
            .maybeSingle()

        if (link && !error) {
            if (link.isPasswordProtected) {
                return {
                    title: `Protected Link - ${slug}`,
                    description: "This link is password protected. Enter the password to continue.",
                }
            } else {
                return {
                    title: `Redirecting...`,
                    description: "You are being redirected to the destination URL.",
                }
            }
        }
    } catch (error) {
        // Fallback metadata
    }

    return {
        title: `Link Not Found - ${slug}`,
        description: "The requested link could not be found.",
    }
}

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function RedirectPage({ params }: PageProps) {
    const { slug } = await params

    try {
        console.log('🔍 Looking for link with slug:', slug)

        // Query the database for the link using correct column names
        const supabase = await createSupabaseServerClient()
        const { data: link, error: dbError } = await supabase
            .from('links')
            .select('*')
            .eq('shortCode', slug)  // Using camelCase as per your database
            .eq('isActive', true)   // Using camelCase as per your database
            .is('deletedAt', null)  // Exclude soft-deleted links
            .maybeSingle()

        console.log('📊 Database query result:', { link, error: dbError })

        if (dbError) {
            console.error('❌ Database error:', dbError)
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-semibold text-destructive">Database Error</h1>
                        <p className="text-muted-foreground">
                            Error: {dbError.message}
                        </p>
                        <p className="text-muted-foreground">
                            Code: {dbError.code}
                        </p>
                    </div>
                </div>
            )
        }

        if (!link) {
            console.log('❌ No link data returned')
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-semibold text-destructive">Link Not Found</h1>
                        <p className="text-muted-foreground">
                            The link <code className="bg-muted px-2 py-1 rounded">/{slug}</code> could not be found.
                        </p>
                    </div>
                </div>
            )
        }

        console.log('✅ Link found:', link)

        // Check if link is expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            console.log('⏰ Link has expired')
            return (
                <html>
                    <head>
                        <meta httpEquiv="refresh" content="0;url=/expired" />
                        <title>Link Expired</title>
                    </head>
                    <body>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `window.location.href = "/expired";`,
                            }}
                        />
                    </body>
                </html>
            )
        }

        // Check if max clicks reached
        if (link.maxClicks && link.clickCount >= link.maxClicks) {
            console.log('🚫 Link has reached maximum clicks')
            return (
                <html>
                    <head>
                        <meta httpEquiv="refresh" content="0;url=/expired" />
                        <title>Link Expired</title>
                    </head>
                    <body>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `window.location.href = "/expired";`,
                            }}
                        />
                    </body>
                </html>
            )
        }

        // Check if link is password protected
        if (link.isPasswordProtected) {
            console.log('🔒 Link is password protected, showing password prompt')
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                    <PasswordPromptCard
                        slug={slug}
                        originalUrl={link.originalUrl}
                    />
                </div>
            )
        }

        // Link is not password protected, proceed with normal redirect
        console.log('🔓 Link is not password protected, proceeding with redirect')

        // Increment click count using correct column name
        const { error: updateError } = await supabase
            .from('links')
            .update({ clickCount: link.clickCount + 1 })  // Using camelCase as per your database
            .eq('id', link.id)

        if (updateError) {
            console.error('⚠️ Failed to increment click count:', updateError)
            // Continue with redirect even if click tracking fails
        } else {
            console.log('📈 Click count incremented successfully')
        }

        // Use client-side redirect instead of server-side redirect
        console.log('🔄 Redirecting to:', link.originalUrl)

        return (
            <html>
                <head>
                    <meta httpEquiv="refresh" content={`0;url=${link.originalUrl}`} />
                    <title>Redirecting...</title>
                </head>
                <body>
                    <div className="min-h-screen flex items-center justify-center bg-background">
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-semibold">Redirecting...</h1>
                            <p className="text-muted-foreground">
                                You are being redirected to the destination URL.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                If you are not redirected automatically,{' '}
                                <a
                                    href={link.originalUrl}
                                    className="text-primary underline hover:no-underline"
                                >
                                    click here
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.location.href = "${link.originalUrl}";
                            `,
                        }}
                    />
                </body>
            </html>
        )

    } catch (err) {
        console.error('💥 Redirect error:', err)
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-semibold text-destructive">Redirect Failed</h1>
                    <p className="text-muted-foreground">An error occurred while redirecting.</p>
                    <p className="text-sm text-muted-foreground">
                        Error: {err instanceof Error ? err.message : 'Unknown error'}
                    </p>
                </div>
            </div>
        )
    }
}
