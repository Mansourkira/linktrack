"use client"

import { motion } from "framer-motion"
import { ArrowRight, Link, BarChart3 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Link,
      title: "Paste Your Long URL",
      description: "Simply paste any long URL into our shortener tool",
    },
    {
      icon: ArrowRight,
      title: "Get Your Short Link",
      description: "Instantly receive a clean, branded short link",
    },
    {
      icon: BarChart3,
      title: "Track Performance",
      description: "Monitor clicks, locations, and engagement in real-time",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with LinkTrack in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
