"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { LinkIcon } from "lucide-react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { ActivityLogger } from "@/modules/analytics"

export default function Page() {
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { user, loading: authCheckLoading } = useAuth()

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    if (!authCheckLoading && user) {
      router.push('/dashboard')
    } else if (!authCheckLoading && !user) {
      setAuthLoading(false)
    }
  }, [user, authCheckLoading, router])

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
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }

      // Log the login activity
      await ActivityLogger.userLogin()

      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
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
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }

      // If email confirm is enabled, try immediate login
      if (!data.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) {
          setError(loginError.message)
          toast.error(loginError.message)
          return
        }
      }

      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  // Show loading screen while checking authentication
  if (authLoading || authCheckLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-lg font-medium">Checking authentication...</span>
          </div>
          <p className="text-muted-foreground">Please wait while we verify your login status</p>
        </div>
      </div>
    )
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
          {/*  {loading && (
            <div className="mb-4 rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium text-primary">
                    {activeForm === 'login' ? 'Signing you in...' : 'Creating your account...'}
                  </span>
                </div>
                <div className="w-full bg-primary/20 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeForm === 'login' ? 'Please wait while we authenticate you...' : 'Setting up your account...'}
                </p>
              </div>
            </div>
          )} */}


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
                  isLoading={loading}
                  error={error}
                  onSwitchToSignup={() => handleFormSwitch('signup')}
                />
              ) : (
                <SignupForm
                  onSubmit={handleSignup}
                  isLoading={loading}
                  error={error}
                  onSwitchToLogin={() => handleFormSwitch('login')}
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
