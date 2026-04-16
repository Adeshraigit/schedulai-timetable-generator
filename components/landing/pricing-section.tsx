"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small departments",
    price: "Free",
    period: "forever",
    features: [
      "Up to 20 professors",
      "10 rooms maximum",
      "Basic scheduling algorithm",
      "PDF export",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing institutions",
    price: "$49",
    period: "/month",
    features: [
      "Up to 100 professors",
      "50 rooms maximum",
      "Advanced optimization",
      "PDF, CSV & Calendar sync",
      "Priority support",
      "Custom constraints",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large universities",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited professors",
      "Unlimited rooms",
      "AI-powered suggestions",
      "API access",
      "Dedicated support",
      "SSO integration",
      "Custom development",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Choose the plan that fits your institution. Start free and scale as you grow.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative border-border ${
                plan.popular 
                  ? "border-2 border-primary shadow-lg shadow-primary/10" 
                  : "bg-card"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
