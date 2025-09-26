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
  items: {
    title: string
    url: string
    icon?: any
  }[]
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
      {items?.map((item: any, index: number) => {
        const isActive = pathname === item.url
        return (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              asChild
              disabled={isNavigating}
              isActive={isActive}
              className={isNavigating ? "opacity-50 cursor-pointer" : "cursor-pointer"}
            >
              <Link href={item.url} onClick={() => handleClick(item.url)}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
