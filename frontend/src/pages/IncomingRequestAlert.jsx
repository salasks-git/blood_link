import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  // SQLite returns "YYYY-MM-DD HH:MM:SS" in UTC. Convert to ISO format so browser parses as UTC.
  const utcDateStr = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = Math.floor((Date.now() - new Date(utcDateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
};

const IncomingRequestAlert = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [requests, setRequests] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({}); // { [requestId]: 'idle'|'accepting'|'accepted'|'declined' }
  const [consentReq, setConsentReq] = useState(null);

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const fetch_ = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/for-donor/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBloodGroup(data.bloodGroup);
        setRequests(prev => {
          // Merge new requests without resetting action states of already-seen ones
          const newIds = new Set((data.requests || []).map(r => r.id));
          // Remove requests no longer open, keep action state for ones already acted on
          return data.requests || [];
        });
        setActionState(prev => {
          const states = { ...prev };
          (data.requests || []).forEach(r => {
            if (!states[r.id]) states[r.id] = 'idle';
          });
          return states;
        });
      } catch (e) {
        setError('Could not load requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
    // Poll every 30 seconds for new incoming requests
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const handleAcceptClick = (req) => {
    setConsentReq(req);
  };

  const executeAccept = async () => {
    if (!consentReq) return;
    const req = consentReq;
    setConsentReq(null);
    setActionState(s => ({ ...s, [req.id]: 'accepting' }));
    try {
      // 'accepted' is the correct status to trigger UI updates across the system
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', donorId: parseInt(userId, 10) }),
      });
      setActionState(s => ({ ...s, [req.id]: 'accepted' }));
    } catch {
      setActionState(s => ({ ...s, [req.id]: 'idle' }));
    }
  };

  const handleDecline = async (req) => {
    setActionState(s => ({ ...s, [req.id]: 'declined' }));
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== req.id));
    }, 1200);
  };

  const urgencyLabel = (u) => {
    if (!u) return 'Standard';
    const val = u.toLowerCase();
    if (val === 'immediate' || val === 'stat' || val === 'emergency') return 'Emergency / Immediate';
    if (val === 'urgent' || val === '24h' || val === 'medium') return 'Within 24 Hours';
    if (val === 'routine' || val === 'scheduled') return 'Scheduled';
    return u; // fallback: show raw value
  };

  const isEmergencyUrgency = (u) => {
    const val = (u || '').toLowerCase();
    return val === 'immediate' || val === 'stat' || val === 'emergency';
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Go Back"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors"
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate max-w-[210px]">Incoming Requests</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-20 pb-24 px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full max-w-[440px] mx-auto pb-space-lg">

          {/* Live status pill */}
          <div className="flex items-center justify-between py-space-xs px-space-sm mb-space-sm bg-error-container/30 rounded-full">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                {bloodGroup ? `Matching ${bloodGroup} Requests` : 'Emergency Match Active'}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mr-1">
              {requests.length} open
            </span>
          </div>

          {error && (
            <div className="w-full bg-error-container text-on-error-container rounded-xl p-space-md text-center font-body-md mb-space-md">
              {error}
            </div>
          )}

          {!error && requests.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center py-16 gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline">volunteer_activism</span>
              <p className="font-title-md text-title-md font-semibold text-on-surface">No Matching Requests</p>
              <p className="font-body-md text-body-md text-center">
                {bloodGroup
                  ? `There are currently no open blood requests for ${bloodGroup}.`
                  : 'No open requests match your blood group right now.'}
              </p>
              <button
                className="mt-2 px-6 py-3 rounded-full bg-primary text-on-primary font-label-lg text-label-lg font-semibold"
                onClick={() => navigate('/donor-home')}
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Request Cards */}
          <div className="flex flex-col gap-space-md">
            {requests.map((req) => {
              const status = actionState[req.id] || 'idle';
              const isUrgent = isEmergencyUrgency(req.urgency);
              return (
                <div key={req.id} className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col items-center text-center relative overflow-hidden">

                  {/* Pulsing icon */}
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-space-md text-primary animate-pulse">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
                  </div>

                  {/* Blood type pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-on-primary rounded-full mb-space-sm shadow-sm">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                    <span className="font-label-lg text-label-lg font-bold tracking-tight">{req.bloodGroup}</span>
                  </div>

                  {/* Headline */}
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mb-space-xs">
                    {req.bloodGroup} needed
                  </h2>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-on-surface-variant mb-space-md">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    <span className="font-label-md text-label-md">Requested {timeAgo(req.createdAt || req.createdat)}</span>
                  </div>

                  {/* Hospital info */}
                  <div className="w-full bg-surface-container-low rounded-xl p-space-md text-left mb-space-lg">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-primary mt-0.5">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-title-md text-title-md text-on-surface font-bold truncate">{req.hospital}</p>
                        <p className="font-body-md text-body-md text-error font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">notification_important</span>
                          {urgencyLabel(req.urgency)}
                        </p>
                      </div>
                    </div>
                    {isEmergencyUrgency(req.urgency) && (
                      <div className="mt-space-sm pt-space-sm flex items-center justify-end text-on-surface-variant font-label-md text-label-md">
                        <span className="font-semibold text-primary">High Priority</span>
                      </div>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-space-sm w-full mb-space-xl">
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col items-center text-center">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Blood Group</span>
                      <span className="font-title-md text-title-md text-on-surface font-bold mt-0.5">{req.bloodGroup}</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col items-center text-center">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Required Units</span>
                      <span className="font-title-md text-title-md text-primary font-bold mt-0.5">{req.units} Unit{req.units > 1 ? 's' : ''} Whole</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {status !== 'accepted' && status !== 'declined' && (
                    <div className="flex flex-col gap-space-sm w-full">
                      <button
                        className="w-full h-12 bg-primary hover:bg-primary/90 active:scale-[0.99] text-on-primary rounded-full font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
                        onClick={() => handleAcceptClick(req)}
                        disabled={status !== 'idle'}
                        type="button"
                      >
                        {status === 'idle' && (
                          <><span className="material-symbols-outlined text-[20px]">check_circle</span><span>Accept Request</span></>
                        )}
                        {status === 'accepting' && (
                          <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span><span>Confirming...</span></>
                        )}
                      </button>

                      <button
                        className="w-full h-12 bg-surface-container hover:bg-surface-container-high active:scale-[0.99] text-on-surface-variant rounded-full font-label-lg text-label-lg font-medium flex items-center justify-center gap-2 transition-all"
                        onClick={() => handleDecline(req)}
                        disabled={status !== 'idle'}
                        type="button"
                      >
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {status === 'accepted' && (
                    <div className="flex flex-col gap-space-md w-full">
                      <div className="w-full h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-label-lg text-label-lg font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span>Accepted — Details Unlocked</span>
                      </div>
                      <div className="flex flex-col p-space-md bg-surface-container-low rounded-lg border border-outline-variant/50 shadow-sm">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-2">Contact Information</span>
                        <span className="font-title-md text-title-md text-on-surface font-bold">{req.requesterName || req.hospital}</span>
                        <span className="font-body-md text-body-md text-secondary mt-1">{req.requesterPhone || "Hospital Admin Desk"}</span>
                        
                        <div className="flex gap-space-sm mt-space-md">
                          <a href={`tel:${req.requesterPhone || "911"}`} className="flex-1 h-10 bg-on-surface text-surface rounded-full flex items-center justify-center font-label-md font-bold gap-2 hover:bg-on-surface/90 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">call</span>
                            <span>Call</span>
                          </a>
                          <button className="flex-1 h-10 bg-surface-container-high text-on-surface rounded-full flex items-center justify-center font-label-md font-bold gap-2 hover:bg-surface-container-highest transition-colors">
                            <span className="material-symbols-outlined text-[18px]">directions</span>
                            <span>Map</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'declined' && (
                    <div className="w-full h-12 bg-surface-container text-on-surface-variant/50 rounded-full font-label-lg text-label-lg font-medium flex items-center justify-center">
                      Alert Dismissed
                    </div>
                  )}

                  {/* Disclaimer */}
                  <p className="font-body-sm text-body-sm text-outline mt-space-md tracking-tight">
                    Accepting confirms your immediate availability to arrive within 25 minutes.
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Consent Modal Overlay */}
      {consentReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-space-lg animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Graphic */}
            <div className="h-32 bg-primary-container flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent" />
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner relative z-10">
                <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
              </div>
            </div>
            
            <div className="p-space-xl flex flex-col gap-space-lg text-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight mb-2">Consent to Share Info</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed">
                  By accepting this emergency request, you agree to securely exchange your contact details (Name & Phone) with the requester, and you will receive their details to coordinate the donation.
                </p>
              </div>
              
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <button
                  className="w-full h-12 bg-primary text-on-primary rounded-full font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container hover:text-on-primary-container hover:shadow-lg transition-all active:scale-[0.98]"
                  onClick={executeAccept}
                >
                  I Agree & Accept
                </button>
                <button
                  className="w-full h-12 bg-transparent text-secondary hover:bg-surface-container rounded-full font-label-lg text-label-lg font-medium transition-colors"
                  onClick={() => setConsentReq(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default IncomingRequestAlert;
