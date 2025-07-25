import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useAuth } from '../contexts/AuthContext'
import { signUp } from '../lib/database'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Human Resources',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Customer Support',
  'Product Management',
  'Design',
  'Quality Assurance',
  'Legal',
  'Research & Development',
  'Business Development',
  'Administration',
  'Other'
]

const POSITION_OPTIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Engineering Manager',
  'Product Manager',
  'Designer',
  'QA Engineer',
  'Sales Representative',
  'Marketing Specialist',
  'HR Specialist',
  'Finance Analyst',
  'Customer Support Representative',
  'Operations Manager',
  'Business Analyst',
  'Project Manager',
  'Data Analyst',
  'DevOps Engineer',
  'Technical Writer',
  'Intern',
  'Other'
]

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [activeTab, setActiveTab] = useState('signin')
  const [userType, setUserType] = useState<'admin' | 'employee'>('employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    console.log('Attempting signin with:', { email, hasPassword: !!password, isSupabaseConfigured: isSupabaseConfigured() })

    try {
      await signIn(email, password)
      console.log('Signin successful')
    } catch (err: any) {
      console.error('Signin error:', err)
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isSupabaseConfigured()) {
        await signUp(email, password, {
          name,
          role: userType,
          department: userType === 'employee' ? department : undefined,
          position: userType === 'employee' ? position : undefined,
        })
        
        setSuccess('Account created successfully! Please check your email to confirm your account, then sign in.')
        setActiveTab('signin')
      } else {
        // In demo mode, create a mock account and sign in automatically
        const mockUser = {
          id: `mock-${Date.now()}`,
          email,
          name,
          role: userType,
          department: userType === 'employee' ? department : undefined,
          position: userType === 'employee' ? position : undefined,
        }
        
        // Store mock user in sessionStorage for this session
        const existingMockUsers = JSON.parse(sessionStorage.getItem('mockUsers') || '{}')
        existingMockUsers[email] = { ...mockUser, password }
        sessionStorage.setItem('mockUsers', JSON.stringify(existingMockUsers))
        
        setSuccess('Demo account created! Signing you in...')
        
        // Auto sign in
        setTimeout(async () => {
          try {
            await signIn(email, password)
          } catch (err: any) {
            setError('Failed to sign in with new account')
          }
        }, 1000)
      }
      
      // Clear form
      setEmail('')
      setPassword('')
      setName('')
      setDepartment('')
      setPosition('')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'admin' | 'employee') => {
    setLoading(true)
    setError(null)
    
    const demoCredentials = {
      admin: { email: 'admin@demo.com', password: 'demo123' },
      employee: { email: 'employee@demo.com', password: 'demo123' }
    }
    
    console.log(`Attempting demo ${role} login`)
    
    try {
      await signIn(demoCredentials[role].email, demoCredentials[role].password)
      console.log(`Demo ${role} login successful`)
    } catch (err: any) {
      console.error(`Demo ${role} login error:`, err)
      setError(`Demo ${role} account not available. Please create an account.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Employee Tracking System</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSupabaseConfigured() && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Connected to Supabase - Full backend functionality enabled
              </AlertDescription>
            </Alert>
          )}

          {!isSupabaseConfigured() && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Demo Mode: Using mock data for testing
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <Info className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDemoLogin('employee')}
                  disabled={loading}
                >
                  Try Employee Demo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                >
                  Try Admin Demo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={userType === 'employee' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setUserType('employee')}
                  >
                    Employee
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'admin' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setUserType('admin')}
                  >
                    Admin
                  </Button>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  
                  {userType === 'employee' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signup-department">Department</Label>
                        <Select 
                          value={department} 
                          onValueChange={setDepartment}
                          disabled={loading}
                        >
                          <SelectTrigger id="signup-department">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENT_OPTIONS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-position">Position</Label>
                        <Select 
                          value={position} 
                          onValueChange={setPosition}
                          disabled={loading}
                        >
                          <SelectTrigger id="signup-position">
                            <SelectValue placeholder="Select your position" />
                          </SelectTrigger>
                          <SelectContent>
                            {POSITION_OPTIONS.map((pos) => (
                              <SelectItem key={pos} value={pos}>
                                {pos}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : `Create ${userType} Account`}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}