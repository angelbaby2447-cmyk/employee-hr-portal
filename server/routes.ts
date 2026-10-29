import { Router, Request, Response, NextFunction } from 'express';
import { db, verifyPassword, User } from './db.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

export const apiRouter = Router();

// Middleware: Authenticate Admin User
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is missing' });
  }

  const token = authHeader.split(' ')[1];
  const user = db.getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  req.user = user;
  req.token = token;
  next();
}

// -----------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// -----------------------------------------------------------------------------

// POST /api/auth/login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  const isMatch = verifyPassword(password, user.salt, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  const token = db.createSession(user.id);

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// GET /api/auth/status - check if admin accounts are initialized
apiRouter.get('/auth/status', (_req: Request, res: Response) => {
  const hasAdmins = db.hasAdminUsers();
  return res.json({
    configured: hasAdmins,
    message: hasAdmins
      ? 'System is initialized with active administrator accounts.'
      : 'Initial configuration required: No administrator registered.'
  });
});

// POST /api/auth/setup-admin - securely provision administrator
apiRouter.post('/auth/setup-admin', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const newUser = db.createAdminUser(name, email, password);
    const token = db.createSession(newUser.id);
    return res.status(201).json({
      message: 'Administrator account configured successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to setup administrator' });
  }
});

// POST /api/auth/register - Register / Create new admin account
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid work email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const assignedRole = role === 'hr_manager' ? 'hr_manager' : 'admin';
    const newUser = db.createAdminUser(name, email, password, assignedRole);
    const token = db.createSession(newUser.id);
    return res.status(201).json({
      message: 'Account created successfully! Welcome to Employee HR Portal.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create account' });
  }
});

// POST /api/auth/forgot-password - secure password reset
apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No administrator account associated with this email.' });
  }

  if (!newPassword) {
    // If only email is provided, verify account existence and inform user
    return res.json({
      verified: true,
      message: 'Account verified. You can now define a new secure password.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    db.resetPasswordByEmail(email, newPassword);
    return res.json({ message: 'Administrator password reset successfully. Please log in.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to reset password' });
  }
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.token) {
    db.deleteSession(req.token);
  }
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// PUT /api/auth/profile
apiRouter.put('/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const updated = db.updateUserProfile(req.user!.id, name, email);
    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

// PUT /api/auth/password
apiRouter.put('/auth/password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = req.user!;
  const isValid = verifyPassword(currentPassword, user.salt, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  db.changeUserPassword(user.id, newPassword);
  return res.json({ message: 'Password changed successfully' });
});

// -----------------------------------------------------------------------------
// DASHBOARD ROUTES
// -----------------------------------------------------------------------------

// GET /api/dashboard/stats
apiRouter.get('/dashboard/stats', requireAuth, (req: Request, res: Response) => {
  const date = (req.query.date as string) || '2026-10-28';
  const stats = db.getDashboardStats(date);
  return res.json(stats);
});

// -----------------------------------------------------------------------------
// EMPLOYEE ROUTES
// -----------------------------------------------------------------------------

// GET /api/employees
apiRouter.get('/employees', requireAuth, (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const departmentId = req.query.departmentId as string | undefined;
  const status = req.query.status as string | undefined;

  const employees = db.getEmployees({ search, departmentId, status });
  return res.json({ employees, count: employees.length });
});

// GET /api/employees/:id
apiRouter.get('/employees/:id', requireAuth, (req: Request, res: Response) => {
  const employee = db.getEmployeeById(req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  // Also include employee's recent attendance & leaves
  const attendance = db.getAttendance().filter((a) => a.employeeId === employee.id).slice(0, 10);
  const leaves = db.getLeaves({ employeeId: employee.id }).slice(0, 5);

  return res.json({ employee, recentAttendance: attendance, recentLeaves: leaves });
});

// POST /api/employees
apiRouter.post('/employees', requireAuth, (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, departmentId, role, salary, joinDate, status, emergencyContact, address } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !departmentId || !role) {
    return res.status(400).json({ error: 'First name, last name, email, department, and role are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const dept = db.getDepartmentById(departmentId);
  if (!dept) {
    return res.status(400).json({ error: 'Selected department does not exist' });
  }

  const numSalary = Number(salary) || 0;
  if (numSalary < 0) {
    return res.status(400).json({ error: 'Salary cannot be negative' });
  }

  const newEmp = db.createEmployee({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || '+1 (555) 000-0000',
    departmentId,
    departmentName: dept.name,
    role: role.trim(),
    salary: numSalary,
    joinDate: joinDate || new Date().toISOString().split('T')[0],
    status: status || 'Active',
    avatarBg: '',
    emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '+1 (555) 999-9999' },
    address: address || '100 Enterprise Way'
  });

  return res.status(201).json({ message: 'Employee added successfully', employee: newEmp });
});

// PUT /api/employees/:id
apiRouter.put('/employees/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (updates.departmentId) {
      const dept = db.getDepartmentById(updates.departmentId);
      if (dept) {
        updates.departmentName = dept.name;
      }
    }
    if (updates.salary !== undefined) {
      updates.salary = Number(updates.salary) || 0;
    }

    const updated = db.updateEmployee(id, updates);
    return res.json({ message: 'Employee updated successfully', employee: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id
apiRouter.delete('/employees/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const emp = db.getEmployeeById(id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.deleteEmployee(id);
  return res.json({ message: `Employee ${emp.firstName} ${emp.lastName} deleted successfully` });
});

// -----------------------------------------------------------------------------
// DEPARTMENT ROUTES
// -----------------------------------------------------------------------------

// GET /api/departments
apiRouter.get('/departments', requireAuth, (req: Request, res: Response) => {
  const depts = db.getDepartments();
  const employees = db.getEmployees();

  const augmented = depts.map((d) => {
    const deptEmployees = employees.filter((e) => e.departmentId === d.id);
    return {
      ...d,
      employeeCount: deptEmployees.length,
      employees: deptEmployees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        role: e.role,
        email: e.email,
        status: e.status
      }))
    };
  });

  return res.json({ departments: augmented });
});

// POST /api/departments
apiRouter.post('/departments', requireAuth, (req: Request, res: Response) => {
  const { name, code, managerName, budget, location, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Department name and code are required' });
  }

  const newDept = db.createDepartment({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    managerId: '',
    managerName: managerName || 'Unassigned',
    budget: Number(budget) || 100000,
    location: location || 'Main Headquarters',
    description: description || 'Department responsible for operations.'
  });

  return res.status(201).json({ message: 'Department created successfully', department: newDept });
});

// PUT /api/departments/:id
apiRouter.put('/departments/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = db.updateDepartment(id, req.body);
    return res.json({ message: 'Department updated successfully', department: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update department' });
  }
});

// DELETE /api/departments/:id
apiRouter.delete('/departments/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    db.deleteDepartment(id);
    return res.json({ message: 'Department deleted successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to delete department' });
  }
});

