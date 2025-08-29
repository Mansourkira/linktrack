"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  buttonText: string
  buttonVariant?: "default" | "outline"
  delay?: number
}

export function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
  buttonText,
  buttonVariant = "default",
  delay = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full transition-all duration-300 hover:shadow-lg",
          popular && "border-primary shadow-lg scale-105",
        )}
      >
        {popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
            Most Popular
          </Badge>
        )}
        <CardHeader className="text-center">
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold">{price}</span>
            {price !== "Free" && <span className="text-muted-foreground">/month</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant={buttonVariant} size="lg">
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
