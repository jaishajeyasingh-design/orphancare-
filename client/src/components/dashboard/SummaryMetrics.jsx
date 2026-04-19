import React from 'react';
import { Users, Heart, ClipboardList, Activity, ArrowUpRight, DollarSign } from 'lucide-react';

const SummaryMetrics = () => {
  const metrics = [
    { title: 'Total Children', value: '142', icon: <Users className="text-blue-500" size={24} />, trend: '+12%', color: 'bg-blue-50' },
    { title: 'Elderly Residents', value: '85', icon: <Heart className="text-rose-500" size={24} />, trend: '+4%', color: 'bg-rose-50' },
    { title: 'Donations (Month)', value: '$12,450', icon: <DollarSign className="text-emerald-500" size={24} />, trend: '+23%', color: 'bg-emerald-50' },
    { title: 'Pending Requests', value: '14', icon: <ClipboardList className="text-amber-500" size={24} />, trend: '-2%', color: 'bg-amber-50' },
    { title: 'Active Volunteers', value: '45', icon: <Activity className="text-purple-500" size={24} />, trend: '+8%', color: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${metric.color} bg-opacity-50 group-hover:scale-110 transition-transform`}>
              {metric.icon}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold">
              {metric.trend}
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{metric.title}</h3>
            <p className="text-3xl font-bold text-slate-800">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryMetrics;
