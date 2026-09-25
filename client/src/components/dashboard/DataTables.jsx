import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const DataTables = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('residents');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState({
        residents: [],
        donations: [],
        volunteers: [],
        adoptions: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

            const [resRes, payRes, volRes, adoptRes] = await Promise.all([
                axios.get('http://localhost:5000/api/residents', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/payments', config).catch(() => ({ data: [] })),
                user?.role === 'Admin' ? axios.get('http://localhost:5000/api/volunteers/applications', config).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                user?.role === 'Admin' ? axios.get('http://localhost:5000/api/adopter/admin/requests', config).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);

            const residents = (resRes.data || []).map((r, i) => ({
                id: `#RES-${r._id ? r._id.slice(-4) : i + 1}`,
                name: r.name,
                field3: r.category,
                date: r.createdAt ? new Date(r.createdAt) : new Date(),
                status: r.status || 'Active'
            }));

            const donations = (payRes.data || []).map((p, i) => ({
                id: `#DON-${p.transactionId ? p.transactionId.slice(-6) : i + 1}`,
                name: p.userId?.name || 'Anonymous Donor',
                field3: `₹${p.amount}`,
                date: p.createdAt ? new Date(p.createdAt) : new Date(),
                status: p.status || 'Completed'
            }));

            const volunteers = (volRes.data || []).map((v, i) => ({
                id: `#VOL-${v._id ? v._id.slice(-4) : i + 1}`,
                name: v.userId?.name || 'Volunteer',
                field3: v.activityId?.title || 'General Volunteering',
                date: v.createdAt ? new Date(v.createdAt) : new Date(),
                status: v.status || 'Pending'
            }));

            const adoptions = (adoptRes.data || []).map((a, i) => ({
                id: `#ADP-${a._id ? a._id.slice(-4) : i + 1}`,
                name: a.userId?.name || 'Adopter',
                field3: a.residentId?.name ? `Child: ${a.residentId.name}` : 'Child Adoption',
                date: a.createdAt ? new Date(a.createdAt) : new Date(),
                status: a.status || 'Pending'
            }));

            setTableData({
                residents,
                donations,
                volunteers,
                adoptions
            });
        } catch (error) {
            console.error('Failed to load table data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const currentList = tableData[activeTab] || [];
    const filteredList = currentList.filter(row => 
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.field3.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-base font-bold text-[#0F172A]">System Directory & Live Records</h2>
                
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['residents', 'donations', 'volunteers', 'adoptions'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${activeTab}...`} 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                    />
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} /> Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                {loading ? (
                    <div className="py-12 flex justify-center items-center text-slate-400 gap-2">
                        <Loader2 className="animate-spin" size={24} /> Loading records...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name / Party</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {activeTab === 'residents' ? 'Category' : activeTab === 'donations' ? 'Amount' : activeTab === 'volunteers' ? 'Activity' : 'Target Child'}
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredList.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.id}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{row.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{row.field3}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{format(row.date, 'MMM dd, yyyy')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                            row.status === 'Approved' || row.status === 'Completed' || row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-400 text-sm">
                                        No records found in {activeTab}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DataTables;

