"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Skeleton for table view
export function LinksTableSkeleton() {
    return (
        <div className="space-y-4">
            {/* Table header skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
            </div>

            {/* Search skeleton */}
            <Skeleton className="h-10 w-full" />

            {/* Table rows skeleton */}
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Skeleton for card view
export function LinksCardSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search skeleton */}
            <Skeleton className="h-10 w-full" />

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    {/* Short code skeleton */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Skeleton className="h-8 w-24 rounded-lg" />
                                    </div>
                                    {/* Original URL skeleton */}
                                    <Skeleton className="h-4 w-full max-w-[200px]" />
                                </div>
                                {/* Actions skeleton */}
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {/* Stats row skeleton */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-8" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>

                                {/* Status row skeleton */}
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-16" />
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>

                                {/* Actions row skeleton */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-6 w-12" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// Main skeleton component that switches between views
interface LinksSkeletonProps {
    view: "table" | "card"
}

export function LinksSkeleton({ view }: LinksSkeletonProps) {
    return view === "table" ? <LinksTableSkeleton /> : <LinksCardSkeleton />
}

