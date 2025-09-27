"use client"

import { IconLayoutGrid, IconTable } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ViewSwitcherProps {
    view: "table" | "card"
    onViewChange: (view: "table" | "card") => void
    className?: string
}

export function ViewSwitcher({ view, onViewChange, className }: ViewSwitcherProps) {
    return (
        <div className={cn("flex items-center border rounded-md", className)}>
            <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("table")}
                className="rounded-r-none border-r"
            >
                <IconTable className="h-4 w-4" />
                <span className="sr-only">Table view</span>
            </Button>
            <Button
                variant={view === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("card")}
                className="rounded-l-none"
            >
                <IconLayoutGrid className="h-4 w-4" />
                <span className="sr-only">Card view</span>
            </Button>
        </div>
    )
}