// -----------------------------------------------------------------------------
// ATTENDANCE ROUTES
// -----------------------------------------------------------------------------

// GET /api/attendance
apiRouter.get('/attendance', requireAuth, (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const departmentId = req.query.departmentId as string | undefined;
  const status = req.query.status as string | undefined;

  const records = db.getAttendance({ date, departmentId, status });
  const allEmployees = db.getEmployees({ departmentId });

  // Map each employee to their record for the date (or mark as Unrecorded)
  const employeeAttendanceMatrix = allEmployees.map((emp) => {
    const existing = records.find((r) => r.employeeId === emp.id);
    return {
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.departmentName,
      departmentId: emp.departmentId,
      role: emp.role,
      date,
      status: existing ? existing.status : 'Absent',
      isRecorded: !!existing,
      checkInTime: existing ? existing.checkInTime : '—',
      checkOutTime: existing ? existing.checkOutTime : '—',
      notes: existing ? existing.notes : ''
    };
  });

  // Calculate day metrics
  const present = employeeAttendanceMatrix.filter((m) => m.status === 'Present').length;
  const late = employeeAttendanceMatrix.filter((m) => m.status === 'Late').length;
  const absent = employeeAttendanceMatrix.filter((m) => m.status === 'Absent').length;
  const leave = employeeAttendanceMatrix.filter((m) => m.status === 'Leave').length;

  return res.json({
    date,
    records: employeeAttendanceMatrix,
    summary: {
      total: employeeAttendanceMatrix.length,
      present,
      late,
      absent,
      leave,
      presentRatePct: employeeAttendanceMatrix.length > 0 ? Math.round(((present + late) / employeeAttendanceMatrix.length) * 100) : 0
    }
  });
});

// POST /api/attendance/mark
apiRouter.post('/attendance/mark', requireAuth, (req: Request, res: Response) => {
  const { employeeId, date, status, checkInTime, checkOutTime, notes } = req.body;

  if (!employeeId || !date || !status) {
    return res.status(400).json({ error: 'Employee ID, date, and status are required' });
  }

  const validStatuses = ['Present', 'Absent', 'Late', 'Leave'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const record = db.markAttendance({
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes
    });
    return res.json({ message: 'Attendance marked successfully', record });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to mark attendance' });
  }
});

