import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  UserCheck,
  KeyRound,
  Database,
  Save,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { CompanySettings } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { ConfirmationModal } from '../components/ConfirmationModal.tsx';

export const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Acme Enterprise Technologies',
    hrEmail: 'hr@acmetech.com',
    currency: 'USD ($)',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    leaveAnnualAllowance: 24,
    timezone: 'America/Los_Angeles'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Admin Profile Form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reset Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      setSettings(res.settings);
      if (user) {
        setAdminName(user.name);
        setAdminEmail(user.email);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.updateSettings(settings);
      showToast('Company profile settings saved to server database.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await api.updateProfile(adminName.trim(), adminEmail.trim());
      await refreshUser();
      showToast('Administrator profile updated successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Current and new password are required', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      await api.downloadDatabaseBackup();
      showToast('Database backup downloaded successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to backup database', 'error');
    }
  };

  const handleResetDatabaseConfirm = async () => {
    setIsResetting(true);
    try {
      await api.resetDatabase();
      showToast('Database reset to clean sample data.');
      setIsResetModalOpen(false);
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">System & Account Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure workplace policies, administrator credentials, and manage persistent database storage.
        </p>
      </div>

      {/* Grid: Company Profile & Admin Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Configuration Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Company Information</h3>
          </div>

          <form onSubmit={handleSaveCompanySettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Display Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HR Inquiries Email</label>
                <input
                  type="email"
                  value={settings.hrEmail}
                  onChange={(e) => setSettings({ ...settings, hrEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code / Symbol</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Start Time</label>
                <input
                  type="text"
                  value={settings.workingHoursStart}
                  onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                  placeholder="09:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work End Time</label>
                <input
                  type="text"
                  value={settings.workingHoursEnd}
                  onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                  placeholder="17:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Paid Leave Allowance (Days)</label>
              <input
                type="number"
                value={settings.leaveAnnualAllowance}
                onChange={(e) => setSettings({ ...settings, leaveAnnualAllowance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 tabular-nums"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving...' : 'Save Company Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Administrator Account Details */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Admin Account Profile</h3>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admin Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Updating...' : 'Update Admin Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Persistent Database Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Database Persistence & Maintenance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Persistent JSON Engine Active</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-3">
              Data is stored at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">data/hr_portal_db.json</code> on the server with synchronous atomic writes. Modifications to employees, attendance check-ins, and leave approvals persist automatically across restarts.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Database Backup</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-rose-50/60 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-700 font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Restore Sample Seed Data</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-3">
              Need to restore all 12 realistic fictional employees, 6 departments, and sample attendance logs? Click below to re-seed the persistent database.
            </p>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Clean Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Confirm Database Re-seed"
        message="This action will restore the original 12 fictional employees, 6 departments, and sample attendance logs. Any custom additions will be replaced. Are you sure you wish to proceed?"
        confirmText="Confirm Re-seed"
        isDanger={true}
        isLoading={isResetting}
        onConfirm={handleResetDatabaseConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
