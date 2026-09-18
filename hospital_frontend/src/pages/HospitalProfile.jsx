import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const HospitalProfile = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'Hospital';
  const hospitalId = localStorage.getItem('hospitalId') || '';
  const locality = localStorage.getItem('hospitalLocality') || 'Unknown';
  const role = localStorage.getItem('hospitalRole') || 'hospital_admin';

  const handleLogout = () => {
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalRole');
    localStorage.removeItem('hospitalLocality');
    navigate('/staff-login');
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-surface-variant z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight tracking-tight uppercase">LifeLink</span>
              <span className="font-label-sm text-label-sm text-secondary uppercase">Clinical Blood Portal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface uppercase">{hospitalName}</span>
              <span className="font-label-sm text-label-sm text-secondary">Locality: {locality}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-3 border-l border-surface-variant">
            <div className="text-right hidden sm:block">
              <span className="block font-label-md text-label-md text-on-surface leading-tight">{hospitalName}</span>
              <span className="block font-label-sm text-label-sm text-secondary uppercase">Hospital Admin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">local_hospital</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-variant z-30 flex flex-col justify-between p-space-lg">
        <div className="flex flex-col gap-space-lg">
          <div className="px-space-sm">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Clinical Units</span>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/dashboard-home')} href="#">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>Dashboard
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/new-blood-request')} href="#">
              <span className="material-symbols-outlined text-[20px]">bloodtype</span>Blood Requests
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/donor-records')} href="#">
              <span className="material-symbols-outlined text-[20px]">group</span>Donor Records
            </a>
            <a aria-current="page" className="flex items-center gap-3 px-space-md py-space-sm transition-colors border border-transparent uppercase bg-primary-container text-on-primary font-bold" onClick={() => navigate('/profile')} href="#">
              <span className="material-symbols-outlined text-[20px]">person</span>Profile
            </a>
            {role === 'system_admin' && (
              <a className="flex items-center gap-3 px-space-md py-space-sm text-primary hover:bg-surface-container-high hover:text-primary transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/admin')} href="#">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>Admin Panel
              </a>
            )}
          </nav>
        </div>
        <div className="flex flex-col gap-2 pt-space-lg border-t border-surface-variant">
          <button
            className="flex items-center gap-3 px-space-md py-space-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors border border-transparent font-label-md text-label-md uppercase w-full text-left"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 flex-grow flex flex-col items-center">
        <div className="w-full max-w-5xl p-space-xl flex flex-col gap-space-xl">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight mb-2">Hospital Profile</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your hospital's geolocation and settings.</p>
          </div>
          
          <SetLocationMap hospitalId={hospitalId} />
        </div>
      </main>
    </div>
  );
};

export default HospitalProfile;
