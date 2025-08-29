"use client"

import Link from "next/link"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: any
  }[]
  onNavigate?: (url: string) => void
  isNavigating?: boolean
}

export function NavMain({ items, onNavigate, isNavigating }: NavMainProps) {
  const handleClick = (url: string) => {
    if (onNavigate) {
      onNavigate(url)
    }
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            disabled={isNavigating}
            className={isNavigating ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Link href={item.url} onClick={() => handleClick(item.url)}>
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
