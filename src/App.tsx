import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { Sidebar, PageId } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Employees } from './pages/Employees.tsx';
import { Attendance } from './pages/Attendance.tsx';
import { Departments } from './pages/Departments.tsx';
import { Leaves } from './pages/Leaves.tsx';
import { Reports } from './pages/Reports.tsx';
import { Settings } from './pages/Settings.tsx';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openAddEmployeeFlag, setOpenAddEmployeeFlag] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl animate-pulse">
            HR
          </div>
          <span className="text-sm font-semibold text-slate-300">
            Initializing Employee HR Portal...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleOpenAddEmployee = () => {
    setCurrentPage('employees');
    setOpenAddEmployeeFlag(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 pb-12 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={(page) => setCurrentPage(page)}
              onOpenAddEmployee={handleOpenAddEmployee}
            />
          )}

          {currentPage === 'employees' && (
            <Employees
              initialOpenAdd={openAddEmployeeFlag}
              onResetOpenAdd={() => setOpenAddEmployeeFlag(false)}
            />
          )}

          {currentPage === 'attendance' && <Attendance />}

          {currentPage === 'departments' && <Departments />}

          {currentPage === 'leaves' && <Leaves />}

          {currentPage === 'reports' && <Reports />}

          {currentPage === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
