import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  DollarSign,
  MapPin,
  Edit2,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { Department } from '../types.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';
import { ConfirmationModal } from '../components/ConfirmationModal.tsx';

export const Departments: React.FC = () => {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [viewDept, setViewDept] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    managerName: '',
    budget: 350000,
    location: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDepartments();
      setDepartments(res.departments);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch departments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      code: '',
      managerName: '',
      budget: 350000,
      location: 'Building A, Floor 2',
      description: ''
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const openEditModal = (d: Department) => {
    setEditDept(d);
    setFormData({
      name: d.name,
      code: d.code,
      managerName: d.managerName,
      budget: d.budget,
      location: d.location,
      description: d.description
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Department name is required';
    if (!formData.code.trim()) errs.code = 'Department code is required';
    if (Number(formData.budget) < 0) errs.budget = 'Budget cannot be negative';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        managerName: formData.managerName.trim() || 'Pending Assignment',
        budget: Number(formData.budget),
        location: formData.location.trim() || 'Main Campus',
        description: formData.description.trim() || 'General operations department.'
      });
      showToast(`Department "${formData.name}" created successfully.`);
      setIsAddOpen(false);
      fetchDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.updateDepartment(editDept.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        managerName: formData.managerName.trim(),
        budget: Number(formData.budget),
        location: formData.location.trim(),
        description: formData.description.trim()
      });
      showToast(`Department "${formData.name}" updated.`);
      setEditDept(null);
      fetchDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to update department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await api.deleteDepartment(deleteTarget.id);
      showToast(`Department "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Department Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee organizational units, leadership, allocated budgets, and headcounts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No departments configured</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first department to start assigning staff.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{dept.name}</h3>
                      <span className="text-[11px] text-slate-400 tabular-nums">ID: {dept.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dept)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>

                {/* Details list */}
                <div className="space-y-2 text-xs py-2 border-y border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Department Head:</span>
                    <span className="font-semibold text-slate-800">{dept.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Staff:</span>
                    <span className="font-semibold text-blue-600 flex items-center gap-1 tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {dept.employeeCount || 0} members
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Annual Budget:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ${dept.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Facility Location:</span>
                    <span className="text-slate-600 truncate max-w-[170px]">{dept.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 flex items-center justify-between">
                <button
                  onClick={() => setViewDept(dept)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Member Roster ({dept.employeeCount || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT DEPARTMENT MODAL */}
      {/* ========================================================================= */}
      {(isAddOpen || editDept) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editDept ? `Edit Department: ${editDept.name}` : 'Create New Department'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditDept(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editDept ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. Legal & Compliance"
                  />
                  {formErrors.name && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{formErrors.name}</span>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 uppercase"
                    placeholder="LGL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager / Lead</label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. Rachel Adams"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  placeholder="e.g. Building B, Floor 4"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 resize-none"
                  placeholder="Responsibilities and domain coverage..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditDept(null);
                  }}
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
                  {isSubmitting ? 'Saving...' : editDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW DEPARTMENT MEMBERS ROSTER MODAL */}
      {/* ========================================================================= */}
      {viewDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewDept.name} Members</h3>
                <span className="text-xs text-slate-500">
                  {viewDept.employeeCount || 0} active assigned employee(s)
                </span>
              </div>
              <button
                onClick={() => setViewDept(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!viewDept.employees || viewDept.employees.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
                No employees currently assigned to this department.
              </div>
            ) : (
              <div className="divide-y divide-slate-150 text-xs">
                {viewDept.employees.map((emp) => (
                  <div key={emp.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{emp.name}</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {emp.id} &middot; {emp.role}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewDept(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Confirm Department Deletion"
        message={`Are you sure you want to delete the department "${deleteTarget?.name}" (${deleteTarget?.code})? If any active employees are assigned, deletion will be blocked by the server.`}
        confirmText="Delete Department"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
