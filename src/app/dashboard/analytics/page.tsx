import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"

export default async function AnalyticsPage() {
    const user = await requireUser();

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Track and analyze your link performance</p>
                </div>
            </div>

            <ComingSoon
                title="Analytics Dashboard"
                description="Comprehensive analytics and reporting features are coming soon. Get detailed insights into your link performance, visitor behavior, and traffic patterns."
                features={[
                    "Real-time click tracking",
                    "Geographic analytics",
                    "Device and browser insights",
                    "Referrer tracking",
                    "Custom date ranges",
                    "Export reports",
                    "Performance metrics"
                ]}
            />
        </div>
    )
}