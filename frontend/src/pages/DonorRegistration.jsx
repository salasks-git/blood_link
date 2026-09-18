import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BLOOD_COMPAT = {
  'A+': { title: 'Platelet & RBC Match', desc: 'Can donate whole blood to A+ and AB+. Can receive from A+, A-, O+, and O-.' },
  'A-': { title: 'High Need Match', desc: 'Can donate whole blood to A+, A-, AB+, and AB-. Universal platelet donor type.' },
  'B+': { title: 'Specialized Match', desc: 'Can donate whole blood to B+ and AB+. Can receive from B+, B-, O+, and O-.' },
  'B-': { title: 'Rare Blood Match', desc: 'Can donate whole blood to B+, B-, AB+, and AB-. Critical emergency demand.' },
  'O+': { title: 'Universal Red Cell Donor', desc: 'Your O+ whole blood can support patients with O+, A+, B+, and AB+ blood types.' },
  'O-': { title: 'Universal First Responder', desc: 'Can donate to any patient in severe trauma emergencies. Highest hospital demand.' },
  'AB+': { title: 'Universal Plasma Donor', desc: 'Your plasma can treat any emergency trauma patient. Universal plasma recipient.' },
  'AB-': { title: 'Rare Plasma Match', desc: 'Plasma is universally compatible with all other groups. High therapeutic utility.' },
};

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId ? parseInt(userId, 10) : null,
          bloodGroup: selectedBlood,
          radius: 15,
          available
        })
      });
      if (response.ok) {
        setSaving(false);
        navigate('/donor-location');
      } else {
        console.error('Failed to register donor');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setSaving(false);
    }
  };

  const compat = BLOOD_COMPAT[selectedBlood];

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Header */}
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
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate max-w-[210px]">Donor Registration</h1>
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

          {/* Alert Banner */}
          <div className="w-full bg-error-container/40 rounded-DEFAULT px-space-md py-space-sm mb-space-md flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="font-label-md text-label-md text-primary font-semibold tracking-tight">CRITICAL NEED: O+ &amp; O- UNITS</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Metro General</span>
          </div>

          {/* Section title */}
          <div className="flex flex-col mb-space-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Donor Profile</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Set your blood group and availability</p>
          </div>

          {/* Blood Group */}
          <div className="flex flex-col mb-space-lg">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-lg text-label-lg text-on-surface font-semibold">Blood Group</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Required</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {Object.keys(BLOOD_COMPAT).map(bg => (
                <button
                  key={bg}
                  className={`flex items-center justify-center h-12 rounded-full font-title-md text-title-md transition-all duration-150 active:scale-95 ${selectedBlood === bg
                      ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container text-on-surface'
                    }`}
                  onClick={() => setSelectedBlood(bg)}
                  type="button"
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Compatibility info */}
            <div className="mt-space-sm bg-surface-container-low rounded-DEFAULT p-space-md flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold">{compat.title}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight mt-0.5">{compat.desc}</span>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex flex-col mb-space-lg">
            <div className="bg-surface-container-lowest rounded-DEFAULT p-space-md shadow-sm flex items-center justify-between gap-space-md">
              <div className="flex flex-col min-w-0 pr-space-xs">
                <span className="font-title-md text-title-md text-on-surface font-semibold">Available to donate</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Receive emergency alerts nearby</span>
              </div>
              <button
                aria-checked={available}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${available ? 'bg-primary' : 'bg-surface-variant'}`}
                onClick={() => setAvailable(a => !a)}
                role="switch"
                type="button"
              >
                <span className="sr-only">Toggle availability</span>
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface shadow-md ring-0 transition duration-200 ease-in-out my-1 ${available ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>



          {/* Save Button */}
          <div className="w-full mt-auto pt-space-md">
            <button
              className="w-full h-12 bg-primary text-on-primary rounded-full font-title-md text-title-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span>Save &amp; Continue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1 mt-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span className="font-label-sm text-label-sm">Encrypted &amp; HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorRegistration;
