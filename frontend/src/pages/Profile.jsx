import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [placeName, setPlaceName] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    role: '',
    location: null,
    donorInfo: null
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '',
            phone: data.phone || '',
            role: data.role || '',
            location: data.location || null,
            donorInfo: data.donorInfo || null
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  useEffect(() => {
    if (profile.location) {
      const { latitude, longitude } = profile.location;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            setPlaceName(parts.slice(0, 3).join(', '));
          }
        })
        .catch(err => console.error("Reverse geocoding failed", err));
    }
  }, [profile.location]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          role: profile.role,
          location: profile.location,
          donorInfo: profile.donorInfo
        })
      });
      if (res.ok) {
        // Navigate to the correct dashboard based on the updated role
        if (profile.role === 'donor') {
          navigate('/donor-home');
        } else if (profile.role === 'receiver') {
          navigate('/receiver-home');
        } else {
          navigate('/role-selection');
        }
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">

      <main className="flex flex-col relative w-full pb-24 px-space-md bg-surface flex-grow">
        <div className="flex flex-col w-full max-w-[440px] mx-auto py-space-md">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-space-lg">
            <button
              aria-label="Go back"
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors"
              onClick={() => navigate(-1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="font-title-md text-title-md text-on-surface">My Profile</span>
            <div className="w-10" />
          </div>

          {error ? (
            <p className="text-error">{error}</p>
          ) : (
            <form className="flex flex-col" onSubmit={handleSave}>
              <div className="flex flex-col gap-space-sm mb-space-md">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Full Name
                </label>
                <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                  <input
                    className="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-sm mb-space-md opacity-70">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Mobile Number (Cannot be changed)
                </label>
                <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent">
                  <input
                    className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none"
                    value={profile.phone}
                    disabled
                    type="tel"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-sm mb-space-md">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Current Role
                </label>
                <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                  <select
                    className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none appearance-none"
                    value={profile.role}
                    onChange={e => setProfile({...profile, role: e.target.value})}
                  >
                    <option value="donor">Donor</option>
                    <option value="receiver">Receiver</option>
                  </select>
                </div>
              </div>

              {profile.role === 'donor' && (
                <div className={`flex flex-col gap-space-sm mb-space-md ${profile.donorInfo?.bloodGroup ? 'opacity-70' : ''}`}>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Blood Group {profile.donorInfo?.bloodGroup ? '(Cannot be changed)' : ''}
                  </label>
                  <div className="flex items-center w-full h-12 px-space-md rounded-full bg-surface-container-lowest shadow-sm border border-transparent focus-within:border-primary/50 transition-colors">
                    {profile.donorInfo?.bloodGroup ? (
                      // Locked — blood group already set
                      <div className="flex items-center gap-2 w-full">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
                        <span className="font-body-lg text-body-lg text-on-surface">
                          {profile.donorInfo.bloodGroup}
                        </span>
                      </div>
                    ) : (
                      // Not set yet — show dropdown
                      <select
                        className="w-full bg-transparent font-body-lg text-body-lg text-on-surface focus:outline-none appearance-none"
                        value={profile.donorInfo?.bloodGroup || ''}
                        onChange={e => setProfile({
                          ...profile,
                          donorInfo: { ...(profile.donorInfo || {}), bloodGroup: e.target.value }
                        })}
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-space-sm mb-space-xl">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Location
                </label>
                {profile.location ? (
                  <div className="mb-3 flex items-start gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">location_on</span>
                    <div className="flex flex-col">
                      {placeName ? (
                        <>
                          <span className="font-body-md font-medium text-on-surface">{placeName}</span>
                          <span className="font-body-xs text-on-surface-variant mt-0.5">
                            Lat: {parseFloat(profile.location.latitude).toFixed(4)}, Lng: {parseFloat(profile.location.longitude).toFixed(4)}
                          </span>
                        </>
                      ) : (
                        <span className="font-body-md text-on-surface-variant">
                          Lat: {parseFloat(profile.location.latitude).toFixed(4)}, Lng: {parseFloat(profile.location.longitude).toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="font-body-md text-on-surface-variant mb-2">No location saved.</p>
                )}
                
                <button
                  type="button"
                  onClick={() => navigate('/donor-location')}
                  className="flex items-center justify-center gap-2 w-full h-12 px-space-md rounded-full border border-surface-container-highest bg-transparent text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    my_location
                  </span>
                  <span className="font-label-lg text-label-lg">
                    Update Location
                  </span>
                </button>
              </div>

              <button
                className="w-full h-12 flex items-center justify-center rounded-full bg-primary text-on-primary font-label-lg text-label-lg tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-60 mb-space-lg"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : 'Save Changes'}
              </button>
              
              <button
                type="button"
                className="w-full h-12 flex items-center justify-center rounded-full border border-error text-error font-label-lg text-label-lg tracking-wide hover:bg-error/10 active:scale-[0.99] transition-all"
                onClick={() => {
                  localStorage.removeItem('userId');
                  navigate('/');
                }}
              >
                Log Out
              </button>
            </form>
          )}
        </div>
      </main>


    </div>
  );
};

export default Profile;
