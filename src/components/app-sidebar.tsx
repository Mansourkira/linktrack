"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Icon mapping for dynamic icon loading
const iconMap = {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
}

// Import sidebar configuration
import sidebarConfig from '../../sidebar-config.json'

// Process the configuration to map icon strings to actual icon components
const processConfig = (config: any) => {
  const processNavItems = (items: any[]): any[] => {
    return items?.map((item: any) => ({
      ...item,
      icon: iconMap[item.icon as keyof typeof iconMap],
      items: item.items ? processNavItems(item.items) : undefined
    }))
  }

  return {
    ...config,
    navMain: processNavItems(config.navMain),
    navClouds: processNavItems(config.navClouds),
    navSecondary: processNavItems(config.navSecondary),
    documents: processNavItems(config.documents)
  }
}

const data = processConfig(sidebarConfig)

// Search component that shows/hides based on sidebar state
function SidebarSearch() {
  const { state } = useSidebar()
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log("Searching for:", searchQuery)
  }

  if (state === "collapsed") {
    return null
  }

  return (
    <div className="px-3 py-2">
      <form onSubmit={handleSearch} className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-sidebar-accent border-sidebar-accent-foreground/20 text-sidebar-accent-foreground placeholder:text-sidebar-accent-foreground/60"
        />
      </form>
    </div>
  )
}

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)

  const handleNavigation = (url: string) => {
    if (url === pathname) return // Don't navigate if already on the page

    setIsNavigating(true)
    router.push(url)

    // Reset navigation state after a short delay
    setTimeout(() => {
      setIsNavigating(false)
    }, 1000)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconInnerShadowTop className="h-4 w-4" />
                </div>
                <span className="font-bold">{data.company.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSearch />
        <NavMain items={data.navMain} onNavigate={handleNavigation} isNavigating={isNavigating} />
        <NavSecondary items={data.navSecondary} onNavigate={handleNavigation} isNavigating={isNavigating} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
