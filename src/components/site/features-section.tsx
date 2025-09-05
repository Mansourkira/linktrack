"use client"

import { MousePointer, Globe, BarChart3, Palette, Users, Share2 } from "lucide-react"
import { FeatureCard } from "./feature-card"
import { Section } from "./section"

const features = [
  {
    icon: <MousePointer className="h-6 w-6 text-primary" />,
    title: "Instant Link Shortening",
    description: "Create short links instantly with our fast and reliable URL shortener. No registration required.",
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "Custom Domains",
    description: "Use your own domain to maintain brand consistency and build trust with your audience.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Advanced Analytics",
    description: "Track clicks, locations, devices, and referrers with detailed real-time analytics and insights.",
  },
  {
    icon: <Palette className="h-6 w-6 text-primary" />,
    title: "Link Management",
    description: "Organize, edit, and manage all your short links from one powerful dashboard.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Password Protection",
    description: "Secure your links with password protection and expiration dates for sensitive content.",
  },
  {
    icon: <Share2 className="h-6 w-6 text-primary" />,
    title: "QR Code Generation",
    description: "Generate QR codes for your links to make them easily shareable across all platforms.",
  },
]

export function FeaturesSection() {
  return (
    <Section id="features" className="bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for link success</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Powerful features to help you create, track, and optimize your short links for maximum performance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </Section>
  )
}
