import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Calendar,
  Users,
  BookOpen,
  DoorOpen,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const stats = [
  {
    title: 'Active Timetables',
    value: '3',
    description: 'Currently published',
    icon: Calendar,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Courses',
    value: '24',
    description: 'Across all departments',
    icon: BookOpen,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: 'Professors',
    value: '18',
    description: 'Teaching staff',
    icon: Users,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    title: 'Rooms',
    value: '12',
    description: 'Available venues',
    icon: DoorOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const recentActivity = [
  {
    action: 'Timetable Generated',
    description: 'Fall 2025 - Computer Science',
    time: '2 hours ago',
    icon: Sparkles,
    status: 'success',
  },
  {
    action: 'Course Added',
    description: 'CS401 - Machine Learning',
    time: '5 hours ago',
    icon: BookOpen,
    status: 'info',
  },
  {
    action: 'Conflict Resolved',
    description: 'Room LH-101 double booking',
    time: '1 day ago',
    icon: CheckCircle2,
    status: 'success',
  },
  {
    action: 'Professor Updated',
    description: 'Dr. Smith availability changed',
    time: '2 days ago',
    icon: Users,
    status: 'info',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your scheduling system.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Timetable
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/generate">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Generate New Timetable
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/courses">
                <BookOpen className="mr-2 h-4 w-4 text-secondary" />
                Add New Course
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/professors">
                <Users className="mr-2 h-4 w-4 text-accent" />
                Manage Professors
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/timetables">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                View All Timetables
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${
                    activity.status === 'success' ? 'bg-accent/10' : 'bg-primary/10'
                  }`}>
                    <activity.icon className={`h-4 w-4 ${
                      activity.status === 'success' ? 'text-accent' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            System Performance
          </CardTitle>
          <CardDescription>
            Timetable generation statistics and optimization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Average Generation Time</p>
              <p className="text-2xl font-bold text-foreground">2.4s</p>
              <p className="text-xs text-accent">15% faster than last month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Conflict Resolution Rate</p>
              <p className="text-2xl font-bold text-foreground">98.5%</p>
              <p className="text-xs text-accent">Industry-leading accuracy</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Optimization Score</p>
              <p className="text-2xl font-bold text-foreground">94/100</p>
              <p className="text-xs text-muted-foreground">Based on constraint satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