// POST /api/attendance/bulk
apiRouter.post('/attendance/bulk', requireAuth, (req: Request, res: Response) => {
  const { date, status, employeeIds } = req.body;
  if (!date || !status) {
    return res.status(400).json({ error: 'Date and status are required' });
  }

  db.bulkMarkAttendance(date, status, employeeIds);
  return res.json({ message: `Bulk marked attendance for ${date} as ${status}` });
});

// -----------------------------------------------------------------------------
// LEAVE MANAGEMENT ROUTES
// -----------------------------------------------------------------------------

// GET /api/leaves
apiRouter.get('/leaves', requireAuth, (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const employeeId = req.query.employeeId as string | undefined;

  const leaves = db.getLeaves({ status, employeeId });
  return res.json({ leaves, count: leaves.length });
});

// POST /api/leaves
apiRouter.post('/leaves', requireAuth, (req: Request, res: Response) => {
  const { employeeId, leaveType, startDate, endDate, reason } = req.body;

  if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Employee, leave type, start date, end date, and reason are required' });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date cannot be after end date' });
  }

  try {
    const leave = db.createLeave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim()
    });
    return res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to submit leave request' });
  }
});

// PUT /api/leaves/:id/status
apiRouter.put('/leaves/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, reviewNote } = req.body;

  if (status !== 'Approved' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Status must be either Approved or Rejected' });
  }

  try {
    const reviewer = req.user ? `${req.user.name} (Admin)` : 'HR Admin';
    const updated = db.updateLeaveStatus(id, status, reviewer, reviewNote);
    return res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to review leave request' });
  }
});

// -----------------------------------------------------------------------------
// REPORTS ROUTES
// -----------------------------------------------------------------------------

// GET /api/reports/summary
apiRouter.get('/reports/summary', requireAuth, (req: Request, res: Response) => {
  const summary = db.getReportsSummary();
  return res.json(summary);
});

// GET /api/reports/export-csv
apiRouter.get('/reports/export-csv', requireAuth, (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'employees';

  if (type === 'employees') {
    const employees = db.getEmployees();
    const headers = 'ID,First Name,Last Name,Email,Phone,Department,Role,Salary,Join Date,Status\n';
    const rows = employees
      .map(
        (e) =>
          `"${e.id}","${e.firstName}","${e.lastName}","${e.email}","${e.phone}","${e.departmentName}","${e.role}",${e.salary},"${e.joinDate}","${e.status}"`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees-export.csv"');
    return res.send(headers + rows);
  }

  if (type === 'attendance') {
    const attendance = db.getAttendance();
    const headers = 'ID,Employee ID,Employee Name,Date,Status,Check In,Check Out,Notes\n';
    const rows = attendance
      .map(
        (a) =>
          `"${a.id}","${a.employeeId}","${a.employeeName}","${a.date}","${a.status}","${a.checkInTime}","${a.checkOutTime}","${a.notes.replace(/"/g, '""')}"`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.csv"');
    return res.send(headers + rows);
  }

  if (type === 'leaves') {
    const leaves = db.getLeaves();
    const headers = 'ID,Employee ID,Employee Name,Department,Type,Start Date,End Date,Days,Status,Reason,Reviewed By\n';
    const rows = leaves
      .map(
        (l) =>
          `"${l.id}","${l.employeeId}","${l.employeeName}","${l.departmentName}","${l.leaveType}","${l.startDate}","${l.endDate}",${l.days},"${l.status}","${l.reason.replace(/"/g, '""')}","${l.reviewedBy || '—'}"`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaves-export.csv"');
    return res.send(headers + rows);
  }

  return res.status(400).json({ error: 'Unknown export type' });
});

// -----------------------------------------------------------------------------
// SETTINGS ROUTES
// -----------------------------------------------------------------------------

// GET /api/settings
apiRouter.get('/settings', requireAuth, (req: Request, res: Response) => {
  return res.json({ settings: db.getSettings() });
});

// PUT /api/settings
apiRouter.put('/settings', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json({ message: 'Settings saved successfully', settings: updated });
});

// POST /api/settings/reset-database
apiRouter.post('/settings/reset-database', requireAuth, (req: Request, res: Response) => {
  db.resetToSeed();
  return res.json({ message: 'Database reset to initial sample data successfully' });
});

// GET /api/settings/backup
apiRouter.get('/settings/backup', requireAuth, (req: Request, res: Response) => {
  const backup = db.getRawData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="hr-portal-database-backup.json"');
  return res.send(JSON.stringify(backup, null, 2));
});
