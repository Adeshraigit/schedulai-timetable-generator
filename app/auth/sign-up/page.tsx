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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Calendar, Shield, Users, Zap } from 'lucide-react'

type Department = {
  id: string
  name: string
  code: string
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('coordinator')
  const [departmentId, setDepartmentId] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchDepartments = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name')
      if (data) setDepartments(data)
    }
    fetchDepartments()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            name,
            role,
            department_id: departmentId || null,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
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
        
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
            Join the Future of Academic Scheduling
          </h1>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 shrink-0">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">AI-Powered Generation</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Genetic algorithms optimize schedules automatically
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 shrink-0">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Conflict-Free Schedules</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Hard constraints ensure zero overlaps
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 shrink-0">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Role-Based Access</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Secure permissions for every user type
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-primary-foreground/60 text-sm">
          Get started in under 5 minutes
        </p>
      </div>

      {/* Right side - Sign Up Form */}
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
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr. John Smith"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.smith@university.edu"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="hod">Head of Department</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={departmentId} onValueChange={setDepartmentId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select dept" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="repeat-password">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
                
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
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
