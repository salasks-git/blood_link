import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReceiverHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userName, setUserName] = useState('User');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || 'User');
        }
      } catch (_) { }
    };
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setMyRequests(data);
        }
      } catch (_) { } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    fetchRequests();
  }, [userId, navigate]);

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
            <span className="font-title-lg text-title-lg text-tertiary tracking-tight font-bold">LifeLink</span>
            <span className="text-outline-variant">/</span>
            <h1 className="font-label-lg text-label-lg text-on-surface font-semibold truncate max-w-[150px]">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-tertiary text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-20 pb-24 px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full space-y-space-md">

          {/* Welcome Strip */}
          <div className="flex items-center justify-between pt-space-xs pb-space-xs">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Welcome back</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Hello, {userName}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              Receiver
            </span>
          </div>

          {/* Action Card */}
          <div className="w-full bg-primary-container rounded-DEFAULT p-space-lg shadow-sm border border-primary/20 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">bloodtype</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-title-lg text-title-lg text-on-primary-container font-bold">Need Blood?</h3>
              <p className="font-body-sm text-body-sm text-on-primary-container mt-1 max-w-[250px]">Create an emergency broadcast to alert nearby donors instantly.</p>
            </div>
            <button
              onClick={() => navigate('/create-request')}
              className="mt-2 w-full h-11 bg-primary text-on-primary rounded-full font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow hover:bg-primary/90 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_alert</span>
              Request Blood Now
            </button>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-space-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">Recent Requests</h3>
            <button
              onClick={() => navigate('/receiver-requests')}
              className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary hover:underline font-semibold"
            >
              View All
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Requests Preview (last 3) */}
          <div className="flex flex-col space-y-space-sm">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
              </div>
            )}
            {!loading && myRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-on-surface-variant bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant p-6 text-center">
                <span className="material-symbols-outlined text-[32px] text-outline">history</span>
                <p className="font-body-md text-body-md">You haven't made any blood requests yet.</p>
              </div>
            )}
            {!loading && myRequests.slice(0, 3).map(r => (
              <div
                key={r.id}
                className="flex flex-col w-full bg-surface-container-lowest rounded-DEFAULT p-space-md shadow-sm border border-surface-container-highest cursor-pointer hover:bg-surface-container-lowest/80 transition-colors active:scale-[0.98]"
                onClick={() => navigate('/request-status', { state: { requestId: r.id } })}
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${r.status === 'searching' ? 'bg-error-container text-on-error-container' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className="material-symbols-outlined text-[20px]">{r.status === 'searching' ? 'emergency' : 'check_circle'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-title-md text-title-md text-on-surface truncate font-semibold">Request #BL-{r.id}</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold shrink-0 ${r.status === 'searching' ? 'bg-error/10 text-error' : 'bg-emerald-100 text-emerald-700'}`}>
                    <span className="material-symbols-outlined text-[14px]">{r.status === 'searching' ? 'search' : 'task_alt'}</span>
                    <span className="capitalize">{r.status}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-space-md pt-space-sm border-t border-surface-container-high">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">opacity</span>
                    <span className="font-label-md text-label-md">{r.units} Unit{r.units > 1 ? 's' : ''} {r.bloodGroup}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm">
                    <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                    <span className="truncate max-w-[120px]">{r.hospital}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <ReceiverBottomNav />
    </div>
  );
};

export default ReceiverHome;
