import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RequestStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.state?.requestId || '8492';
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (requestId === '8492') {
        // Fallback mock data if accessed directly without state
        setRequest({ id: '8492', status: 'accepted', hospital: 'City Central Hospital', units: 2, bloodGroup: 'B+' });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${requestId}`);
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRequest, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const steps = [
    {
      id: 1,
      label: 'Request Created',
      sub: request ? 'Emergency Priority' : '',
      status: 'done',
    },
    {
      id: 2,
      label: 'Matching Donors',
      sub: 'Nearby eligible donors notified',
      status: 'done',
    },
    {
      id: 3,
      label: request?.status === 'accepted' ? 'Donor Found & Confirmed' : 'Waiting for Donor',
      sub: request?.status === 'accepted' ? 'In transit to hospital' : 'Searching active network...',
      status: request?.status === 'accepted' ? 'active' : 'upcoming',
    },
    {
      id: 4,
      label: 'Donation Complete',
      sub: 'Transfusion protocol ready at station',
      status: 'upcoming',
    },
  ];

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
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate max-w-[210px]">Request Status</h1>
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

      <main className="flex flex-col relative w-full pt-20 pb-safe px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full pb-24">

          {/* Live Tag */}
          <div className="flex items-center justify-between py-space-sm mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-md text-label-md text-primary tracking-wide uppercase">Live Status</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">Request #BL-{requestId}</span>
          </div>

          {/* Status Banner */}
          {request?.status === 'accepted' ? (
            <section className="bg-surface-container-low rounded-lg p-space-md mb-space-lg shadow-sm border border-emerald-500/20">
              <div className="flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-title-md text-title-md text-on-surface leading-tight font-semibold">Donor found — Confirmed</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">A donor has accepted and is on the way.</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-surface-container-lowest rounded-lg p-space-md mb-space-lg shadow-sm border border-error-container">
              <div className="flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-title-md text-title-md text-on-surface leading-tight font-semibold">Searching for Donors</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">We are alerting donors nearby.</p>
                </div>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="bg-surface-container-lowest rounded-lg p-space-md mb-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <span className="font-label-lg text-label-lg text-on-surface">Timeline Progress</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Step {request?.status === 'accepted' ? '3' : '2'} of 4</span>
            </div>

            <div className="relative pl-1">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-3 bottom-5 w-0.5 bg-surface-container-high" />

              {steps.map((step, idx) => (
                <div key={step.id} className={`flex items-start gap-space-md relative ${idx < steps.length - 1 ? 'pb-6' : ''}`}>
                  {/* Step dot */}
                  {step.status === 'done' && (
                    <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[16px] font-bold">check</span>
                    </div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 z-10 ring-4 ring-primary-fixed shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />
                    </div>
                  )}
                  {step.status === 'upcoming' && (
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-outline" />
                    </div>
                  )}

                  {/* Step text */}
                  <div className="pt-0.5">
                    <div className="flex items-center gap-space-xs">
                      <h3 className={`font-label-lg text-label-lg ${step.status === 'upcoming' ? 'text-outline' : 'text-on-surface'} ${step.status === 'active' ? 'font-bold' : ''}`}>
                        {step.label}
                      </h3>
                      {step.status === 'active' && (
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary font-medium">Active</span>
                      )}
                    </div>
                    <p className={`font-body-sm text-body-sm mt-0.5 ${step.status === 'upcoming' ? 'text-outline' : 'text-on-surface-variant'}`}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Destination */}
          <section className="bg-surface-container-low rounded-lg p-space-md mb-space-lg shadow-sm">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">local_hospital</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Designated Destination</span>
                <h3 className="font-title-md text-title-md text-on-surface truncate">{request?.hospital || 'Hospital'}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{request?.units} Unit{request?.units > 1 ? 's' : ''} of {request?.bloodGroup}</p>
              </div>
            </div>
          </section>

          {/* Actions (Only unlocked when donor accepts) */}
          {request?.status === 'accepted' ? (
            <div className="flex flex-col gap-space-sm mb-space-lg">
              <a
                className="w-full h-12 rounded-full bg-emerald-600 text-white font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md active:bg-emerald-700 transition-colors"
                href="tel:5550192834"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span>Call Donor</span>
              </a>
              <button
                className="w-full h-12 rounded-full bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs hover:bg-surface-container-high active:bg-surface-dim transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
                <span>View Donor Details</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-12 rounded-full bg-surface-container text-on-surface-variant font-label-lg text-label-lg flex items-center justify-center gap-space-xs cursor-not-allowed opacity-70">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Contact Info Locked (Waiting for Donor)</span>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav — role-aware */}
      {(() => {
        const activeRole = localStorage.getItem('activeRole');
        const homeRoute = activeRole === 'receiver' ? '/receiver-home' : '/donor-home';
        const requestsRoute = activeRole === 'receiver' ? '/receiver-requests' : '/incoming-request';
        const navColor = activeRole === 'receiver' ? 'text-tertiary' : 'text-primary';
        return (
          <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
            <div className="max-w-[440px] mx-auto px-space-md h-16 flex items-center justify-around">
              <button className="flex flex-col items-center justify-center flex-1 py-1 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => navigate(homeRoute)}>
                <span className="material-symbols-outlined text-[22px]">home</span>
                <span className="font-label-sm text-label-sm mt-0.5">Home</span>
              </button>
              <button className={`flex flex-col items-center justify-center flex-1 py-1 relative ${navColor}`}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                <span className="font-label-sm text-label-sm mt-0.5 font-bold">Status</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeRole === 'receiver' ? 'bg-tertiary' : 'bg-primary'}`} />
              </button>
              <button className="flex flex-col items-center justify-center flex-1 py-1 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => navigate(requestsRoute)}>
                <span className="material-symbols-outlined text-[22px]">list_alt</span>
                <span className="font-label-sm text-label-sm mt-0.5">All Requests</span>
              </button>
              <button className="flex flex-col items-center justify-center flex-1 py-1 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => navigate('/profile')}>
                <span className="material-symbols-outlined text-[22px]">account_circle</span>
                <span className="font-label-sm text-label-sm mt-0.5">Profile</span>
              </button>
            </div>
          </nav>
        );
      })()}
    </div>
  );
};

export default RequestStatus;
