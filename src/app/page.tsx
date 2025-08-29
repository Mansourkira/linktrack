"use client"
import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/site/navbar"
import { HeroSection } from "@/components/site/hero-section"
import { FeaturesSection } from "@/components/site/features-section"
import { HowItWorksSection } from "@/components/site/how-it-works-section"
import { PricingSection } from "@/components/site/pricing-section"
import { TestimonialsSection } from "@/components/site/testimonials-section"
import { FAQSection } from "@/components/site/faq-section"
import { Footer } from "@/components/site/footer"
import { config } from "@/lib/config";

export default function HomePage() {
  return (
    <>

      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <TestimonialsSection />
          <FAQSection />
        </main>
        <Footer />
      </div>

    </>
  )
}
