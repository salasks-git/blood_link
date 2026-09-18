import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const SetupLocation = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'Your Hospital';
  const hospitalId   = localStorage.getItem('hospitalId') || '';

  const [saved, setSaved] = useState(false);

  const handleLocationSaved = () => {
    setSaved(true);
    setTimeout(() => navigate('/dashboard-home'), 1200);
  };

  const handleSkip = () => navigate('/dashboard-home');

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="w-full max-w-2xl bg-surface-container-lowest shadow-xl rounded-2xl overflow-hidden">

        {/* Top band */}
        <div className="bg-primary-container px-8 py-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-0.5">
              One-time Setup
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight uppercase">
              Set Hospital Location
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Pin <strong>{hospitalName}</strong> on the map so donors can navigate directly to you.
              This is saved to your profile and won't be asked again.
            </p>
          </div>
        </div>

        {/* Map widget */}
        <div className="p-6">
          <SetLocationMap
            hospitalId={hospitalId}
            onLocationSaved={handleLocationSaved}
          />
        </div>

        {/* Skip */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {saved ? (
            <div className="flex items-center gap-2 text-secondary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
              Location saved! Redirecting…
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={handleSkip}
            type="button"
            className="font-label-sm text-label-sm text-secondary hover:text-on-surface uppercase underline transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mt-6">
        <span className="w-2.5 h-2.5 rounded-full bg-secondary/30" />
        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="w-2.5 h-2.5 rounded-full bg-secondary/30" />
      </div>
      <p className="font-label-xs text-label-xs text-secondary mt-2 uppercase tracking-wider">
        Step 2 of 3 — Location
      </p>
    </div>
  );
};

export default SetupLocation;
