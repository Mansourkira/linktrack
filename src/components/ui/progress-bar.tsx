"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface ProgressBarProps {
    className?: string
}

export function ProgressBar({ className = "" }: ProgressBarProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const pathname = usePathname()

    useEffect(() => {
        // Reset progress when pathname changes
        setIsLoading(true)
        setProgress(0)

        // Simulate progress
        const timer = setTimeout(() => {
            setProgress(100)
            setTimeout(() => {
                setIsLoading(false)
                setProgress(0)
            }, 200)
        }, 300)

        return () => clearTimeout(timer)
    }, [pathname])

    if (!isLoading) return null

    return (
        <div className={`fixed top-0 left-0 w-full h-1 bg-background z-50 ${className}`}>
            <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
