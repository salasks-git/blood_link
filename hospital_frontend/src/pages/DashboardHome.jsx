import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const API = 'http://localhost:5001';

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const urgencyLabel = (u) => {
  if (!u) return 'Routine';
  const val = u.toLowerCase();
  if (val === 'stat' || val === 'code red' || val === 'critical') return 'STAT / Code Red';
  if (val === 'urgent') return 'Urgent';
  return 'Routine';
};

const urgencyBadgeClass = (u) => {
  if (!u) return 'bg-surface-container-high text-on-surface';
  const val = u.toLowerCase();
  if (val === 'stat' || val === 'code red' || val === 'critical') return 'bg-primary-container text-on-primary';
  if (val === 'urgent') return 'bg-secondary-fixed text-on-secondary-fixed';
  return 'bg-surface-container-high text-on-surface';
};

const statusBadgeClass = (s) => {
  if (!s) return 'bg-surface-container-high text-on-surface';
  switch (s) {
    case 'searching': return 'bg-surface-container-high text-on-surface';
    case 'found': return 'bg-secondary-fixed text-on-secondary-fixed';
    case 'confirmed': return 'bg-secondary-fixed text-on-secondary-fixed';
    case 'fulfilled': return 'bg-surface-container text-secondary';
    default: return 'bg-surface-container-high text-on-surface';
  }
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'St. Jude Memorial Hospital';
  const hospitalId = localStorage.getItem('hospitalId') || '';
  const locality = localStorage.getItem('hospitalLocality') || 'Global';
  const role = localStorage.getItem('hospitalRole') || 'hospital_admin';

  const [stats, setStats] = useState({ activeRequests: 0, totalDonors: 0, criticalReserveUnits: 0 });
  const [requests, setRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [filter, setFilter] = useState('all');
  const [fulfilling, setFulfilling] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDetail = async (req) => {
    setSelectedReq({ ...req, _loading: true });
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/api/hospital/requests/${req.id}/detail`);
      if (res.ok) setSelectedReq(await res.json());
    } catch (_) {}
    setDetailLoading(false);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/hospital/dashboard-stats?hospitalId=${hospitalId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (_) {} finally {
      setLoadingStats(false);
    }
  }, [hospitalId]);

  const fetchRequests = useCallback(async () => {
    try {
      let params = `?hospitalId=${hospitalId}`;
      if (filter !== 'all') params += `&status=${filter}`;
      const res = await fetch(`${API}/api/hospital/requests${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (_) {} finally {
      setLoadingReqs(false);
      setLastRefreshed(new Date());
    }
  }, [filter, hospitalId]);

  useEffect(() => {
    fetchStats();
    fetchRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchRequests]);

  const handleRefresh = () => {
    setLoadingStats(true);
    setLoadingReqs(true);
    fetchStats();
    fetchRequests();
  };

  const handleFulfill = async (req) => {
    const next = req.status === 'fulfilled' ? 'searching' : 'fulfilled';
    setFulfilling(f => ({ ...f, [req.id]: true }));
    try {
      await fetch(`${API}/api/hospital/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, hospitalId }),
      });
      setRequests(rs => rs.map(r => r.id === req.id ? { ...r, status: next } : r));
      fetchStats();
    } catch (_) {} finally {
      setFulfilling(f => ({ ...f, [req.id]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalRole');
    localStorage.removeItem('hospitalLocality');
    navigate('/staff-login');
  };

  const statReqs = stats.activeRequests;
  const statDonors = stats.totalDonors;
  const statCritical = stats.criticalReserveUnits;

  return (
    <div className="w-full h-full flex flex-col flex-grow">
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
          {lastRefreshed && (
            <span className="hidden sm:block font-label-sm text-label-sm text-secondary">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
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
            <a aria-current="page" className="flex items-center gap-3 px-space-md py-space-sm transition-colors border border-transparent uppercase bg-primary-container text-on-primary font-bold" href="#">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>Dashboard
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/new-blood-request')} href="#">
              <span className="material-symbols-outlined text-[20px]">bloodtype</span>Blood Requests
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/donor-records')} href="#">
              <span className="material-symbols-outlined text-[20px]">group</span>Donor Records
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/profile')} href="#">
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

      {/* Main content */}
      <div className="pl-64">
        <main className="w-full pt-16 px-gutter-lg pb-space-2xl bg-surface min-h-screen">
          <div className="flex flex-col w-full gap-space-lg">

            {/* Page header */}
            <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Dashboard Home</span>
                  <span className="px-space-xs py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary uppercase tracking-wider">Live Data</span>
                </div>
                <span className="font-body-md text-body-md text-secondary">Real-time hospital blood supply metrics, urgent transfusion alerts, and active requisition tracking.</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm">
                <button
                  className="flex items-center gap-2 px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase tracking-wider shadow-sm hover:bg-surface-container transition-colors"
                  onClick={handleRefresh}
                >
                  <span className={`material-symbols-outlined text-[18px] ${loadingStats ? 'animate-spin' : ''}`}>sync</span>
                  Refresh Telemetry
                </button>
                <button
                  className="flex items-center gap-2 px-space-md py-space-sm bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider shadow-sm hover:bg-primary transition-colors"
                  onClick={() => navigate('/new-blood-request')}
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  + New Blood Request
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
              <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Active Blood Requests</span>
                  <span className="font-data-display text-data-display text-on-surface">
                    {loadingStats ? '…' : statReqs}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">All non-fulfilled requests</span>
                </div>
                <div className="w-10 h-10 bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Available Donors</span>
                  <span className="font-data-display text-data-display text-on-surface">
                    {loadingStats ? '…' : statDonors}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">Currently available in registry</span>
                </div>
                <div className="w-10 h-10 bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">O- Universal Donors (Available)</span>
                  <span className={`font-data-display text-data-display ${statCritical === 0 ? 'text-primary' : 'text-on-surface'}`}>
                    {loadingStats ? '…' : statCritical}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">Critical universal blood type</span>
                </div>
                <div className="w-10 h-10 bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">bloodtype</span>
                </div>
              </div>
            </div>

            {/* Request table header + filter */}
            <div className="bg-surface-container-lowest p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-md text-headline-md text-on-surface uppercase font-semibold">Active Blood Requests & Triage</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                {[
                  { key: 'all', label: 'All Requests' },
                  { key: 'searching', label: 'Searching' },
                  { key: 'found', label: 'Donor Found' },
                  { key: 'confirmed', label: 'Confirmed' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-space-sm py-1 font-label-sm text-label-sm uppercase transition-colors ${
                      filter === key
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container-low text-secondary hover:text-on-surface'
                    }`}
                  >
                    {label}
                    {key === 'all' && !loadingReqs && ` (${requests.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Request table */}
            <div className="bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-space-md px-space-lg">Request ID & Time</th>
                      <th className="py-space-md px-space-md">Patient & Hospital</th>
                      <th className="py-space-md px-space-md text-center">Blood Group</th>
                      <th className="py-space-md px-space-md">Urgency</th>
                      <th className="py-space-md px-space-md">Status</th>
                      <th className="py-space-md px-space-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-surface-variant">
                    {loadingReqs ? (
                      <tr>
                        <td colSpan={6} className="py-space-2xl text-center text-secondary font-label-md text-label-md uppercase">
                          <span className="material-symbols-outlined animate-spin text-[20px] mr-2">refresh</span>
                          Loading requests…
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-space-2xl text-center text-secondary font-label-md text-label-md uppercase">
                          <span className="material-symbols-outlined text-[32px] block mb-2 opacity-30">inbox</span>
                          No blood requests found
                          <div className="mt-2">
                            <button
                              onClick={() => navigate('/new-blood-request')}
                              className="text-primary font-bold underline font-label-sm text-label-sm uppercase"
                            >
                              Create First Request →
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      requests.map(req => (
                        <tr
                          key={req.id}
                          className="hover:bg-surface-container-low/70 transition-colors cursor-pointer"
                          onClick={() => fetchDetail(req)}
                        >
                          <td className="py-space-md px-space-lg">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">#REQ-{req.id}</span>
                              <span className="font-label-sm text-label-sm text-secondary">{timeAgo(req.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                                {req.patientName || 'Unknown Patient'}
                              </span>
                              <span className="font-label-sm text-label-sm text-secondary">
                                {req.hospital || 'St. Jude Memorial Hospital'}
                              </span>
                            </div>
                          </td>
                          <td className="py-space-md px-space-md text-center">
                            <span className="inline-flex items-center justify-center w-12 py-1 bg-primary-container text-on-primary font-data-metric text-data-metric font-bold">
                              {req.bloodGroup || '—'}
                            </span>
                            <span className="block font-label-sm text-label-sm text-secondary mt-0.5">{req.units || 1} Unit{req.units !== 1 ? 's' : ''}</span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 font-label-sm text-label-sm uppercase font-semibold ${urgencyBadgeClass(req.urgency)}`}>
                              {(req.urgency?.toLowerCase() === 'stat' || req.urgency?.toLowerCase() === 'code red') && (
                                <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-ping" />
                              )}
                              {urgencyLabel(req.urgency)}
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 font-label-sm text-label-sm uppercase font-semibold ${statusBadgeClass(req.status)}`}>
                              {req.status || 'searching'}
                            </span>
                          </td>
                          <td className="py-space-md px-space-lg text-right">
                            {req.status !== 'fulfilled' ? (
                              <button
                                onClick={() => handleFulfill(req)}
                                disabled={fulfilling[req.id]}
                                className="px-space-md py-1.5 bg-primary text-on-primary font-label-sm text-label-sm uppercase hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60"
                              >
                                {fulfilling[req.id] ? 'Saving…' : 'Fulfill / Release'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFulfill(req)}
                                disabled={fulfilling[req.id]}
                                className="px-space-md py-1.5 bg-surface-container text-on-surface font-label-md text-label-md uppercase hover:bg-surface-container-high transition-colors shadow-sm disabled:opacity-60"
                              >
                                Reopen
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <span className="font-label-md text-label-md text-secondary uppercase">
                  Showing <span className="font-bold text-on-surface">{requests.length}</span> blood requisitions
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Request Detail Slide-over ── */}
      {selectedReq && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setSelectedReq(null)}
          />
          {/* Panel */}
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-container-lowest z-50 flex flex-col shadow-2xl border-l border-surface-variant overflow-y-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface uppercase">Request #{selectedReq.id}</span>
                <span className="font-label-sm text-label-sm text-secondary">{selectedReq.patientName || 'Unknown Patient'} &mdash; {selectedReq.hospital}</span>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
              </div>
            ) : (
              <div className="flex flex-col gap-6 p-6">

                {/* Blood info chips */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-container rounded-full">
                    <span className="font-data-metric text-data-metric text-on-primary font-bold">{selectedReq.bloodGroup}</span>
                    <span className="font-label-sm text-label-sm text-on-primary">{selectedReq.units} Unit{selectedReq.units !== 1 ? 's' : ''}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-sm text-label-sm uppercase ${
                    selectedReq.urgency?.toLowerCase() === 'stat' || selectedReq.urgency?.toLowerCase() === 'code red'
                      ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-secondary'
                  }`}>
                    {selectedReq.urgency}
                  </div>
                </div>

                {/* Status Progress Stepper */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">Request Progress</span>
                  {[
                    { key: 'searching', label: 'Searching for Donor', icon: 'search' },
                    { key: 'accepted',  label: 'Donor Accepted',      icon: 'how_to_reg' },
                    { key: 'confirmed', label: 'Confirmed',            icon: 'verified' },
                    { key: 'fulfilled', label: 'Fulfilled / Released', icon: 'check_circle' },
                  ].map((step, i) => {
                    const statuses = ['searching', 'accepted', 'confirmed', 'fulfilled'];
                    const currentIdx = statuses.indexOf(selectedReq.status);
                    const stepIdx    = statuses.indexOf(step.key);
                    const isDone     = stepIdx < currentIdx;
                    const isCurrent  = stepIdx === currentIdx;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isDone    ? 'bg-secondary-fixed text-on-secondary-fixed' :
                            isCurrent ? 'bg-primary text-on-primary animate-pulse' :
                                        'bg-surface-container text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isDone || isCurrent ? "'FILL' 1" : "'FILL' 0" }}>{step.icon}</span>
                          </div>
                          {i < 3 && <div className={`w-0.5 h-6 mt-0.5 ${ stepIdx < currentIdx ? 'bg-secondary-fixed' : 'bg-surface-variant' }`} />}
                        </div>
                        <div className="pt-1.5 flex flex-col">
                          <span className={`font-label-md text-label-md uppercase ${ isCurrent ? 'text-on-surface font-bold' : isDone ? 'text-secondary' : 'text-on-surface-variant' }`}>{step.label}</span>
                          {isCurrent && <span className="font-label-xs text-label-xs text-secondary">Current status</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Donor Card — shown when accepted/confirmed/fulfilled */}
                {selectedReq.donorName ? (
                  <div className="flex flex-col gap-3 p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">Accepting Donor</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                        <span className="font-data-metric text-data-metric text-on-primary font-bold">{selectedReq.donorBloodGroup || '?'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{selectedReq.donorName}</span>
                        <a
                          href={`tel:${selectedReq.donorPhone}`}
                          className="flex items-center gap-1 font-body-md text-body-md text-primary underline"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                          {selectedReq.donorPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  ['accepted','confirmed','fulfilled'].includes(selectedReq.status) ? (
                    <div className="p-4 bg-surface-container-low rounded-xl text-secondary font-body-sm text-body-sm">
                      Donor details not yet recorded.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-secondary text-[20px] animate-pulse">search</span>
                      <span className="font-body-sm text-body-sm text-secondary">Waiting for a donor to accept this request…</span>
                    </div>
                  )
                )}

                {/* Action button */}
                <button
                  onClick={() => { handleFulfill(selectedReq); setSelectedReq(s => ({ ...s, status: s.status === 'fulfilled' ? 'searching' : 'fulfilled' })); }}
                  className={`w-full py-3 font-label-md text-label-md uppercase tracking-wider shadow-sm transition-colors ${
                    selectedReq.status !== 'fulfilled'
                      ? 'bg-primary text-on-primary hover:bg-primary-container'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {selectedReq.status !== 'fulfilled' ? '✓ Mark as Fulfilled' : '↩ Reopen Request'}
                </button>

              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
