"use client"

import { TestimonialCard } from "./testimonial-card"
import { Section } from "./section"

const testimonials = [
  {
    quote:
      "LinkTrack transformed how I share my content. The analytics alone have helped me understand my audience so much better.",
    author: "Sarah Chen",
    role: "Content Creator",
    company: "YouTube",
    avatar: "/testimonial-sarah.png",
  },
  {
    quote:
      "Finally, a link-in-bio tool that doesn't look generic. The custom domain feature makes it feel like part of my brand.",
    author: "Marcus Rodriguez",
    role: "Photographer",
    company: "Studio MR",
    avatar: "/testimonial-marcus.png",
  },
  {
    quote: "The team collaboration features are incredible. We can manage all our artists' pages from one dashboard.",
    author: "Emily Watson",
    role: "Digital Marketing Manager",
    company: "Indie Records",
    avatar: "/testimonial-emily.png",
  },
  {
    quote:
      "I've tried every link-in-bio tool out there. LinkTrack is the only one that feels professional and actually converts.",
    author: "David Kim",
    role: "Entrepreneur",
    company: "TechStart",
    avatar: "/testimonial-david.png",
  },
]

export function TestimonialsSection() {
  return (
    <Section className="bg-muted/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by creators worldwide</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Join thousands of creators, entrepreneurs, and brands who trust Links Pages to showcase their best work.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.author}
            quote={testimonial.quote}
            author={testimonial.author}
            role={testimonial.role}
            company={testimonial.company}
            avatar={testimonial.avatar}
            delay={index * 0.1}
          />
        ))}
      </div>
    </Section>
  )
}
