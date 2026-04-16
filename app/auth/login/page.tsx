'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Calendar, Clock } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(redirect)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">SchedulAI</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
            Intelligent Timetable Generation for Modern Education
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Automate your academic scheduling with AI-powered constraint satisfaction. 
            Save hours of manual work and eliminate conflicts.
          </p>
          
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Clock className="h-5 w-5" />
              <span>Save 90% scheduling time</span>
            </div>
          </div>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          Trusted by universities worldwide
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SchedulAI</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@university.edu"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
                
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:underline"
                  >
                    Create account
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
