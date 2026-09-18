import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * HospitalLayout — shared shell for hospital portal pages.
 * Reads auth from localStorage (set by StaffLogin).
 */
const HospitalLayout = ({ children, isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const hospitalName = localStorage.getItem('hospitalName') || 'St. Jude Memorial Hospital';
  const locality     = localStorage.getItem('hospitalLocality') || 'Global';
  const role         = localStorage.getItem('hospitalRole') || 'hospital_admin';

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('gadmin');
      navigate('/admin-login');
    } else {
      localStorage.removeItem('hospitalId');
      localStorage.removeItem('hospitalName');
      localStorage.removeItem('hospitalRole');
      localStorage.removeItem('hospitalLocality');
      navigate('/staff-login');
    }
  };

  const navLinks = isAdmin ? [
    { path: '/admin', icon: 'admin_panel_settings', label: 'Admin Console' }
  ] : [
    { path: '/dashboard-home',     icon: 'grid_view',           label: 'Dashboard' },
    { path: '/new-blood-request',  icon: 'bloodtype',           label: 'Blood Requests' },
    { path: '/donor-records',      icon: 'group',               label: 'Donor Records' },
    { path: '/profile',            icon: 'person',              label: 'Profile' }
  ];

  return (
    <div className="w-full h-full flex flex-col flex-grow">
      {/* ── Top Header ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight tracking-tight uppercase">LifeLink</span>
            <span className="font-label-sm text-label-sm text-secondary uppercase">Clinical Blood Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">
              {isAdmin ? 'shield' : 'local_hospital'}
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface uppercase">
                {isAdmin ? 'LifeLink Core System' : hospitalName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-3 border-l border-surface-variant">
          <div className="text-right hidden sm:block">
            <span className="block font-label-md text-label-md text-on-surface leading-tight">
              {isAdmin ? 'LifeLink Core System' : hospitalName}
            </span>
            <span className="block font-label-sm text-label-sm text-secondary uppercase">
              {isAdmin ? 'Global Admin' : role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              {isAdmin ? 'shield' : 'local_hospital'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Left Sidebar ───────────────────────────────── */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest/80 backdrop-blur-sm border-r border-outline-variant/30 z-30 flex flex-col justify-between p-space-lg">
        <div className="flex flex-col gap-space-lg">
          <div className="px-space-sm">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              {isAdmin ? 'System Governance' : 'Clinical Units'}
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ path, icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-space-md py-space-sm transition-all rounded-xl font-label-md text-label-md uppercase ${
                    isActive
                      ? 'bg-secondary text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <hr className="border-outline-variant/50 mb-2" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-space-md py-space-sm text-error hover:bg-error/10 hover:text-error transition-all rounded-xl font-label-md text-label-md uppercase font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────── */}
      <div className="pl-64">
        <main className="w-full pt-16 px-gutter-lg pb-space-2xl bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
