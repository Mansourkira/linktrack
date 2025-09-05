import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { IconBrandGoogle } from "@tabler/icons-react"

interface LoginFormProps {
  className?: string
  onSubmit?: (data: { email: string; password: string }) => Promise<void>
  isLoading?: boolean
  error?: string | null
  onSwitchToSignup?: () => void
}

export function LoginForm({
  className,
  onSubmit,
  isLoading = false,
  error,
  onSwitchToSignup,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && !isLoading) {
      await onSubmit({ email, password })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {error && (
            <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <a
                href="#"
                className="text-sm text-primary hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <Button variant="outline" className="w-full h-11" disabled={isLoading}>
              <IconBrandGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
