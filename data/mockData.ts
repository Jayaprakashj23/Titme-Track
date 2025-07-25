export const mockEmployees = [
  {
    id: "employee-demo-id",
    name: "Demo Employee",
    email: "employee@demo.com",
    role: "employee",
    department: "Engineering",
    position: "Software Developer"
  },
  {
    id: "emp-2",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "employee",
    department: "Marketing",
    position: "Marketing Specialist"
  },
  {
    id: "emp-3",
    name: "Bob Wilson",
    email: "bob@company.com",
    role: "employee",
    department: "Sales",
    position: "Sales Representative"
  },
  {
    id: "emp-4",
    name: "Carol Brown",
    email: "carol@company.com",
    role: "employee",
    department: "HR",
    position: "HR Coordinator"
  }
]

export const mockTimeEntries = [
  {
    id: "entry-1",
    employeeId: "employee-demo-id",
    clockIn: new Date(2024, 0, 15, 9, 0),
    clockOut: new Date(2024, 0, 15, 17, 30),
    date: "2024-01-15"
  },
  {
    id: "entry-2",
    employeeId: "employee-demo-id",
    clockIn: new Date(2024, 0, 16, 8, 45),
    clockOut: new Date(2024, 0, 16, 17, 15),
    date: "2024-01-16"
  },
  {
    id: "entry-3",
    employeeId: "emp-2",
    clockIn: new Date(2024, 0, 16, 9, 15),
    clockOut: new Date(2024, 0, 16, 18, 0),
    date: "2024-01-16"
  },
  {
    id: "entry-4",
    employeeId: "emp-3",
    clockIn: new Date(2024, 0, 16, 8, 30),
    clockOut: undefined, // Still clocked in
    date: "2024-01-16"
  }
]

// Create today's date entries for better demo experience
const today = new Date().toISOString().split('T')[0]
const todayEntries = [
  {
    id: "today-1",
    employeeId: "employee-demo-id",
    clockIn: new Date(new Date().setHours(9, 0, 0, 0)),
    clockOut: undefined,
    date: today
  },
  {
    id: "today-2",
    employeeId: "emp-2",
    clockIn: new Date(new Date().setHours(8, 45, 0, 0)),
    clockOut: new Date(new Date().setHours(17, 15, 0, 0)),
    date: today
  }
]

// Add today's entries to mock data
mockTimeEntries.push(...todayEntries)