import { redirect } from "next/navigation"
import { getServerUser } from "./server"

export async function withAuth<T extends React.ComponentType<any>>(
    Component: T,
    redirectTo: string = "/auth"
): Promise<T> {
    return async function AuthenticatedComponent(props: any) {
        const { user, error } = await getServerUser()

        if (error || !user) {
            redirect(redirectTo)
        }

        return <Component {...props} />
    } as T
}

export async function requireAuth(redirectTo: string = "/auth") {
    const { user, error } = await getServerUser()

    if (error || !user) {
        redirect(redirectTo)
    }

    return user
}

