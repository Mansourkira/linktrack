import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function BillingPage() {
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
                        <h1 className="text-2xl font-semibold">Billing</h1>
                        <p className="text-muted-foreground">Manage your billing and subscriptions</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="Billing & Subscriptions"
                description="Manage your plan, view invoices, and update payment methods. This feature is currently under development and will be available soon."
                features={[
                    "View current plan details",
                    "Upgrade or downgrade your subscription",
                    "Access past invoices and receipts",
                    "Update payment information",
                    "Manage billing cycles"
                ]}
            />
        </div>
    )
}
