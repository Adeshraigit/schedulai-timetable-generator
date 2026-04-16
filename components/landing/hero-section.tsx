"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { TimetablePreview } from "./timetable-preview"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <Badge 
            variant="secondary" 
            className="mb-6 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI-Powered Academic Scheduling
          </Badge>

          <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Generate Conflict-Free Timetables in{" "}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Minutes, Not Days
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            SchedulAI transforms complex academic scheduling into a seamless experience. 
            Our intelligent system ensures no double-bookings, optimizes room utilization, 
            and respects all professor preferences automatically.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="h-12 bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Start Generating Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 border-border px-8 text-base font-medium text-foreground hover:bg-muted"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                    style={{ backgroundColor: `hsl(${i * 60}, 70%, 80%)` }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">500+</strong> institutions trust us
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg 
                    key={i} 
                    className="h-4 w-4 fill-secondary text-secondary" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">4.9/5</strong> from 200+ reviews
              </span>
            </div>
          </div>
        </div>

        {/* Timetable Preview */}
        <div className="mt-16 lg:mt-20">
          <TimetablePreview />
        </div>
      </div>
    </section>
  )
}
