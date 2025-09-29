import { requireUser } from "@/lib/auth/server"
import { ComingSoon } from "@/components/ComingSoon"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function IntegrationsPage() {
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
                        <h1 className="text-2xl font-semibold">Integrations</h1>
                        <p className="text-muted-foreground">Integrate with other services</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="Integrations"
                description="Integrate with other services. You'll be able to integrate with Google Analytics, Google Tag Manager, Google Ads, Google Search Console, and Google My Business."
                features={[
                    "Integrate with Google Analytics",
                    "Integrate with Google Tag Manager",
                    "Integrate with Google Ads",
                    "Integrate with Google Search Console",
                    "Integrate with Google My Business"
                ]}
            />


        </div>
    )
}