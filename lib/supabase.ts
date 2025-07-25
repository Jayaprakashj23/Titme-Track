import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Now configured with your actual project
const supabaseUrl = 'https://odppkrjxjbygztfuzkpj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcHBrcmp4amJ5Z3p0ZnV6a3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTE1MzYsImV4cCI6MjA2ODk2NzUzNn0.4h_MX5eyqnocwptzhS7rZ6fEx8Kk1wPqUxbOuVKWs3Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'employee'
          department: string | null
          position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'admin' | 'employee'
          department?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'employee'
          department?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          employee_id: string
          clock_in: string
          clock_out: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          clock_in: string
          clock_out?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          clock_in?: string
          clock_out?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type TimeEntry = Database['public']['Tables']['time_entries']['Row']

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !supabaseUrl.includes('your-project') && 
         !supabaseAnonKey.includes('your-anon-key') &&
         supabaseUrl.startsWith('https://') &&
         supabaseAnonKey.length > 50
}