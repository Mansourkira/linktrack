"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthActions } from "@/lib/auth-actions"
import { toast } from "sonner"
import { testDatabaseConnection } from "@/lib/test-db"
import { LinkIcon } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('login')
  const { login, register, isLoading, loadingMessage } = useAuthActions()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check URL hash on component mount
    const hash = window.location.hash.slice(1) // Remove the # symbol
    if (hash === 'signup') {
      setActiveForm('signup')
    } else {
      setActiveForm('login')
    }
  }, [])

  const handleFormSwitch = (form: 'login' | 'signup') => {
    setActiveForm(form)
    setError(null) // Clear errors when switching forms
    // Update URL hash without page reload
    window.history.pushState(null, '', `#${form}`)
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      setError(null)
      await login(email, password)
      toast.success('Logged in successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleSignup = async ({
    email,
    password,
    confirmPassword
  }: {
    email: string;
    password: string;
    confirmPassword: string
  }) => {
    try {
      setError(null)
      await register(email, password, confirmPassword)
      toast.success('Account created successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleTestDatabase = async () => {
    try {
      await testDatabaseConnection()
      toast.success('Database test completed! Check console for results.')
    } catch (err) {
      toast.error('Database test failed!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LinkIcon className="h-4 w-4" />
              </div>
              LinkTrack
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          {/* Loading Message */}
          {isLoading && loadingMessage && (
            <div className="mb-4 rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium text-primary">{loadingMessage}</span>
              </div>
            </div>
          )}

          {/* Debug Button */}
          <div className="mb-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestDatabase}
              className="text-xs"
            >
              🐛 Test Database Connection
            </Button>
          </div>

          {/* Form Toggle Buttons */}
          <div className="mb-6 flex rounded-lg border bg-card/50 backdrop-blur-sm p-1">
            <Button
              variant={activeForm === 'login' ? 'default' : 'ghost'}
              className="flex-1 rounded-md"
              onClick={() => handleFormSwitch('login')}
            >
              Login
            </Button>
            <Button
              variant={activeForm === 'signup' ? 'default' : 'ghost'}
              className="flex-1 rounded-md"
              onClick={() => handleFormSwitch('signup')}
            >
              Sign Up
            </Button>
          </div>

          {/* Form Container */}
          <Card className="bg-card/50 backdrop-blur-sm border shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {activeForm === 'login' ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <CardDescription className="text-base">
                {activeForm === 'login'
                  ? 'Sign in to your LinkTrack account to manage your links'
                  : 'Join LinkTrack and start creating beautiful short links'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeForm === 'login' ? (
                <LoginForm
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <SignupForm
                  onSubmit={handleSignup}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
