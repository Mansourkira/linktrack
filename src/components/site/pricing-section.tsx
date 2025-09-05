"use client"

import { PricingCard } from "./pricing-card"
import { Section } from "./section"

const pricingPlans = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for getting started",
    features: ["Unlimited short links", "Basic analytics", "Custom short codes", "QR code generation", "Password protection"],
    buttonText: "Get started",
    buttonVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$9",
    description: "Best for creators and professionals",
    features: [
      "Everything in Free",
      "Custom domains",
      "Advanced analytics",
      "Link expiration dates",
      "Bulk link management",
      "Priority support",
      "API access",
    ],
    popular: true,
    buttonText: "Start Pro trial",
    buttonVariant: "default" as const,
  },
  {
    name: "Business",
    price: "$29",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "User roles & permissions",
      "White-label solution",
      "Dedicated support",
      "Custom branding",
      "Advanced integrations",
      "Bulk operations",
    ],
    buttonText: "Contact sales",
    buttonVariant: "outline" as const,
  },
]

export function PricingSection() {
  return (
    <Section id="pricing">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Choose the plan that fits your needs. Start free and upgrade as you grow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            popular={plan.popular}
            buttonText={plan.buttonText}
            buttonVariant={plan.buttonVariant}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">All plans include a 14-day free trial. No credit card required.</p>
      </div>
    </Section>
  )
}
