"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Section } from "./section"

const faqs = [
  {
    question: "How is LinkTrack different from other link-in-bio tools?",
    answer:
      "LinkTrack focuses on beautiful design, powerful analytics, and professional features like custom domains and team collaboration. We're built for creators and businesses who want more than just a basic link list.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes! Pro and Business plans include custom domain support. You can use your existing domain or register a new one through our platform. This helps maintain your brand consistency and builds trust with your audience.",
  },
  {
    question: "What analytics do you provide?",
    answer:
      "We provide detailed insights including total clicks, unique visitors, top-performing links, geographic data, device types, and referral sources. Pro users also get conversion tracking and advanced filtering options.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! Our free plan includes 1 link page with unlimited links, basic themes, and mobile responsiveness. It's perfect for getting started. You can upgrade anytime to unlock advanced features.",
  },
  {
    question: "How does team collaboration work?",
    answer:
      "Business plans include team features where you can invite team members, assign different permission levels, and manage multiple pages from one dashboard. Perfect for agencies, record labels, or marketing teams.",
  },
  {
    question: "Can I customize the design?",
    answer:
      "All plans include theme customization. Pro users get access to premium themes and custom CSS, while Business users can completely white-label the experience with their own branding.",
  },
]

export function FAQSection() {
  return (
    <Section id="faq">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about LinkTrack. Can't find the answer you're looking for? Contact our support
          team.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
