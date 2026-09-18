import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleanedPhone = phone.replace(/\D/g, '');

    if (!isLogin && !trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (cleanedPhone.length !== 10) {
      setError('Please enter an exact 10-digit mobile number');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { phone: cleanedPhone, password }
        : { phone: cleanedPhone, name: trimmedName, password, role: 'user' };

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
        if (response.ok) {
        const data = await response.json();
        const userId = data.id;
        const userRole = data.role || 'user';
        localStorage.setItem('userId', userId);

        setLoading(false);
        if (userRole === 'donor') {
          navigate('/donor-home');
        } else if (userRole === 'receiver') {
          navigate('/receiver-home');
        } else {
          navigate('/role-selection');
        }
      } else {
        const errData = await response.json();
        setError(errData.error || (isLogin ? 'Login failed' : 'Signup failed'));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">

      <main className="flex flex-col relative w-full pb-safe px-space-md bg-surface flex-grow justify-center">
        <div className="flex flex-col w-full max-w-[440px] mx-auto py-space-md">

          {/* Top bar */}
          <div className="flex items-center mb-space-lg relative">
            <div className="w-full flex justify-center items-center">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Authentication
              </span>
            </div>
          </div>

          {/* Tabs for Login / Signup */}
          <div className="flex w-full bg-surface-container-low rounded-full p-1 mb-space-xl shadow-inner border border-surface-variant">
            <button 
              type="button"
              className={`flex-1 py-2.5 text-center font-label-lg text-label-lg rounded-full transition-all ${isLogin ? 'bg-surface shadow-sm text-on-surface font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setIsLogin(true); setError(null); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`flex-1 py-2.5 text-center font-label-lg text-label-lg rounded-full transition-all ${!isLogin ? 'bg-surface shadow-sm text-on-surface font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => { setIsLogin(false); setError(null); }}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-space-xs mb-space-xl">
            <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isLogin ? 'Sign in to your LifeLink account to continue.' : 'Your name is kept private from other users.'}
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Name field (Only for Signup) */}
            {!isLogin && (
              <div className="flex flex-col gap-space-sm mb-space-md">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="name-input">
                  Full Name
                </label>
                <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                  <input
                    className="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                    id="name-input"
                    placeholder="Enter your name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Phone field */}
            <div className="flex flex-col gap-space-sm mb-space-md">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="phone-input">
                Mobile Number
              </label>
              <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                <div className="flex items-center gap-1 pr-3 mr-3">
                  <span className="font-label-lg text-label-lg text-on-surface select-none">+91</span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
                </div>
                <div className="w-px h-5 bg-surface-container-highest mr-3" />
                <input
                  className="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  id="phone-input"
                  placeholder="10-digit number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-space-sm mb-space-xl">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password-input">
                Password
              </label>
              <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                <input
                  className="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  id="password-input"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-error font-body-sm mb-space-md text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              className="w-full h-12 flex items-center justify-center rounded-full bg-primary text-on-primary font-label-lg text-label-lg tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default Auth;
