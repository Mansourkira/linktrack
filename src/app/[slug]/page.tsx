import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Metadata } from "next"

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
            .single()

        console.log('📊 Database query result:', { link, error: dbError })

        if (dbError) {
            console.error('❌ Database error:', dbError)

            // Check if it's a "no rows returned" error
            if (dbError.code === 'PGRST116') {
                console.log('🔍 No rows found, checking if link exists without isActive filter...')

                // Try to find the link without the isActive filter to see if it exists
                const { data: existingLink, error: checkError } = await supabase
                    .from('links')
                    .select('shortCode, isActive, originalUrl')
                    .eq('shortCode', slug)
                    .single()

                console.log('🔍 Link check result:', { existingLink, error: checkError })

                if (existingLink) {
                    if (!existingLink.isActive) {
                        console.log('⚠️ Link exists but is inactive')
                        return (
                            <div className="min-h-screen flex items-center justify-center bg-background">
                                <div className="text-center space-y-4">
                                    <h1 className="text-2xl font-semibold text-destructive">Link Inactive</h1>
                                    <p className="text-muted-foreground">
                                        The link <code className="bg-muted px-2 py-1 rounded">/{slug}</code> exists but is currently inactive.
                                    </p>
                                </div>
                            </div>
                        )
                    }
                }
            }

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
