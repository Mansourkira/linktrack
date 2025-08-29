"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, ExternalLink, Instagram, Twitter, Youtube } from "lucide-react"
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
              Beautiful link pages
            </Badge>
          </motion.div>

          {/* Headline */}
          <AnimatedText
            text="Turn your links into a delightful, branded page."
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
            Build, customize, and share your bio link in minutes — with analytics, themes, and custom domains.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button size="lg" className="group" asChild>
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group bg-transparent" asChild>
              <Link href="/demo">
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
              {/* Profile Section */}
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/professional-headshot.png" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">Jane Doe</h3>
                <p className="text-sm text-muted-foreground">Content Creator & Designer</p>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border cursor-pointer transition-colors hover:bg-background/80"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Instagram className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium flex-1">Instagram</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border cursor-pointer transition-colors hover:bg-background/80"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Twitter className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium flex-1">Twitter</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border cursor-pointer transition-colors hover:bg-background/80"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Youtube className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium flex-1">YouTube Channel</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border cursor-pointer transition-colors hover:bg-background/80"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    P
                  </div>
                  <span className="font-medium flex-1">Portfolio</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Section>
  )
}
