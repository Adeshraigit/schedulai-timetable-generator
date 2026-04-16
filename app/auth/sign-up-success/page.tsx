import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent you a confirmation link. Please check your email and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground text-center">
                Didn&apos;t receive an email? Check your spam folder or try signing up again.
              </p>
            </div>
            
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Continue to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
