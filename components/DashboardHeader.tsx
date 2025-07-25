import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  icon: React.ReactNode;
  userName: string;
  onLogout: () => void;
}

export function DashboardHeader({ title, icon, userName, onLogout }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          {icon}
          <h1>{title}</h1>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {userName}
          </span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}