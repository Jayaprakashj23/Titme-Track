import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Copy, ExternalLink, Database, Key, Settings } from 'lucide-react'

export function SetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Employee Tracking System Setup</h1>
          <p className="text-muted-foreground">
            Configure your Supabase backend to get started with the full application
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Step 1: Create Supabase Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Step 1: Create Supabase Project
              </CardTitle>
              <CardDescription>
                Set up your Supabase backend database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">1. Go to Supabase and create a new project</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">2. Choose a project name and database password</p>
                <p className="text-sm">3. Wait for the project to be created</p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Get API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Step 2: Get API Keys
              </CardTitle>
              <CardDescription>
                Copy your project URL and API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">1. Go to Settings → API in your Supabase project</p>
                <p className="text-sm">2. Copy your Project URL</p>
                <p className="text-sm">3. Copy your Anon/Public key</p>
              </div>
              
              <Alert>
                <AlertDescription>
                  Keep your API keys secure. The anon key is safe to use in frontend applications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3: Run Database Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 3: Database Setup
              </CardTitle>
              <CardDescription>
                Create the required database tables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">1. Go to the SQL Editor in your Supabase dashboard</p>
                <p className="text-sm">2. Copy and run the setup script below:</p>
              </div>
              
              <div className="bg-muted p-3 rounded-md text-sm font-mono relative">
                <pre className="text-xs overflow-x-auto">
{`-- Copy the contents from /database/setup.sql
-- This creates the profiles and time_entries tables
-- with proper Row Level Security policies`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard('Check /database/setup.sql file')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Update Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 4: Update Configuration
              </CardTitle>
              <CardDescription>
                Add your API keys to the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">1. Open <code>/lib/supabase.ts</code></p>
                <p className="text-sm">2. Replace the placeholder values:</p>
              </div>
              
              <div className="bg-muted p-3 rounded-md text-sm font-mono relative">
                <pre className="text-xs overflow-x-auto">
{`const supabaseUrl = 'https://your-project-ref.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard("const supabaseUrl = 'YOUR_PROJECT_URL'\nconst supabaseAnonKey = 'YOUR_ANON_KEY'")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Mode Available</CardTitle>
            <CardDescription>
              You can try the application in demo mode with mock data while setting up Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()}>
                Continue with Demo Mode
              </Button>
              <Button variant="outline" onClick={() => window.open('/database/setup.sql', '_blank')}>
                View Database Setup Script
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}