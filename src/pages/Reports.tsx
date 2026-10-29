import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Users,
  DollarSign,
  CalendarCheck,
  CalendarOff,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { ReportsSummary } from '../types.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';

export const Reports: React.FC = () => {
  const { showToast } = useToast();

  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const data = await api.getReportsSummary();
      setSummary(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load report analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDownloadCsv = async (type: 'employees' | 'attendance' | 'leaves') => {
    try {
      setDownloadingType(type);
      await api.triggerCsvDownload(type);
      showToast(`Exported ${type} report to CSV successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to export CSV', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  if (isLoading || !summary) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with CSV Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Executive HR Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Workforce demographics, departmental budget allocation, and CSV export utilities.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadCsv('employees')}
            disabled={downloadingType === 'employees'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{downloadingType === 'employees' ? 'Exporting...' : 'Employees CSV'}</span>
          </button>
          <button
            onClick={() => handleDownloadCsv('attendance')}
            disabled={downloadingType === 'attendance'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{downloadingType === 'attendance' ? 'Exporting...' : 'Attendance CSV'}</span>
          </button>
          <button
            onClick={() => handleDownloadCsv('leaves')}
            disabled={downloadingType === 'leaves'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>{downloadingType === 'leaves' ? 'Exporting...' : 'Leaves CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Annual Company Payroll
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
            ${summary.totalPayroll.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Avg: ${summary.avgSalary.toLocaleString()} per employee
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Overall Attendance Rate
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block tabular-nums">
            {summary.overallAttendanceRate}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Calculated across historical logs
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Workforce
          </span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block tabular-nums">
            {summary.activeCount} / {summary.totalEmployees}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {Math.round((summary.activeCount / summary.totalEmployees) * 100)}% active duty
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Leave Requests Logged
          </span>
          <span className="text-2xl font-extrabold text-purple-600 mt-1 block tabular-nums">
            {summary.totalLeavesLogged}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.approvedLeaves} approved, {summary.pendingLeaves} pending
          </span>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Department Budget Allocation & Headcount Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-500">6 Functional Departments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Total Payroll</th>
                <th className="py-3 px-4">Annual Budget</th>
                <th className="py-3 px-4">Budget Utilization</th>
                <th className="py-3 px-4 text-right">Avg Comp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {summary.deptReports.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {d.name} <span className="text-[11px] font-normal text-slate-400">({d.code})</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                    {d.headcount} staff
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 tabular-nums">
                    ${d.payroll.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                    ${d.budget.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            d.budgetUtilizationPct > 90
                              ? 'bg-rose-500'
                              : d.budgetUtilizationPct > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, d.budgetUtilizationPct)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                        {d.budgetUtilizationPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 tabular-nums">
                    ${d.headcount > 0 ? Math.round(d.payroll / d.headcount).toLocaleString() : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <CalendarOff className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Leave Applications by Category</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(summary.leaveBreakdown).map(([type, count]) => {
              const pct = summary.totalLeavesLogged > 0 ? Math.round((count / summary.totalLeavesLogged) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{type} Leave</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Persistence & Export Notice */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Data Reliability & Export Integrity</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              All employee rosters, attendance sign-ins, and leave workflows are persistently saved to disk on the Node Express server. You can generate raw CSV files for audit reporting or spreadsheet imports at any time.
            </p>
            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
              <li>RFC-4180 standard compliant CSV files.</li>
              <li>Includes full audit columns and timestamps.</li>
              <li>Encrypted authentication token validation on each export.</li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Status: Server Synchronized</span>
            <span className="tabular-nums font-mono text-[11px]">UTC-7 Realtime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
