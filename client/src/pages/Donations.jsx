import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api/apiClient';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Download, Clock, Plus, ArrowRight, Heart, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

    // Feedback & Action Loading States
    const [processingManual, setProcessingManual] = useState(false);
    const [processingRazorpay, setProcessingRazorpay] = useState(false);
    const [processingStripe, setProcessingStripe] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/payments');
            setDonations(response.data || []);
        } catch (error) {
            console.error('Failed to fetch donations:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to fetch donations transactions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    // Handle return URLs from Stripe or external payment gateways securely
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const canceled = urlParams.get('canceled');

        if (sessionId) {
            const recordStripePayment = async () => {
                try {
                    setVerifyingPayment(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    
                    const res = await apiClient.post('/stripe/verify-session', { sessionId });
                    
                    if (res.data && res.data.status === 'ok') {
                        setSuccessMessage(`Stripe Payment of $${res.data.data?.amount || ''} verified and recorded successfully!`);
                        fetchDonations();
                    } else {
                        setErrorMessage(res.data?.message || 'Stripe payment verification failed.');
                    }
                } catch (error) {
                    console.error('Failed to verify Stripe payment:', error);
                    setErrorMessage(error.response?.data?.message || 'Stripe payment verification failed.');
                } finally {
                    setVerifyingPayment(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            };
            recordStripePayment();
        } else if (canceled === 'true') {
            setErrorMessage('Stripe Payment checkout was canceled.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleAddDonation = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrorMessage(null);

        if (!amount || Number(amount) <= 0) {
            setErrorMessage('Please enter a valid donation amount greater than zero.');
            return;
        }

        try {
            setProcessingManual(true);
            const response = await apiClient.post('/payments', {
                amount: Number(amount),
                type: fundType,
                donorName
            });

            if (response.data) {
                setSuccessMessage(`Manual entry of $${Number(amount).toFixed(2)} recorded successfully.`);
                setShowForm(false);
                setAmount('');
                setDonorName('');
                fetchDonations();
            }
        } catch (error) {
            console.error('Failed to add manual donation entry:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to record manual donation entry.');
        } finally {
            setProcessingManual(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setSuccessMessage(null);
        setErrorMessage(null);

        if (!amount || Number(amount) <= 0) {
            setErrorMessage('Please enter a valid donation amount greater than zero for Razorpay.');
            return;
        }

        try {
            setProcessingRazorpay(true);

            // 1. Create Order securely on backend
            const { data: order } = await apiClient.post('/razorpay/create-order', {
                amount: Number(amount),
                currency: 'INR'
            });

            if (order.mock) {
                // Handle Test / Mock Mode safely via server-side verification endpoint
                const verifyRes = await apiClient.post('/razorpay/verify-payment', {
                    razorpay_order_id: order.id,
                    razorpay_payment_id: `MOCK-PAY-${Date.now()}`,
                    razorpay_signature: 'mock_signature',
                    amount: Number(amount),
                    type: fundType
                });

                if (verifyRes.data?.status === 'ok') {
                    setSuccessMessage(`MOCK RAZORPAY: Test Order ${order.id} verified & recorded successfully!`);
                    fetchDonations();
                    setAmount('');
                    setShowForm(false);
                } else {
                    setErrorMessage(verifyRes.data?.message || 'Razorpay test payment verification failed.');
                }
                setProcessingRazorpay(false);
                return;
            }

            // 2. Open Official Razorpay Checkout Modal (Real / Test Sandbox Keys)
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: "OrphanCare+",
                description: `Donation for ${fundType}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        setVerifyingPayment(true);
                        // Server signature verification
                        const verifyRes = await apiClient.post('/razorpay/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: Number(amount),
                            type: fundType
                        });

                        if (verifyRes.data && verifyRes.data.status === 'ok') {
                            setSuccessMessage(`Secure Razorpay Payment of ₹${amount} verified & recorded successfully!`);
                            fetchDonations();
                            setAmount('');
                            setShowForm(false);
                        } else {
                            setErrorMessage(verifyRes.data?.message || 'Razorpay signature verification failed.');
                        }
                    } catch (err) {
                        console.error('Razorpay Verification error:', err);
                        setErrorMessage(err.response?.data?.message || 'Razorpay payment verification failed.');
                    } finally {
                        setVerifyingPayment(false);
                        setProcessingRazorpay(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setErrorMessage('Razorpay payment modal closed / canceled.');
                        setProcessingRazorpay(false);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: "#e11d48", // Rose 600
                },
            };

            if (!window.Razorpay) {
                setErrorMessage('Razorpay SDK failed to load. Please check internet connection.');
                setProcessingRazorpay(false);
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setErrorMessage(response.error?.description || 'Razorpay Payment Failed.');
                setProcessingRazorpay(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Razorpay initialization error:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to initialize Razorpay checkout session.');
            setProcessingRazorpay(false);
        }
    };

    const handleStripePayment = async () => {
        setSuccessMessage(null);
        setErrorMessage(null);

        if (!amount || Number(amount) <= 0) {
            setErrorMessage('Please enter a valid donation amount greater than zero for Stripe.');
            return;
        }

        try {
            setProcessingStripe(true);
            const { data } = await apiClient.post('/stripe/create-checkout-session', {
                amount: Number(amount),
                type: fundType
            });

            if (data.mock) {
                // Verify mock session via backend endpoint
                const verifyRes = await apiClient.post('/stripe/verify-session', {
                    sessionId: data.id,
                    amount: Number(amount),
                    type: fundType
                });

                if (verifyRes.data?.status === 'ok') {
                    setSuccessMessage(`MOCK STRIPE: Payment of $${amount} verified & recorded successfully.`);
                    fetchDonations();
                    setAmount('');
                    setShowForm(false);
                } else {
                    setErrorMessage(verifyRes.data?.message || 'Stripe test payment verification failed.');
                }
                setProcessingStripe(false);
                return;
            }

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout page
            } else {
                setErrorMessage('Stripe Checkout Session URL was not returned.');
                setProcessingStripe(false);
            }
        } catch (error) {
            console.error('Stripe initialization error:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to initialize Stripe checkout session.');
            setProcessingStripe(false);
        }
    };

    const downloadReceipt = (donation) => {
        const receiptContent = `
--- ORPHANCARE+ DONATION RECEIPT ---
Transaction ID: ${donation.transactionId || donation._id}
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
    const isProcessingAny = processingManual || processingRazorpay || processingStripe || verifyingPayment;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Heart className="text-rose-600 dark:text-rose-500" fill="currentColor" />
                    Donations & Sponsorships
                </h1>
                <button 
                    className="btn-primary bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 px-4 py-2 rounded-xl transition" 
                    onClick={() => {
                        setShowForm(!showForm);
                        setSuccessMessage(null);
                        setErrorMessage(null);
                    }}
                >
                    {showForm ? 'Cancel Entry' : <><Plus size={18} /> Add New Donation</>}
                </button>
            </div>

            {/* Notification Alert Banners */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p>{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-3 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p>{errorMessage}</p>
                </div>
            )}

            {verifyingPayment && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl flex items-center gap-3 text-sm font-medium">
                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                    <p>Verifying payment signature with payment gateway...</p>
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Record Donation or Select Real Payment Gateway</h3>
                    <form onSubmit={handleAddDonation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Donor Name (Reference)</label>
                            <input 
                                type="text" 
                                className="form-input w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" 
                                value={donorName} 
                                onChange={e => setDonorName(e.target.value)} 
                                required 
                                placeholder="e.g. Emma Watson" 
                            />
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($ / ₹)</label>
                            <input 
                                type="number" 
                                min="1"
                                className="form-input w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                                required 
                                placeholder="e.g. 100" 
                            />
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fund Category</label>
                            <select 
                                className="form-input w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20" 
                                value={fundType} 
                                onChange={e => setFundType(e.target.value)}
                            >
                                <option value="Donation">General Donation</option>
                                <option value="Sponsorship">Child Sponsorship</option>
                                <option value="Fee">Resident Fee</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-4 pt-2">
                            <button 
                                type="submit" 
                                disabled={isProcessingAny}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {processingManual ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</>
                                ) : (
                                    <>Record Manual Entry <ArrowRight size={18} /></>
                                )}
                            </button>

                            <button 
                                type="button" 
                                onClick={handleStripePayment}
                                disabled={isProcessingAny}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {processingStripe ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Connecting Stripe...</>
                                ) : (
                                    <>Pay via Stripe (USD $) <Heart size={18} /></>
                                )}
                            </button>

                            <button 
                                type="button" 
                                onClick={handleRazorpayPayment}
                                disabled={isProcessingAny}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {processingRazorpay ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Connecting Razorpay...</>
                                ) : (
                                    <>Pay via Razorpay (INR ₹) <Heart size={18} fill="currentColor" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Lifetime Donations</div>
                        <div className="text-3xl font-extrabold text-slate-900">${totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                        <Heart size={28} fill="currentColor" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Record Count</p>
                        <p className="text-3xl font-extrabold text-slate-900">{donations.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/60">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Verified Transactions</h3>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading verified transactions...</div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map((donation) => (
                                <div key={donation._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold shrink-0">
                                            {donation.userId?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {donation.userId?.name || 'Valued Donor'} 
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">
                                                    {donation.transactionId ? `Txn: ${donation.transactionId}` : 'Verified Entry'}
                                                </span>
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{donation.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 border-slate-200 dark:border-slate-700 pt-4 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+${donation.amount.toFixed(2)}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(donation.createdAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadReceipt(donation)}
                                            className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                                            title="Download Verified Receipt"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {donations.length === 0 && (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <p>No verified donation records found.</p>
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
