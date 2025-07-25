import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { DashboardHeader } from './DashboardHeader'
import { TimeStatusCards } from './TimeStatusCards'
import { TimeTrackingCard } from './TimeTrackingCard'
import { EmployeeInfoCard } from './EmployeeInfoCard'
import { TimeEntriesCard } from './TimeEntriesCard'
import { useAuth } from '../contexts/AuthContext'
import { 
  createTimeEntry, 
  updateTimeEntry, 
  getTimeEntriesForEmployee, 
  getActiveTimeEntry,
  subscribeToTimeEntries 
} from '../lib/database'
import { calculateWorkingTime } from '../utils/timeUtils'
import type { TimeEntry } from '../lib/supabase'

export function EmployeeDashboard() {
  const { user, profile, signOut } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [workingHours, setWorkingHours] = useState('0h 0m')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return

    try {
      const [entries, active] = await Promise.all([
        getTimeEntriesForEmployee(user.id),
        getActiveTimeEntry(user.id)
      ])
      
      setTimeEntries(entries)
      setActiveEntry(active)
      setIsClockedIn(!!active)
    } catch (error) {
      console.error('Error loading employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load initial data and subscribe to updates
  useEffect(() => {
    if (user) {
      loadData()

      // Subscribe to real-time updates for this employee's time entries
      const subscription = subscribeToTimeEntries((payload) => {
        if (payload.new?.employee_id === user.id || payload.old?.employee_id === user.id) {
          loadData()
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [user])

  // Update working hours when clocked in
  useEffect(() => {
    if (isClockedIn && activeEntry) {
      const updateWorkingHours = () => {
        const clockInTime = new Date(activeEntry.clock_in)
        setWorkingHours(calculateWorkingTime(clockInTime))
      }

      updateWorkingHours()
      const interval = setInterval(updateWorkingHours, 1000)
      return () => clearInterval(interval)
    }
  }, [isClockedIn, activeEntry])

  const handleClockIn = async () => {
    if (!user) return

    try {
      const now = new Date()
      const entry = await createTimeEntry(user.id, now)
      setActiveEntry(entry)
      setIsClockedIn(true)
      
      // Refresh time entries list
      const entries = await getTimeEntriesForEmployee(user.id)
      setTimeEntries(entries)
    } catch (error) {
      console.error('Error clocking in:', error)
      alert('Failed to clock in. Please try again.')
    }
  }

  const handleClockOut = async () => {
    if (!activeEntry) return

    try {
      const now = new Date()
      await updateTimeEntry(activeEntry.id, now)
      
      setIsClockedIn(false)
      setActiveEntry(null)
      setWorkingHours('0h 0m')
      
      // Refresh time entries list
      const entries = await getTimeEntriesForEmployee(user.id)
      setTimeEntries(entries)
    } catch (error) {
      console.error('Error clocking out:', error)
      alert('Failed to clock out. Please try again.')
    }
  }

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

  const clockInTime = activeEntry ? new Date(activeEntry.clock_in) : null

  // Convert database entries to component format
  const formattedEntries = timeEntries.map(entry => ({
    id: entry.id,
    employeeId: entry.employee_id,
    clockIn: new Date(entry.clock_in),
    clockOut: entry.clock_out ? new Date(entry.clock_out) : undefined,
    date: entry.date
  }))

  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardHeader 
        title="Employee Dashboard"
        icon={<Clock className="h-6 w-6" />}
        userName={profile?.name || 'Employee'}
        onLogout={signOut}
      />

      <div className="p-6 space-y-6">
        <TimeStatusCards 
          currentTime={currentTime}
          isClockedIn={isClockedIn}
          workingHours={workingHours}
        />

        <TimeTrackingCard 
          isClockedIn={isClockedIn}
          clockInTime={clockInTime}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />

        {profile && <EmployeeInfoCard user={{
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          department: profile.department,
          position: profile.position
        }} />}

        <TimeEntriesCard timeEntries={formattedEntries} />
      </div>
    </div>
  )
}