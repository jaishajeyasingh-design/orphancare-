import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Users, Activity, CreditCard, Shield, HeartPulse } from 'lucide-react';

const GuardianDashboard = () => {
    const { user } = useContext(AuthContext);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/residents/my-wards', config);
                setWards(data);
            } catch (error) {
                console.error('Failed to fetch wards', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.token) {
            fetchWards();
        } else {
            setLoading(false);
        }

        // Load razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            document.body.removeChild(script);
        };
    }, [user]);

    const handlePayment = async (ward) => {
        if (!ward.monthlyFee) return alert('No fee required for this ward.');
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: orderData } = await axios.post('http://localhost:5000/api/razorpay/create-order', {
                amount: ward.monthlyFee
            }, config);

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'OrphanCare+',
                description: `Monthly Fee for ${ward.name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        await axios.post('http://localhost:5000/api/razorpay/verify-payment', {
                            ...response,
                            amount: ward.monthlyFee,
                            type: 'Fee'
                        }, config);
                        alert('Payment Successful!');
                    } catch (err) {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: '#2563eb' }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (error) {
            console.error('Payment Error', error);
            alert('Unable to initialize payment.');
        }
    };

    const totalFees = wards.reduce((sum, ward) => sum + (ward.monthlyFee || 0), 0);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-primary-600" size={28} /> Guardian Dashboard
                </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Wards</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{wards.length}</p>
                    </div>
                    <div className="p-4 bg-primary-100 rounded-xl text-primary-600">
                        <Users size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Monthly Fees</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">${totalFees}</p>
                    </div>
                    <div className="p-4 bg-emerald-100 rounded-xl text-emerald-600">
                        <CreditCard size={28} />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Quick Contact</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">Admin Helpdesk</p>
                    </div>
                    <div className="p-4 bg-blue-100 rounded-xl text-blue-600 cursor-pointer hover:bg-blue-200 transition">
                        <Activity size={28} />
                    </div>
                </div>
            </div>

            {/* Wards section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <HeartPulse size={20} className="text-rose-500" /> My Assigned Relatives / Wards
                    </h3>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading your wards...</div>
                ) : wards.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="mx-auto text-slate-300 mb-3" size={48} />
                        <p className="font-medium">No wards currently assigned to you.</p>
                        <p className="text-sm mt-1">Contact the administrator if you believe this is a mistake.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {wards.map(ward => (
                            <div key={ward._id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xl text-slate-600">
                                        {ward.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{ward.name}</h4>
                                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                            <span>Age: {ward.age}</span>
                                            <span className="flex items-center gap-1">
                                                Status: 
                                                <span className={`font-semibold ${ward.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {ward.status}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto">
                                    <div className="text-right flex-1 md:flex-none">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Health</p>
                                        <p className="font-semibold text-slate-700">{ward.healthCondition}</p>
                                    </div>
                                    <div className="text-right flex-1 md:flex-none">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Fee</p>
                                        <p className="font-semibold text-slate-700">${ward.monthlyFee || 0}/mo</p>
                                    </div>
                                    <button onClick={() => handlePayment(ward)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap shadow-sm">
                                        Pay Fee
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuardianDashboard;
