"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  Shield, 
  Zap, 
  Users, 
  LayoutGrid, 
  Download,
  Settings,
  BarChart3
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Generate complete timetables in under 30 seconds using our advanced constraint-satisfaction algorithm.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Zero Conflicts",
    description: "Our system guarantees no professor or room double-bookings through intelligent constraint validation.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Multi-User Roles",
    description: "Support for administrators, HODs, and professors with role-specific access and permissions.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Calendar,
    title: "Availability Management",
    description: "Professors can easily mark their preferred time slots with an intuitive availability grid.",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: LayoutGrid,
    title: "Visual Timetable Grid",
    description: "Interactive grid view with color-coded classes, drag-and-drop editing, and conflict highlighting.",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    icon: Download,
    title: "Export Options",
    description: "Export schedules as PDF, CSV, or sync directly with Google Calendar and Outlook.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Settings,
    title: "Customizable Rules",
    description: "Configure maximum consecutive classes, break durations, and room type requirements.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track room utilization, professor workload distribution, and scheduling efficiency metrics.",
    color: "bg-secondary/10 text-secondary",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Perfect Scheduling
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to simplify complex academic scheduling 
            while ensuring optimal resource allocation.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="group border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
