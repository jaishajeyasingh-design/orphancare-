import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const MyRequests = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/adopter/my-requests', config);
                setRequests(data);
            } catch (error) {
                console.error('Failed to fetch requests', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user.token]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} className="text-amber-500" />;
            case 'Approved': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'Rejected': return <XCircle size={16} className="text-rose-500" />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Adoption Requests</h1>
                    <p className="text-slate-500 mt-1">Track the status of your applications and view details.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search requests..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Reference ID</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Child Profile</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Submission Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Last Status Update</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Current Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-[10px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i}>
                                        <td colSpan="6" className="px-8 py-6 text-center animate-pulse bg-slate-50/20 h-20"></td>
                                    </tr>
                                ))
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 font-mono text-xs font-medium text-slate-400">#REQ-{req._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                                                    {req.residentId?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{req.residentId?.name}</p>
                                                    <p className="text-xs text-slate-500">{req.residentId?.age} years old</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-600 font-medium">{format(new Date(req.createdAt), 'MMMM dd, yyyy')}</td>
                                        <td className="px-8 py-6 text-sm text-slate-400 capitalize">{format(new Date(req.updatedAt || req.createdAt), 'MMM dd, hh:mm a')}</td>
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit border ${
                                                req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {getStatusIcon(req.status)}
                                                {req.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                                <FileText size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <FileText className="mx-auto text-slate-200 mb-4" size={56} />
                                        <h3 className="text-lg font-bold text-slate-700">No requests found</h3>
                                        <p className="text-slate-400 text-sm mt-1">Submit an adoption request to see it here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyRequests;
