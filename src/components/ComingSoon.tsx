"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-8 px-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We&apos;re building something amazing. Stay tuned for the launch of our link tracking platform.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Get notified when we launch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild>
              <Link href="mailto:hello@linktrack.com">
                Contact Us
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://github.com/yourusername/linktrack">
                Follow Development
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="pt-8">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © 2024 LinkTrack. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 