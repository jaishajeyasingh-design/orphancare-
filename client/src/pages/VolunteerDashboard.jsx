import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, Activity, HeartHandshake, CheckCircle2, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import { getMyVolunteerRequests } from '../services/volunteerService';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [actsRes, appsRes, reqsData] = await Promise.all([
                axios.get('http://localhost:5000/api/volunteers/activities', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/volunteers/my-applications', config).catch(() => ({ data: [] })),
                getMyVolunteerRequests().catch(() => [])
            ]);
            setActivities(actsRes.data || []);
            setApplications(appsRes.data || []);
            setRequests(reqsData || []);
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
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        }
    };

    // Total requests counter
    const totalCount = requests.length + applications.length;
    const pendingCount = requests.filter(r => r.status === 'Pending').length + applications.filter(a => a.status === 'Pending').length;
    const approvedCount = requests.filter(r => r.status === 'Approved' || r.status === 'Completed').length + applications.filter(a => a.status === 'Approved').length;

    // Filter out activities already applied for
    const appliedActivityIds = applications.map(app => app.activityId?._id);
    const availableActivities = activities.filter(act => !appliedActivityIds.includes(act._id));

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HeartHandshake className="text-primary-600" size={28} /> Volunteer Dashboard
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">My Submissions</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{totalCount}</p>
                    </div>
                    <div className="p-4 bg-primary-100 rounded-xl text-primary-600">
                        <Activity size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Review</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{pendingCount}</p>
                    </div>
                    <div className="p-4 bg-amber-100 rounded-xl text-amber-600">
                        <Clock size={28} />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Approved Work</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{approvedCount}</p>
                    </div>
                    <div className="p-4 bg-emerald-100 rounded-xl text-emerald-600">
                        <CheckCircle size={28} />
                    </div>
                </div>
            </div>

            {/* Submitted Volunteering Requests Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Award size={20} className="text-emerald-600" /> My Volunteering Requests ({requests.length})
                </h3>

                {loading ? (
                    <div className="p-6 text-center text-slate-400">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        You have not submitted any volunteering requests yet. Explore the <span className="font-semibold text-primary-600">Opportunities</span> catalog to apply!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map((req) => (
                            <div key={req._id} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h4 className="font-bold text-slate-900 text-base">{req.opportunity?.title || 'Volunteering Opportunity'}</h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            req.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            req.status === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            'bg-rose-100 text-rose-800 border-rose-200'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2">{req.opportunity?.description}</p>
                                    {req.organization?.name && (
                                        <p className="text-xs font-semibold text-primary-600 mt-2">
                                            Orphanage: {req.organization.name}
                                        </p>
                                    )}
                                </div>
                                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
                                    <span>Submitted: {req.createdAt ? format(new Date(req.createdAt), 'PPP') : 'N/A'}</span>
                                    <span className="capitalize">Status: {req.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Available Activities */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Available Activity Drives</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : availableActivities.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No new activity drives to apply for right now.
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

                {/* My Applications (Legacy Drives) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">My Activity Drives Schedule</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex-1 flex flex-col justify-center items-center gap-2">
                            <Clock size={40} className="text-slate-300" />
                            <p>You haven't registered for any activity drives yet.</p>
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
