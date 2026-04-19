import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, Activity, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [actsRes, appsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/volunteers/activities', config),
                axios.get('http://localhost:5000/api/volunteers/my-applications', config)
            ]);
            setActivities(actsRes.data);
            setApplications(appsRes.data);
        } catch (error) {
            console.error('Failed to fetch volunteer data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchData();
    }, [user]);

    const handleApply = async (activityId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/volunteers/apply', { activityId }, config);
            alert('Application submitted successfully!');
            fetchData(); // Refresh UI
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        }
    };

    // Filter out activities the user has already applied for
    const appliedActivityIds = applications.map(app => app.activityId?._id);
    const availableActivities = activities.filter(act => !appliedActivityIds.includes(act._id));

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HeartHandshake className="text-primary-600" size={28} /> Volunteer Dashboard
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">My Registrations</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{applications.length}</p>
                    </div>
                    <div className="p-4 bg-primary-100 rounded-xl text-primary-600">
                        <Activity size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Review</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                            {applications.filter(a => a.status === 'Pending').length}
                        </p>
                    </div>
                    <div className="p-4 bg-amber-100 rounded-xl text-amber-600">
                        <Clock size={28} />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Approved Events</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                            {applications.filter(a => a.status === 'Approved').length}
                        </p>
                    </div>
                    <div className="p-4 bg-emerald-100 rounded-xl text-emerald-600">
                        <CheckCircle size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Available Activities */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Available Activities</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : availableActivities.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No new activities to apply for right now.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {availableActivities.map(act => (
                                <div key={act._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{act.title}</h4>
                                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {format(new Date(act.date), 'PPP')}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleApply(act._id)}
                                        className="bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                    >
                                        Volunteer
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Applications */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">My Schedule</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex-1 flex flex-col justify-center items-center gap-2">
                            <Clock size={40} className="text-slate-300" />
                            <p>You haven't volunteered for any activities yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 overflow-y-auto w-full">
                            {applications.map(app => (
                                <div key={app._id} className="p-6 flex items-center justify-between flex-wrap gap-4">
                                    <div className="w-full md:flex-1">
                                        <h4 className="font-bold text-slate-800">{app.activityId?.title || 'Unknown Activity'}</h4>
                                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> 
                                                {app.activityId?.date ? format(new Date(app.activityId.date), 'PPP') : 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        app.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                        app.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-rose-100 text-rose-600'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
