import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DonorHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [available, setAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [donorName, setDonorName] = useState('Donor');
  const [bloodGroup, setBloodGroup] = useState('');
  const [pastDonations, setPastDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleAvailability = async () => {
    const newVal = !available;
    setAvailable(newVal);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newVal })
      });
    } catch (e) {
      console.error(e);
      setAvailable(!newVal); // revert on error
    }
  };

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setDonorName(data.name || 'Donor');
          if (data.donorInfo) {
            setBloodGroup(data.donorInfo.bloodGroup || '');
            setAvailable(data.donorInfo.available === true || data.donorInfo.available === 1);
          }
        }
      } catch (_) {}
    };
    const fetchDonations = async () => {
      try {
        // Accepted requests that this donor accepted (filtered by userId who created them as receiver)
        // For simplicity: show all accepted requests matching donor's blood group
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const bg = profile.donorInfo?.bloodGroup;
          if (bg) {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests?status=accepted`);
            if (res.ok) {
              const data = await res.json();
              setPastDonations(data.filter(r => r.bloodGroup === bg));
            }
          }
        }
      } catch (_) {} finally {
        setLoading(false);
      }
    };
    fetchProfile();
    fetchDonations();
  }, [userId, navigate]);

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-sm border-b border-outline-variant/30">
        <div className="h-16 px-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-title-sm text-title-sm text-primary tracking-tight font-bold uppercase">LifeLink</span>
            </div>
            <span className="text-outline-variant font-light mx-1">/</span>
            <h1 className="font-label-lg text-label-lg text-on-surface font-semibold truncate max-w-[140px]">Donor Home</h1>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Notifications"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => navigate('/incoming-request')}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
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
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Hello, {donorName}</h2>
            </div>
            {bloodGroup && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                <span className="font-label-md text-label-md font-bold">{bloodGroup}</span>
              </div>
            )}
          </div>

          {/* Availability Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/50 p-space-md hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 ring-4 ${available ? 'bg-tertiary ring-tertiary/20 animate-pulse' : 'bg-error ring-error/20'}`} />
                  <div className="flex flex-col ml-1">
                    <span className="font-title-md text-title-md text-on-surface font-bold tracking-tight">
                      Status: {available ? 'Available' : 'Paused'}
                    </span>
                    <span className={`font-body-sm text-body-sm font-medium ${available ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                      {available ? 'Ready for urgent dispatched alerts' : 'Standby mode — no alerts'}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  aria-checked={available}
                  aria-label="Toggle availability status"
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-inner ${available ? 'bg-tertiary' : 'bg-surface-variant'}`}
                  onClick={toggleAvailability}
                  role="switch"
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${available ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-space-md mt-6 pt-5 border-t border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">Times Donated</span>
                    <span className="text-2xl text-on-surface font-black">{pastDonations.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold">Next Eligible</span>
                    <span className="text-2xl text-on-surface font-black">Now</span>
                  </div>
                </div>
              </div>
            </div>
          {/* Section Header */}
          <div className="flex items-center justify-between pt-space-xs">
            <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">Past Donations</h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {loading ? 'Loading...' : `${pastDonations.length} Completed`}
            </span>
          </div>

          {/* Donation History */}
          <div className="flex flex-col space-y-space-sm">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
              </div>
            )}
            {!loading && pastDonations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] text-outline">bloodtype</span>
                <p className="font-body-md text-body-md text-center">No completed donations yet.<br/>Accept a request to get started!</p>
              </div>
            )}
            {!loading && pastDonations.map(d => (
              <div key={d.id} className="flex flex-col w-full bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-title-md text-title-md text-on-surface truncate font-semibold">{d.requesterName || d.hospital || "Requester"}</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Accepted on {new Date(d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">opacity</span>
                    <span className="font-label-md text-label-md">{d.units} Unit{d.units > 1 ? 's' : ''} {d.bloodGroup}</span>
                  </div>
                  <a href={`tel:${d.requesterPhone || "911"}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span className="font-label-sm text-label-sm font-bold">Contact</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <div className="pt-space-xs">
            <button className="w-full min-h-[48px] px-space-md py-space-sm rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-space-xs active:scale-[0.99]">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="font-label-lg text-label-lg font-semibold">Download Donation Certificate</span>
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default DonorHome;
