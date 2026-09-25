import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Activity, Heart, BadgeCheck, AlertCircle, Send, X } from 'lucide-react';

const AvailableChildren = () => {
    const { user } = useContext(AuthContext);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        reason: '',
        family_details: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/adopter/children', config);
            setChildren(data);
        } catch (error) {
            console.error('Failed to fetch children', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, [user.token]);

    const handleOpenApply = (child) => {
        setSelectedChild(child);
        setShowModal(true);
    };

    const handleCloseApply = () => {
        setSelectedChild(null);
        setShowModal(false);
        setFormData({ reason: '', family_details: '' });
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/adopter/adoption-request', {
                child_id: selectedChild._id,
                reason: formData.reason,
                family_details: formData.family_details
            }, config);
            
            alert('Adoption application submitted successfully!');
            handleCloseApply();
            fetchChildren(); // Refresh in case status logic changes
        } catch (error) {
            console.error('Failed to submit request', error);
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Available Children</h1>
                    <p className="text-slate-500 mt-1">Browse children eligible for adoption and start your application.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-100">
                    <BadgeCheck size={18} /> Verified Profiles
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100 shadow-sm"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {children.map(child => (
                        <div key={child._id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                            <div className="h-44 bg-blue-50/80 border-b border-blue-100 relative p-6 flex flex-col justify-end">
                                <div className="absolute top-5 right-5 bg-white text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                    ID: #{child._id.slice(-5)}
                                </div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xs mb-2 border border-blue-100">
                                    <User size={28} />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{child.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 font-medium text-xs mt-0.5">
                                    <span>Age: {child.age} yrs</span>
                                    <span>•</span>
                                    <span>Verified Profile</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Activity size={18} className="text-blue-600" />
                                        <span className="font-semibold text-slate-700">Condition:</span> {child.healthCondition}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Heart size={18} className="text-rose-500" />
                                        <span className="font-semibold text-slate-700">Eligibility:</span> Ready for Adoption
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleOpenApply(child)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                                >
                                    Start Adoption Process
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {children.length === 0 && (
                        <div className="col-span-full bg-slate-50 rounded-3xl py-20 text-center border-2 border-dashed border-slate-200">
                            <Heart className="mx-auto text-slate-200 mb-4" size={56} />
                            <h3 className="text-xl font-bold text-slate-700">All children currently in matching process</h3>
                            <p className="text-slate-500 max-w-md mx-auto mt-2">Check back soon for updated profiles or contact the administrator for more details.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Application Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-scale-in">
                        <button 
                            onClick={handleCloseApply}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="p-8 pb-0">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                                    <Send size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for Adoption</h3>
                                    <p className="text-slate-500">Starting application for <span className="font-bold text-primary-600">{selectedChild?.name}</span></p>
                                </div>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800 text-sm mb-8">
                                <AlertCircle className="shrink-0" size={20} />
                                <p><strong>Important:</strong> Adoption is a serious legal process. Please provide truthful and detailed information to help us with the initial screening.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="p-8 pt-0 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Why do you want to adopt this child?</label>
                                <textarea 
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none" 
                                    rows="3" 
                                    placeholder="Tell us your motivation and how you can support the child..."
                                    value={formData.reason}
                                    onChange={e => setFormData({...formData, reason: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Family & Household Details</label>
                                <textarea 
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none" 
                                    rows="3" 
                                    placeholder="Describe your family structure, home environment, and other relevant details..."
                                    value={formData.family_details}
                                    onChange={e => setFormData({...formData, family_details: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={handleCloseApply}
                                    className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : <><Send size={20} /> Submit Application</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailableChildren;
