"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileInput, Settings2, Cpu, Calendar } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: FileInput,
    title: "Input Your Data",
    description: "Add professors, subjects, rooms, and time slots. Bulk import via CSV for faster setup.",
    color: "bg-primary text-primary-foreground",
  },
  {
    step: "02",
    icon: Settings2,
    title: "Set Constraints",
    description: "Configure professor availability, room requirements, and scheduling preferences.",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Generate Schedule",
    description: "Our AI engine processes all constraints and generates an optimal, conflict-free timetable.",
    color: "bg-accent text-accent-foreground",
  },
  {
    step: "04",
    icon: Calendar,
    title: "Review & Publish",
    description: "Review the generated schedule, make manual adjustments if needed, and publish to all users.",
    color: "bg-chart-4 text-foreground",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How SchedulAI Works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From data input to published timetable in four simple steps. 
            No technical expertise required.
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-16 hidden h-0.5 w-full -translate-x-1/2 bg-border lg:block" />
                )}
                <Card className="relative border-border bg-card">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} shadow-lg`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Step {step.step}
                    </span>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
