"use client"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { CrudCard } from "@/components/ui/crud-card"
import { IconPlus, IconLink, IconChartBar, IconSettings } from "@tabler/icons-react"
import Link from "next/link"
import { StatsCards } from "@/modules/analytics/components/stats-cards"
import { useAnalytics } from "@/modules/analytics"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading, error, filters, updateFilters, refreshData } = useAnalytics()

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }
  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-lg">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Failed to Load Analytics</h2>
            <p className="text-muted-foreground">{error || 'Unknown error occurred'}</p>
            <Button onClick={refreshData}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 w-full">
      {/* <SectionCards /> */}
      <StatsCards data={data} />
      {/* Quick Actions */}
      <CrudCard
        title="Quick Actions"
        description="Get started with your link tracking journey"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/links">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors cursor-pointer">
              <IconPlus className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Create Link</h3>
              <p className="text-sm text-muted-foreground text-center">
                Create your first short link
              </p>
            </div>
          </Link>

          <Link href="/dashboard/links">
            <div className="flex flex-col items-center p-6 border rounded-lg bg-accent border-accent-foreground">
              <IconLink className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Manage Links</h3>
              <p className="text-sm text-muted-foreground text-center">
                View and edit all your links
              </p>
            </div>
          </Link>

          <Link href="/dashboard/analytics">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors cursor-pointer">
              <IconChartBar className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground text-center">
                Track link performance
              </p>
            </div>
          </Link>

          <Link href="/dashboard/domains">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors cursor-pointer">
              <IconSettings className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Domains</h3>
              <p className="text-sm text-muted-foreground text-center">
                Manage your domains
              </p>
            </div>
          </Link>
        </div>
      </CrudCard>

      <ChartAreaInteractive
        filters={filters}
        onTimeRangeChange={(timeRange) => updateFilters({ dateRange: timeRange as any })}
      />
    </div>
  )
}
