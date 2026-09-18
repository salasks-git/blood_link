import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalLayout from '../components/HospitalLayout';

const API = 'http://localhost:5001';

const TrustLayerAdmin = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth Check
    if (localStorage.getItem('gadmin') !== 'true') {
      navigate('/admin-login');
      return;
    }

    const fetchData = async () => {
      try {
        const [hospRes, usersRes, reqRes] = await Promise.all([
          fetch(`${API}/api/admin/hospitals`),
          fetch(`${API}/api/admin/users`),
          fetch(`${API}/api/admin/requests`)
        ]);
        
        if (hospRes.ok) setHospitals(await hospRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (reqRes.ok) setRequests(await reqRes.json());
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('gadmin');
    navigate('/admin-login');
  };

  const handleApproveHospital = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/hospitals/${id}/approve`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setHospitals(hospitals.map(h => h.id === id ? { ...h, status: 'approved' } : h));
      } else {
        alert('Failed to approve hospital');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving hospital');
    }
  };

  return (
    <HospitalLayout isAdmin={true}>
      <main className="min-h-screen flex flex-col gap-6">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-outline-variant gap-4 bg-surface">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">TRUST LAYER &amp; GOVERNANCE</h1>
              <span className="px-2 py-0.5 border border-primary-container bg-red-50 text-primary font-label-sm text-label-sm uppercase font-semibold">
                STATION 4B AUDIT VERIFIED
              </span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-1 max-w-4xl">
              Cryptographic hospital node accreditation, cross-institution peer verification, and staff credential moderation.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleLogout} className="h-10 px-5 rounded-xl bg-surface border border-outline-variant hover:bg-surface-container-low font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]" data-icon="logout">logout</span>
              <span>Global Sign Out</span>
            </button>
            <button className="h-10 px-5 rounded-xl bg-primary text-white hover:bg-primary/90 font-label-md text-label-md uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm" onClick={() => window.location.reload()}>
              <span className="material-symbols-outlined text-[18px]" data-icon="sync">sync</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                  Registered Hospitals
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{hospitals.length}</span>
                <span className="font-label-md text-secondary font-semibold uppercase">Hospitals</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/50">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-label-sm text-[11px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Active in network
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                  Total Patients
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{users.length}</span>
                <span className="font-label-md text-secondary font-semibold uppercase">Patients</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/50">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-label-sm text-[11px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Registered via Donor App
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">emergency</span>
                  Emergency Requests
                </span>
                <span className="material-symbols-outlined text-error text-[24px]">warning</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{requests.length}</span>
                <span className="font-label-md text-secondary font-semibold uppercase">Logs</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/50">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-error/10 text-error font-label-sm text-[11px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                {requests.filter(r => r.status === 'searching').length} Currently Active
              </span>
            </div>
          </div>
        </section>

        {/* Hospitals Table */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant flex flex-col overflow-hidden mb-6">
          <div className="p-5 border-b border-outline-variant/50 bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" data-icon="apartment">apartment</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight uppercase">
                  Hospital Accreditation &amp; Network Admission
                </h2>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/50 h-10">
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Hospital / Clinic Name</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Facility ID</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Joined At</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-sm text-body-sm bg-surface">
                {loading ? (
                  <tr><td colSpan="4" className="px-5 py-8 text-center text-secondary font-label-md">Loading data...</td></tr>
                ) : hospitals.length === 0 ? (
                  <tr><td colSpan="4" className="px-5 py-8 text-center text-secondary font-label-md">No hospitals currently registered.</td></tr>
                ) : hospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-surface-container-lowest transition-colors even:bg-surface/50 odd:bg-surface-container-lowest">
                    <td className="px-5 py-4 font-semibold text-on-surface flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                      </div>
                      {hosp.hospitalName}
                    </td>
                    <td className="px-5 py-4 text-secondary font-mono text-xs">{hosp.hospitalId}</td>
                    <td className="px-5 py-4 text-secondary">{new Date(hosp.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      {hosp.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 text-warning font-label-sm text-[11px] font-bold uppercase border border-warning/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                            Pending Approval
                          </span>
                          <button 
                            onClick={() => handleApproveHospital(hosp.id)}
                            className="h-7 px-3 bg-primary text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Verified Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Users Table */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant flex flex-col overflow-hidden mb-6">
          <div className="p-5 border-b border-outline-variant/50 bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" data-icon="shield_person">shield_person</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight uppercase">
                  User Access &amp; Moderation
                </h2>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/50 h-10">
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">User Name</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Phone Number</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-sm text-body-sm bg-surface">
                {loading ? (
                  <tr><td colSpan="4" className="px-5 py-8 text-center text-secondary font-label-md">Loading data...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="px-5 py-8 text-center text-secondary font-label-md">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors even:bg-surface/50 odd:bg-surface-container-lowest">
                    <td className="px-5 py-4 font-semibold text-on-surface flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs uppercase">
                        {(u.name || 'AN').substring(0, 2)}
                      </div>
                      {u.name || 'Anonymous'}
                    </td>
                    <td className="px-5 py-4 text-primary font-mono text-sm">{u.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase">
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* Requests Table */}
        <section className="bg-surface-container-lowest border border-outline-variant flex flex-col">
          <div className="p-4 border-b border-outline-variant flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error" data-icon="emergency">emergency</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight uppercase font-label-md">
                  Emergency Requests Log
                </h2>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-on-surface h-8">
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Date</th>
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Requester</th>
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Patient</th>
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Blood Group</th>
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Units</th>
                  <th className="px-4 py-2 font-label-sm text-label-sm text-secondary font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-6 text-center text-secondary">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-6 text-center text-secondary">No requests found.</td></tr>
                ) : requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-secondary">{new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{req.hospital || req.requesterName}</td>
                    <td className="px-4 py-3 text-on-surface">{req.patientName || 'N/A'}</td>
                    <td className="px-4 py-3 font-bold text-primary">{req.bloodGroup}</td>
                    <td className="px-4 py-3 text-secondary">{req.units}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase ${
                        req.status === 'searching' ? 'border-yellow-600 text-yellow-800 bg-yellow-50' :
                        req.status === 'accepted' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' :
                        req.status === 'fulfilled' ? 'border-blue-600 text-blue-800 bg-blue-50' :
                        'border-gray-600 text-gray-800 bg-gray-50'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </HospitalLayout>
  );
};

export default TrustLayerAdmin;
