import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReceiverBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const validRoutes = ['/receiver-home', '/receiver-requests', '/profile'];
  if (!validRoutes.includes(path)) return null;

  // Only show for receiver role
  const activeRole = localStorage.getItem('activeRole');
  if (activeRole !== 'receiver') return null;

  let activeIndex = 0;
  if (path === '/receiver-home') activeIndex = 0;
  else if (path === '/receiver-requests') activeIndex = 1;
  else if (path === '/profile') activeIndex = 2;

  const tabs = [
    { label: 'Home', icon: 'home', route: '/receiver-home' },
    { label: 'Requests', icon: 'assignment', route: '/receiver-requests' },
    { label: 'Profile', icon: 'account_circle', route: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)] border-t border-outline-variant/30">
      <div className="relative flex justify-around items-center h-16 px-2">
        {/* Animated Pill Background */}
        <div
          className="absolute top-2 bottom-2 w-1/3 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)`, left: '0' }}
        >
          <div className="w-[85%] h-full mx-auto bg-tertiary/10 rounded-full" />
        </div>

        {tabs.map((tab, idx) => (
          <button
            key={tab.route}
            className={`relative z-10 flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-colors duration-300 ${activeIndex === idx ? 'text-tertiary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => navigate(tab.route)}
          >
            <div className="px-4 py-1 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[22px]"
                style={activeIndex === idx ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
            </div>
            <span className={`font-label-sm text-[11px] transition-all duration-300 ${activeIndex === idx ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ReceiverBottomNav;
