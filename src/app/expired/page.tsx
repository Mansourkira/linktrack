"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconHome, IconClock } from "@tabler/icons-react"

export default function ExpiredPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <IconClock className="h-8 w-8 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Expired</h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    This link has expired, reached its maximum click limit, or is no longer active.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                        <Link href="/">
                            <IconHome className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}
