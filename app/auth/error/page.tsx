import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">SchedulAI</span>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription className="text-base">
              Something went wrong during the authentication process. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground text-center">
                This could happen if the link has expired or has already been used.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-up">
                  Create new account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
