import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const URGENCY_OPTIONS = [
  {
    id: 'immediate',
    icon: 'bolt',
    label: 'Emergency / Immediate',
    sub: 'Priority alert with acoustic siren to donors',
  },
  {
    id: '24h',
    icon: 'schedule',
    label: 'Within 24 Hours',
    sub: 'Standard dispatch for planned surgery',
  },
  {
    id: 'scheduled',
    icon: 'event_note',
    label: 'Scheduled',
    sub: 'Scheduled requirement (2+ days ahead)',
  },
];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [urgency, setUrgency] = useState('immediate');
  const [hospital, setHospital] = useState('');
  const [customHospital, setCustomHospital] = useState('');
  const [position, setPosition] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [units, setUnits] = useState(2);
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success
  const [showToast, setShowToast] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(null);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [hospitalsList, setHospitalsList] = useState([]);

  // Fetch approved hospitals for the dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/hospitals`);
        if (res.ok) {
          const data = await res.json();
          setHospitalsList(data);
          if (data.length > 0 && hospital === 'City Central Hospital, Ward 4') {
             // Set default hospital to the first approved one if the old default is still present
             setHospital(data[0].hospitalName);
          }
        }
      } catch (e) {
        console.error('Failed to fetch hospitals', e);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch matching donor count whenever blood group changes
  useEffect(() => {
    const fetchDonorCount = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/donors?bloodGroup=${encodeURIComponent(selectedBlood)}`);
        if (res.ok) {
          const data = await res.json();
          setNearbyCount(data.length);
        }
      } catch (e) {
        setNearbyCount(null);
      }
    };
    fetchDonorCount();
  }, [selectedBlood]);

  const updateUnits = (delta) => {
    setUnits(u => Math.max(1, Math.min(8, u + delta)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState('loading');
    const userId = localStorage.getItem('userId');

    try {
      let finalLat = position ? position.lat : null;
      let finalLng = position ? position.lng : null;
      let finalHospital = hospital;

      if (hospital === 'custom') {
        finalHospital = customHospital;
      } else {
        const selectedHosp = hospitalsList.find(h => h.hospitalName === hospital);
        if (selectedHosp && selectedHosp.latitude && selectedHosp.longitude) {
          finalLat = selectedHosp.latitude;
          finalLng = selectedHosp.longitude;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId ? parseInt(userId, 10) : null,
          bloodGroup: selectedBlood,
          units,
          urgency,
          hospital: finalHospital,
          latitude: finalLat,
          longitude: finalLng
        })
      });

      if (response.ok) {
        const created = await response.json();
        // Notify matching donors
        try {
          const notifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${created.id}/notify-donors`, {
            method: 'POST'
          });
          if (notifyRes.ok) {
            const notifyData = await notifyRes.json();
            setNotifiedCount(notifyData.notifiedCount);
          }
        } catch (_) { }

        setSubmitState('success');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setSubmitState('idle');
          navigate('/request-status', { state: { requestId: created.id } });
        }, 2000);
      } else {
        console.error('Failed to create request');
        setSubmitState('idle');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitState('idle');
    }
  };

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
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate max-w-[210px]">Create Request</h1>
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
        <div className="flex flex-col w-full pb-8">

          {/* Broadcast Banner */}
          <div className="w-full bg-error-container/40 rounded-DEFAULT p-space-sm mb-space-md flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <p className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase pl-1.5">Direct Broadcast Active</p>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {nearbyCount === null ? 'Searching...' : `${nearbyCount} ${selectedBlood} Donors available`}
            </span>
          </div>

          {/* Sub-header */}
          <div className="flex flex-col mb-space-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Create Blood Request</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Broadcast your critical requirement to nearby compatible donors instantly.
            </p>
          </div>

          <form className="flex flex-col gap-space-lg w-full" onSubmit={handleSubmit}>

            {/* Blood Group */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-lg text-label-lg text-on-surface">Blood Group Required</label>
                <span className="font-label-sm text-label-sm text-primary font-semibold">Matched: Rh+</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    className={`py-2.5 rounded-DEFAULT font-title-md text-title-md transition-all text-center ${selectedBlood === bg
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container text-on-surface'
                      }`}
                    onClick={() => setSelectedBlood(bg)}
                    type="button"
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-lg text-label-lg text-on-surface">Urgency Level</label>
              <div className="flex flex-col gap-2 mt-1">
                {URGENCY_OPTIONS.map(opt => {
                  const isSelected = urgency === opt.id;
                  const isImmediate = opt.id === 'immediate';
                  return (
                    <button
                      key={opt.id}
                      className={`flex items-center justify-between p-3.5 rounded-DEFAULT cursor-pointer transition-all ${isSelected
                        ? isImmediate
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'bg-surface-container-highest text-on-surface'
                        : 'bg-surface-container text-on-surface'
                        }`}
                      onClick={() => setUrgency(opt.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-space-sm">
                        <span
                          className={`material-symbols-outlined text-[22px] ${isSelected ? (isImmediate ? 'text-primary' : 'text-on-surface') : 'text-on-surface-variant'}`}
                          style={isSelected && isImmediate ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {opt.icon}
                        </span>
                        <div className="flex flex-col text-left">
                          <span className={`font-label-lg text-label-lg ${isSelected ? 'font-bold' : ''}`}>{opt.label}</span>
                          <span className={`font-body-sm text-body-sm ${isSelected ? (isImmediate ? 'text-on-primary-fixed-variant' : 'text-on-surface-variant') : 'text-on-surface-variant'}`}>{opt.sub}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? (isImmediate ? 'bg-primary' : 'bg-on-surface') : 'bg-surface-container-high'}`}>
                        {isSelected && (
                          <span className={`material-symbols-outlined text-[14px] ${isImmediate ? 'text-on-primary' : 'text-surface'}`}>check</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hospital Field */}
            <div className="flex flex-col gap-space-xs z-10 relative">
              <label className="font-label-lg text-label-lg text-on-surface" htmlFor="hospitalName">Hospital</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">local_hospital</span>
                <select
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT py-3.5 pl-11 pr-10 focus:outline-none focus:bg-surface-container transition-colors appearance-none cursor-pointer"
                  id="hospitalName"
                  required
                  value={hospital}
                  onChange={e => setHospital(e.target.value)}
                >
                  <option value="" disabled>Select a hospital or custom location</option>
                  {hospitalsList.map((h, i) => (
                    <option key={h.id || i} value={h.hospitalName}>
                      {h.hospitalName} {h.locality ? `(${h.locality})` : ''}
                    </option>
                  ))}
                  <option value="custom">Other / Custom Location</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant pl-1">
                {hospital === 'custom' ? 'Specify a custom hospital and pin its location below' : 'Select an approved hospital (location automatically included)'}
              </p>
            </div>

            {/* Custom Hospital Input */}
            {hospital === 'custom' && (
              <div className="flex flex-col gap-space-xs -mt-2">
                <input
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT py-3.5 px-4 focus:outline-none focus:bg-surface-container transition-colors shadow-sm border border-transparent focus:border-primary/50"
                  placeholder="Enter hospital name and room/ward"
                  required
                  type="text"
                  value={customHospital}
                  onChange={e => setCustomHospital(e.target.value)}
                />
              </div>
            )}

            {/* Map Selector */}
            {hospital === 'custom' && (
              <div className="flex flex-col gap-space-xs mt-space-sm z-0">
                <label className="font-label-lg text-label-lg text-on-surface">Precise Location Pin</label>
                <SetLocationMap pickerOnly={true} onChange={setPosition} onAddressChange={setSelectedAddress} />
                {/* Address display box */}
                {selectedAddress && (
                  <div className="flex items-start gap-3 mt-2 p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-xs text-label-xs text-secondary uppercase tracking-wider font-bold mb-0.5">Pinned Address</span>
                      <span className="font-body-md text-body-md text-on-surface leading-snug">{selectedAddress}</span>
                      {position && (
                        <span className="font-body-xs text-body-xs text-on-surface-variant font-mono mt-1">
                          {position.lat?.toFixed(5)}, {position.lng?.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Units Counter */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-lg text-label-lg text-on-surface">Units Needed (Pints)</label>
              <div className="flex items-center justify-between bg-surface-container p-2 rounded-DEFAULT">
                <div className="flex items-center gap-space-sm pl-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">{units} {units === 1 ? 'Unit' : 'Units'}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Approx. {units * 450} ml Whole Blood</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-1">
                  <button
                    aria-label="Decrease units"
                    className="w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center active:scale-95 transition-transform"
                    onClick={() => updateUnits(-1)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <span className="font-title-lg text-title-lg text-on-surface font-bold min-w-[24px] text-center">{units}</span>
                  <button
                    aria-label="Increase units"
                    className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform"
                    onClick={() => updateUnits(1)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="bg-surface-container-low p-space-md rounded-DEFAULT flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified_user</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Your verified medical contact will automatically be shared with donors accepting this priority broadcast.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                className={`w-full min-h-[48px] py-3.5 px-space-lg rounded-full font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${submitState === 'success' ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary hover:bg-primary/90'
                  }`}
                type="submit"
                disabled={submitState === 'loading'}
              >
                {submitState === 'idle' && (
                  <><span className="material-symbols-outlined text-[20px]">emergency_share</span><span>Submit Request</span></>
                )}
                {submitState === 'loading' && (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span><span>Broadcasting...</span></>
                )}
                {submitState === 'success' && (
                  <><span className="material-symbols-outlined text-[20px]">check_circle</span><span>Broadcast Sent</span></>
                )}
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-space-sm">Average match time: ~4 minutes</p>
            </div>
          </form>
        </div>
      </main>

      {/* Toast Notification */}
      <div
        className={`fixed inset-x-4 bottom-8 mx-auto max-w-[400px] z-50 transition-all duration-300 ease-out ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'
          }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface p-space-md rounded-DEFAULT shadow-lg flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-tertiary text-[18px]">check</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-label-lg text-label-lg font-semibold truncate">Emergency Request Broadcasted!</p>
            <p className="font-body-sm text-body-sm text-inverse-on-surface/80 truncate">
              {notifiedCount > 0
                ? `Notified ${notifiedCount} ${selectedBlood} donor${notifiedCount !== 1 ? 's' : ''} instantly.`
                : `Broadcast sent for ${selectedBlood} donors.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
