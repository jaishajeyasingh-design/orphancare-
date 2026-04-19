import React from 'react';
import { UserPlus, Megaphone, CheckCircle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        { title: 'Add Resident', icon: <UserPlus size={20} />, color: 'bg-blue-500', link: '/residents' },
        { title: 'Post Requirement', icon: <Megaphone size={20} />, color: 'bg-purple-500', link: '/requirements' },
        { title: 'Approve Volunteers', icon: <CheckCircle size={20} />, color: 'bg-emerald-500', link: '/volunteers' },
        { title: 'View Donations', icon: <Wallet size={20} />, color: 'bg-rose-500', link: '/donations' }
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action, idx) => (
                    <Link key={idx} to={action.link} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all gap-3 overflow-hidden group">
                        <div className={`p-3 rounded-full text-white ${action.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
