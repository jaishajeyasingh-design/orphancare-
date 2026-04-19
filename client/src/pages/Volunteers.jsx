import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, CheckSquare, Loader2, Database } from 'lucide-react';
import { format } from 'date-fns';

const Volunteers = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.get('http://localhost:5000/api/volunteers/applications', config);
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Admin') {
            fetchApplications();
        }
    }, [user.token]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            await axios.put(`http://localhost:5000/api/volunteers/applications/${id}/status`, { status }, config);
            fetchApplications();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const handleSeedData = async () => {
        try {
            setSeeding(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            await axios.post('http://localhost:5000/api/volunteers/seed', {}, config);
            fetchApplications();
        } catch (error) {
            console.error('Failed to seed data', error);
        } finally {
            setSeeding(false);
        }
    };

    if (user?.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <CheckSquare className="text-slate-300 mb-2" size={48} />
                <p className="text-slate-500 font-medium text-lg">Access Restricted</p>
                <p className="text-slate-400">Only administrators can manage volunteer applications.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare className="text-emerald-600" />
                    Volunteer Management
                </h1>
                {applications.length === 0 && (
                    <button 
                        onClick={handleSeedData}
                        disabled={seeding}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition disabled:opacity-50"
                    >
                        {seeding ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                        Seed Demo Data
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                    Volunteer Applications ({applications.length})
                </h3>
                
                {loading ? (
                    <div className="flex flex-col items-center py-12 text-slate-500">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p>Fetching applications...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app._id} className={`flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl border ${app.status === 'Pending' ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                <div className="mb-4 sm:mb-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg text-slate-800">{app.userId?.name || 'Unknown User'}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                            app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {app.status === 'Pending' ? 'Under Review' : app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">Applied for: <span className="font-medium text-slate-900">{app.activityId?.title || 'Unknown Activity'}</span></p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Activity Date: {app.activityId?.date ? format(new Date(app.activityId.date), 'MMMM dd, yyyy') : 'N/A'}
                                    </p>
                                </div>
                                
                                {app.status === 'Pending' && (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleStatusUpdate(app._id, 'Approved')}
                                            className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                            className="flex items-center gap-1 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-medium hover:bg-rose-100 transition-colors"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <p>No applications found.</p>
                                <p className="text-sm">Click "Seed Demo Data" to populate the list for testing.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Volunteers;
