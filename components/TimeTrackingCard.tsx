import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Clock } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface TimeTrackingCardProps {
  isClockedIn: boolean;
  clockInTime: Date | null;
  onClockIn: () => void;
  onClockOut: () => void;
}

export function TimeTrackingCard({ isClockedIn, clockInTime, onClockIn, onClockOut }: TimeTrackingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracking</CardTitle>
        <CardDescription>
          {isClockedIn 
            ? `Clocked in at ${clockInTime ? formatTime(clockInTime) : ''}`
            : 'Click below to start your work day'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {!isClockedIn ? (
            <Button onClick={onClockIn} className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Clock In
            </Button>
          ) : (
            <Button 
              onClick={onClockOut} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Clock Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}