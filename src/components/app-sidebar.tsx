"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
interface SidebarConfig {
  company: {
    name: string
    logo: string
  }
  navMain: Array<Record<string, unknown>>
  navClouds: Array<Record<string, unknown>>
  navSecondary?: Array<Record<string, unknown>>
  documents?: Array<Record<string, unknown>>
}

const processConfig = (config: SidebarConfig) => {
  const processNavItems = (items: Array<Record<string, unknown>>): Array<Record<string, unknown>> => {
    return items?.map((item: Record<string, unknown>) => ({
      ...item,
      icon: iconMap[item.icon as keyof typeof iconMap],
      items: item.items ? processNavItems(item.items as Array<Record<string, unknown>>) : undefined
    }))
  }

  const processNavSections = (sections: Array<Record<string, unknown>>): Array<Record<string, unknown>> => {
    return sections?.map((section: Record<string, unknown>) => ({
      ...section,
      items: processNavItems(section.items as Array<Record<string, unknown>>)
    }))
  }

  return {
    ...config,
    navMain: processNavSections(config.navMain),
    navClouds: processNavItems(config.navClouds),
    navSecondary: config.navSecondary ? processNavItems(config.navSecondary) : [],
    documents: config.documents ? processNavItems(config.documents) : []
  }
}

const data = processConfig(sidebarConfig)

// Component to render sectioned navigation
function SectionedNavMain({ sections, onNavigate, isNavigating }: {
  sections: Array<Record<string, unknown>>
  onNavigate: (url: string) => void
  isNavigating: boolean
}) {
  return (
    <>
      {sections.map((section: any, index: number) => (
        <SidebarGroup key={section.section}>
          <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain
              items={section.items}
              onNavigate={onNavigate}
              isNavigating={isNavigating}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

// Search component that shows/hides based on sidebar state
function SidebarSearch() {
  const { state } = useSidebar()
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log("Searching for:", searchQuery)
  }

  // Hide search completely when collapsed
  if (state === "collapsed") {
    return null
  }

  return (
    <div className="px-2 py-2">
      <form onSubmit={handleSearch} className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 w-full bg-sidebar-accent border-sidebar-accent-foreground/20 text-sidebar-accent-foreground placeholder:text-sidebar-accent-foreground/60"
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
            <SidebarMenuButton asChild tooltip={data.company.name}>
              <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 transition-all duration-200 overflow-hidden">
                  <Image
                    src="/linktrack.png"
                    alt={data.company.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-contain group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 transition-all duration-200"
                  />
                </div>
                <span className="font-bold group-data-[collapsible=icon]:hidden transition-all duration-200">{data.company.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSearch />
        <SectionedNavMain sections={data.navMain} onNavigate={handleNavigation} isNavigating={isNavigating} />
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSecondary items={data.navSecondary} onNavigate={handleNavigation} isNavigating={isNavigating} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
