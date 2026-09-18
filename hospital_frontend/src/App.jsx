import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StaffLogin from './pages/StaffLogin';
import DashboardHome from './pages/DashboardHome';
import NewBloodRequestForm from './pages/NewBloodRequestForm';
import DonorRecords from './pages/DonorRecords';
import TrustLayerAdmin from './pages/TrustLayerAdmin';
import AdminLogin from './pages/AdminLogin';

import HospitalProfile from './pages/HospitalProfile';
import SetupLocation from './pages/SetupLocation';

// ─── HOSPITAL PORTAL ─────────────────────────────────────────────────────────
// This app is exclusively for hospital staff (port 5174).
// User/Donor flows live in the separate User Portal at port 5173.

function App() {
  return (
    <BrowserRouter basename="/hospital">
      <Routes>
        {/* Root always sends hospital staff to their login */}
        <Route path="/" element={<Navigate to="/staff-login" replace />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/setup-location" element={<SetupLocation />} />
        <Route path="/dashboard-home" element={<DashboardHome />} />
        <Route path="/new-blood-request" element={<NewBloodRequestForm />} />
        <Route path="/donor-records" element={<DonorRecords />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<TrustLayerAdmin />} />
        <Route path="/profile" element={<HospitalProfile />} />
        {/* Catch-all: redirect unknown paths to staff login */}
        <Route path="*" element={<Navigate to="/staff-login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;