import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"

export default async function DomainsPage() {
    const user = await requireUser();

    return (
        <div className="space-y-6 p-6 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Domains Management</h1>
                    <p className="text-muted-foreground">Manage your custom domains and settings</p>
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