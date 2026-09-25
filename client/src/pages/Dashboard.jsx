import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SummaryMetrics from '../components/dashboard/SummaryMetrics';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import DataTables from '../components/dashboard/DataTables';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import ImpactWidget from '../components/dashboard/ImpactWidget';

import AdopterDashboard from './AdopterDashboard';
import GuardianDashboard from './GuardianDashboard';
import VolunteerDashboard from './VolunteerDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Dummy user context safe-check for UI building since backend might not be logged in currently
    const activeRole = user?.role || 'Admin';

    if (activeRole === 'Adopter') {
        return <AdopterDashboard />;
    }

    if (activeRole === 'Guardian') {
        return <GuardianDashboard />;
    }

    if (activeRole === 'Volunteer') {
        return <VolunteerDashboard />;
    }

    return (
        <div className="space-y-4 pb-6 animate-fade-in">
            {/* Conditional Global Summary based on Role */}
            {(activeRole === 'Admin' || activeRole === 'Donor') && (
                <SummaryMetrics />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                    {activeRole === 'Admin' && (
                        <QuickActions />
                    )}

                    {(activeRole === 'Admin' || activeRole === 'Donor') && (
                        <AnalyticsCharts />
                    )}

                    {activeRole === 'Admin' && (
                        <DataTables />
                    )}

                    {activeRole === 'Volunteer' && (
                        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex justify-center items-center h-48">
                            <p className="text-[#64748B] text-sm font-medium">Role-specific tasks list placeholder</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <ActivityTimeline />
                    
                    {activeRole === 'Admin' && (
                        <CalendarWidget />
                    )}
                </div>
            </div>

            <ImpactWidget />
        </div>
    );
};

export default Dashboard;
