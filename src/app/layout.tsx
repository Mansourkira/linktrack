import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { Analytics } from '@vercel/analytics/react'
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
  icons: {
    icon: [
      { url: "/linktrack.png", sizes: "32x32", type: "image/png" },
      { url: "/linktrack.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/linktrack.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2878731516544158"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProgressBar />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
