import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'hr_manager';
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
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
}

export interface Employee {
  id: string; // e.g. EMP-1001
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
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkInTime: string;
  checkOutTime: string;
  notes: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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

export interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  departments: Department[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  settings: CompanySettings;
}

// Password hashing utility using built-in scrypt
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const calculatedHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(calculatedHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// File path for database
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'hr_portal_db.json');

// Default initial seed data with rich, realistic enterprise records
export function getInitialSeedData(): DatabaseSchema {
  const adminSalt = generateSalt();
  const adminHash = hashPassword('Admin@12345', adminSalt);

  const departments: Department[] = [
    {
      id: 'DEP-01',
      name: 'Engineering',
      code: 'ENG',
      managerId: 'EMP-1001',
      managerName: 'Sarah Jenkins',
      budget: 850000,
      location: 'Building A, Floor 4',
      description: 'Core software engineering, cloud architecture, and infrastructure security.',
      createdAt: '2024-01-15'
    },
    {
      id: 'DEP-02',
      name: 'Product & Design',
      code: 'PRD',
      managerId: 'EMP-1003',
      managerName: 'Marcus Vance',
      budget: 420000,
      location: 'Building A, Floor 3',
      description: 'Product lifecycle strategy, user experience research, and design systems.',
      createdAt: '2024-01-15'
    },
    {
      id: 'DEP-03',
      name: 'Human Resources',
      code: 'HR',
      managerId: 'EMP-1002',
      managerName: 'Elena Rostova',
      budget: 310000,
      location: 'Building B, Floor 2',
      description: 'Talent acquisition, employee wellness, compliance, and organizational culture.',
      createdAt: '2024-01-15'
    },
    {
      id: 'DEP-04',
      name: 'Sales & Marketing',
      code: 'MKT',
      managerId: 'EMP-1005',
      managerName: 'David Kalu',
      budget: 680000,
      location: 'Building B, Floor 1',
      description: 'B2B enterprise account executives, brand management, and inbound demand generation.',
      createdAt: '2024-02-01'
    },
    {
      id: 'DEP-05',
      name: 'Finance & Operations',
      code: 'FIN',
      managerId: 'EMP-1007',
      managerName: 'Victoria Chen',
      budget: 490000,
      location: 'Building A, Floor 2',
      description: 'Financial forecasting, treasury, accounts payable, and procurement oversight.',
      createdAt: '2024-02-15'
    },
    {
      id: 'DEP-06',
      name: 'Customer Support',
      code: 'SUP',
      managerId: 'EMP-1009',
      managerName: 'Liam O’Connor',
      budget: 275000,
      location: 'Building B, Floor 3',
      description: 'Tier-1 to Tier-3 client technical support, SLA tracking, and resolution management.',
      createdAt: '2024-03-01'
    }
  ];

  const employees: Employee[] = [
    {
      id: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 's.jenkins@portal.org',
      phone: '+1 (555) 234-5671',
      departmentId: 'DEP-01',
      departmentName: 'Engineering',
      role: 'VP of Engineering',
      salary: 165000,
      joinDate: '2023-03-15',
      status: 'Active',
      avatarBg: '#2563eb',
      emergencyContact: {
        name: 'Robert Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 234-9988'
      },
      address: '742 Evergreen Terr, Springfield, OR'
    },
    {
      id: 'EMP-1002',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'e.rostova@portal.org',
      phone: '+1 (555) 345-6782',
      departmentId: 'DEP-03',
      departmentName: 'Human Resources',
      role: 'HR Director',
      salary: 130000,
      joinDate: '2023-04-01',
      status: 'Active',
      avatarBg: '#059669',
      emergencyContact: {
        name: 'Mikhail Rostov',
        relationship: 'Brother',
        phone: '+1 (555) 345-0012'
      },
      address: '128 Pinecrest Ave, Seattle, WA'
    },
    {
      id: 'EMP-1003',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'm.vance@portal.org',
      phone: '+1 (555) 456-7893',
      departmentId: 'DEP-02',
      departmentName: 'Product & Design',
      role: 'Head of Product',
      salary: 145000,
      joinDate: '2023-05-10',
      status: 'Active',
      avatarBg: '#7c3aed',
      emergencyContact: {
        name: 'Clara Vance',
        relationship: 'Partner',
        phone: '+1 (555) 456-1123'
      },
      address: '450 Bayview Blvd, San Francisco, CA'
    },
    {
      id: 'EMP-1004',
      firstName: 'Amina',
      lastName: 'Diallo',
      email: 'a.diallo@portal.org',
      phone: '+1 (555) 567-8904',
      departmentId: 'DEP-01',
      departmentName: 'Engineering',
      role: 'Staff Cloud Architect',
      salary: 152000,
      joinDate: '2023-06-20',
      status: 'Active',
      avatarBg: '#0891b2',
      emergencyContact: {
        name: 'Ousmane Diallo',
        relationship: 'Father',
        phone: '+1 (555) 567-4490'
      },
      address: '89 Beacon St, Boston, MA'
    },
    {
      id: 'EMP-1005',
      firstName: 'David',
      lastName: 'Kalu',
      email: 'd.kalu@portal.org',
      phone: '+1 (555) 678-9015',
      departmentId: 'DEP-04',
      departmentName: 'Sales & Marketing',
      role: 'VP of Global Sales',
      salary: 155000,
      joinDate: '2023-08-01',
      status: 'Active',
      avatarBg: '#d97706',
      emergencyContact: {
        name: 'Grace Kalu',
        relationship: 'Spouse',
        phone: '+1 (555) 678-3321'
      },
      address: '320 Michigan Ave, Chicago, IL'
    },
    {
      id: 'EMP-1006',
      firstName: 'Chloe',
      lastName: 'Dupont',
      email: 'c.dupont@portal.org',
      phone: '+1 (555) 789-0126',
      departmentId: 'DEP-02',
      departmentName: 'Product & Design',
      role: 'Lead UX Researcher',
      salary: 118000,
      joinDate: '2023-09-15',
      status: 'On Leave',
      avatarBg: '#db2777',
      emergencyContact: {
        name: 'Luc Dupont',
        relationship: 'Father',
        phone: '+1 (555) 789-9944'
      },
      address: '512 Austin Way, Austin, TX'
    },
    {
      id: 'EMP-1007',
      firstName: 'Victoria',
      lastName: 'Chen',
      email: 'v.chen@portal.org',
      phone: '+1 (555) 890-1237',
      departmentId: 'DEP-05',
      departmentName: 'Finance & Operations',
      role: 'Chief Financial Officer',
      salary: 168000,
      joinDate: '2023-10-01',
      status: 'Active',
      avatarBg: '#4f46e5',
      emergencyContact: {
        name: 'Henry Chen',
        relationship: 'Spouse',
        phone: '+1 (555) 890-7766'
      },
      address: '90 Wall St, New York, NY'
    },
    {
      id: 'EMP-1008',
      firstName: 'Ethan',
      lastName: 'Ramirez',
      email: 'e.ramirez@portal.org',
      phone: '+1 (555) 901-2348',
      departmentId: 'DEP-01',
      departmentName: 'Engineering',
      role: 'Senior Frontend Engineer',
      salary: 125000,
      joinDate: '2023-11-05',
      status: 'Active',
      avatarBg: '#ea580c',
      emergencyContact: {
        name: 'Sofia Ramirez',
        relationship: 'Mother',
        phone: '+1 (555) 901-6655'
      },
      address: '1410 Market St, Denver, CO'
    },
    {
      id: 'EMP-1009',
      firstName: 'Liam',
      lastName: 'O’Connor',
      email: 'l.oconnor@portal.org',
      phone: '+1 (555) 012-3459',
      departmentId: 'DEP-06',
      departmentName: 'Customer Support',
      role: 'Support Operations Lead',
      salary: 95000,
      joinDate: '2024-01-08',
      status: 'Active',
      avatarBg: '#0d9488',
      emergencyContact: {
        name: 'Maeve O’Connor',
        relationship: 'Sister',
        phone: '+1 (555) 012-1188'
      },
      address: '67 Congress St, Portland, ME'
    },
    {
      id: 'EMP-1010',
      firstName: 'Maya',
      lastName: 'Patel',
      email: 'm.patel@portal.org',
      phone: '+1 (555) 123-4560',
      departmentId: 'DEP-04',
      departmentName: 'Sales & Marketing',
      role: 'Senior Growth Strategist',
      salary: 110000,
      joinDate: '2024-02-14',
      status: 'Active',
      avatarBg: '#e11d48',
      emergencyContact: {
        name: 'Raj Patel',
        relationship: 'Spouse',
        phone: '+1 (555) 123-9009'
      },
      address: '88 Peachtreet St, Atlanta, GA'
    },
    {
      id: 'EMP-1011',
      firstName: 'Julian',
      lastName: 'Holt',
      email: 'j.holt@portal.org',
      phone: '+1 (555) 234-5670',
      departmentId: 'DEP-05',
      departmentName: 'Finance & Operations',
      role: 'Senior Financial Analyst',
      salary: 104000,
      joinDate: '2024-03-01',
      status: 'Active',
      avatarBg: '#64748b',
      emergencyContact: {
        name: 'Diane Holt',
        relationship: 'Mother',
        phone: '+1 (555) 234-8877'
      },
      address: '22 Elm St, Columbus, OH'
    },
    {
      id: 'EMP-1012',
      firstName: 'Kaitlyn',
      lastName: 'Brooks',
      email: 'k.brooks@portal.org',
      phone: '+1 (555) 345-6789',
      departmentId: 'DEP-03',
      departmentName: 'Human Resources',
      role: 'Talent Acquisition Partner',
      salary: 88000,
      joinDate: '2024-04-12',
      status: 'Active',
      avatarBg: '#16a34a',
      emergencyContact: {
        name: 'Samuel Brooks',
        relationship: 'Father',
        phone: '+1 (555) 345-7766'
      },
      address: '77 Franklin Way, Charlotte, NC'
    }
  ];

  // Today's date in local ISO format (e.g. 2026-10-28)
  const todayStr = '2026-10-28';
  const yesterdayStr = '2026-10-27';

  const attendance: AttendanceRecord[] = [
    {
      id: 'ATT-20261028-001',
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:52 AM',
      checkOutTime: '—',
      notes: 'On-site: Architecture review'
    },
    {
      id: 'ATT-20261028-002',
      employeeId: 'EMP-1002',
      employeeName: 'Elena Rostova',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:45 AM',
      checkOutTime: '—',
      notes: 'On-site: Executive 1-on-1s'
    },
    {
      id: 'ATT-20261028-003',
      employeeId: 'EMP-1003',
      employeeName: 'Marcus Vance',
      date: todayStr,
      status: 'Present',
      checkInTime: '09:05 AM',
      checkOutTime: '—',
      notes: 'Remote: Product roadmap sync'
    },
    {
      id: 'ATT-20261028-004',
      employeeId: 'EMP-1004',
      employeeName: 'Amina Diallo',
      date: todayStr,
      status: 'Late',
      checkInTime: '09:42 AM',
      checkOutTime: '—',
      notes: 'Transit delay on Green Line'
    },
    {
      id: 'ATT-20261028-005',
      employeeId: 'EMP-1005',
      employeeName: 'David Kalu',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:30 AM',
      checkOutTime: '—',
      notes: 'Customer presentation in Boardroom B'
    },
    {
      id: 'ATT-20261028-006',
      employeeId: 'EMP-1006',
      employeeName: 'Chloe Dupont',
      date: todayStr,
      status: 'Leave',
      checkInTime: '—',
      checkOutTime: '—',
      notes: 'Approved Annual Leave'
    },
    {
      id: 'ATT-20261028-007',
      employeeId: 'EMP-1007',
      employeeName: 'Victoria Chen',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:50 AM',
      checkOutTime: '—',
      notes: 'Q4 Audit preparations'
    },
    {
      id: 'ATT-20261028-008',
      employeeId: 'EMP-1008',
      employeeName: 'Ethan Ramirez',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:58 AM',
      checkOutTime: '—',
      notes: 'Core frontend sprint tasks'
    },
    {
      id: 'ATT-20261028-009',
      employeeId: 'EMP-1009',
      employeeName: 'Liam O’Connor',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:40 AM',
      checkOutTime: '—',
      notes: 'Managing morning shift escalation queue'
    },
    {
      id: 'ATT-20261028-010',
      employeeId: 'EMP-1010',
      employeeName: 'Maya Patel',
      date: todayStr,
      status: 'Absent',
      checkInTime: '—',
      checkOutTime: '—',
      notes: 'Unplanned absence - notified HR'
    },
    {
      id: 'ATT-20261028-011',
      employeeId: 'EMP-1011',
      employeeName: 'Julian Holt',
      date: todayStr,
      status: 'Present',
      checkInTime: '09:00 AM',
      checkOutTime: '—',
      notes: 'On-site: Budget ledger reconciliation'
    },
    {
      id: 'ATT-20261028-012',
      employeeId: 'EMP-1012',
      employeeName: 'Kaitlyn Brooks',
      date: todayStr,
      status: 'Present',
      checkInTime: '08:48 AM',
      checkOutTime: '—',
      notes: 'Conducting candidate technical interviews'
    },
    // Yesterday records
    {
      id: 'ATT-20261027-001',
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      date: yesterdayStr,
      status: 'Present',
      checkInTime: '08:55 AM',
      checkOutTime: '05:30 PM',
      notes: 'Full day'
    },
    {
      id: 'ATT-20261027-002',
      employeeId: 'EMP-1002',
      employeeName: 'Elena Rostova',
      date: yesterdayStr,
      status: 'Present',
      checkInTime: '08:45 AM',
      checkOutTime: '05:15 PM',
      notes: 'Full day'
    },
    {
      id: 'ATT-20261027-006',
      employeeId: 'EMP-1006',
      employeeName: 'Chloe Dupont',
      date: yesterdayStr,
      status: 'Leave',
      checkInTime: '—',
      checkOutTime: '—',
      notes: 'Approved Annual Leave'
    }
  ];

  const leaves: LeaveRequest[] = [
    {
      id: 'LR-101',
      employeeId: 'EMP-1006',
      employeeName: 'Chloe Dupont',
      departmentName: 'Product & Design',
      leaveType: 'Annual',
      startDate: '2026-10-27',
      endDate: '2026-10-31',
      days: 5,
      reason: 'Scheduled autumn family vacation.',
      status: 'Approved',
      appliedAt: '2026-10-14 10:20',
      reviewedBy: 'Elena Rostova (HR)',
      reviewedAt: '2026-10-15 09:30',
      reviewNote: 'Approved. Handover documentation confirmed.'
    },
    {
      id: 'LR-102',
      employeeId: 'EMP-1008',
      employeeName: 'Ethan Ramirez',
      departmentName: 'Engineering',
      leaveType: 'Sick',
      startDate: '2026-11-02',
      endDate: '2026-11-03',
      days: 2,
      reason: 'Scheduled dental oral surgery and medical recovery.',
      status: 'Pending',
      appliedAt: '2026-10-28 08:15'
    },
    {
      id: 'LR-103',
      employeeId: 'EMP-1010',
      employeeName: 'Maya Patel',
      departmentName: 'Sales & Marketing',
      leaveType: 'Casual',
      startDate: '2026-11-06',
      endDate: '2026-11-06',
      days: 1,
      reason: 'Attending sibling university graduation ceremony.',
      status: 'Pending',
      appliedAt: '2026-10-27 16:45'
    },
    {
      id: 'LR-104',
      employeeId: 'EMP-1004',
      employeeName: 'Amina Diallo',
      departmentName: 'Engineering',
      leaveType: 'Annual',
      startDate: '2026-11-23',
      endDate: '2026-11-27',
      days: 5,
      reason: 'Thanksgiving holiday travel to visit relatives.',
      status: 'Pending',
      appliedAt: '2026-10-26 14:10'
    },
    {
      id: 'LR-105',
      employeeId: 'EMP-1011',
      employeeName: 'Julian Holt',
      departmentName: 'Finance & Operations',
      leaveType: 'Sick',
      startDate: '2026-10-10',
      endDate: '2026-10-11',
      days: 2,
      reason: 'Acute seasonal flu and doctor ordered rest.',
      status: 'Approved',
      appliedAt: '2026-10-09 18:00',
      reviewedBy: 'Elena Rostova (HR)',
      reviewedAt: '2026-10-10 08:00',
      reviewNote: 'Approved medical leave with certificate.'
    },
    {
      id: 'LR-106',
      employeeId: 'EMP-1009',
      employeeName: 'Liam O’Connor',
      departmentName: 'Customer Support',
      leaveType: 'Casual',
      startDate: '2026-09-18',
      endDate: '2026-09-19',
      days: 2,
      reason: 'Personal urgent real estate relocation.',
      status: 'Rejected',
      appliedAt: '2026-09-15 11:30',
      reviewedBy: 'Elena Rostova (HR)',
      reviewedAt: '2026-09-16 14:20',
      reviewNote: 'Conflict with major customer onboarding shift schedule.'
    }
  ];

  const settings: CompanySettings = {
    companyName: 'Acme Enterprise Technologies',
    hrEmail: 'hr@acmetech.com',
    currency: 'USD ($)',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    leaveAnnualAllowance: 24,
    timezone: 'America/Los_Angeles'
  };

  return {
    users: [
      {
        id: 'USR-ADMIN-01',
        name: 'Administrator',
        email: 'admin@hrportal.com',
        passwordHash: adminHash,
        salt: adminSalt,
        role: 'admin',
        createdAt: '2024-01-01'
      }
    ],
    sessions: [],
    departments,
    employees,
    attendance,
    leaves,
    settings
  };
}

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.employees && parsed.departments && parsed.users) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to read database file, initializing seed data:', err);
    }

    const initial = getInitialSeedData();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public resetToSeed() {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // --- Users & Sessions ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createSession(userId: string): string {
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.data.sessions.push({ token, userId, expiresAt });
    this.save();
    return token;
  }

  public getSessionUser(token: string): User | null {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.deleteSession(token);
      return null;
    }
    const user = this.findUserById(session.userId);
    return user || null;
  }

  public deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  public updateUserProfile(userId: string, name: string, email: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    user.name = name;
    user.email = email;
    this.save();
    return user;
  }

  public changeUserPassword(userId: string, newPasswordPlain: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    user.salt = generateSalt();
    user.passwordHash = hashPassword(newPasswordPlain, user.salt);
    this.save();
    return true;
  }

  public resetPasswordByEmail(email: string, newPasswordPlain: string) {
    const user = this.findUserByEmail(email);
    if (!user) throw new Error('No administrator account found with this email address.');
    user.salt = generateSalt();
    user.passwordHash = hashPassword(newPasswordPlain, user.salt);
    this.save();
    return true;
  }

  public createAdminUser(name: string, email: string, passwordPlain: string, role: 'admin' | 'hr_manager' = 'admin'): User {
    const existing = this.findUserByEmail(email);
    if (existing) throw new Error('An account with this email already exists.');

    const salt = generateSalt();
    const passwordHash = hashPassword(passwordPlain, salt);
    const newUser: User = {
      id: `USR-ADMIN-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      salt,
      role: role || 'admin',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public hasAdminUsers(): boolean {
    return this.data.users.length > 0;
  }

  // --- Departments ---
  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public getDepartmentById(id: string): Department | undefined {
    return this.data.departments.find((d) => d.id === id);
  }

  public createDepartment(deptData: Omit<Department, 'id' | 'createdAt'>): Department {
    const id = `DEP-0${this.data.departments.length + 1}`;
    const newDept: Department = {
      id,
      ...deptData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.departments.push(newDept);
    this.save();
    return newDept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department {
    const index = this.data.departments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Department not found');
    this.data.departments[index] = { ...this.data.departments[index], ...updates };
    
    // Also update departmentName in employees if name changed
    if (updates.name) {
      this.data.employees.forEach((emp) => {
        if (emp.departmentId === id) {
          emp.departmentName = updates.name!;
        }
      });
    }
    this.save();
    return this.data.departments[index];
  }

  public deleteDepartment(id: string) {
    // Check if any employees are in this department
    const count = this.data.employees.filter((e) => e.departmentId === id).length;
    if (count > 0) {
      throw new Error(`Cannot delete department with ${count} active assigned employee(s). Reassign them first.`);
    }
    this.data.departments = this.data.departments.filter((d) => d.id !== id);
    this.save();
  }

  // --- Employees ---
  public getEmployees(params?: { search?: string; departmentId?: string; status?: string }): Employee[] {
    let list = [...this.data.employees];
    if (!params) return list;

    if (params.departmentId && params.departmentId !== 'all') {
      list = list.filter((e) => e.departmentId === params.departmentId);
    }
    if (params.status && params.status !== 'all') {
      list = list.filter((e) => e.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find((e) => e.id === id);
  }

  public createEmployee(empData: Omit<Employee, 'id'>): Employee {
    const nextNum = 1000 + this.data.employees.length + 1;
    const id = `EMP-${nextNum}`;
    
    // Choose avatar color
    const colors = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#4f46e5', '#db2777', '#0891b2', '#ea580c'];
    const avatarBg = empData.avatarBg || colors[Math.floor(Math.random() * colors.length)];

    const newEmp: Employee = {
      id,
      ...empData,
      avatarBg
    };

    this.data.employees.unshift(newEmp);
    this.save();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee {
    const index = this.data.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    this.data.employees[index] = { ...this.data.employees[index], ...updates };
    this.save();
    return this.data.employees[index];
  }

  public deleteEmployee(id: string) {
    this.data.employees = this.data.employees.filter((e) => e.id !== id);
    // Also clean up or preserve attendance/leaves
    this.save();
  }

  // --- Attendance ---
  public getAttendance(params?: { date?: string; departmentId?: string; status?: string }): AttendanceRecord[] {
    let list = [...this.data.attendance];
    if (!params) return list;

    if (params.date) {
      list = list.filter((a) => a.date === params.date);
    }
    if (params.status && params.status !== 'all') {
      list = list.filter((a) => a.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params.departmentId && params.departmentId !== 'all') {
      const empIds = new Set(
        this.data.employees.filter((e) => e.departmentId === params.departmentId).map((e) => e.id)
      );
      list = list.filter((a) => empIds.has(a.employeeId));
    }
    return list;
  }

  public markAttendance(record: {
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }): AttendanceRecord {
    const employee = this.getEmployeeById(record.employeeId);
    if (!employee) throw new Error('Employee not found');

    const existingIndex = this.data.attendance.findIndex(
      (a) => a.employeeId === record.employeeId && a.date === record.date
    );

    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let finalRecord: AttendanceRecord;
    if (existingIndex >= 0) {
      const current = this.data.attendance[existingIndex];
      finalRecord = {
        ...current,
        status: record.status,
        checkInTime: record.checkInTime !== undefined ? record.checkInTime : current.checkInTime || (record.status === 'Present' || record.status === 'Late' ? nowTime : '—'),
        checkOutTime: record.checkOutTime !== undefined ? record.checkOutTime : current.checkOutTime,
        notes: record.notes !== undefined ? record.notes : current.notes
      };
      this.data.attendance[existingIndex] = finalRecord;
    } else {
      finalRecord = {
        id: `ATT-${record.date.replace(/-/g, '')}-${record.employeeId}`,
        employeeId: record.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: record.date,
        status: record.status,
        checkInTime: record.checkInTime || (record.status === 'Present' || record.status === 'Late' ? nowTime : '—'),
        checkOutTime: record.checkOutTime || '—',
        notes: record.notes || ''
      };
      this.data.attendance.unshift(finalRecord);
    }

    this.save();
    return finalRecord;
  }

  public bulkMarkAttendance(date: string, status: 'Present' | 'Absent' | 'Late' | 'Leave', employeeIds?: string[]) {
    const targetIds = employeeIds && employeeIds.length > 0 ? employeeIds : this.data.employees.filter((e) => e.status !== 'Terminated').map((e) => e.id);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    for (const empId of targetIds) {
      this.markAttendance({
        employeeId: empId,
        date,
        status,
        checkInTime: status === 'Present' || status === 'Late' ? nowTime : '—'
      });
    }
    this.save();
  }

  // --- Leaves ---
  public getLeaves(params?: { status?: string; employeeId?: string }): LeaveRequest[] {
    let list = [...this.data.leaves];
    if (params?.status && params.status !== 'all') {
      list = list.filter((l) => l.status.toLowerCase() === params.status?.toLowerCase());
    }
    if (params?.employeeId) {
      list = list.filter((l) => l.employeeId === params.employeeId);
    }
    return list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  public createLeave(leaveData: {
    employeeId: string;
    leaveType: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }): LeaveRequest {
    const employee = this.getEmployeeById(leaveData.employeeId);
    if (!employee) throw new Error('Employee not found');

    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newLeave: LeaveRequest = {
      id: `LR-${100 + this.data.leaves.length + 1}`,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      departmentName: employee.departmentName,
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      days,
      reason: leaveData.reason,
      status: 'Pending',
      appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    this.data.leaves.unshift(newLeave);
    this.save();
    return newLeave;
  }

  public updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', reviewerName: string, reviewNote?: string): LeaveRequest {
    const index = this.data.leaves.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Leave request not found');

    const leave = this.data.leaves[index];
    leave.status = status;
    leave.reviewedBy = reviewerName;
    leave.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (reviewNote) leave.reviewNote = reviewNote;

    // If approved, sync attendance for dates if within current scope
    if (status === 'Approved') {
      const cur = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (cur <= end) {
        const dStr = cur.toISOString().split('T')[0];
        this.markAttendance({
          employeeId: leave.employeeId,
          date: dStr,
          status: 'Leave',
          notes: `Approved ${leave.leaveType} Leave: ${leave.reason}`
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    this.save();
    return leave;
  }

  // --- Settings ---
  public getSettings(): CompanySettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<CompanySettings>): CompanySettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Reports & Stats ---
  public getDashboardStats(date: string = '2026-10-28') {
    const totalEmployees = this.data.employees.length;
    const activeEmployees = this.data.employees.filter((e) => e.status === 'Active').length;
    const onLeaveEmployees = this.data.employees.filter((e) => e.status === 'On Leave').length;

    const dayAttendance = this.data.attendance.filter((a) => a.date === date);
    const presentToday = dayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const absentToday = dayAttendance.filter((a) => a.status === 'Absent').length;
    const lateToday = dayAttendance.filter((a) => a.status === 'Late').length;
    const onLeaveToday = dayAttendance.filter((a) => a.status === 'Leave').length;

    // Department breakdown
    const departmentDistribution = this.data.departments.map((dept) => {
      const count = this.data.employees.filter((e) => e.departmentId === dept.id).length;
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        count
      };
    });

    const pendingLeaves = this.data.leaves.filter((l) => l.status === 'Pending');

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      departmentDistribution,
      pendingLeavesCount: pendingLeaves.length,
      pendingLeaves: pendingLeaves.slice(0, 5),
      recentAttendance: dayAttendance.slice(0, 6)
    };
  }

  public getReportsSummary() {
    const totalEmployees = this.data.employees.length;
    const activeCount = this.data.employees.filter((e) => e.status === 'Active').length;
    const totalPayroll = this.data.employees.reduce((acc, e) => acc + (e.salary || 0), 0);
    const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    // Department payroll & headcount
    const deptReports = this.data.departments.map((d) => {
      const emps = this.data.employees.filter((e) => e.departmentId === d.id);
      const payroll = emps.reduce((acc, e) => acc + (e.salary || 0), 0);
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        headcount: emps.length,
        payroll,
        budget: d.budget,
        budgetUtilizationPct: d.budget > 0 ? Math.round((payroll / d.budget) * 100) : 0
      };
    });

    // Attendance rate across all recorded days
    const allRecords = this.data.attendance;
    const presentOrLate = allRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const overallAttendanceRate = allRecords.length > 0 ? Math.round((presentOrLate / allRecords.length) * 100) : 94;

    // Leave counts by type
    const leaveBreakdown = {
      Annual: this.data.leaves.filter((l) => l.leaveType === 'Annual').length,
      Sick: this.data.leaves.filter((l) => l.leaveType === 'Sick').length,
      Casual: this.data.leaves.filter((l) => l.leaveType === 'Casual').length,
      Maternity: this.data.leaves.filter((l) => l.leaveType === 'Maternity').length,
      Unpaid: this.data.leaves.filter((l) => l.leaveType === 'Unpaid').length
    };

    return {
      totalEmployees,
      activeCount,
      totalPayroll,
      avgSalary,
      overallAttendanceRate,
      deptReports,
      leaveBreakdown,
      totalLeavesLogged: this.data.leaves.length,
      approvedLeaves: this.data.leaves.filter((l) => l.status === 'Approved').length,
      pendingLeaves: this.data.leaves.filter((l) => l.status === 'Pending').length
    };
  }
}

export const db = new PersistentDatabase();
