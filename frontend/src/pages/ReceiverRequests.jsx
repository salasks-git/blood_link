import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReceiverRequests = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'searching' | 'accepted'

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
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
    fetchRequests();
  }, [userId, navigate]);

  const filtered = filter === 'all'
    ? myRequests
    : myRequests.filter(r => r.status === filter);

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors"
              onClick={() => navigate('/receiver-home')}
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold">My Requests</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-tertiary text-[18px]">person</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-20 pb-28 px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full space-y-space-md">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-space-sm pt-space-xs">
            <div className="bg-surface-container-lowest rounded-xl p-space-sm border border-surface-container-high text-center shadow-sm">
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold">{myRequests.length}</div>
              <div className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Total</div>
            </div>
            <div className="bg-error/5 rounded-xl p-space-sm border border-error/20 text-center shadow-sm">
              <div className="font-headline-sm text-headline-sm text-error font-bold">{myRequests.filter(r => r.status === 'searching').length}</div>
              <div className="font-label-sm text-[10px] text-error/70 uppercase tracking-wider mt-0.5">Searching</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-space-sm border border-emerald-200 text-center shadow-sm">
              <div className="font-headline-sm text-headline-sm text-emerald-700 font-bold">{myRequests.filter(r => r.status === 'accepted').length}</div>
              <div className="font-label-sm text-[10px] text-emerald-600 uppercase tracking-wider mt-0.5">Accepted</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-full w-full">
            {[
              { key: 'all', label: 'All' },
              { key: 'searching', label: 'Searching' },
              { key: 'accepted', label: 'Accepted' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 py-2 text-center font-label-md text-label-md rounded-full transition-all ${filter === f.key ? 'bg-surface shadow-sm text-on-surface font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Request List */}
          <div className="flex flex-col space-y-space-sm">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-tertiary text-3xl">progress_activity</span>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-6 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline">assignment</span>
                <p className="font-title-sm text-title-sm text-on-surface font-semibold">No requests yet</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Go home to create your first blood request.</p>
                <button
                  onClick={() => navigate('/receiver-home')}
                  className="mt-2 h-10 px-6 bg-primary text-on-primary rounded-full font-label-lg text-label-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add_alert</span>
                  Create Request
                </button>
              </div>
            )}

            {!loading && filtered.map(r => (
              <div
                key={r.id}
                className="flex flex-col w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-highest cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => navigate('/request-status', { state: { requestId: r.id } })}
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${r.status === 'searching' ? 'bg-error-container text-on-error-container' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className="material-symbols-outlined text-[20px]">{r.status === 'searching' ? 'emergency' : 'check_circle'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-title-md text-title-md text-on-surface truncate font-semibold">Request #BL-{r.id}</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold shrink-0 ${r.status === 'searching' ? 'bg-error/10 text-error' : 'bg-emerald-100 text-emerald-700'}`}>
                    <span className="w-1.5 h-1.5 rounded-full ${r.status === 'searching' ? 'bg-error animate-pulse' : 'bg-emerald-600'}" />
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
                    <span className="truncate max-w-[130px]">{r.hospital}</span>
                  </div>
                  <div className="flex items-center gap-1 text-tertiary font-label-sm font-semibold">
                    <span>Details</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Request FAB */}
          {!loading && (
            <div className="fixed bottom-24 right-4 z-40">
              <button
                onClick={() => navigate('/create-request')}
                className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
                aria-label="Create new request"
              >
                <span className="material-symbols-outlined text-[24px]">add</span>
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ReceiverRequests;
