import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Download, Clock, Plus, ArrowRight, Heart } from 'lucide-react';
import { format } from 'date-fns';

const Donations = () => {
    const { user } = useContext(AuthContext);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [fundType, setFundType] = useState('Donation');

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.get('http://localhost:5000/api/payments', config);
            setDonations(data);
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, [user.token]);

    useEffect(() => {
        // Handle Stripe success redirect
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const amountParam = urlParams.get('amount');
        const typeParam = urlParams.get('type');

        if (success === 'true' && amountParam && typeParam) {
            const recordPayment = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await axios.post('http://localhost:5000/api/payments', {
                        amount: Number(amountParam),
                        type: typeParam,
                    }, config);
                    
                    // Clear params to avoid duplicate recording on refresh
                    window.history.replaceState({}, document.title, window.location.pathname);
                    fetchDonations();
                    alert(`Stripe Payment of $${amountParam} was successful and recorded!`);
                } catch (error) {
                    console.error('Failed to record Stripe payment', error);
                }
            };
            recordPayment();
        }
    }, [user.token]);

    const handleAddDonation = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            await axios.post('http://localhost:5000/api/payments', {
                amount: Number(amount),
                type: fundType,
                donorName // This will be ignored by backend for now but kept for UI sync if needed
            }, config);
            
            setShowForm(false);
            setAmount('');
            setDonorName('');
            fetchDonations();
        } catch (error) {
            console.error('Failed to add donation', error);
            alert(error.response?.data?.message || 'Failed to record donation');
        }
    };

    const handleRazorpayPayment = async () => {
        if (!amount || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // 1. Create Order on Backend
            const { data: order } = await axios.post('http://localhost:5000/api/razorpay/create-order', {
                amount: Number(amount),
                currency: 'INR'
            }, config);

            if (order.mock) {
                // Handle Backend Mock Mode
                const recordConfig = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post('http://localhost:5000/api/payments', {
                    amount: Number(amount),
                    type: fundType,
                }, recordConfig);
                
                fetchDonations();
                setAmount('');
                setShowForm(false);
                alert(`MOCK RAZORPAY: Order ${order.id} processed successfully.`);
                return;
            }

            // 2. Open Razorpay Checkout Modal (Real Keys)
            const options = {
                key: order.key === 'rzp_test_mock' ? 'rzp_test_5174mockkey' : order.key, // Fallback for UI if mock
                amount: order.amount,
                currency: order.currency,
                name: "OrphanCare+",
                description: `Donation for ${fundType}`,
                order_id: order.id,
                handler: async function (response) {
                    // This function runs after successful payment modal closes
                    try {
                        const verifyConfig = { headers: { Authorization: `Bearer ${user.token}` } };
                        await axios.post('http://localhost:5000/api/razorpay/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: Number(amount),
                            type: fundType
                        }, verifyConfig);
                        
                        fetchDonations();
                        setAmount('');
                        setShowForm(false);
                        alert('Secure Payment Verified & Recorded!');
                    } catch (err) {
                        console.error('Verification error', err);
                        alert(err.response?.data?.message || 'Payment verification failed.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#e11d48", // Rose 600
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Razorpay initialization error', error);
            alert('Failed to initialize Razorpay. Check backend logs.');
        }
    };

    const handleStripePayment = async () => {
        if (!amount || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', {
                amount: Number(amount),
                type: fundType
            }, config);

            if (data.mock) {
                // Handle Mock Success without redirecting (prevents dashboard reset)
                const recordConfig = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post('http://localhost:5000/api/payments', {
                    amount: data.amount,
                    type: data.type,
                }, recordConfig);
                
                fetchDonations();
                setAmount('');
                setShowForm(false);
                alert(`MOCK STRIPE: Payment of $${data.amount} recorded successfully (In-Page Flow).`);
                return;
            }

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            }
        } catch (error) {
            console.error('Stripe error', error);
            alert('Failed to initialize Stripe payment. Ensure backend is running.');
        }
    };

    const downloadReceipt = (donation) => {
        const receiptContent = `
--- ORPHANCARE+ DONATION RECEIPT ---
Transaction ID: ${donation.transactionId || 'N/A'}
Date: ${format(new Date(donation.createdAt), 'MMMM dd, yyyy HH:mm')}
Donor: ${donation.userId?.name || 'Valued Donor'}
Amount: $${donation.amount.toFixed(2)}
Type: ${donation.type}
Status: COMPLETED

Thank you for your generous contribution to OrphanCare+.
Your support helps us provide better care for our residents.
------------------------------------
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${donation.transactionId || donation._id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Heart className="text-rose-600" fill="currentColor" />
                    Donations & Sponsorships
                </h1>
                <button className="btn-primary bg-rose-600 hover:bg-rose-700 flex items-center gap-2 px-4 py-2 text-white rounded-lg transition" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel Entry' : <><Plus size={18} /> Add New Donation</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border-t-4 border-t-rose-500 shadow-sm mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Record Manual Donation</h3>
                    <form onSubmit={handleAddDonation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Donor Name (Reference)</label>
                            <input type="text" className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20" value={donorName} onChange={e => setDonorName(e.target.value)} required placeholder="e.g. Emma Watson" />
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                            <input type="number" className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 100" />
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Fund Category</label>
                            <select className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20" value={fundType} onChange={e => setFundType(e.target.value)}>
                                <option value="Donation">General Donation</option>
                                <option value="Sponsorship">Child Sponsorship</option>
                                <option value="Fee">Resident Fee</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-4 pt-2">
                            <button type="submit" className="bg-slate-800 text-white font-medium py-3 px-8 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-sm">
                                Record Manual Entry <ArrowRight size={18} />
                            </button>
                            <button 
                                type="button" 
                                onClick={handleStripePayment}
                                className="bg-slate-800 text-white font-medium py-3 px-8 rounded-xl hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                            >
                                Pay via Stripe <Heart size={18} />
                            </button>
                            <button 
                                type="button" 
                                onClick={handleRazorpayPayment}
                                className="bg-rose-600 text-white font-medium py-3 px-8 rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                            >
                                Pay via Razorpay <Heart size={18} fill="currentColor" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl text-white shadow-md">
                    <div className="text-rose-100 text-sm font-medium mb-1">Total Lifetime Donations</div>
                    <div className="text-4xl font-bold">${totalAmount.toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Record Count</p>
                        <p className="text-2xl font-bold text-slate-800">{donations.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading transactions...</div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map((donation) => (
                                <div key={donation._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold shrink-0">
                                            {donation.userId?.name.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">
                                                {donation.userId?.name || 'Unknown Donor'} 
                                                <span className="text-sm font-normal text-slate-500 ml-2">via System Entry</span>
                                            </p>
                                            <p className="text-sm text-slate-500">{donation.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 border-slate-200 pt-4 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="font-bold text-emerald-600 text-lg">+${donation.amount.toFixed(2)}</p>
                                            <p className="text-xs text-slate-400">{format(new Date(donation.createdAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadReceipt(donation)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                                            title="Download Receipt"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {donations.length === 0 && (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <p>No donation records found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Donations;
