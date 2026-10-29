import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';
import { api } from '../services/api.ts';

const REMEMBER_KEY = 'hr_remembered_admin_email';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  // Mode: 'register' | 'login' (defaults to 'register' with clean tabs)
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Success message after creating account
  const [creationSuccessMsg, setCreationSuccessMsg] = useState('');

  // Register Form States (Create Account)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'hr_manager'>('admin');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Login Form States (Sign In)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Forgot Password Modal States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotStatusMsg, setForgotStatusMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setLoginEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(regPassword);

  // Submit Create Account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setCreationSuccessMsg('');

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!trimmedEmail) {
      setRegError('Please provide your official work email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setRegError('Please enter a valid work email format (e.g. name@portal.org).');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Password confirmation does not match.');
      return;
    }
    if (!agreeTerms) {
      setRegError('Please accept the portal security and privacy terms.');
      return;
    }

    setIsRegistering(true);
    try {
      await api.register({
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        password: regPassword,
        role: regRole
      });

      // Populate Sign In inputs with newly created account
      setLoginEmail(trimmedEmail);
      setLoginPassword(regPassword);
      setCreationSuccessMsg(
        `Account created successfully for ${trimmedName}! Please sign in below.`
      );
      showToast(`Account created for ${trimmedName}! Please sign in.`, 'success');

      // Switch to Sign In tab
      setMode('login');
    } catch (err: any) {
      setRegError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Submit Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail) {
      setLoginError('Please enter your administrator work email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLoginError('Please provide a valid email format.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      await login(trimmedEmail, loginPassword);
      showToast('Authentication successful. Redirecting to Dashboard...', 'success');
    } catch (err: any) {
      setLoginError(
        err.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg('');
    setForgotStatusMsg('');

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotErrorMsg('Please provide your administrator email.');
      return;
    }
    if (!forgotNewPassword) {
      setForgotErrorMsg('Please enter a new password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotErrorMsg('Passwords do not match.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await api.forgotPassword(trimmed, forgotNewPassword);
      setForgotStatusMsg(res.message || 'Password successfully updated! You can now sign in.');
      setLoginEmail(trimmed);
      setLoginPassword('');
      showToast('Password updated. Please sign in with your new password.');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStatusMsg('');
        setForgotErrorMsg('');
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setForgotErrorMsg(err.message || 'Could not verify or update account.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setLoginEmail('admin@hrportal.com');
    setLoginPassword('Admin@12345');
    setLoginError('');
    setMode('login');
    showToast('Loaded demo admin credentials: admin@hrportal.com', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800/40">
        {/* Left Side: Dark Navy Presentation (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-8 sm:p-10 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Logo Lockup */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                HR
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block text-white leading-tight">
                  Employee HR Portal
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
                  Enterprise Workspace
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2 leading-snug">
              Workforce & HR Operations
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Centralized administrative portal to manage employee profiles, track attendance check-ins, oversee departments, and approve leave requests.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Employee directory & salary management</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Daily attendance logging & check-in records</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Leave approval workflows with calendar syncing</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Encrypted server persistence (crypto.scrypt)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Session tokens secured with 7-day server TTL</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-between">
          <div>
            {/* Top Clean Tabs: CREATE ACCOUNT & SIGN IN */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
              {/* Tab: Create Account */}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegError('');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>

              {/* Tab: Sign In */}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setRegError('');
                  setLoginError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Subtitle */}
            <div className="mb-5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'register' ? 'Create Administrator Account' : 'Sign In to HR Portal'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'register'
                  ? 'Register your administrative credentials in the persistent server database'
                  : 'Authenticate to access employee records, attendance, and leaves'}
              </p>
            </div>

            {/* Account Creation Success Banner */}
            {creationSuccessMsg && mode === 'login' && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  <p className="font-bold text-emerald-900">{creationSuccessMsg}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Your credentials have been pre-filled below. Click &quot;Sign In to Portal&quot; to continue.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banners */}
            {regError && mode === 'register' && (
              <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium leading-relaxed">{regError}</span>
              </div>
            )}

            {loginError && mode === 'login' && (
              <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium leading-relaxed">{loginError}</span>
              </div>
            )}

            {/* =============================================================== */}
            {/* CREATE ACCOUNT FORM */}
            {/* =============================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                {/* Work Email & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Work Email *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.rostova@portal.org"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role / Privilege *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                    >
                      <option value="admin">HR Administrator (Full Access)</option>
                      <option value="hr_manager">HR Manager (Personnel & Leaves)</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Strength: {strength.label}</span>
                      <span>{regPassword.length >= 6 ? 'Meets length requirement' : 'Too short (min 6)'}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer mt-0.5"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I agree to the workplace security protocols, confidentiality compliance, and administrative data policies.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isRegistering ? 'Creating Account...' : 'Create Account'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* =============================================================== */}
            {/* SIGN IN FORM */}
            {/* =============================================================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@hrportal.com"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setIsForgotModalOpen(true);
                      setForgotErrorMsg('');
                      setForgotStatusMsg('');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Sign In */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Portal'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Don&apos;t have an administrator account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}
          </div>

          {/* Bottom Pre-seeded Demo Credentials Card */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Pre-seeded Demo Administrator</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Email: <code className="font-mono text-slate-700">admin@hrportal.com</code> &middot; Pass: <code className="font-mono text-slate-700">Admin@12345</code>
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer shrink-0"
              >
                Auto-Fill Credentials
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Administrator Password Reset</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotErrorMsg && (
              <div className="mb-3.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {forgotErrorMsg}
              </div>
            )}

            {forgotStatusMsg && (
              <div className="mb-3.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                {forgotStatusMsg}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Administrator Email *
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@hrportal.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Secure Password *
                </label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  disabled={isResettingPassword}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? 'Updating...' : 'Reset & Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
