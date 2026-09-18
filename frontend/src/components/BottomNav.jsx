import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Only show on these three specific routes
  const validRoutes = ['/donor-home', '/incoming-request', '/profile'];
  if (!validRoutes.includes(path)) {
    return null;
  }

  // Determine active index for the slider pill
  let activeIndex = 0;
  if (path === '/donor-home') activeIndex = 0;
  else if (path === '/incoming-request') activeIndex = 1;
  else if (path === '/profile') activeIndex = 2;

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)] border-t border-outline-variant/30">
      <div className="relative flex justify-around items-center h-16 px-2">
        {/* Dynamic Island / Sliding Pill Background */}
        <div 
          className="absolute top-2 bottom-2 w-1/3 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)`, left: '0' }}
        >
          <div className="w-[85%] h-full mx-auto bg-primary/10 rounded-full" />
        </div>

        <button
          className={`relative z-10 flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors duration-300 ${activeIndex === 0 ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => navigate('/donor-home')}
        >
          <div className="px-4 py-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]" style={activeIndex === 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          </div>
          <span className={`font-label-sm text-[11px] transition-all duration-300 ${activeIndex === 0 ? 'font-bold' : 'font-medium'}`}>Home</span>
        </button>

        <button
          className={`relative z-10 flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors duration-300 ${activeIndex === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => navigate('/incoming-request')}
        >
          <div className="px-4 py-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]" style={activeIndex === 1 ? { fontVariationSettings: "'FILL' 1" } : {}}>volunteer_activism</span>
          </div>
          <span className={`font-label-sm text-[11px] transition-all duration-300 ${activeIndex === 1 ? 'font-bold' : 'font-medium'}`}>Requests</span>
        </button>

        <button
          className={`relative z-10 flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors duration-300 ${activeIndex === 2 ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => navigate('/profile')}
        >
          <div className="px-4 py-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]" style={activeIndex === 2 ? { fontVariationSettings: "'FILL' 1" } : {}}>account_circle</span>
          </div>
          <span className={`font-label-sm text-[11px] transition-all duration-300 ${activeIndex === 2 ? 'font-bold' : 'font-medium'}`}>Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
