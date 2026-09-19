import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalLayout from '../components/HospitalLayout';

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

const DonorRecords = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'St. Jude Memorial Hospital';
  const hospitalId = localStorage.getItem('hospitalId') || '';
  const locality = localStorage.getItem('hospitalLocality') || 'Global';
  const role = localStorage.getItem('hospitalRole') || 'hospital_admin';

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modals and Toasts
  const [dispatchDonor, setDispatchDonor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  // New Donor Form State
  const [newDonor, setNewDonor] = useState({
    name: '',
    bloodGroup: 'O-',
    age: '',
    distance: '',
    availability: 'Available Now',
    location: ''
  });

  const fetchDonors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/hospital/donors?hospitalId=${hospitalId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Deduplicate donors by userid to show unique users
        const donorsMap = new Map();
        data.forEach(d => {
            const uid = d.userid || d.userId;
            if (uid) {
                // Keep the most recent record
                if (!donorsMap.has(uid) || new Date(d.createdat || d.createdAt) > new Date(donorsMap.get(uid).createdat || donorsMap.get(uid).createdAt)) {
                    donorsMap.set(uid, d);
                }
            } else {
                // If no userid, just use its own id (e.g. manually added donors)
                donorsMap.set('manual_' + d.id, d);
            }
        });
        setDonors(Array.from(donorsMap.values()));
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    fetchDonors();
    const interval = setInterval(fetchDonors, 30000);
    return () => clearInterval(interval);
  }, [fetchDonors]);

  const handleLogout = () => {
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalRole');
    localStorage.removeItem('hospitalLocality');
    navigate('/staff-login');
  };

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDispatch = () => {
    if (!dispatchDonor) return;
    // Simulate dispatch success
    showToast('System Broadcast Dispatched', `Alert sent to ${dispatchDonor.userName || dispatchDonor.name}.`);
    setDispatchDonor(null);
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newDonor.name,
        bloodGroup: newDonor.bloodGroup,
        radius: parseFloat(newDonor.distance) || 5,
        available: newDonor.availability === 'Available Now' || newDonor.availability === 'On Call',
        hospitalId
      };
      const res = await fetch(`${API}/api/hospital/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Donor Registered', `Successfully added ${newDonor.name} to registry.`);
        setShowAddModal(false);
        setNewDonor({ name: '', bloodGroup: 'O-', age: '', distance: '', availability: 'Available Now', location: '' });
        fetchDonors();
      }
    } catch (_) {}
  };

  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      // Search
      const searchLower = search.toLowerCase();
      const bloodGroup = d.bloodgroup || d.bloodGroup;
      const userName = d.username || d.userName || d.name;
      const matchSearch = !search || 
        (userName && userName.toLowerCase().includes(searchLower)) ||
        (bloodGroup && bloodGroup.toLowerCase().includes(searchLower));
      
      if (!matchSearch) return false;

      // Filter pills
      if (filter === 'O-') return bloodGroup === 'O-' || bloodGroup === 'O Negative';
      if (filter === 'available-now') return d.available === 1 || d.available === true;
      if (filter === 'eligible-today') return true; // Simplify for now
      return true;
    });
  }, [donors, search, filter]);

  const stats = useMemo(() => {
    const total = donors.length;
    const universal = donors.filter(d => {
        const bg = d.bloodgroup || d.bloodGroup;
        return (bg === 'O-' || bg === 'O Negative') && (d.available === 1 || d.available === true);
    }).length;
    const near = donors.filter(d => d.distanceKm !== undefined && d.distanceKm <= 8 && (d.available === 1 || d.available === true)).length; // 8km is ~5 miles
    return { total, universal, near };
  }, [donors]);

  return (
    <HospitalLayout>
      <div className="flex flex-col w-full gap-space-lg">
        {/* Page header */}
        <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Donor Records & Registry</span>
              <span className="px-space-xs py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary uppercase tracking-wider">Live Database</span>
            </div>
            <span className="font-body-md text-body-md text-secondary">Manage community donor profiles, verify availability, and initiate emergency transfusion broadcasts.</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              className="flex items-center gap-2 px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase tracking-wider shadow-sm hover:bg-surface-container transition-colors"
              onClick={() => {
                setLoading(true);
                fetchDonors();
              }}
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>sync</span>
              Sync Database
            </button>
            <button
              className="flex items-center gap-2 px-space-md py-space-sm bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider shadow-sm hover:bg-primary transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Donor
            </button>
          </div>
        </div>

        {/* Dynamic Operational Stat Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Registry</span>
              <span className="font-data-display text-data-display text-on-surface">{loading ? '…' : stats.total}</span>
            </div>
            <div className="w-10 h-10 bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Universal (O-) Active</span>
              <span className="font-data-display text-data-display text-primary">{loading ? '…' : stats.universal}</span>
            </div>
            <div className="w-10 h-10 bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">bloodtype</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Available &lt; 5 Miles</span>
              <span className="font-data-display text-data-display text-on-surface">{loading ? '…' : stats.near}</span>
            </div>
            <div className="w-10 h-10 bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Dispatches (Shift A)</span>
              <span className="font-data-display text-data-display text-on-surface">0</span>
            </div>
            <div className="w-10 h-10 bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">send_time_extension</span>
            </div>
          </div>
        </div>

        {/* Command, Filter & Search Console */}
        <div className="bg-surface-container-lowest p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
            <input 
              className="w-full pl-10 pr-space-md py-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest transition-all" 
              placeholder="Search by donor name, blood group..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            {[
              { id: 'all', label: 'All Groups' },
              { id: 'O-', label: 'O- Negative (Universal)' },
              { id: 'available-now', label: 'Available Now' },
              { id: 'eligible-today', label: 'Eligible to Donate' }
            ].map(f => (
              <button 
                key={f.id}
                className={`px-space-sm py-1 font-label-sm text-label-sm uppercase transition-colors ${filter === f.id ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary hover:text-on-surface'}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-space-md px-space-lg">Donor Identity & Age</th>
                  <th className="py-space-md px-space-md text-center">Blood Group</th>
                  <th className="py-space-md px-space-md">Eligibility Status</th>
                  <th className="py-space-md px-space-md">Distance / Area</th>
                  <th className="py-space-md px-space-md">Availability</th>
                  <th className="py-space-md px-space-lg text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-space-2xl text-center text-secondary font-label-md text-label-md uppercase">
                      <span className="material-symbols-outlined animate-spin text-[20px] mr-2">refresh</span> Loading donors…
                    </td>
                  </tr>
                ) : filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-space-2xl text-center text-secondary font-label-md text-label-md uppercase">
                      No donors match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map(donor => {
                    const name = donor.username || donor.userName || donor.name || 'Unknown Donor';
                    const initials = name.substring(0, 2).toUpperCase();
                    const isAvailable = donor.available === 1 || donor.available === true;
                    const phone = donor.userphone || donor.userPhone || donor.phone || 'No phone';
                    const bloodGroup = donor.bloodgroup || donor.bloodGroup || 'Unknown';
                    
                    return (
                      <tr key={donor.id} className="hover:bg-surface-container-low/70 transition-colors">
                        <td className="py-space-md px-space-lg">
                          <div className="flex items-center gap-space-md">
                            <div className="w-9 h-9 bg-primary-fixed flex items-center justify-center font-label-md text-label-md text-primary font-bold">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{name}</span>
                              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary">
                                <span>ID: #DN-{donor.id}</span>
                                <span>·</span>
                                <span>{phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md text-center">
                          <span className={`inline-flex items-center justify-center w-12 py-1 font-data-metric text-data-metric font-bold ${bloodGroup.includes('O-') ? 'bg-primary-container text-on-primary' : 'bg-surface-container-highest text-on-surface'}`}>
                            {bloodGroup}
                          </span>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span className="font-label-md text-label-md uppercase font-semibold">Eligible today</span>
                            </div>
                            <span className="font-label-sm text-label-sm text-secondary">Verified by system</span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex items-center gap-space-xs">
                            <span className="material-symbols-outlined text-secondary text-[16px]">pin_drop</span>
                            <span className="font-data-metric text-data-metric text-on-surface">
                              {donor.distanceKm !== undefined ? `${donor.distanceKm.toFixed(1)} km` : (donor.locality || '?')}
                            </span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <span className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 font-label-sm text-label-sm uppercase font-semibold ${isAvailable ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-low text-secondary'}`}>
                            {isAvailable && <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>}
                            {!isAvailable && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                            {isAvailable ? 'Available Now' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-space-md px-space-lg text-right">
                          <div className="inline-flex items-center gap-space-xs justify-end">
                            <button 
                              className={`px-space-md py-1.5 font-label-sm text-label-sm uppercase transition-colors shadow-sm flex items-center gap-1 ${isAvailable ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container-low text-secondary cursor-not-allowed'}`}
                              disabled={!isAvailable}
                              onClick={() => setDispatchDonor(donor)}
                            >
                              {isAvailable ? (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">notification_important</span> Dispatch Alert
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">lock_clock</span> Rest Period
                                </>
                              )}
                            </button>
                            <button className="p-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" title="Direct Phone Call">
                              <span className="material-symbols-outlined text-[18px]">call</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <span className="font-label-md text-label-md text-secondary uppercase">
              Showing <span className="font-bold text-on-surface">{filteredDonors.length}</span> of <span className="font-bold text-on-surface">{stats.total}</span> registered donors
            </span>
          </div>
        </div>

      </div>

      {/* Dispatch Modal */}
      {dispatchDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg p-space-lg shadow-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">emergency</span>
                <span className="font-headline-md text-headline-md text-on-surface uppercase font-semibold">Priority Emergency Dispatch</span>
              </div>
              <button className="text-secondary hover:text-on-surface" onClick={() => setDispatchDonor(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-space-md bg-surface-container-low flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-secondary uppercase">Target Candidate</span>
                <span className="px-2 py-0.5 bg-primary-container text-on-primary font-data-metric text-data-metric font-bold">{dispatchDonor.bloodgroup || dispatchDonor.bloodGroup}</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{dispatchDonor.username || dispatchDonor.userName || dispatchDonor.name}</span>
              <span className="font-label-sm text-label-sm text-secondary">ID: #DN-{dispatchDonor.id} · Distance: {dispatchDonor.distanceKm !== undefined ? `${dispatchDonor.distanceKm.toFixed(1)} km` : (dispatchDonor.radius ? `${dispatchDonor.radius} miles` : '?')}</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-secondary uppercase">Clinical Unit / Ward Destination</label>
              <select className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none">
                <option>Emergency Trauma Bay 3 - Code Red</option>
                <option>Cardiothoracic OR 2 - Transfusion Critical</option>
                <option>Pediatric ICU - Cross-match Unit</option>
                <option>Standard Replenishment Batch (Shift A)</option>
              </select>
            </div>
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-secondary uppercase">Dispatch Notification Mode</label>
              <div className="grid grid-cols-2 gap-space-sm font-label-md text-label-md">
                <label className="flex items-center gap-2 p-space-sm bg-surface-container-low cursor-pointer">
                  <input defaultChecked className="accent-primary" name="dispatch_type" type="radio"/>
                  <span>Automated SMS + Call</span>
                </label>
                <label className="flex items-center gap-2 p-space-sm bg-surface-container-low cursor-pointer">
                  <input className="accent-primary" name="dispatch_type" type="radio"/>
                  <span>Mobile App Push Ping</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-space-sm">
              <button className="px-space-md py-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md uppercase" onClick={() => setDispatchDonor(null)}>
                Cancel
              </button>
              <button className="px-space-lg py-space-sm bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md uppercase font-semibold flex items-center gap-2" onClick={handleDispatch}>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Broadcast Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest w-full max-w-xl p-space-lg shadow-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">person_add</span>
                <span className="font-headline-md text-headline-md text-on-surface uppercase font-semibold">New Donor Registration</span>
              </div>
              <button className="text-secondary hover:text-on-surface" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="flex flex-col gap-space-md" onSubmit={handleAddDonor}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase">Full Name</label>
                  <input className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" placeholder="e.g. Jordan Miller" required type="text" value={newDonor.name} onChange={e => setNewDonor({...newDonor, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase">Blood Group</label>
                  <select className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" required value={newDonor.bloodGroup} onChange={e => setNewDonor({...newDonor, bloodGroup: e.target.value})}>
                    <option value="O-">O- (Universal Red Cell)</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+ (Universal Plasma)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase">Age</label>
                  <input className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" max="75" min="18" placeholder="30" type="number" value={newDonor.age} onChange={e => setNewDonor({...newDonor, age: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase">Distance (Miles)</label>
                  <input className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" placeholder="2.4" required step="0.1" type="number" value={newDonor.distance} onChange={e => setNewDonor({...newDonor, distance: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase">Availability</label>
                  <select className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" value={newDonor.availability} onChange={e => setNewDonor({...newDonor, availability: e.target.value})}>
                    <option value="Available Now">Available Now</option>
                    <option value="On Call">On Call</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-secondary uppercase">Location / Neighborhood</label>
                <input className="w-full p-2 bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none" placeholder="e.g. Metro Valley, Bay District" type="text" value={newDonor.location} onChange={e => setNewDonor({...newDonor, location: e.target.value})} />
              </div>
              <div className="flex items-center justify-end gap-space-sm pt-space-sm">
                <button className="px-space-md py-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md uppercase" onClick={() => setShowAddModal(false)} type="button">
                  Cancel
                </button>
                <button className="px-space-lg py-space-sm bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md uppercase font-semibold" type="submit">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-surface px-space-lg py-space-md shadow-2xl flex items-center gap-3 border-l-4 border-primary">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold uppercase">{toast.title}</span>
            <span className="font-body-sm text-body-sm text-surface-variant">{toast.message}</span>
          </div>
        </div>
      )}
    </HospitalLayout>
  );
};

export default DonorRecords;
