import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Users, Heart, ClipboardList, Activity, ArrowUpRight, DollarSign, Loader2 } from 'lucide-react';

const SummaryMetrics = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalChildren: 0,
    elderlyResidents: 0,
    totalDonations: 0,
    pendingRequests: 0,
    activeVolunteers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

        // Fetch residents
        const resRes = await axios.get('http://localhost:5000/api/residents', config).catch(() => ({ data: [] }));
        const residents = resRes.data || [];
        const totalChildren = residents.filter(r => r.category === 'Orphan Child').length;
        const elderlyResidents = residents.filter(r => r.category === 'Free Elderly' || r.category === 'Paid Elderly').length;

        // Fetch payments
        const payRes = await axios.get('http://localhost:5000/api/payments', config).catch(() => ({ data: [] }));
        const payments = payRes.data || [];
        const totalDonations = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        // Fetch adoption requests count
        let pendingRequests = 0;
        if (user?.role === 'Admin') {
          const adoptRes = await axios.get('http://localhost:5000/api/adopter/admin/requests', config).catch(() => ({ data: [] }));
          pendingRequests = (adoptRes.data || []).filter(r => r.status === 'Pending').length;
        }

        // Fetch volunteer applications count
        let activeVolunteers = 0;
        if (user?.role === 'Admin') {
          const volRes = await axios.get('http://localhost:5000/api/volunteers/applications', config).catch(() => ({ data: [] }));
          activeVolunteers = (volRes.data || []).length;
        }

        setStats({
          totalChildren,
          elderlyResidents,
          totalDonations,
          pendingRequests,
          activeVolunteers
        });
      } catch (error) {
        console.error('Error loading summary metrics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  const metrics = [
    { title: 'Total Children', value: loading ? '...' : stats.totalChildren, icon: <Users className="text-[#2563EB]" size={22} />, trend: 'Live', bgColor: 'bg-[#EFF6FF]' },
    { title: 'Elderly Residents', value: loading ? '...' : stats.elderlyResidents, icon: <Heart className="text-[#EC4899]" size={22} />, trend: 'Live', bgColor: 'bg-[#FDF2F8]' },
    { title: 'Total Donations', value: loading ? '...' : `₹${stats.totalDonations.toLocaleString()}`, icon: <DollarSign className="text-[#10B981]" size={22} />, trend: 'Live', bgColor: 'bg-[#ECFDF5]' },
    { title: 'Pending Adoption Requests', value: loading ? '...' : stats.pendingRequests, icon: <ClipboardList className="text-[#F59E0B]" size={22} />, trend: 'Live', bgColor: 'bg-[#FFFBEB]' },
    { title: 'Volunteer Applications', value: loading ? '...' : stats.activeVolunteers, icon: <Activity className="text-[#8B5CF6]" size={22} />, trend: 'Live', bgColor: 'bg-[#F5F3FF]' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-all group">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2.5 rounded-lg ${metric.bgColor} group-hover:scale-105 transition-transform`}>
              {metric.icon}
            </div>
            <div className="flex items-center gap-0.5 text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full text-xs font-semibold">
              {metric.trend}
              <ArrowUpRight size={13} />
            </div>
          </div>
          <div>
            <h3 className="text-[#64748B] text-xs font-medium mb-0.5">{metric.title}</h3>
            <p className="text-2xl font-bold text-[#0F172A] tracking-tight">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryMetrics;

