import React from 'react';
import { DollarSign, CheckSquare, HeartHandshake, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityTimeline = () => {
  const activities = [
    { id: 1, type: 'donation', title: 'New Donation Received', description: 'John Doe donated $500 for education.', date: new Date(Date.now() - 1000 * 60 * 15), icon: <DollarSign size={16} />, color: 'bg-emerald-100 text-emerald-600' },
    { id: 2, type: 'volunteer', title: 'Volunteer Application', description: 'Sarah Smith applied for Weekend Reading Session.', date: new Date(Date.now() - 1000 * 60 * 60 * 2), icon: <HeartHandshake size={16} />, color: 'bg-purple-100 text-purple-600' },
    { id: 3, type: 'adoption', title: 'Adoption Request', description: 'Alex & Jamie submitted adoption profile.', date: new Date(Date.now() - 1000 * 60 * 60 * 5), icon: <UserPlus size={16} />, color: 'bg-blue-100 text-blue-600' },
    { id: 4, type: 'payment', title: 'Payment Completed', description: 'Guardian fees for Resident #405 processed.', date: new Date(Date.now() - 1000 * 60 * 60 * 24), icon: <CheckSquare size={16} />, color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Recent Activity Feed</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
      </div>
      
      <div className="relative border-l-2 border-slate-100 ml-3">
        {activities.map((activity, index) => (
          <div key={activity.id} className="mb-8 ml-6 relative group">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-10 ring-4 ring-white ${activity.color}`}>
              {activity.icon}
            </span>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl group-hover:bg-slate-100 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-semibold text-slate-800">{activity.title}</h3>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
              </div>
              <p className="text-sm text-slate-600">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
