import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  FileText
} from 'lucide-react';
import { LeaveRequest, Employee } from '../types.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';

export const Leaves: React.FC = () => {
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Apply Leave Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid'>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review / Decision Modal
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        api.getLeaves({ status: statusFilter !== 'all' ? statusFilter : undefined }),
        api.getEmployees({ status: 'Active' })
      ]);
      setLeaves(leavesRes.leaves);
      setEmployees(empRes.employees);
      if (empRes.employees.length > 0 && !employeeId) {
        setEmployeeId(empRes.employees[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load leave requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('Start date cannot be after end date.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createLeave({
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });
      showToast('Leave request submitted successfully.');
      setIsApplyOpen(false);
      setReason('');
      fetchLeaves();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;

    setIsReviewing(true);
    try {
      await api.updateLeaveStatus(
        reviewTarget.id,
        reviewAction,
        reviewNote.trim() || (reviewAction === 'Approved' ? 'Approved by Admin' : 'Declined by Admin')
      );
      showToast(`Leave request ${reviewAction.toLowerCase()} successfully.`);
      setReviewTarget(null);
      setReviewNote('');
      fetchLeaves();
    } catch (err: any) {
      showToast(err.message || 'Failed to update leave request', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  // Quick stats
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit, review, approve, or reject paid and unpaid time-off requests.
          </p>
        </div>
        <button
          onClick={() => {
            setStartDate('2026-11-02');
            setEndDate('2026-11-04');
            setIsApplyOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Requests
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
            {totalCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block tabular-nums">
            {pendingCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Approved
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block tabular-nums">
            {approvedCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Rejected
          </span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block tabular-nums">
            {rejectedCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Leaves' : tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Showing {leaves.length} recorded application(s)
        </span>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarOff className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No leave requests found</h3>
            <p className="text-xs text-slate-500 mt-1">
              There are currently no leave submissions matching this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration & Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Details</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{leave.employeeName}</span>
                      <span className="text-[11px] text-slate-400">
                        {leave.departmentName} &middot; {leave.employeeId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block tabular-nums">
                        {leave.startDate} to {leave.endDate}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums font-semibold">
                        {leave.days} day(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : leave.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {leave.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                        {leave.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {leave.status === 'Pending' && <Clock className="w-3 h-3" />}
                        <span>{leave.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {leave.reviewedBy ? (
                        <div>
                          <span className="font-medium text-slate-700 block">{leave.reviewedBy}</span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[160px]" title={leave.reviewNote}>
                            {leave.reviewNote || leave.reviewedAt}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Awaiting Admin</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReviewTarget(leave);
                              setReviewAction('Approved');
                              setReviewNote('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setReviewTarget(leave);
                              setReviewAction('Rejected');
                              setReviewNote('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewTarget(leave);
                            setReviewAction(leave.status === 'Approved' ? 'Rejected' : 'Approved');
                            setReviewNote(leave.reviewNote || '');
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Approved leave automatically flags employee attendance log as &quot;Leave&quot;</span>
          <span className="tabular-nums">Persisted in database</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBMIT LEAVE MODAL */}
      {/* ========================================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Annual">Annual Leave (Vacation)</option>
                  <option value="Sick">Sick / Medical Leave</option>
                  <option value="Casual">Casual / Personal Emergency</option>
                  <option value="Maternity">Maternity / Paternity</option>
                  <option value="Unpaid">Unpaid Leave of Absence</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Specify circumstances or handover coverage..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW LEAVE DECISION MODAL */}
      {/* ========================================================================= */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Review Leave Request</h3>
              <button
                onClick={() => setReviewTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">{reviewTarget.employeeName}</p>
              <p className="text-slate-600">
                {reviewTarget.leaveType} Leave &middot; {reviewTarget.startDate} to {reviewTarget.endDate} (
                <span className="font-semibold tabular-nums">{reviewTarget.days} days</span>)
              </p>
              <p className="text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                &quot;{reviewTarget.reason}&quot;
              </p>
            </div>

            <form onSubmit={handleReviewDecision} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('Approved')}
                    className={`py-2 px-3 rounded-lg font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      reviewAction === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('Rejected')}
                    className={`py-2 px-3 rounded-lg font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      reviewAction === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administrator Review Note (Optional)
                </label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewAction === 'Approved'
                      ? 'e.g. Approved. Project handover confirmed.'
                      : 'e.g. Schedule conflict with release sprint.'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  disabled={isReviewing}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className={`px-4 py-2 font-semibold text-white rounded-lg cursor-pointer disabled:opacity-50 ${
                    reviewAction === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isReviewing ? 'Saving...' : `Confirm ${reviewAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
