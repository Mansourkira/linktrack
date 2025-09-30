import { requireAuth } from "@/lib/auth/server-guard"
import { ComingSoon } from "@/components/ComingSoon"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function BulkImportPage() {
    await requireAuth();

    return (
        <div className="space-y-6 p-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IconArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Bulk Import</h1>
                        <p className="text-muted-foreground">Bulk import links from a file</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="Bulk Import"
                description="Bulk import links from a file. You'll be able to import links from a CSV, JSON, URL list, text file, or HTML file."
                features={[
                    "Import links from a CSV file",
                    "Import links from a JSON file",
                    "Import links from a URL list",
                    "Import links from a text file",
                    "Import links from a HTML file"
                ]}
            />


        </div>
    )
}