import { useState } from 'react'
import { AdminDashboard } from './components/AdminDashboard'
import { EmployeeDashboard } from './components/EmployeeDashboard'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Users, User } from 'lucide-react'

// Mock user data for demo
const mockAdminUser = {
  id: 'admin-demo-id',
  email: 'admin@demo.com'
}

const mockEmployeeUser = {
  id: 'employee-demo-id',
  email: 'employee@demo.com'
}

const mockAdminProfile = {
  id: 'admin-demo-id',
  email: 'admin@demo.com',
  name: 'Demo Admin',
  role: 'admin' as const,
  department: null,
  position: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockEmployeeProfile = {
  id: 'employee-demo-id',
  email: 'employee@demo.com',
  name: 'Demo Employee',
  role: 'employee' as const,
  department: 'Engineering',
  position: 'Software Developer',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock Auth Context Provider
function MockAuthProvider({ children, user, profile }: { 
  children: React.ReactNode, 
  user: any, 
  profile: any 
}) {
  const mockAuthContext = {
    user,
    profile,
    loading: false,
    signIn: async () => {},
    signOut: async () => {},
    refreshProfile: async () => {}
  }

  return (
    <div style={{ '--auth-context': JSON.stringify(mockAuthContext) } as any}>
      {children}
    </div>
  )
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<'admin' | 'employee'>('employee')
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true)

  const currentUser = currentRole === 'admin' ? mockAdminUser : mockEmployeeUser
  const currentProfile = currentRole === 'admin' ? mockAdminProfile : mockEmployeeProfile

  if (showRoleSwitcher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Employee Tracking System</CardTitle>
            <p className="text-muted-foreground">
              Choose a role to access the dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Badge variant="secondary" className="text-sm">
                Demo Mode - No Login Required
              </Badge>
            </div>
            
            <Button
              onClick={() => {
                setCurrentRole('employee')
                setShowRoleSwitcher(false)
              }}
              className="w-full h-16 flex items-center justify-center gap-3"
              variant="outline"
            >
              <User className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Employee Dashboard</div>
                <div className="text-sm text-muted-foreground">
                  Track time and view personal data
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                setCurrentRole('admin')
                setShowRoleSwitcher(false)
              }}
              className="w-full h-16 flex items-center justify-center gap-3"
              variant="outline"
            >
              <Users className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Admin Dashboard</div>
                <div className="text-sm text-muted-foreground">
                  Manage employees and view reports
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MockAuthProvider user={currentUser} profile={currentProfile}>
      <div className="relative">
        {/* Role switcher button */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowRoleSwitcher(true)}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
          >
            Switch Role
          </Button>
        </div>
        
        {/* Dashboard content */}
        {currentRole === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
      </div>
    </MockAuthProvider>
  )
}