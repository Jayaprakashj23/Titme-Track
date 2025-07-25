import { supabase, isSupabaseConfigured } from './supabase'
import type { Profile, TimeEntry } from './supabase'
import { mockEmployees, mockTimeEntries } from '../data/mockData'

// Get mock users from session storage
const getMockUsers = () => {
  try {
    return JSON.parse(sessionStorage.getItem('mockUsers') || '{}')
  } catch {
    return {}
  }
}

// Auth functions
export const signUp = async (email: string, password: string, userData: { name: string, role: 'admin' | 'employee', department?: string, position?: string }) => {
  if (!isSupabaseConfigured()) {
    // In demo mode, just validate the data and store in session
    if (!email || !password || password.length < 6) {
      throw new Error('Please provide valid email and password (min 6 characters)')
    }
    
    const mockUsers = getMockUsers()
    if (mockUsers[email]) {
      throw new Error('User with this email already exists')
    }
    
    // This will be handled by the LoginPage component
    return { user: { id: `mock-${Date.now()}`, email } }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name: userData.name,
        role: userData.role,
        department: userData.department || null,
        position: userData.position || null,
      })

    if (profileError) throw profileError
  }

  return authData
}

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    // Check demo accounts first
    const demoUsers = {
      'admin@demo.com': { id: 'admin-demo-id', email: 'admin@demo.com' },
      'employee@demo.com': { id: 'employee-demo-id', email: 'employee@demo.com' }
    }
    
    // Check session mock users
    const mockUsers = getMockUsers()
    
    if (email in demoUsers && password === 'demo123') {
      return { user: demoUsers[email as keyof typeof demoUsers] }
    } else if (email in mockUsers && mockUsers[email].password === password) {
      return { user: { id: mockUsers[email].id, email } }
    }
    
    throw new Error('Invalid credentials')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return
  }
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (!isSupabaseConfigured()) {
    // Check demo profiles first
    const demoProfiles = {
      'admin-demo-id': {
        id: 'admin-demo-id',
        email: 'admin@demo.com',
        name: 'Demo Admin',
        role: 'admin' as const,
        department: null,
        position: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'employee-demo-id': {
        id: 'employee-demo-id',
        email: 'employee@demo.com',
        name: 'Demo Employee',
        role: 'employee' as const,
        department: 'Engineering',
        position: 'Software Developer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    if (userId in demoProfiles) {
      return demoProfiles[userId as keyof typeof demoProfiles]
    }
    
    // Check session mock users
    const mockUsers = getMockUsers()
    for (const [email, userData] of Object.entries(mockUsers)) {
      const user = userData as any;
      if (user.id === userId) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department || null,
          position: user.position || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
    
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export const getAllEmployees = async (): Promise<Profile[]> => {
  if (!isSupabaseConfigured()) {
    const employees = mockEmployees.map(emp => ({
      id: emp.id,
      email: emp.email,
      name: emp.name,
      role: emp.role as 'admin' | 'employee',
      department: emp.department,
      position: emp.position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    // Add session mock users who are employees
    const mockUsers = getMockUsers()
    for (const [email, userData] of Object.entries(mockUsers)) {
      const user = userData as any;
      if (user.role === 'employee') {
        employees.push({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department || null,
          position: user.position || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
    
    return employees
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .order('name')

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }

  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  if (!isSupabaseConfigured()) {
    console.log('Mock update profile:', userId, updates)
    return { ...updates, id: userId }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Time entry functions
export const createTimeEntry = async (employeeId: string, clockIn: Date): Promise<TimeEntry> => {
  if (!isSupabaseConfigured()) {
    const mockEntry: TimeEntry = {
      id: `mock-${Date.now()}`,
      employee_id: employeeId,
      clock_in: clockIn.toISOString(),
      clock_out: null,
      date: clockIn.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Store in session storage for persistence during session
    const existingEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
    existingEntries.push(mockEntry)
    sessionStorage.setItem('mockTimeEntries', JSON.stringify(existingEntries))
    
    return mockEntry
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      employee_id: employeeId,
      clock_in: clockIn.toISOString(),
      date: clockIn.toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTimeEntry = async (entryId: string, clockOut: Date): Promise<TimeEntry> => {
  if (!isSupabaseConfigured()) {
    const existingEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
    const entryIndex = existingEntries.findIndex((entry: any) => entry.id === entryId)
    
    if (entryIndex !== -1) {
      existingEntries[entryIndex].clock_out = clockOut.toISOString()
      existingEntries[entryIndex].updated_at = new Date().toISOString()
      sessionStorage.setItem('mockTimeEntries', JSON.stringify(existingEntries))
      return existingEntries[entryIndex]
    }
    
    // Fallback mock entry
    const mockEntry: TimeEntry = {
      id: entryId,
      employee_id: 'employee-demo-id',
      clock_in: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      clock_out: clockOut.toISOString(),
      date: clockOut.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return mockEntry
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update({ 
      clock_out: clockOut.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', entryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTimeEntriesForEmployee = async (employeeId: string): Promise<TimeEntry[]> => {
  if (!isSupabaseConfigured()) {
    // Get base mock entries
    const baseEntries = mockTimeEntries
      .filter(entry => entry.employeeId === employeeId)
      .map(entry => ({
        id: entry.id,
        employee_id: entry.employeeId,
        clock_in: entry.clockIn.toISOString(),
        clock_out: entry.clockOut?.toISOString() || null,
        date: entry.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    
    // Get session entries
    const sessionEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
      .filter((entry: any) => entry.employee_id === employeeId)
    
    return [...baseEntries, ...sessionEntries]
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching time entries:', error)
    return []
  }

  return data
}

export const getAllTimeEntries = async (): Promise<TimeEntry[]> => {
  if (!isSupabaseConfigured()) {
    const baseEntries = mockTimeEntries.map(entry => ({
      id: entry.id,
      employee_id: entry.employeeId,
      clock_in: entry.clockIn.toISOString(),
      clock_out: entry.clockOut?.toISOString() || null,
      date: entry.date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    const sessionEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
    
    return [...baseEntries, ...sessionEntries]
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all time entries:', error)
    return []
  }

  return data
}

export const getTodayTimeEntries = async (): Promise<TimeEntry[]> => {
  if (!isSupabaseConfigured()) {
    const today = new Date().toISOString().split('T')[0]
    const baseEntries = mockTimeEntries
      .filter(entry => entry.date === today)
      .map(entry => ({
        id: entry.id,
        employee_id: entry.employeeId,
        clock_in: entry.clockIn.toISOString(),
        clock_out: entry.clockOut?.toISOString() || null,
        date: entry.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    
    const sessionEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
      .filter((entry: any) => entry.date === today)
    
    return [...baseEntries, ...sessionEntries]
  }

  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching today time entries:', error)
    return []
  }

  return data
}

export const getActiveTimeEntry = async (employeeId: string): Promise<TimeEntry | null> => {
  if (!isSupabaseConfigured()) {
    // Check session entries first
    const sessionEntries = JSON.parse(sessionStorage.getItem('mockTimeEntries') || '[]')
    const activeSessionEntry = sessionEntries.find(
      (entry: any) => entry.employee_id === employeeId && !entry.clock_out
    )
    
    if (activeSessionEntry) {
      return activeSessionEntry
    }
    
    // Check base mock entries
    const activeEntry = mockTimeEntries.find(
      entry => entry.employeeId === employeeId && !entry.clockOut
    )
    
    if (!activeEntry) return null
    
    return {
      id: activeEntry.id,
      employee_id: activeEntry.employeeId,
      clock_in: activeEntry.clockIn.toISOString(),
      clock_out: null,
      date: activeEntry.date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .is('clock_out', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching active time entry:', error)
    return null
  }

  return data
}

// Real-time subscriptions (mock versions when Supabase not configured)
export const subscribeToTimeEntries = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured()) {
    // Return a mock subscription
    return {
      unsubscribe: () => console.log('Mock subscription unsubscribed')
    }
  }

  return supabase
    .channel('time_entries_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'time_entries' },
      callback
    )
    .subscribe()
}

export const subscribeToProfiles = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured()) {
    return {
      unsubscribe: () => console.log('Mock subscription unsubscribed')
    }
  }

  return supabase
    .channel('profiles_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'profiles' },
      callback
    )
    .subscribe()
}