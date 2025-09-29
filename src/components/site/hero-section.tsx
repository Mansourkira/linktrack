"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedText } from "./animated-text"
import { Section } from "./section"

export function HeroSection() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Content */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Advanced link analytics
            </Badge>
          </motion.div>

          {/* Headline */}
          <AnimatedText
            text="Short links with powerful analytics and custom domains."
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            mode="per-line"
            delay={0.2}
          />

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
          >
            Create branded short links, track clicks with detailed analytics, and use your own custom domain for maximum impact.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/auth">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group bg-transparent" asChild>
              <Link href="/auth">
                <Play className="mr-2 h-4 w-4" />
                Live demo
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="flex justify-center lg:justify-end"
        >
          <Card className="w-full max-w-sm bg-card/50 backdrop-blur-sm border shadow-2xl">
            <CardContent className="p-6">
              {/* Analytics Header */}
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Link Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time click tracking</p>
              </div>

              {/* Analytics Stats */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">L</span>
                    </div>
                    <span className="font-medium text-sm">linktrack.app/leo</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">2,847</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">C</span>
                    </div>
                    <span className="font-medium text-sm">linktrack.app/chatgpt</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">1,234</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">G</span>
                    </div>
                    <span className="font-medium text-sm">linktrack.app/ganesha</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">856</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">D</span>
                    </div>
                    <span className="font-medium text-sm">linktrack.app/dT8XrA</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">432</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Section>
  )
}
