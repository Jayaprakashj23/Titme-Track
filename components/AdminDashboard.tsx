import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Users, Clock, UserCheck } from 'lucide-react'
import { DashboardHeader } from './DashboardHeader'
import { useAuth } from '../contexts/AuthContext'
import { getAllEmployees, getTodayTimeEntries, subscribeToTimeEntries, subscribeToProfiles } from '../lib/database'
import { formatTime, getHoursWorked } from '../utils/timeUtils'
import type { Profile, TimeEntry } from '../lib/supabase'

export function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const [employees, setEmployees] = useState<Profile[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [employeesData, timeEntriesData] = await Promise.all([
        getAllEmployees(),
        getTodayTimeEntries()
      ])
      
      setEmployees(employeesData)
      setTimeEntries(timeEntriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to real-time updates
    const timeEntriesSubscription = subscribeToTimeEntries(() => {
      getTodayTimeEntries().then(setTimeEntries)
    })

    const profilesSubscription = subscribeToProfiles(() => {
      getAllEmployees().then(setEmployees)
    })

    return () => {
      timeEntriesSubscription.unsubscribe()
      profilesSubscription.unsubscribe()
    }
  }, [])

  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || 'Unknown'
  }

  const activeEmployees = timeEntries.filter(entry => !entry.clock_out).length
  const totalEmployees = employees.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardHeader 
        title="Admin Dashboard"
        icon={<UserCheck className="h-6 w-6" />}
        userName={profile?.name || 'Admin'}
        onLogout={signOut}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEmployees > 0 ? Math.round((timeEntries.length / totalEmployees) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheet">Time Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>
                  Manage and view all employees in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const isActive = timeEntries.some(
                        entry => entry.employee_id === employee.id && !entry.clock_out
                      );
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.position || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : "secondary"}>
                              {isActive ? "Active" : "Offline"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timesheet">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>
                  View employee clock-in and clock-out times for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => {
                      const clockIn = new Date(entry.clock_in)
                      const clockOut = entry.clock_out ? new Date(entry.clock_out) : undefined
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{getEmployeeName(entry.employee_id)}</TableCell>
                          <TableCell>{formatTime(clockIn)}</TableCell>
                          <TableCell>
                            {clockOut ? formatTime(clockOut) : '-'}
                          </TableCell>
                          <TableCell>
                            {getHoursWorked({
                              ...entry,
                              clockIn,
                              clockOut
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.clock_out ? "secondary" : "default"}>
                              {entry.clock_out ? "Completed" : "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}