import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  UserX,
  CalendarOff,
  Edit3,
  X,
  Users
} from 'lucide-react';
import { AttendanceRecord, Department } from '../types.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';

export const Attendance: React.FC = () => {
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState('2026-10-28'); // current local date context
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departments, setDepartments] = useState<Department[]>([]);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    presentRatePct: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Custom Modal State
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<'Present' | 'Absent' | 'Late' | 'Leave'>('Present');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const [attRes, deptRes] = await Promise.all([
        api.getAttendance({
          date: selectedDate,
          departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        api.getDepartments()
      ]);
      setRecords(attRes.records);
      setSummary(attRes.summary);
      setDepartments(deptRes.departments);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, departmentFilter, statusFilter]);

  const handleQuickStatusChange = async (
    employeeId: string,
    status: 'Present' | 'Absent' | 'Late' | 'Leave'
  ) => {
    try {
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      await api.markAttendance({
        employeeId,
        date: selectedDate,
        status,
        checkInTime: status === 'Present' || status === 'Late' ? nowTime : '—',
        checkOutTime: '—'
      });
      showToast(`Updated attendance status to ${status}.`);
      fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark attendance', 'error');
    }
  };

  const handleBulkMark = async (status: 'Present' | 'Absent') => {
    try {
      setIsLoading(true);
      await api.bulkMarkAttendance(selectedDate, status);
      showToast(`All active employees marked as ${status} for ${selectedDate}.`);
      fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'Failed to bulk mark attendance', 'error');
      setIsLoading(false);
    }
  };

  const openCustomModal = (rec: AttendanceRecord) => {
    setEditRecord(rec);
    setModalStatus(rec.status);
    setCheckInTime(rec.checkInTime !== '—' ? rec.checkInTime : '09:00 AM');
    setCheckOutTime(rec.checkOutTime !== '—' ? rec.checkOutTime : '05:00 PM');
    setNotes(rec.notes || '');
  };

  const handleSaveCustomModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;

    setIsSaving(true);
    try {
      await api.markAttendance({
        employeeId: editRecord.employeeId,
        date: selectedDate,
        status: modalStatus,
        checkInTime: modalStatus === 'Present' || modalStatus === 'Late' ? checkInTime : '—',
        checkOutTime: modalStatus === 'Present' || modalStatus === 'Late' ? checkOutTime : '—',
        notes: notes.trim()
      });
      showToast(`Saved attendance details for ${editRecord.employeeName}.`);
      setEditRecord(null);
      fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Date step helper
  const changeDateBy = (offset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daily Attendance Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark present, absent, late, or on-leave status with real-time database persistence.
          </p>
        </div>

        {/* Date Selector & Navigator */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-300">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => changeDateBy(1)}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate('2026-10-28')}
            className="px-2 py-0.5 text-[11px] font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Scheduled
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block tabular-nums">
            {summary.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Present
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block tabular-nums">
            {summary.present}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Late
          </span>
          <span className="text-xl font-bold text-amber-700 mt-1 block tabular-nums">
            {summary.late}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Absent
          </span>
          <span className="text-xl font-bold text-rose-700 mt-1 block tabular-nums">
            {summary.absent}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            On Leave
          </span>
          <span className="text-xl font-bold text-blue-700 mt-1 block tabular-nums">
            {summary.leave}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
            Turnout Rate
          </span>
          <span className="text-xl font-bold text-indigo-700 mt-1 block tabular-nums">
            {summary.presentRatePct}%
          </span>
        </div>
      </div>

      {/* Control Bar: Bulk Actions & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bulk Mark:
          </span>
          <button
            onClick={() => handleBulkMark('Present')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkMark('Absent')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Mark All Absent
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No staff members found</h3>
            <p className="text-xs text-slate-500 mt-1">No employees matching selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Quick Status</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Custom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {records.map((rec) => (
                  <tr key={rec.employeeId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{rec.employeeName}</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">{rec.employeeId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{rec.departmentName}</span>
                      <span className="text-[11px] text-slate-400">{rec.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(rec.employeeId, 'Present')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            rec.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(rec.employeeId, 'Late')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            rec.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(rec.employeeId, 'Absent')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            rec.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(rec.employeeId, 'Leave')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            rec.status === 'Leave'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 tabular-nums">
                      {rec.checkInTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 tabular-nums">
                      {rec.checkOutTime}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-500" title={rec.notes}>
                      {rec.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openCustomModal(rec)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="Edit times and notes"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Date: {selectedDate}</span>
          <span>Click status button to instantly persist update</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUSTOM ATTENDANCE EDIT MODAL */}
      {/* ========================================================================= */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Attendance Record</h3>
                <p className="text-xs text-slate-500">
                  {editRecord.employeeName} &middot; {selectedDate}
                </p>
              </div>
              <button
                onClick={() => setEditRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">On Leave</option>
                </select>
              </div>

              {(modalStatus === 'Present' || modalStatus === 'Late') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Check-In Time</label>
                    <input
                      type="text"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      placeholder="e.g. 08:45 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      placeholder="e.g. 05:15 PM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Reason</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Doctor appointment, subway delay, client visit..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
