"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { CrudCard } from "@/components/ui/crud-card"
import { IconPlus, IconLink, IconChartBar, IconSettings } from "@tabler/icons-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="space-y-6 p-6 w-full">
      {/*   <SectionCards /> */}

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

          <div className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors cursor-pointer">
            <IconChartBar className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Analytics</h3>
            <p className="text-sm text-muted-foreground text-center">
              Track link performance
            </p>
          </div>

          <div className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors cursor-pointer">
            <IconSettings className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Settings</h3>
            <p className="text-sm text-muted-foreground text-center">
              Configure your account
            </p>
          </div>
        </div>
      </CrudCard>

      <ChartAreaInteractive />
    </div>
  )
}
