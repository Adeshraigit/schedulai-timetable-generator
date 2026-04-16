"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to Transform Your Scheduling?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
          Join 500+ institutions already using SchedulAI to eliminate scheduling conflicts 
          and save countless hours every semester.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button 
            size="lg" 
            className="h-12 bg-white px-8 text-base font-medium text-primary shadow-lg transition-all hover:bg-white/90"
          >
            Start Free Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 border-primary-foreground/30 bg-transparent px-8 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10"
          >
            Schedule a Demo
          </Button>
        </div>
        <p className="mt-6 text-sm text-primary-foreground/60">
          No credit card required. Free plan available forever.
        </p>
      </div>
    </section>
  )
}
