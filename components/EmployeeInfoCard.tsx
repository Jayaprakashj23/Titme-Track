import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Profile } from '../lib/supabase';

interface EmployeeInfoCardProps {
  user: Profile;
}

export function EmployeeInfoCard({ user }: EmployeeInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Department</label>
            <div>{user.department || 'Not assigned'}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Position</label>
            <div>{user.position || 'Not assigned'}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <div>{user.email}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}