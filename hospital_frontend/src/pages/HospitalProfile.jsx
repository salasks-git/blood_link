import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetLocationMap from '../components/SetLocationMap';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const HospitalProfile = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'Hospital';
  const hospitalId = localStorage.getItem('hospitalId') || '';
  const role = localStorage.getItem('hospitalRole') || 'hospital_admin';

  const [savedLocation, setSavedLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [editingLocation, setEditingLocation] = useState(false);
  // Keep locality in state so it updates live after saving
  const [locality, setLocality] = useState(localStorage.getItem('hospitalLocality') || 'Global');

  // Fetch saved location on mount
  useEffect(() => {
    if (!hospitalId) { setLoadingLocation(false); return; }
    fetch(`${API}/api/hospital/location?hospitalId=${encodeURIComponent(hospitalId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          setSavedLocation(data);
          if (data.locality) {
            setLocality(data.locality);
            localStorage.setItem('hospitalLocality', data.locality);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLocation(false));
  }, [hospitalId]);

  const handleLocationSaved = (savedData) => {
    if (savedData) {
      setSavedLocation({
        latitude: savedData.lat,
        longitude: savedData.lng,
        locality: savedData.locality,
      });
      if (savedData.locality) {
        localStorage.setItem('hospitalLocality', savedData.locality);
        setLocality(savedData.locality);
      }
    } else {
      fetch(`${API}/api/hospital/location?hospitalId=${encodeURIComponent(hospitalId)}`)
        .then(r => r.json())
        .then(data => {
          if (data.latitude) {
            setSavedLocation(data);
            if (data.locality) {
              localStorage.setItem('hospitalLocality', data.locality);
              setLocality(data.locality);
            }
          }
        })
        .catch(() => {});
    }
    setEditingLocation(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalRole');
    localStorage.removeItem('hospitalLocality');
    navigate('/staff-login');
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow bg-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-surface-variant z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight tracking-tight uppercase">LifeLink</span>
              <span className="font-label-sm text-label-sm text-secondary uppercase">Clinical Blood Portal</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface uppercase">{hospitalName}</span>
              <span className="font-label-sm text-label-sm text-secondary">Locality: {locality}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-3 border-l border-surface-variant">
            <div className="text-right hidden sm:block">
              <span className="block font-label-md text-label-md text-on-surface leading-tight">{hospitalName}</span>
              <span className="block font-label-sm text-label-sm text-secondary uppercase">Hospital Admin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">local_hospital</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-variant z-30 flex flex-col justify-between p-space-lg">
        <div className="flex flex-col gap-space-lg">
          <div className="px-space-sm">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Clinical Units</span>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/dashboard-home')} href="#">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>Dashboard
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/new-blood-request')} href="#">
              <span className="material-symbols-outlined text-[20px]">bloodtype</span>Blood Requests
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/donor-records')} href="#">
              <span className="material-symbols-outlined text-[20px]">group</span>Donor Records
            </a>
            <a aria-current="page" className="flex items-center gap-3 px-space-md py-space-sm transition-colors border border-transparent uppercase bg-primary-container text-on-primary font-bold" onClick={() => navigate('/profile')} href="#">
              <span className="material-symbols-outlined text-[20px]">person</span>Profile
            </a>
            {role === 'system_admin' && (
              <a className="flex items-center gap-3 px-space-md py-space-sm text-primary hover:bg-surface-container-high hover:text-primary transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/admin')} href="#">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>Admin Panel
              </a>
            )}
          </nav>
        </div>
        <div className="flex flex-col gap-2 pt-space-lg border-t border-surface-variant">
          <button
            className="flex items-center gap-3 px-space-md py-space-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors border border-transparent font-label-md text-label-md uppercase w-full text-left"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 flex-grow flex flex-col items-center">
        <div className="w-full max-w-5xl p-space-xl flex flex-col gap-space-xl">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight mb-2">Hospital Profile</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your hospital's geolocation and settings.</p>
          </div>

          {/* Location Card */}
          <div className="bg-surface-container-lowest shadow-sm flex flex-col gap-space-md p-space-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Hospital Geolocation</h2>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  {editingLocation
                    ? "Click on the map or search to update your hospital's location."
                    : "Your hospital's saved location for precise donor matching."}
                </p>
              </div>
              {!editingLocation && (
                <button
                  onClick={() => setEditingLocation(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-high hover:text-on-surface transition-all font-label-md uppercase"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_location</span>
                  Edit Location
                </button>
              )}
              {editingLocation && (
                <button
                  onClick={() => setEditingLocation(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-high transition-all font-label-md uppercase"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  Cancel
                </button>
              )}
            </div>

            {/* Saved location display (view mode) */}
            {!editingLocation && (
              <div>
                {loadingLocation ? (
                  <div className="flex items-center gap-3 py-6 text-secondary">
                    <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                    <span className="font-body-md">Loading saved location...</span>
                  </div>
                ) : savedLocation ? (
                  <div className="flex items-start gap-4 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">location_on</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-label-sm text-secondary uppercase font-bold tracking-wider mb-1">Saved Location</span>
                      <span className="font-body-md text-on-surface">{savedLocation.locality || `${parseFloat(savedLocation.latitude).toFixed(4)}, ${parseFloat(savedLocation.longitude).toFixed(4)}`}</span>
                      <span className="font-code-sm text-[11px] text-secondary mt-0.5">
                        Lat: {parseFloat(savedLocation.latitude).toFixed(6)}, Lng: {parseFloat(savedLocation.longitude).toFixed(6)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                    <span className="material-symbols-outlined text-secondary text-[22px]">location_off</span>
                    <div>
                      <p className="font-label-md text-on-surface">No location set yet</p>
                      <p className="font-body-sm text-secondary">Click "Edit Location" to set your hospital on the map.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edit mode: show full map */}
            {editingLocation && (
              <SetLocationMap
                hospitalId={hospitalId}
                onLocationSaved={handleLocationSaved}
                initialLocation={savedLocation ? { lat: parseFloat(savedLocation.latitude), lng: parseFloat(savedLocation.longitude) } : null}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalProfile;
