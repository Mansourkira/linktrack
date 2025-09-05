"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconLock } from "@tabler/icons-react"

export default function VerifyPage() {
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [slug, setSlug] = useState("")
    const searchParams = useSearchParams()
    const params = useParams()
    const domain = searchParams.get('domain') || 'linktrack.app'
    const error = searchParams.get('error')

    useEffect(() => {
        if (params.slug) {
            setSlug(params.slug as string)
        }
    }, [params.slug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password.trim()) return

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('password', password)
            formData.append('domain', domain)

            const response = await fetch(`/api/redirect/${slug}`, {
                method: 'POST',
                body: formData
            })

            if (response.redirected) {
                window.location.href = response.url
            }
        } catch (error) {
            console.error('Error submitting password:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <IconLock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Protected Link</CardTitle>
                    <CardDescription>
                        This link is password protected. Please enter the password to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        {error === 'invalid_password' && (
                            <div className="text-sm text-red-600 text-center">
                                Incorrect password. Please try again.
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Continue"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>Short code: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code></p>
                        <p>Domain: <code className="bg-gray-100 px-2 py-1 rounded">{domain}</code></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
