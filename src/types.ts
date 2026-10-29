export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr_manager';
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId: string;
  managerName: string;
  budget: number;
  location: string;
  description: string;
  createdAt: string;
  employeeCount?: number;
  employees?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    status: string;
  }>;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  role: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatarBg: string;
  emergencyContact: EmergencyContact;
  address: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkInTime: string;
  checkOutTime: string;
  notes: string;
  departmentName?: string;
  departmentId?: string;
  role?: string;
  isRecorded?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CompanySettings {
  companyName: string;
  hrEmail: string;
  currency: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  leaveAnnualAllowance: number;
  timezone: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  departmentDistribution: Array<{
    id: string;
    name: string;
    code: string;
    count: number;
  }>;
  pendingLeavesCount: number;
  pendingLeaves: LeaveRequest[];
  recentAttendance: AttendanceRecord[];
}

export interface ReportsSummary {
  totalEmployees: number;
  activeCount: number;
  totalPayroll: number;
  avgSalary: number;
  overallAttendanceRate: number;
  deptReports: Array<{
    id: string;
    name: string;
    code: string;
    headcount: number;
    payroll: number;
    budget: number;
    budgetUtilizationPct: number;
  }>;
  leaveBreakdown: {
    Annual: number;
    Sick: number;
    Casual: number;
    Maternity: number;
    Unpaid: number;
  };
  totalLeavesLogged: number;
  approvedLeaves: number;
  pendingLeaves: number;
}
