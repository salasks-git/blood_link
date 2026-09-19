import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalLayout from '../components/HospitalLayout';

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

const NewBloodRequestForm = () => {
  const navigate = useNavigate();
  const hospitalName = localStorage.getItem('hospitalName') || 'St. Jude Memorial Hospital';
  const hospitalId = localStorage.getItem('hospitalId') || '';
  const locality = localStorage.getItem('hospitalLocality') || 'Global';
  const role = localStorage.getItem('hospitalRole') || 'hospital_admin';
  
  const [formData, setFormData] = useState({
    patientMrn: '',
    patientName: '',
    wardLocation: '',
    bloodGroup: 'O+', // Use exact matches instead of _POS
    productType: 'PRBC',
    unitsNeeded: 2,
    urgencyLevel: 'STAT',
    requiredDate: '',
    requiredTime: ''
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [notifiedCount, setNotifiedCount] = useState(null);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalRole');
    localStorage.removeItem('hospitalLocality');
    navigate('/staff-login');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        units: formData.unitsNeeded,
        urgency: formData.urgencyLevel,
        hospitalId,
      };
      
      const res = await fetch(`${API}/api/hospital/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setSuccessData(data);

        // Notify matching donors within the urgency-based radius
        // (10 km for ROUTINE, 20 km for URGENT, 40 km for STAT)
        try {
          const notifyRes = await fetch(`${API}/api/requests/${data.id}/notify-donors`, {
            method: 'POST'
          });
          if (notifyRes.ok) {
            const notifyData = await notifyRes.json();
            setNotifiedCount(notifyData.notifiedCount);
          }
        } catch (_) {
          // Notification failure is non-fatal — request was still created
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HospitalLayout>
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-space-lg pt-space-lg px-space-lg">
        {/* Page header */}
        <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm text-secondary">
            <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Clinical Requisition</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">New Blood Request</h1>
          <p className="font-body-md text-body-md text-secondary">Initiate a formal requisition for blood components. High urgency requests will broadcast to the decentralized network.</p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-space-md rounded-md flex items-center gap-space-sm border border-error/20 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/donor-records')} href="#">
              <span className="material-symbols-outlined text-[20px]">group</span>Donor Records
            </a>
            <a className="flex items-center gap-3 px-space-md py-space-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent font-label-md text-label-md uppercase" onClick={() => navigate('/profile')} href="#">
              <span className="material-symbols-outlined text-[20px]">person</span>Profile
            </a>
            <span className="font-label-md text-label-md font-semibold">{error}</span>
          </div>
        )}

        <form className="grid grid-cols-1 gap-space-xl" onSubmit={handleFormSubmit}>
              <div className="flex flex-col gap-space-xl w-full">
                
                {/* Section 1 */}
                <section className="bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm bg-inverse-surface text-inverse-on-surface px-1.5 py-0.5 font-bold">01</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Patient &amp; Ward Details</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
                    <div className="md:col-span-4 flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                        <span>Patient MRN / ID</span>
                      </label>
                      <div className="relative">
                        <input className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase tracking-wider focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner border border-surface-variant" 
                          placeholder="e.g. MRN-8849-B" type="text" value={formData.patientMrn} onChange={e => setFormData({...formData, patientMrn: e.target.value})} />
                        <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-secondary text-[18px]">badge</span>
                      </div>
                    </div>
                    <div className="md:col-span-8 flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                        <span>Patient Full Name</span>
                        <span className="text-primary font-bold">*</span>
                      </label>
                      <input className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface font-body-md text-body-md uppercase focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner border border-surface-variant" 
                        placeholder="LASTNAME, FIRSTNAME M." required type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} />
                    </div>
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                        <span>Hospital Ward / ICU Bed</span>
                        <span className="text-primary font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          className="w-full h-10 px-space-md bg-surface-container-low text-on-surface font-body-md text-body-md rounded focus:outline-none focus:bg-surface-container-lowest transition-colors border border-transparent shadow-inner focus:border-outline"
                          placeholder="e.g. ICU Bed 14, Ward 4N"
                          required
                          type="text"
                          value={formData.wardLocation}
                          onChange={e => setFormData({...formData, wardLocation: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section className="bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between pb-space-sm bg-surface-container-low px-space-md py-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm bg-inverse-surface text-inverse-on-surface px-1.5 py-0.5 font-bold">02</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Blood Request Specifications</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                      <span>Triage Urgency Level</span>
                      <span className="text-primary font-bold">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                      <label className={`relative flex flex-col p-space-md cursor-pointer transition-all select-none border border-transparent ${formData.urgencyLevel === 'ROUTINE' ? 'bg-surface-container-high border-secondary' : 'bg-surface-container-low hover:bg-surface-container-high'}`}>
                        <input className="sr-only" name="urgencyLevel" type="radio" value="ROUTINE" checked={formData.urgencyLevel === 'ROUTINE'} onChange={() => setFormData({...formData, urgencyLevel: 'ROUTINE'})} />
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-headline-sm text-headline-sm text-on-surface uppercase">Routine</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary mb-2">Within 24 Hours</span>
                      </label>
                      <label className={`relative flex flex-col p-space-md cursor-pointer transition-all select-none border border-transparent ${formData.urgencyLevel === 'URGENT' ? 'bg-surface-container-high border-secondary' : 'bg-surface-container-low hover:bg-surface-container-high'}`}>
                        <input className="sr-only" name="urgencyLevel" type="radio" value="URGENT" checked={formData.urgencyLevel === 'URGENT'} onChange={() => setFormData({...formData, urgencyLevel: 'URGENT'})} />
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-headline-sm text-headline-sm text-on-surface uppercase">Urgent</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary mb-2">Within 4 Hours</span>
                      </label>
                      <label className={`relative flex flex-col p-space-md cursor-pointer transition-all select-none border border-transparent ${formData.urgencyLevel === 'STAT' ? 'bg-error-container border-error' : 'bg-error-container/30 hover:bg-error-container/80'}`}>
                        <input className="sr-only" name="urgencyLevel" type="radio" value="STAT" checked={formData.urgencyLevel === 'STAT'} onChange={() => setFormData({...formData, urgencyLevel: 'STAT'})} />
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-headline-sm text-headline-sm text-error font-bold uppercase flex items-center gap-1.5">
                            STAT / Code Red
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-error font-semibold mb-2">Immediate</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg pt-space-xs">
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                        <span>Required Group</span>
                        <span className="text-primary font-bold">*</span>
                      </label>
                      <div className="relative">
                        <select className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface font-headline-md text-headline-md uppercase appearance-none focus:outline-none focus:bg-surface-container-low transition-colors shadow-inner pr-8 border border-surface-variant" 
                          required value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                          <option value="O-">O-</option>
                          <option value="O+">O+</option>
                          <option value="A-">A-</option>
                          <option value="A+">A+</option>
                          <option value="B-">B-</option>
                          <option value="B+">B+</option>
                          <option value="AB-">AB-</option>
                          <option value="AB+">AB+</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-secondary text-[18px] pointer-events-none">bloodtype</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase font-medium flex items-center justify-between">
                        <span>Units Quantity</span>
                        <span className="text-primary font-bold">*</span>
                      </label>
                      <div className="flex items-center h-10 bg-surface-container-low shadow-inner border border-surface-variant">
                        <button type="button" className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-secondary text-on-surface hover:text-on-secondary transition-colors" 
                          onClick={() => setFormData({...formData, unitsNeeded: Math.max(1, formData.unitsNeeded - 1)})}>
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <input className="w-full h-10 text-center font-data-display text-headline-md text-on-surface bg-transparent focus:outline-none" 
                          max="10" min="1" readOnly type="number" value={formData.unitsNeeded} />
                        <button type="button" className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-secondary text-on-surface hover:text-on-secondary transition-colors" 
                          onClick={() => setFormData({...formData, unitsNeeded: Math.min(20, formData.unitsNeeded + 1)})}>
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="p-space-lg bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button type="button" className="w-full sm:w-auto text-center px-space-lg py-2.5 font-label-md text-label-md text-secondary hover:text-on-surface uppercase transition-colors" onClick={() => navigate('/dashboard-home')}>
                      Discard / Cancel
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-3 px-space-2xl py-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider shadow-md transition-all active:scale-[0.99] disabled:opacity-60">
                    <span className="material-symbols-outlined text-[20px]">{loading ? 'refresh' : 'send'}</span>
                    <span>{loading ? 'Submitting...' : 'Submit Blood Request'}</span>
                  </button>
                </div>
              </div>

            </form>

            {/* Success Toast */}
            {successData && (
              <div className="fixed bottom-6 right-6 max-w-md bg-inverse-surface text-inverse-on-surface p-space-lg shadow-xl flex items-start gap-3 z-50 transition-all">
                <span className="material-symbols-outlined text-primary text-[24px] shrink-0">check_circle</span>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md uppercase font-bold tracking-wide">Request Transmitted Successfully</span>
                  <p className="font-body-sm text-body-sm text-surface-container-high leading-snug">
                    Order #BR-{successData.id} dispatched.
                    {notifiedCount !== null
                      ? ` ${notifiedCount} ${successData.bloodGroup} donor${notifiedCount !== 1 ? 's' : ''} alerted within ${successData.searchRadiusKm} km.`
                      : ' Emergency cross-match sequence engaged.'}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <button className="font-label-sm text-label-sm text-primary font-bold uppercase underline" onClick={() => navigate('/dashboard-home')}>View Dashboard</button>
                    <button className="font-label-sm text-label-sm text-surface-variant uppercase" onClick={() => setSuccessData(null)}>Dismiss</button>
                  </div>
                </div>
              </div>
            )}

      </div>
    </HospitalLayout>
  );
};

export default NewBloodRequestForm;
