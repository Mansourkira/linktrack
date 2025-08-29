import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 min-w-0 max-w-none overflow-y-auto">
                {children}
            </main>

        </SidebarProvider>
    )
}
