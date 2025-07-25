import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Timer } from 'lucide-react';
import { formatTime, formatDate } from '../utils/timeUtils';

interface TimeStatusCardsProps {
  currentTime: Date;
  isClockedIn: boolean;
  workingHours: string;
}

export function TimeStatusCards({ currentTime, isClockedIn, workingHours }: TimeStatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-mono">{formatTime(currentTime, true)}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={isClockedIn ? "default" : "secondary"}>
                {isClockedIn ? "Clocked In" : "Clocked Out"}
              </Badge>
            </div>
            {isClockedIn && (
              <div className="text-sm text-muted-foreground">
                Working for: <span className="font-mono">{workingHours}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}