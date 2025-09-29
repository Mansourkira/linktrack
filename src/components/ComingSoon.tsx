"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconClock, IconRocket, IconCheck, IconBrandGithub } from "@tabler/icons-react"
import Link from "next/link"

interface ComingSoonProps {
  title?: string
  description?: string
  features?: string[]
  showContact?: boolean
}

export const ComingSoon = ({
  title = "Coming Soon",
  description = "We're building something amazing. Stay tuned for the launch of this feature.",
  features = [],
  showContact = false
}: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <IconRocket className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>

        {features.length > 0 && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">What's Coming</h3>
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-4">
              <IconClock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Feature in development</span>
            </div>

            <Link href="https://github.com/Mansourkira/linktrack" target="_blank" rel="noopener noreferrer" className="block">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <IconBrandGithub className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Contributions welcome on GitHub</span>
              </div>
            </Link>
          </CardContent>
        )}

        {showContact && (
          <CardContent className="pt-0">
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Get notified when this feature launches
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="sm" asChild>
                  <Link href="mailto:hello@linktrack.com">
                    Contact Us
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 