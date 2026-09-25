import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, User, Heart, Shield, Activity, CheckCircle, XCircle, HeartHandshake } from 'lucide-react';
import { format } from 'date-fns';

const ManageResidents = () => {
    const [residents, setResidents] = useState([]);
    const [adoptionRequests, setAdoptionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('residents'); // 'residents' | 'adoption-requests'
    const { user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        category: 'Orphan Child',
        healthCondition: 'Healthy',
        monthlyFee: '',
        adoptionEligibility: true
    });

    const fetchResidents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/residents', config);
            setResidents(data);
        } catch (error) {
            console.error('Failed to fetch residents', error);
        }
    };

    const fetchAdoptionRequests = async () => {
        if (user?.role !== 'Admin') return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/adopter/admin/requests', config);
            setAdoptionRequests(data);
        } catch (error) {
            console.error('Failed to fetch adoption requests', error);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchResidents(), fetchAdoptionRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line
    }, [user.token]);

    const handleAddResident = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/residents', {
                 ...formData,
                 age: Number(formData.age),
                 monthlyFee: formData.monthlyFee ? Number(formData.monthlyFee) : 0,
                 adoptionEligibility: formData.category === 'Orphan Child' ? formData.adoptionEligibility : false
            }, config);
            setShowForm(false);
            setFormData({ name: '', age: '', category: 'Orphan Child', healthCondition: 'Healthy', monthlyFee: '', adoptionEligibility: true });
            fetchResidents();
        } catch (error) {
            console.error('Failed to add resident', error);
            alert(error.response?.data?.message || 'Failed to add resident.');
        }
    };

    const handleToggleEligibility = async (resident) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/residents/${resident._id}`, {
                adoptionEligibility: !resident.adoptionEligibility
            }, config);
            fetchResidents();
        } catch (error) {
            console.error('Failed to update adoption eligibility', error);
        }
    };

    const handleAdoptionStatusUpdate = async (requestId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/adopter/admin/requests/${requestId}/status`, { status }, config);
            await loadAll();
        } catch (error) {
            console.error('Failed to update adoption request status', error);
            alert('Error updating adoption request status');
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Resident & Adoption Management</h1>
                    <p className="text-slate-500 text-sm">Manage orphans, elderly residents, and adoption approval workflows.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('residents')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'residents' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                        >
                            Residents Directory ({residents.length})
                        </button>
                        {user?.role === 'Admin' && (
                            <button 
                                onClick={() => setActiveTab('adoption-requests')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'adoption-requests' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'}`}
                            >
                                <HeartHandshake size={16} /> Adoption Requests ({adoptionRequests.filter(r => r.status === 'Pending').length})
                            </button>
                        )}
                    </div>
                    {user?.role === 'Admin' && activeTab === 'residents' && (
                        <button className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={() => setShowForm(!showForm)}>
                            <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Resident'}
                        </button>
                    )}
                </div>
            </div>

            {showForm && activeTab === 'residents' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-3">Register a New Resident</h3>
                    <form onSubmit={handleAddResident} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input type="number" className="w-full px-4 py-2 border rounded-lg text-sm" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required placeholder="e.g. 12" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select className="w-full px-4 py-2 border rounded-lg text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option>Orphan Child</option>
                                <option>Free Elderly</option>
                                <option>Paid Elderly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Health Condition</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm" value={formData.healthCondition} onChange={e => setFormData({...formData, healthCondition: e.target.value})} placeholder="e.g. Healthy" />
                        </div>

                        {formData.category === 'Orphan Child' && (
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="adoptionEligibility" 
                                    checked={formData.adoptionEligibility} 
                                    onChange={e => setFormData({...formData, adoptionEligibility: e.target.checked})}
                                    className="w-4 h-4 text-emerald-600 rounded" 
                                />
                                <label htmlFor="adoptionEligibility" className="text-sm font-medium text-slate-700">Eligible for Adoption</label>
                            </div>
                        )}
                        
                        {formData.category === 'Paid Elderly' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (₹)</label>
                                <input type="number" className="w-full px-4 py-2 border rounded-lg text-sm" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: e.target.value})} required placeholder="e.g. 5000" />
                            </div>
                        )}
                        
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition">
                                Save Resident Profile
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'residents' && (
                loading ? (
                    <div className="text-center py-12 text-slate-500">Loading records...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {residents.map(resident => (
                            <div key={resident._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${resident.category.includes('Child') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {resident.category.includes('Child') ? <User size={24} /> : <Shield size={24} />}
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                        resident.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                        resident.status === 'Adopted' ? 'bg-purple-100 text-purple-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
                                        {resident.status}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{resident.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4">{resident.category} • {resident.age} years old</p>
                                
                                {resident.category === 'Orphan Child' && user?.role === 'Admin' && resident.status === 'Active' && (
                                    <div className="mb-4 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="text-xs font-medium text-slate-600">Adoption Status:</span>
                                        <button 
                                            onClick={() => handleToggleEligibility(resident)}
                                            className={`text-xs px-2 py-1 rounded font-semibold transition ${resident.adoptionEligibility ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                        >
                                            {resident.adoptionEligibility ? 'Eligible' : 'Not Eligible'}
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Activity size={16} className="text-purple-500" />
                                        <span><span className="font-medium">Health:</span> {resident.healthCondition}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Heart size={16} className="text-rose-400" />
                                        <span><span className="font-medium">Admitted:</span> {format(new Date(resident.admissionDate || Date.now()), 'MMMM d, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {residents.length === 0 && (
                            <div className="col-span-full bg-slate-50 rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                                <User className="mx-auto text-slate-300 mb-3" size={32} />
                                <h3 className="text-lg font-medium text-slate-700 mb-1">No residents found</h3>
                                <p className="text-slate-500">Add a new resident to populate the directory.</p>
                            </div>
                        )}
                    </div>
                )
            )}

            {activeTab === 'adoption-requests' && user?.role === 'Admin' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Pending Adoption Applications</h3>
                    <div className="space-y-4">
                        {adoptionRequests.map(req => (
                            <div key={req._id} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-slate-900">{req.userId?.name || 'Applicant Adopter'}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">Applying to adopt: <span className="font-bold text-slate-800">{req.residentId?.name || 'Child'}</span> ({req.residentId?.age} yrs old)</p>
                                    <p className="text-xs text-slate-500 mt-1">{req.notes}</p>
                                    <p className="text-xs text-slate-400 mt-1">Submitted on: {format(new Date(req.createdAt || Date.now()), 'PPP')}</p>
                                </div>
                                {req.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAdoptionStatusUpdate(req._id, 'Approved')}
                                            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                                        >
                                            <CheckCircle size={16} /> Approve Adoption
                                        </button>
                                        <button 
                                            onClick={() => handleAdoptionStatusUpdate(req._id, 'Rejected')}
                                            className="flex items-center gap-1 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-semibold hover:bg-rose-100 transition"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {adoptionRequests.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                No adoption applications submitted yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageResidents;

