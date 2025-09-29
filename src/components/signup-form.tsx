import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { IconBrandGoogle } from "@tabler/icons-react"

interface SignupFormProps {
  className?: string
  onSubmit?: (data: { email: string; password: string; confirmPassword: string }) => Promise<void>
  isLoading?: boolean
  error?: string | null
  onSwitchToLogin?: () => void
}

export function SignupForm({
  className,
  onSubmit,
  isLoading = false,
  error,
  onSwitchToLogin,
  ...props
}: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && !isLoading) {
      await onSubmit({ email, password, confirmPassword })
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
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />

            <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            {/*  <Button variant="outline" className="w-full h-11" disabled={isLoading}>
              <IconBrandGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button> */}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  )
}
