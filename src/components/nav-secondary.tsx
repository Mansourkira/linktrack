"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavSecondaryProps {
  items: Array<Record<string, unknown>>
  onNavigate?: (url: string) => void
  isNavigating?: boolean
}

export function NavSecondary({ items, onNavigate, isNavigating }: NavSecondaryProps) {
  const pathname = usePathname()

  const handleClick = (url: string) => {
    if (onNavigate) {
      onNavigate(url)
    }
  }

  return (
    <SidebarMenu>
      {items?.map((item: Record<string, unknown>, index: number) => {
        const isActive = pathname === item.url
        const IconComponent = item.icon as React.ComponentType<{ className?: string }>
        return (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              asChild
              disabled={isNavigating}
              isActive={isActive}
              className={isNavigating ? "opacity-50 cursor-pointer" : "cursor-pointer"}
            >
              <Link href={item.url as string} onClick={() => handleClick(item.url as string)}>
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{item.title as string}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
