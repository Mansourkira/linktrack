import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ProgressBar } from "@/components/ui/progress-bar"
import { AuthProvider } from "@/components/auth/AuthProvider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "LinkTrack - Short links. Real-time analytics.",
  description:
    "Create branded short links, route visitors intelligently, and measure what matters with LinkTrack's powerful analytics platform.",
  keywords: ["short links", "url shortener", "link analytics", "branded domains", "click tracking", "utm tracking"],
  authors: [{ name: "LinkTrack" }],
  creator: "LinkTrack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://linktrack.com",
    title: "LinkTrack - Short links. Real-time analytics.",
    description:
      "Create branded short links, route visitors intelligently, and measure what matters with LinkTrack's powerful analytics platform.",
    siteName: "LinkTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkTrack - Short links. Real-time analytics.",
    description:
      "Create branded short links, route visitors intelligently, and measure what matters with LinkTrack's powerful analytics platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProgressBar />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
