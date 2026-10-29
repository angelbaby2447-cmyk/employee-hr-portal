import React from 'react';
import { Menu, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { PageId } from './Sidebar.tsx';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobile: () => void;
}

const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of workforce metrics & today’s operations' },
  employees: { title: 'Employee Directory', subtitle: 'Manage staff profiles, roles, and status' },
  attendance: { title: 'Attendance Log', subtitle: 'Daily check-ins, status tracking, and notes' },
  departments: { title: 'Departments', subtitle: 'Organizational units, budgets, and leadership' },
  leaves: { title: 'Leave Management', subtitle: 'Review and approve employee time-off requests' },
  reports: { title: 'Analytics & Reports', subtitle: 'Workforce statistics, payroll, and export tools' },
  settings: { title: 'System Settings', subtitle: 'Company profile and persistent database management' }
};

export const Header: React.FC<HeaderProps> = ({ currentPage, onOpenMobile }) => {
  const { user } = useAuth();
  const current = pageTitles[currentPage];

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(2026, 9, 28)); // current local context: Oct 28, 2026

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Portal</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-semibold">{current.title}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 truncate tracking-tight hidden sm:block">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Right: Date and Admin Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="tabular-nums">{todayFormatted}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[130px] font-semibold">{user?.name || 'Administrator'}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};
