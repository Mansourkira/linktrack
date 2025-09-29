import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function DomainsPage() {
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
                        <h1 className="text-2xl font-semibold">Domains</h1>
                        <p className="text-muted-foreground">Manage your domains</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="Domains Management"
                description="Custom domain management and configuration will be available soon. You'll be able to add your own domains, configure DNS settings, and manage domain-specific settings."
                features={[
                    "Add custom domains",
                    "DNS configuration",
                    "Domain verification",
                    "SSL certificate management",
                    "Domain-specific analytics"
                ]}
            />


        </div>
    )
}