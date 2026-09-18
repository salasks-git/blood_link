import React from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const DonorLocation = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleSkip = () => {
    navigate('/donor-home');
  };

  const handleLocationSaved = () => {
    navigate('/donor-home');
  };

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
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate max-w-[210px]">Set Location</h1>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-primary font-label-md text-label-md uppercase font-semibold"
          >
            Skip
          </button>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-20 pb-safe px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full pb-8">
          
          <div className="flex flex-col mb-space-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Your Location</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Set your location to receive relevant blood requests nearby. This is optional and can be updated later.</p>
          </div>

          <div className="flex flex-col mb-space-xl">
            <SetLocationMap userId={userId} onLocationSaved={handleLocationSaved} />
          </div>

          <div className="w-full mt-auto pt-space-md">
            <button
              className="w-full h-12 bg-surface-container text-on-surface rounded-full font-title-md text-title-md font-semibold flex items-center justify-center shadow-sm transition-colors"
              onClick={handleSkip}
              type="button"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorLocation;
