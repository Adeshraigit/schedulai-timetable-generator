import Link from 'next/link'
import { Home, LayoutDashboard, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <SearchX className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-semibold tracking-widest text-muted-foreground">ERROR 404</p>
            <CardTitle className="text-3xl font-bold">Page not found</CardTitle>
            <CardDescription className="text-base">
              The page you are looking for does not exist or may have been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to home
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Open dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
