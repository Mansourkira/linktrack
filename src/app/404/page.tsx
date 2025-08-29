import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconHome, IconArrowLeft } from "@tabler/icons-react"

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Link Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    The short link you're looking for doesn't exist or has been removed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                        <Link href="/">
                            <IconHome className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <IconArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}
