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
                        <h1 className="text-2xl font-semibold">Settings</h1>
                        <p className="text-muted-foreground">Manage your settings</p>
                    </div>
                </div>
            </div>

            <ComingSoon
                title="Settings"
                description="Manage your settings. You'll be able to manage your settings, such as your profile, your password, and your email."
                features={[
                    "Manage your profile",
                    "Manage your password",
                    "Manage your email",
                    "Manage your notifications",
                    "Manage your integrations"
                ]}
            />


        </div>
    )
}