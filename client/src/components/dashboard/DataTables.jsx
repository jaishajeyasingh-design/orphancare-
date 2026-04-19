import React, { useState } from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const DataTables = () => {
    const [activeTab, setActiveTab] = useState('residents');

    // Mock data for all tabs
    const dataMock = {
        residents: [
            { id: '#RES-849', name: 'Sophia Miller', field3: 'Orphan Child', date: new Date(), status: 'Active' },
            { id: '#RES-850', name: 'James Wilson', field3: 'Free Elderly', date: new Date(Date.now() - 864000000), status: 'Active' },
            { id: '#RES-851', name: 'Arthur Pend', field3: 'Paid Elderly', date: new Date(Date.now() - 1728000000), status: 'Active' },
        ],
        donations: [
            { id: '#DON-102', name: 'Michael Chang', field3: '$500', date: new Date(), status: 'Completed' },
            { id: '#DON-103', name: 'Sarah Connor', field3: '$150', date: new Date(Date.now() - 40000000), status: 'Completed' },
        ],
        volunteers: [
            { id: '#VOL-044', name: 'Emily Clark', field3: 'Reading Session', date: new Date(), status: 'Pending' },
            { id: '#VOL-045', name: 'David Smith', field3: 'Food Drive', date: new Date(Date.now() - 9000000), status: 'Approved' },
        ]
    };

    const currentData = dataMock[activeTab];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-slate-800">Data Directory</h2>
                
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['residents', 'donations', 'volunteers'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} /> Filters
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {activeTab === 'residents' ? 'Category' : activeTab === 'donations' ? 'Amount' : 'Activity'}
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {currentData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.id}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{row.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{row.field3}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{format(row.date, 'MMM dd, yyyy')}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-slate-400 hover:text-primary-600"><MoreVertical size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTables;
