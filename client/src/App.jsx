import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Existing Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ManageResidents from './pages/ManageResidents';
import Dashboard from './pages/Dashboard';
import Requirements from './pages/Requirements';
import Donations from './pages/Donations';
import Volunteers from './pages/Volunteers';
import AdopterDashboard from './pages/AdopterDashboard';
import AvailableChildren from './pages/AvailableChildren';
import MyRequests from './pages/MyRequests';

// Modular OrphanCare AI Skeleton Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminChildren from './pages/admin/AdminChildren';
import AdminDonors from './pages/admin/AdminDonors';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminOpportunities from './pages/admin/AdminOpportunities';
import AdminMatches from './pages/admin/AdminMatches';
import AdminProgress from './pages/admin/AdminProgress';
import AdminImpact from './pages/admin/AdminImpact';

import DonorDashboard from './pages/donor/DonorDashboard';
import DonorOpportunities from './pages/donor/DonorOpportunities';
import DonorMatches from './pages/donor/DonorMatches';
import DonorImpact from './pages/donor/DonorImpact';

import VolunteerHub from './pages/volunteer/VolunteerHub';
import VolunteerOpportunities from './pages/volunteer/VolunteerOpportunities';
import VolunteerMatches from './pages/volunteer/VolunteerMatches';

import ChildrenList from './pages/children/ChildrenList';
import ChildDetail from './pages/children/ChildDetail';

import OpportunitiesList from './pages/opportunities/OpportunitiesList';
import OpportunityDetail from './pages/opportunities/OpportunityDetail';

import MatchingDashboard from './pages/matching/MatchingDashboard';
import DevelopmentPlans from './pages/development/DevelopmentPlans';
import ProgressTracking from './pages/progress/ProgressTracking';
import ImpactDashboard from './pages/impact/ImpactDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Existing Routes */}
        <Route path="residents" element={<ManageResidents />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="donations" element={<Donations />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="adopter">
            <Route index element={<AdopterDashboard />} />
            <Route path="children" element={<AvailableChildren />} />
            <Route path="my-requests" element={<MyRequests />} />
        </Route>

        {/* Admin Module Routes */}
        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="children" element={<AdminChildren />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="opportunities" element={<AdminOpportunities />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="progress" element={<AdminProgress />} />
          <Route path="impact" element={<AdminImpact />} />
        </Route>

        {/* Donor Module Routes */}
        <Route path="donor">
          <Route index element={<DonorDashboard />} />
          <Route path="opportunities" element={<DonorOpportunities />} />
          <Route path="matches" element={<DonorMatches />} />
          <Route path="impact" element={<DonorImpact />} />
        </Route>

        {/* Volunteer Module Routes */}
        <Route path="volunteer">
          <Route index element={<VolunteerHub />} />
          <Route path="opportunities" element={<VolunteerOpportunities />} />
          <Route path="matches" element={<VolunteerMatches />} />
        </Route>

        {/* Core Domain Routes */}
        <Route path="children">
          <Route index element={<ChildrenList />} />
          <Route path=":id" element={<ChildDetail />} />
        </Route>

        <Route path="opportunities">
          <Route index element={<OpportunitiesList />} />
          <Route path=":id" element={<OpportunityDetail />} />
        </Route>

        <Route path="matching" element={<MatchingDashboard />} />
        <Route path="development" element={<DevelopmentPlans />} />
        <Route path="progress" element={<ProgressTracking />} />
        <Route path="impact" element={<ImpactDashboard />} />

        <Route path="*" element={<div className="p-8 text-center text-slate-500">Page not found or not yet implemented.</div>} />
      </Route>
    </Routes>
  );
}

export default App;
