import React from 'react';

const StatCard = ({ title, value, icon: Icon, change }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {change && <p className="text-xs text-emerald-600 mt-1 font-medium">{change}</p>}
      </div>
      {Icon && (
        <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
