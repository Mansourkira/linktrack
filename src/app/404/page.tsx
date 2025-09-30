"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconHome, IconArrowLeft, IconLink, IconSearch, IconAlertTriangle } from "@tabler/icons-react"

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                        <IconAlertTriangle className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Link Not Found
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            The short link you're looking for doesn't exist or has been removed.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <IconLink className="h-4 w-4" />
                            <span>Error Code: 404</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This could happen if:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 text-left">
                            <li>• The link was mistyped</li>
                            <li>• The link has been deleted</li>
                            <li>• The link has expired</li>
                            <li>• The link is inactive</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/">
                                <IconHome className="mr-2 h-4 w-4" />
                                Go to Homepage
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                            <IconArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                        <Button variant="ghost" asChild className="w-full">
                            <Link href="/dashboard">
                                <IconSearch className="mr-2 h-4 w-4" />
                                Create New Link
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center space-y-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Need help? Contact support or check our documentation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
