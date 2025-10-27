import { requireAuth } from "@/lib/auth/server-guard"
import { DomainsPage as DomainsPageComponent } from "@/modules/domains"

export default async function DomainsPage() {
    await requireAuth();

    return <DomainsPageComponent />
}