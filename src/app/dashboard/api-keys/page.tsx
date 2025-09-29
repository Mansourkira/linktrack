import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function BulkImportPage() {
    const user = await requireUser();

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
                        <h1 className="text-2xl font-semibold">API Keys</h1>
                        <p className="text-muted-foreground">Manage your API keys</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="API Keys"
                description="Bulk import links from a file. You'll be able to import links from a CSV, JSON, URL list, text file, or HTML file."
                features={[
                    "Create API keys",
                    "Manage your API keys",
                    "Delete API keys"
                ]}
            />


        </div>
    )
}