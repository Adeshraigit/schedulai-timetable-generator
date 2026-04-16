"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, TrendingUp, CheckCircle2, Building2 } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    metric: "80%",
    label: "Time Saved",
    description: "Reduce scheduling time from days to minutes with automated generation.",
  },
  {
    icon: CheckCircle2,
    metric: "100%",
    label: "Conflict-Free",
    description: "Zero double-bookings guaranteed through intelligent constraint validation.",
  },
  {
    icon: TrendingUp,
    metric: "85%+",
    label: "Room Utilization",
    description: "Optimize space usage with smart room allocation algorithms.",
  },
  {
    icon: Building2,
    metric: "500+",
    label: "Institutions",
    description: "Trusted by universities and colleges worldwide.",
  },
]

const testimonials = [
  {
    quote: "SchedulAI transformed our scheduling process. What used to take our team 3 days now takes 10 minutes.",
    author: "Dr. Sarah Mitchell",
    role: "Dean of Academics",
    institution: "Stanford University",
  },
  {
    quote: "The conflict detection alone has saved us countless hours of manual checking. Absolutely essential tool.",
    author: "Prof. James Chen",
    role: "Department Head",
    institution: "MIT",
  },
  {
    quote: "Our professors love the availability management feature. It&apos;s intuitive and respects their preferences.",
    author: "Maria Rodriguez",
    role: "Academic Administrator",
    institution: "UCLA",
  },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.label} className="border-border bg-card">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-4xl font-bold text-foreground">{benefit.metric}</span>
                <span className="mt-1 text-sm font-semibold text-primary">{benefit.label}</span>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 sm:mt-20">
          <h3 className="mb-8 text-center text-2xl font-semibold text-foreground sm:mb-12">
            Trusted by Leading Institutions
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-secondary text-secondary"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="mb-4 text-foreground">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full bg-muted"
                      style={{ backgroundColor: `hsl(${index * 80 + 200}, 60%, 70%)` }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.institution}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
