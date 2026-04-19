import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Heart, Activity, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdopterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/adopter/my-requests', config);
                
                setRecentRequests(data.slice(0, 5));
                const total = data.length;
                const pending = data.filter(r => r.status === 'Pending').length;
                const approved = data.filter(r => r.status === 'Approved').length;
                setStats({ total, pending, approved });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.token]);

    const statCards = [
        { name: 'My Total Requests', value: stats.total, icon: <Activity className="text-blue-600" />, bg: 'bg-blue-50' },
        { name: 'Pending Review', value: stats.pending, icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50' },
        { name: 'Approved Requests', value: stats.approved, icon: <CheckCircle className="text-emerald-600" />, bg: 'bg-emerald-50' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.name}</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-4 ${stat.bg} rounded-xl`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
                    <button className="text-sm text-primary-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading your activities...</div>
                    ) : recentRequests.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {recentRequests.map((req) => (
                                <div key={req._id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                            {req.residentId?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Application for {req.residentId?.name}</p>
                                            <p className="text-sm text-slate-500">Submitted on {format(new Date(req.createdAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        req.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-rose-100 text-rose-600'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="mx-auto text-slate-200 mb-3" size={48} />
                            <p className="text-slate-500 font-medium text-lg">No adoption requests yet</p>
                            <p className="text-slate-400 text-sm mt-1">Start by browsing children available for adoption.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdopterDashboard;
