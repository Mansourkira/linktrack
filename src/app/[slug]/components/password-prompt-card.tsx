"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconLock, IconEye, IconEyeOff, IconShield, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface PasswordPromptCardProps {
    slug: string
    originalUrl: string
}

export function PasswordPromptCard({ slug, originalUrl }: PasswordPromptCardProps) {
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password.trim()) {
            setError("Password is required")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('password', password)
            formData.append('domain', window.location.host)

            console.log('Submitting password for slug:', slug)
            console.log('Domain:', window.location.host)

            const response = await fetch(`/api/redirect/${slug}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json, text/html, */*'
                }
            })

            console.log('Response status:', response.status)
            console.log('Response redirected:', response.redirected)
            console.log('Response URL:', response.url)

            if (response.redirected) {
                // Password was correct, redirect to the original URL
                console.log('Password correct, redirecting to:', response.url)
                window.location.href = response.url
            } else if (response.ok) {
                // If response is ok but not redirected, it might be a JSON response
                try {
                    const result = await response.json()
                    console.log('Response result:', result)
                    if (result?.error) {
                        setError(result.error)
                    } else {
                        setError("Invalid password. Please try again.")
                    }
                } catch (jsonError) {
                    console.error('Error parsing JSON response:', jsonError)
                    setError("Invalid password. Please try again.")
                }
            } else {
                // Handle HTTP error status
                console.error('HTTP error:', response.status, response.statusText)
                try {
                    const errorResult = await response.json()
                    setError(errorResult.error || "An error occurred. Please try again.")
                } catch (jsonError) {
                    setError(`Server error (${response.status}). Please try again.`)
                }
            }
        } catch (error) {
            console.error('Error submitting password:', error)
            setError("Network error. Please check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-300">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg animate-pulse">
                    <IconShield className="h-8 w-8 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Protected Link
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        This link is password protected. Please enter the password to continue.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError(null)
                                }}
                                className="pr-10 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200"
                                required
                                autoFocus
                                disabled={isSubmitting}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={togglePasswordVisibility}
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <IconEyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <IconEye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <IconLock className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-700 dark:text-red-300">
                                {error}
                            </span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isSubmitting || !password.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <IconLock className="mr-2 h-4 w-4" />
                                Continue
                            </>
                        )}
                    </Button>
                </form>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Short code: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">{slug}</code>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Protected by LinkTrack
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
