"use client"

import { Card } from "@/components/ui/card"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"]

const scheduleData: Record<string, Record<string, { subject: string; professor: string; room: string; color: string } | null>> = {
  "Mon": {
    "9:00 AM": { subject: "Data Structures", professor: "Dr. Smith", room: "Lab 101", color: "bg-primary/15 border-primary/30 text-primary" },
    "10:00 AM": { subject: "Data Structures", professor: "Dr. Smith", room: "Lab 101", color: "bg-primary/15 border-primary/30 text-primary" },
    "11:00 AM": null,
    "12:00 PM": null,
    "2:00 PM": { subject: "Calculus II", professor: "Prof. Johnson", room: "Room 205", color: "bg-secondary/15 border-secondary/30 text-secondary" },
    "3:00 PM": null,
  },
  "Tue": {
    "9:00 AM": { subject: "Database Systems", professor: "Dr. Williams", room: "Lab 102", color: "bg-accent/15 border-accent/30 text-accent" },
    "10:00 AM": null,
    "11:00 AM": { subject: "Linear Algebra", professor: "Prof. Brown", room: "Room 301", color: "bg-chart-4/15 border-chart-4/30 text-chart-4" },
    "12:00 PM": { subject: "Linear Algebra", professor: "Prof. Brown", room: "Room 301", color: "bg-chart-4/15 border-chart-4/30 text-chart-4" },
    "2:00 PM": null,
    "3:00 PM": { subject: "Physics Lab", professor: "Dr. Davis", room: "Lab 103", color: "bg-chart-5/15 border-chart-5/30 text-chart-5" },
  },
  "Wed": {
    "9:00 AM": null,
    "10:00 AM": { subject: "Algorithms", professor: "Dr. Smith", room: "Room 102", color: "bg-primary/15 border-primary/30 text-primary" },
    "11:00 AM": { subject: "Algorithms", professor: "Dr. Smith", room: "Room 102", color: "bg-primary/15 border-primary/30 text-primary" },
    "12:00 PM": null,
    "2:00 PM": { subject: "Statistics", professor: "Prof. Lee", room: "Room 204", color: "bg-secondary/15 border-secondary/30 text-secondary" },
    "3:00 PM": { subject: "Statistics", professor: "Prof. Lee", room: "Room 204", color: "bg-secondary/15 border-secondary/30 text-secondary" },
  },
  "Thu": {
    "9:00 AM": { subject: "Database Systems", professor: "Dr. Williams", room: "Lab 102", color: "bg-accent/15 border-accent/30 text-accent" },
    "10:00 AM": { subject: "Database Systems", professor: "Dr. Williams", room: "Lab 102", color: "bg-accent/15 border-accent/30 text-accent" },
    "11:00 AM": null,
    "12:00 PM": { subject: "Calculus II", professor: "Prof. Johnson", room: "Room 205", color: "bg-secondary/15 border-secondary/30 text-secondary" },
    "2:00 PM": null,
    "3:00 PM": { subject: "Seminar", professor: "Dr. Chen", room: "Hall A", color: "bg-chart-4/15 border-chart-4/30 text-chart-4" },
  },
  "Fri": {
    "9:00 AM": { subject: "Data Structures", professor: "Dr. Smith", room: "Lab 101", color: "bg-primary/15 border-primary/30 text-primary" },
    "10:00 AM": null,
    "11:00 AM": { subject: "Project Work", professor: "Multiple", room: "Lab 201", color: "bg-accent/15 border-accent/30 text-accent" },
    "12:00 PM": { subject: "Project Work", professor: "Multiple", room: "Lab 201", color: "bg-accent/15 border-accent/30 text-accent" },
    "2:00 PM": null,
    "3:00 PM": null,
  },
}

export function TimetablePreview() {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-xl shadow-black/5">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/70" />
            <div className="h-3 w-3 rounded-full bg-secondary/70" />
            <div className="h-3 w-3 rounded-full bg-accent/70" />
          </div>
          <span className="text-sm font-medium text-foreground">Computer Science Department - Spring 2026</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">Auto-generated in 2.3s</span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-175 p-4 sm:p-6">
          <div className="grid grid-cols-6 gap-2">
            {/* Header row */}
            <div className="p-2" />
            {days.map((day) => (
              <div key={day} className="p-2 text-center">
                <span className="text-sm font-semibold text-foreground">{day}</span>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={`row-${time}`} className="contents">
                <div className="flex items-center p-2">
                  <span className="text-xs font-medium text-muted-foreground">{time}</span>
                </div>
                {days.map((day) => {
                  const slot = scheduleData[day]?.[time]
                  return (
                    <div key={`${day}-${time}`} className="min-h-17.5 p-1">
                      {slot ? (
                        <div className={`h-full rounded-lg border p-2 transition-all hover:scale-[1.02] hover:shadow-md ${slot.color}`}>
                          <p className="text-xs font-semibold leading-tight">{slot.subject}</p>
                          <p className="mt-1 text-[10px] opacity-80">{slot.professor}</p>
                          <p className="text-[10px] opacity-70">{slot.room}</p>
                        </div>
                      ) : (
                        <div className="h-full rounded-lg border border-dashed border-border bg-muted/30" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
