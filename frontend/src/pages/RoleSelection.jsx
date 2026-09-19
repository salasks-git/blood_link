import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(null);
  const userId = localStorage.getItem('userId');

  const handleSelect = async (role) => {
    setPressed(role);
    
    // Wait for animation
    await new Promise(r => setTimeout(r, 200));

    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      localStorage.setItem('userRole', role);
    } catch (err) {
      console.error('Failed to update role:', err);
    }

    if (role === 'receiver') {
      navigate('/receiver-home');
    } else {
      // Check if user is already a donor
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.donorInfo && data.donorInfo.bloodGroup) {
            navigate('/donor-home');
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
      navigate('/donor-registration');
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">

      <main className="flex flex-col relative w-full pb-safe px-space-md bg-surface flex-grow justify-center">
        <div className="flex flex-col w-full py-space-md">

          {/* Brand Header */}
          <header className="flex items-center justify-between w-full mb-space-xl">
            <div className="flex items-center gap-space-xs">
              <button
                aria-label="Go Back"
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors"
                onClick={() => {
                  localStorage.removeItem('userId');
                  navigate('/login');
                }}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <span className="font-title-md text-title-md text-on-surface tracking-tight font-semibold">LifeLink</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">v1.0</span>
          </header>

          {/* Title */}
          <section className="flex flex-col gap-space-xs mb-space-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Select your path
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Are you here to find blood for an emergency, or to donate as a lifesaver?
            </p>
          </section>

          {/* Role Buttons */}
          <div className="flex flex-col gap-space-md w-full">

            {/* Receiver */}
            <button
              className={`group relative w-full text-left p-space-lg rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between min-h-[148px] ${pressed === 'receiver' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleSelect('receiver')}
              type="button"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors">
                  <span className="material-symbols-outlined text-[24px]">emergency</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-title-lg text-title-lg font-bold text-on-surface">I need blood</span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold">Patient / Hospital</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">Find verified donors near you instantly</p>
              </div>
            </button>

            {/* Donor */}
            <button
              className={`group relative w-full text-left p-space-lg rounded-2xl bg-primary hover:bg-primary/90 text-on-primary transition-all duration-200 active:scale-[0.98] shadow-md flex flex-col justify-between min-h-[148px] ${pressed === 'donor' ? 'opacity-90' : ''}`}
              onClick={() => handleSelect('donor')}
              type="button"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-on-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-title-lg text-title-lg font-bold text-on-primary">I want to donate</span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-white/20 text-on-primary font-semibold">Live Donor</span>
                </div>
                <p className="font-body-md text-body-md text-on-primary/80">Register as a certified community lifesaver</p>
              </div>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;
