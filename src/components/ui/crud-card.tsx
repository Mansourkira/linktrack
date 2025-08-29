import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"

interface CrudCardProps {
    title: string
    description?: string
    actions?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
    headerClassName?: string
    contentClassName?: string
    footerClassName?: string
}

export function CrudCard({
    title,
    description,
    actions,
    children,
    footer,
    className,
    headerClassName,
    contentClassName,
    footerClassName,
}: CrudCardProps) {
    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className={cn("pb-4", headerClassName)}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                        {description && (
                            <CardDescription className="text-sm text-muted-foreground">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className={cn("px-6", contentClassName)}>
                {children}
            </CardContent>

            {footer && (
                <>
                    <Separator />
                    <div className={cn("px-6 py-4", footerClassName)}>
                        {footer}
                    </div>
                </>
            )}
        </Card>
    )
}
