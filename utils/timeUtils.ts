export const formatTime = (date: Date, includeSeconds = false) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  }
  
  if (includeSeconds) {
    options.second = '2-digit'
  }
  
  return date.toLocaleTimeString('en-US', options)
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const getHoursWorked = (entry: { clockIn: Date; clockOut?: Date }) => {
  if (!entry.clockOut) return 'In Progress'
  const diff = entry.clockOut.getTime() - entry.clockIn.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export const calculateWorkingTime = (clockInTime: Date) => {
  const now = new Date()
  const diff = now.getTime() - clockInTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}