import { config } from "@/lib/config"
import type { LinkConfig } from "../types"

export const linkConfig: LinkConfig = {
    baseUrl: config.isDevelopment ? 'http://localhost:3000' : 'https://linktrack.app',
    shortUrl: (shortCode: string) => `${config.isDevelopment ? 'http://localhost:3000' : 'https://linktrack.app'}/${shortCode}`
}

export const getShortUrl = (shortCode: string): string => {
    return linkConfig.shortUrl(shortCode)
}

export const getBaseUrl = (): string => {
    return linkConfig.baseUrl
}
