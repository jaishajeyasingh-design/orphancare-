import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, CheckSquare, Loader2, Database, Plus, HeartHandshake, UserCheck, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { getOrgVolunteerRequests, updateVolunteerRequestStatus } from '../services/volunteerService';

const Volunteers = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [activities, setActivities] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [showActivityForm, setShowActivityForm] = useState(false);
    
    // New Activity Form State
    const [activityData, setActivityData] = useState({
        title: '',
        description: '',
        date: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [appRes, actRes, reqData] = await Promise.all([
                axios.get('http://localhost:5000/api/volunteers/applications', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/volunteers/activities', config).catch(() => ({ data: [] })),
                getOrgVolunteerRequests().catch(() => [])
            ]);
            setApplications(appRes.data || []);
            setActivities(actRes.data || []);
            setRequests(reqData || []);
        } catch (error) {
            console.error('Failed to fetch volunteer data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Admin' || user?.role === 'Organization') {
            fetchData();
        }
    }, [user.token]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/volunteers/applications/${id}/status`, { status }, config);
            fetchData();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const handleRequestStatusUpdate = async (id, status) => {
        try {
            await updateVolunteerRequestStatus(id, status);
            fetchData();
        } catch (error) {
            console.error('Failed to update request status', error);
            alert(error.response?.data?.message || 'Failed to update request status');
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/volunteers/activities', activityData, config);
            setShowActivityForm(false);
            setActivityData({ title: '', description: '', date: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create activity', error);
            alert('Failed to create activity');
        }
    };

    const handleSeedData = async () => {
        try {
            setSeeding(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/volunteers/seed', {}, config);
            fetchData();
        } catch (error) {
            console.error('Failed to seed data', error);
        } finally {
            setSeeding(false);
        }
    };

    if (user?.role !== 'Admin' && user?.role !== 'Organization') {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <CheckSquare className="text-slate-300 mb-2" size={48} />
                <p className="text-slate-500 font-medium text-lg">Access Restricted</p>
                <p className="text-slate-400">Only administrators and orphanage staff can manage volunteer applications.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HeartHandshake className="text-emerald-600" size={28} />
                        Volunteer Requests & Drives Management
                    </h1>
                    <p className="text-slate-500 text-sm">Review volunteer requests submitted to your organization and post activities.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowActivityForm(!showActivityForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                    >
                        <Plus size={18} /> {showActivityForm ? 'Cancel' : 'Post New Activity'}
                    </button>
                    {applications.length === 0 && (
                        <button 
                            onClick={handleSeedData}
                            disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                        >
                            {seeding ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                            Seed Demo Data
                        </button>
                    )}
                </div>
            </div>

            {showActivityForm && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-3">Create Volunteer Activity Drive</h3>
                    <form onSubmit={handleCreateActivity} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Activity Title</label>
                            <input 
                                type="text" 
                                required
                                value={activityData.title}
                                onChange={e => setActivityData({...activityData, title: e.target.value})}
                                placeholder="e.g. Weekend Reading & Mentorship" 
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scheduled Date</label>
                            <input 
                                type="date" 
                                required
                                value={activityData.date}
                                onChange={e => setActivityData({...activityData, date: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                            <textarea 
                                rows="2"
                                value={activityData.description}
                                onChange={e => setActivityData({...activityData, description: e.target.value})}
                                placeholder="Details about responsibilities and timing..." 
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                                Publish Activity
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Organization Volunteer Requests Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Opportunity Volunteer Requests ({requests.length})
                        </h3>
                        <p className="text-xs text-slate-500">Submitted by registered volunteers for your organization's support needs.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-8 text-slate-500">
                        <Loader2 className="animate-spin mb-2" size={28} />
                        <p className="text-sm">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No volunteer requests submitted to your organization yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req._id} className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between md:items-center gap-4 ${
                                req.status === 'Pending' ? 'border-amber-200 bg-amber-50/20' :
                                req.status === 'Approved' ? 'border-emerald-200 bg-emerald-50/20' :
                                req.status === 'Completed' ? 'border-blue-200 bg-blue-50/20' :
                                'border-slate-200 bg-slate-50/50'
                            }`}>
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                                            <UserCheck size={18} className="text-emerald-600" />
                                            {req.volunteer?.name || 'Volunteer User'}
                                        </h4>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                            req.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            req.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            'bg-rose-100 text-rose-800 border border-rose-200'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-600">
                                        <span className="font-semibold text-slate-700">Requested Opportunity:</span>{' '}
                                        <span className="text-primary-700 font-bold">{req.opportunity?.title || 'Support Need'}</span>
                                        {req.opportunity?.type && (
                                            <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                {req.opportunity.type}
                                            </span>
                                        )}
                                    </div>

                                    {req.message && (
                                        <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 flex items-start gap-2 mt-2">
                                            <MessageSquare size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                            <span>"{req.message}"</span>
                                        </div>
                                    )}

                                    <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1">
                                        <span>Email: {req.volunteer?.email || 'N/A'}</span>
                                        <span>Submitted: {req.createdAt ? format(new Date(req.createdAt), 'PPP') : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 shrink-0">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => handleRequestStatusUpdate(req._id, 'Approved')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleRequestStatusUpdate(req._id, 'Rejected')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {req.status === 'Approved' && (
                                        <>
                                            <button
                                                onClick={() => handleRequestStatusUpdate(req._id, 'Completed')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                                            >
                                                <CheckCircle size={14} /> Mark Completed
                                            </button>
                                            <button
                                                onClick={() => handleRequestStatusUpdate(req._id, 'Rejected')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legacy Activity Drives & Applications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                    Active Volunteer Drives ({activities.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {activities.map(act => (
                        <div key={act._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                            <h4 className="font-bold text-slate-800">{act.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{act.description || 'No detailed description.'}</p>
                            <p className="text-xs font-semibold text-emerald-600 mt-2">Date: {format(new Date(act.date), 'PP')}</p>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="col-span-full text-center py-4 text-slate-400 text-sm">
                            No upcoming activities published yet.
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                    Legacy Drive Applications ({applications.length})
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

