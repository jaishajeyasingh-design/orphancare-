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
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Conditional Global Summary based on Role */}
            {(activeRole === 'Admin' || activeRole === 'Donor') && (
                <SummaryMetrics />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
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
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6 flex justify-center items-center h-64">
                            <p className="text-slate-500 font-medium">Role-specific tasks list placeholder</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
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
