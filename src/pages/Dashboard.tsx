import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  CalendarCheck,
  UserX,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  XCircle,
  Building2,
  CalendarOff,
  AlertCircle
} from 'lucide-react';
import { DashboardStats, LeaveRequest } from '../types.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';
import { PageId } from '../components/Sidebar.tsx';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenAddEmployee: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAddEmployee }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveLeave = async (leave: LeaveRequest) => {
    try {
      setActionLoadingId(leave.id);
      await api.updateLeaveStatus(leave.id, 'Approved', 'Approved from Dashboard quick action');
      showToast(`Leave request for ${leave.employeeName} approved.`);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve leave', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectLeave = async (leave: LeaveRequest) => {
    try {
      setActionLoadingId(leave.id);
      await api.updateLeaveStatus(leave.id, 'Rejected', 'Declined from Dashboard quick review');
      showToast(`Leave request for ${leave.employeeName} rejected.`);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject leave', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-6 bg-white rounded-xl border border-rose-200 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to Load Dashboard</h3>
          <p className="text-xs text-slate-500 mb-4">{error || 'Unable to connect to server'}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Workforce Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status for today (Oct 28, 2026) across all 6 departments.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddEmployee}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-slate-500" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* 4 Main Stat Cards Required by Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Employees
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
              {stats.totalEmployees}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Registered in company</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Employees
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block tabular-nums">
              {stats.activeEmployees}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.onLeaveEmployees} currently on leave
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Present Today
            </span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block tabular-nums">
              {stats.presentToday}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Includes {stats.lateToday} late arrivals
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Absent Today
            </span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block tabular-nums">
              {stats.absentToday}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.onLeaveToday} scheduled leave
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Department Distribution & Pending Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Department Headcount</h3>
              </div>
              <button
                onClick={() => onNavigate('departments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {stats.departmentDistribution.map((dept) => {
                const percentage =
                  stats.totalEmployees > 0
                    ? Math.round((dept.count / stats.totalEmployees) * 100)
                    : 0;
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate">{dept.name}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {dept.count} <span className="text-[11px] font-normal text-slate-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>6 Active Departments</span>
            <span className="font-semibold text-slate-700">100% Staff Assigned</span>
          </div>
        </div>

        {/* Right Column: Pending Leave Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Pending Leave Approvals</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 tabular-nums">
                {stats.pendingLeavesCount} pending
              </span>
            </div>
            <button
              onClick={() => onNavigate('leaves')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Leaves</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.pendingLeaves.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-xs font-semibold text-slate-700">All caught up!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No pending leave requests requiring review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2.5">Employee</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Duration</th>
                    <th className="pb-2.5">Reason</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.pendingLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <span className="font-semibold text-slate-900 block">{leave.employeeName}</span>
                        <span className="text-[11px] text-slate-400">{leave.departmentName}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-700 block tabular-nums">
                          {leave.startDate} to {leave.endDate}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">{leave.days} day(s)</span>
                      </td>
                      <td className="py-3 max-w-[180px] truncate text-slate-600" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveLeave(leave)}
                            disabled={actionLoadingId === leave.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave)}
                            disabled={actionLoadingId === leave.id}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Today's Attendance Activity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Today’s Check-In Snapshot</h3>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Attendance Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.recentAttendance.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-lg border border-slate-150 bg-slate-50/60 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-900">{rec.employeeName}</p>
                <p className="text-[11px] text-slate-500">
                  In: <span className="tabular-nums font-medium text-slate-700">{rec.checkInTime}</span>
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  rec.status === 'Present'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : rec.status === 'Late'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : rec.status === 'Leave'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {rec.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
