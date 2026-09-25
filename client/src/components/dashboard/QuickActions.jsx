import React from 'react';
import { UserPlus, Megaphone, CheckCircle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        { title: 'Add Resident', icon: <UserPlus size={20} className="text-[#2563EB]" />, iconBg: 'bg-[#EFF6FF]', btnBg: 'bg-[#EFF6FF]/60 hover:bg-[#EFF6FF] border-[#E2E8F0]', link: '/residents' },
        { title: 'Post Requirement', icon: <Megaphone size={20} className="text-[#8B5CF6]" />, iconBg: 'bg-[#F5F3FF]', btnBg: 'bg-[#F5F3FF]/60 hover:bg-[#F5F3FF] border-[#E2E8F0]', link: '/requirements' },
        { title: 'Approve Volunteers', icon: <CheckCircle size={20} className="text-[#10B981]" />, iconBg: 'bg-[#ECFDF5]', btnBg: 'bg-[#ECFDF5]/60 hover:bg-[#ECFDF5] border-[#E2E8F0]', link: '/volunteers' },
        { title: 'View Donations', icon: <Wallet size={20} className="text-[#F43F5E]" />, iconBg: 'bg-[#FFF1F2]', btnBg: 'bg-[#FFF1F2]/60 hover:bg-[#FFF1F2] border-[#E2E8F0]', link: '/donations' }
    ];

    return (
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <h2 className="text-base font-bold text-[#0F172A] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action, idx) => (
                    <Link key={idx} to={action.link} className={`flex flex-col items-center justify-center p-3 rounded-lg border ${action.btnBg} transition-all duration-200 gap-2 overflow-hidden group hover:-translate-y-0.5 hover:shadow-2xs`}>
                        <div className={`p-2.5 rounded-full ${action.iconBg} group-hover:scale-105 transition-transform`}>
                            {action.icon}
                        </div>
                        <span className="text-xs font-semibold text-[#0F172A]">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
