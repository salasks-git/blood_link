import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('gadmin', 'true');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-background min-h-screen">
      <main className="w-full min-h-screen flex items-center justify-center p-gutter-lg">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-outline-variant/40">
            {/* Header */}
            <div className="p-space-xl pb-space-md border-b border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="tracking-widest uppercase">GADMIN ACCESS</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">System Login</h1>
            </div>

            {/* Form */}
            <form className="p-space-xl flex flex-col gap-space-lg" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm uppercase text-secondary tracking-wider" htmlFor="admin-username">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-space-md text-tertiary material-symbols-outlined text-[18px]">person</span>
                  <input
                    className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded border border-transparent focus:border-on-surface focus:outline-none transition-colors"
                    id="admin-username"
                    placeholder="Enter admin username"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm uppercase text-secondary tracking-wider" htmlFor="admin-password">Password</label>
                <div className="relative flex items-center">
                  <span className="absolute left-space-md text-tertiary material-symbols-outlined text-[18px]">lock</span>
                  <input
                    className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded border border-transparent focus:border-on-surface focus:outline-none transition-colors"
                    id="admin-password"
                    placeholder="Enter admin password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="bg-error-container text-on-error-container p-space-sm rounded flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span className="font-label-sm text-label-sm">{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                className="w-full h-11 bg-on-surface hover:bg-black text-on-primary font-label-md text-label-md uppercase tracking-wider rounded shadow-md transition-colors flex items-center justify-center gap-space-sm mt-space-xs"
                type="submit"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Enter Console</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
