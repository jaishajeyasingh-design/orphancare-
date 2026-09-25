import React from 'react';
import { DollarSign, CheckSquare, HeartHandshake, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityTimeline = () => {
  const activities = [
    { id: 1, type: 'donation', title: 'New Donation Received', description: 'John Doe donated ₹5,000 for education.', date: new Date(Date.now() - 1000 * 60 * 15), icon: <DollarSign size={16} />, color: 'bg-[#ECFDF5] text-[#10B981]' },
    { id: 2, type: 'volunteer', title: 'Volunteer Application', description: 'Sarah Smith applied for Weekend Reading Session.', date: new Date(Date.now() - 1000 * 60 * 60 * 2), icon: <HeartHandshake size={16} />, color: 'bg-[#F5F3FF] text-[#8B5CF6]' },
    { id: 3, type: 'adoption', title: 'Adoption Request', description: 'Alex & Jamie submitted adoption profile.', date: new Date(Date.now() - 1000 * 60 * 60 * 5), icon: <UserPlus size={16} />, color: 'bg-[#EFF6FF] text-[#2563EB]' },
    { id: 4, type: 'payment', title: 'Payment Completed', description: 'Guardian fees for Resident #405 processed.', date: new Date(Date.now() - 1000 * 60 * 60 * 24), icon: <CheckSquare size={16} />, color: 'bg-[#FFF1F2] text-[#F43F5E]' },
  ];

  return (
    <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-[#0F172A]">Recent Activity Feed</h2>
        <button className="text-xs text-[#2563EB] hover:text-[#1d4ed8] font-semibold">View All</button>
      </div>
      
      <div className="relative border-l-2 border-[#CBD5E1] ml-3">
        {activities.map((activity) => (
          <div key={activity.id} className="mb-4 last:mb-1 ml-6 relative group">
            <span className={`absolute flex items-center justify-center w-7 h-7 rounded-full -left-9 ring-4 ring-white ${activity.color} shadow-2xs`}>
              {activity.icon}
            </span>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg group-hover:bg-white group-hover:shadow-2xs transition-all">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="text-xs font-bold text-[#0F172A]">{activity.title}</h3>
                <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#E2E8F0]">{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
              </div>
              <p className="text-xs text-[#64748B]">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
