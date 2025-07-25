import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TimeEntry } from '../App';
import { formatTime, getHoursWorked } from '../utils/timeUtils';

interface TimeEntriesCardProps {
  timeEntries: TimeEntry[];
}

export function TimeEntriesCard({ timeEntries }: TimeEntriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
        <CardDescription>
          Your recent clock-in and clock-out history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{entry.date}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : 'In Progress'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{getHoursWorked(entry)}</div>
                <Badge variant={entry.clockOut ? "secondary" : "default"} className="text-xs">
                  {entry.clockOut ? "Completed" : "Active"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}