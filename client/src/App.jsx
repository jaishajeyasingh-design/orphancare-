import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageResidents from './pages/ManageResidents';
import Dashboard from './pages/Dashboard';
import Requirements from './pages/Requirements';
import Donations from './pages/Donations';
import Volunteers from './pages/Volunteers';
import AdopterDashboard from './pages/AdopterDashboard';
import AvailableChildren from './pages/AvailableChildren';
import MyRequests from './pages/MyRequests';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="residents" element={<ManageResidents />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="donations" element={<Donations />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="adopter">
            <Route index element={<AdopterDashboard />} />
            <Route path="children" element={<AvailableChildren />} />
            <Route path="my-requests" element={<MyRequests />} />
        </Route>
        <Route path="*" element={<div className="p-8 text-center text-slate-500">Page not found or not yet implemented.</div>} />
      </Route>
    </Routes>
  );
}

export default App;
