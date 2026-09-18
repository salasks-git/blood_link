import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [locality, setLocality] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('clinical_staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/hospital/auth/login' : '/api/hospital/auth/signup';
      const payload = isLogin
        ? { hospitalId, password }
        : { hospitalId, hospitalName, password };

      const res = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isLogin ? 'Authentication failed.' : 'Signup failed.'));
        setLoading(false);
        return;
      }

      if (data.status === 'pending') {
        setError('Account is pending admin approval.');
        setLoading(false);
        return;
      }

      // Persist session
      localStorage.setItem('hospitalId', data.hospitalId);
      localStorage.setItem('hospitalName', data.hospitalName);
      localStorage.setItem('hospitalRole', data.role);
      localStorage.setItem('hospitalLocality', data.locality || 'Global');

      // If hospital has no location set yet → take them through location setup
      const hasLocation = data.latitude && data.longitude;
      navigate(hasLocation ? '/dashboard-home' : '/setup-location');
    } catch (err) {
      setError('Network error. Please ensure the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow">
      <main className="w-full min-h-screen flex items-center justify-center p-gutter-lg bg-surface">
        <div className="flex flex-col w-full items-center justify-center py-margin-lg">
          <div className="w-full max-w-[440px] flex flex-col items-center">

            {/* Main Authentication Container */}
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
              {/* Portal Brand Band */}
              <div className="bg-surface-container-low p-space-xl flex items-start justify-between">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-7 h-7 bg-primary-container text-on-primary flex items-center justify-center rounded">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
                    </div>
                    <span className="font-headline-md text-headline-md tracking-tight text-on-surface">LifeLink</span>
                    <span className="font-label-sm text-label-sm uppercase bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded">HOSPITAL</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">CLINICAL OPERATIONAL ACCESS POINT</span>
                </div>
              </div>

              {/* Authentication Form */}
              <form className="p-space-xl flex flex-col gap-space-lg" onSubmit={handleSubmit}>



                {/* Hospital Name (Only on Signup) */}
                {!isLogin && (
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex justify-between items-baseline">
                      <label className="font-label-sm text-label-sm uppercase text-secondary tracking-wider" htmlFor="hospital-name">Hospital Name</label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-space-md text-tertiary material-symbols-outlined text-[18px]">local_hospital</span>
                      <input
                        className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded focus:outline-none focus:bg-surface-container-lowest transition-colors"
                        id="hospital-name"
                        placeholder="e.g. St. Jude Medical Center"
                        required={!isLogin}
                        type="text"
                        value={hospitalName}
                        onChange={e => setHospitalName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Hospital ID Field */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex justify-between items-baseline">
                    <label className="font-label-sm text-label-sm uppercase text-secondary tracking-wider" htmlFor="staff-id">Hospital Staff ID</label>
                    <span className="font-label-sm text-label-sm text-tertiary">ORGANIZATION SSO</span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-space-md text-tertiary material-symbols-outlined text-[18px]">badge</span>
                    <input
                      className="w-full h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded focus:outline-none focus:bg-surface-container-lowest transition-colors"
                      id="staff-id"
                      placeholder="e.g. admin_xyz"
                      required
                      type="text"
                      value={hospitalId}
                      onChange={e => setHospitalId(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex justify-between items-baseline">
                    <label className="font-label-sm text-label-sm uppercase text-secondary tracking-wider" htmlFor="staff-pass">Passphrase</label>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-space-md text-tertiary material-symbols-outlined text-[18px]">lock</span>
                    <input
                      className="w-full h-10 pl-10 pr-10 bg-surface-container-low text-on-surface font-body-md text-body-md rounded focus:outline-none focus:bg-surface-container-lowest transition-colors"
                      id="staff-pass"
                      placeholder="••••••••••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      className="absolute right-space-sm text-tertiary hover:text-on-surface p-1"
                      onClick={() => setShowPassword(v => !v)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="bg-error-container text-on-error-container p-space-sm rounded flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span className="font-label-sm text-label-sm">{error}</span>
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider rounded shadow-md transition-all flex items-center justify-center gap-space-sm mt-space-xs active:scale-[0.99] disabled:opacity-60"
                  id="btn-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>{isLogin ? 'Sign In to Portal' : 'Register Organization'}</span>
                    </>
                  )}
                </button>

                {/* Toggle Signup/Login */}
                <div className="text-center mt-2">
                  <p className="font-body-sm text-secondary">
                    {isLogin ? "New hospital partner? " : "Already registered? "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-semibold"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                      }}
                    >
                      {isLogin ? 'Register Here' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* HIPAA & Compliance Verification Footer */}
            <div className="w-full mt-space-lg px-space-md flex flex-col gap-space-xs text-center">
              <div className="flex items-center justify-center gap-space-xs text-secondary">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">HIPAA Security Standard Certified</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Authorized clinical personnel only. Confidential patient and donor health records protected by federal law, HIPAA, and internal clinical audits.
              </p>
              <div className="flex items-center justify-center gap-space-md mt-space-xs text-tertiary">
                <span className="font-label-sm text-label-sm">SYSTEM STATUS: NOMINAL</span>
                <span>•</span>
                <span className="font-label-sm text-label-sm">IT DESK: EXT-4402</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
