"use client"

import { MousePointer, Globe, BarChart3, Palette, Users, Share2 } from "lucide-react"
import { FeatureCard } from "./feature-card"
import { Section } from "./section"

const features = [
  {
    icon: <MousePointer className="h-6 w-6 text-primary" />,
    title: "Drag & Drop Builder",
    description: "Easily customize your page with our intuitive drag-and-drop interface. No coding required.",
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "Custom Domains",
    description: "Use your own domain to maintain brand consistency and build trust with your audience.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Advanced Analytics",
    description: "Track clicks, views, and engagement with detailed analytics and insights.",
  },
  {
    icon: <Palette className="h-6 w-6 text-primary" />,
    title: "Themes & Dark Mode",
    description: "Choose from beautiful themes and let users toggle between light and dark modes.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Teams & Collaboration",
    description: "Work together with your team to manage multiple pages and share access controls.",
  },
  {
    icon: <Share2 className="h-6 w-6 text-primary" />,
    title: "Social Embeds",
    description: "Embed content from Instagram, Twitter, YouTube, and other social platforms seamlessly.",
  },
]

export function FeaturesSection() {
  return (
    <Section id="features" className="bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to shine online</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Powerful features to help you create, customize, and optimize your link page for maximum impact.
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
