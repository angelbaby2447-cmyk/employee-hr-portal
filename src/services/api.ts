import {
  User,
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  CompanySettings,
  DashboardStats,
  ReportsSummary
} from '../types.ts';

const TOKEN_KEY = 'hr_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeStoredToken();
    // Dispatch custom event for session expiry
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Your session has expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async getAuthStatus(): Promise<{ configured: boolean; message: string }> {
    return request<{ configured: boolean; message: string }>('/api/auth/status');
  },

  async setupAdmin(data: { name: string; email: string; password: string }): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async forgotPassword(email: string, newPassword?: string): Promise<{ message: string; verified?: boolean }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(name: string, email: string): Promise<{ user: User; message: string }> {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Dashboard
  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<DashboardStats>(`/api/dashboard/stats${query}`);
  },

  // Employees
  async getEmployees(params?: { search?: string; departmentId?: string; status?: string }): Promise<{ employees: Employee[]; count: number }> {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.departmentId) sp.append('departmentId', params.departmentId);
    if (params?.status) sp.append('status', params.status);

    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<{ employees: Employee[]; count: number }>(`/api/employees${qs}`);
  },

  async getEmployee(id: string): Promise<{ employee: Employee; recentAttendance: AttendanceRecord[]; recentLeaves: LeaveRequest[] }> {
    return request(`/api/employees/${encodeURIComponent(id)}`);
  },

  async createEmployee(data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
    return request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
    return request(`/api/employees/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteEmployee(id: string): Promise<{ message: string }> {
    return request(`/api/employees/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Departments
  async getDepartments(): Promise<{ departments: Department[] }> {
    return request<{ departments: Department[] }>('/api/departments');
  },

  async createDepartment(data: Partial<Department>): Promise<{ message: string; department: Department }> {
    return request('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<{ message: string; department: Department }> {
    return request(`/api/departments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteDepartment(id: string): Promise<{ message: string }> {
    return request(`/api/departments/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Attendance
  async getAttendance(params?: { date?: string; departmentId?: string; status?: string }): Promise<{
    date: string;
    records: AttendanceRecord[];
    summary: {
      total: number;
      present: number;
      late: number;
      absent: number;
      leave: number;
      presentRatePct: number;
    };
  }> {
    const sp = new URLSearchParams();
    if (params?.date) sp.append('date', params.date);
    if (params?.departmentId) sp.append('departmentId', params.departmentId);
    if (params?.status) sp.append('status', params.status);

    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request(`/api/attendance${qs}`);
  },

  async markAttendance(data: {
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }): Promise<{ message: string; record: AttendanceRecord }> {
    return request('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async bulkMarkAttendance(date: string, status: 'Present' | 'Absent' | 'Late' | 'Leave', employeeIds?: string[]): Promise<{ message: string }> {
    return request('/api/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ date, status, employeeIds })
    });
  },

  // Leaves
  async getLeaves(params?: { status?: string; employeeId?: string }): Promise<{ leaves: LeaveRequest[]; count: number }> {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.employeeId) sp.append('employeeId', params.employeeId);

    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<{ leaves: LeaveRequest[]; count: number }>(`/api/leaves${qs}`);
  },

  async createLeave(data: {
    employeeId: string;
    leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<{ message: string; leave: LeaveRequest }> {
    return request('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', reviewNote?: string): Promise<{ message: string; leave: LeaveRequest }> {
    return request(`/api/leaves/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNote })
    });
  },

  // Reports
  async getReportsSummary(): Promise<ReportsSummary> {
    return request<ReportsSummary>('/api/reports/summary');
  },

  downloadCsvUrl(type: 'employees' | 'attendance' | 'leaves'): string {
    const token = getStoredToken();
    return `/api/reports/export-csv?type=${type}${token ? `&auth_token=${token}` : ''}`;
  },

  async triggerCsvDownload(type: 'employees' | 'attendance' | 'leaves') {
    const token = getStoredToken();
    const response = await fetch(`/api/reports/export-csv?type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to generate CSV export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Settings
  async getSettings(): Promise<{ settings: CompanySettings }> {
    return request<{ settings: CompanySettings }>('/api/settings');
  },

  async updateSettings(data: Partial<CompanySettings>): Promise<{ message: string; settings: CompanySettings }> {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async resetDatabase(): Promise<{ message: string }> {
    return request('/api/settings/reset-database', {
      method: 'POST'
    });
  },

  async downloadDatabaseBackup() {
    const token = getStoredToken();
    const response = await fetch('/api/settings/backup', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to download backup');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
