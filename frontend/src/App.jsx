import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DonorHome from './pages/DonorHome';
import Auth from './pages/Auth';
import DonorRegistration from './pages/DonorRegistration';
import DonorLocation from './pages/DonorLocation';
import RoleSelection from './pages/RoleSelection';
import IncomingRequestAlert from './pages/IncomingRequestAlert';
import RequestStatus from './pages/RequestStatus';
import CreateRequest from './pages/CreateRequest';
import Profile from './pages/Profile';
import ReceiverHome from './pages/ReceiverHome';
import BottomNav from './components/BottomNav';

// ─── USER PORTAL (Donors & Receivers) ───────────────────────────────────────
// Hospital staff should access the separate Hospital Portal at port 5174.
// Do NOT add hospital routes here.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/donor-registration" element={<DonorRegistration />} />
        <Route path="/donor-location" element={<DonorLocation />} />
        <Route path="/donor-home" element={<DonorHome />} />
        <Route path="/receiver-home" element={<ReceiverHome />} />
        <Route path="/incoming-request" element={<IncomingRequestAlert />} />
        <Route path="/request-status" element={<RequestStatus />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/profile" element={<Profile />} />
        {/* Catch-all: redirect unknown paths back to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;