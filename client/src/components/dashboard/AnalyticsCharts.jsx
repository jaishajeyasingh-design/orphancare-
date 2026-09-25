import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const donationData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 2000 },
  { name: 'Apr', amount: 2780 },
  { name: 'May', amount: 1890 },
  { name: 'Jun', amount: 2390 },
  { name: 'Jul', amount: 3490 },
];

const residentData = [
  { name: 'Boys', value: 80, color: '#3b82f6' },
  { name: 'Girls', value: 62, color: '#ec4899' },
  { name: 'Elderly Males', value: 40, color: '#10b981' },
  { name: 'Elderly Females', value: 45, color: '#f59e0b' },
];

const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-[#0F172A]">Donation Trends</h2>
          <p className="text-xs text-[#64748B]">Monthly breakdown of recorded donations</p>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={donationData} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                 contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '12px' }}
                 formatter={(value) => [`₹${value}`, 'Amount']}
              />
              <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={3} dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 5.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#0F172A]">Resident Demographics</h2>
          <p className="text-xs text-[#64748B]">Active profiles in the system</p>
        </div>
        <div className="h-[190px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={residentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {residentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
            {residentData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div>
                        <p className="text-[11px] text-[#64748B] font-medium leading-tight">{item.name}</p>
                        <p className="text-xs font-bold text-[#0F172A]">{item.value}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
