import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, User, Heart, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';

const ManageResidents = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        category: 'Orphan Child',
        healthCondition: 'Healthy',
        monthlyFee: '',
    });

    const fetchResidents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/residents', config);
            setResidents(data);
        } catch (error) {
            console.error('Failed to fetch residents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
        // eslint-disable-next-line
    }, [user.token]);

    const handleAddResident = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/residents', {
                 ...formData,
                 age: Number(formData.age),
                 monthlyFee: formData.monthlyFee ? Number(formData.monthlyFee) : 0
            }, config);
            setShowForm(false);
            setFormData({ name: '', age: '', category: 'Orphan Child', healthCondition: 'Healthy', monthlyFee: '' });
            fetchResidents(); // Refresh
        } catch (error) {
            console.error('Failed to add resident', error);
            alert(error.response?.data?.message || 'Failed to add resident. Only Admins can execute this action.');
        }
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Manage Residents</h1>
                {user?.role === 'Admin' && (
                    <button className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" onClick={() => setShowForm(!showForm)}>
                        <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Resident'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="glass-card mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Register a New Resident</h3>
                    <form onSubmit={handleAddResident} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="form-label">Age</label>
                            <input type="number" className="form-input" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required placeholder="e.g. 12" />
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option>Orphan Child</option>
                                <option>Free Elderly</option>
                                <option>Paid Elderly</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Health Condition</label>
                            <input type="text" className="form-input" value={formData.healthCondition} onChange={e => setFormData({...formData, healthCondition: e.target.value})} placeholder="e.g. Healthy" />
                        </div>
                        
                        {formData.category === 'Paid Elderly' && (
                            <div>
                                <label className="form-label">Monthly Fee ($)</label>
                                <input type="number" className="form-input" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: e.target.value})} required placeholder="e.g. 500" />
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

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading records...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {residents.map(resident => (
                        <div key={resident._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${resident.category.includes('Child') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {resident.category.includes('Child') ? <User size={24} /> : <Shield size={24} />}
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${resident.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {resident.status}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{resident.name}</h3>
                            <p className="text-sm font-medium text-slate-500 mb-6">{resident.category} • {resident.age} years old</p>
                            
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Activity size={16} className="text-purple-500" />
                                    <span><span className="font-medium">Health:</span> {resident.healthCondition}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Heart size={16} className="text-rose-400" />
                                    <span><span className="font-medium">Admitted:</span> {format(new Date(resident.admissionDate), 'MMMM d, yyyy')}</span>
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
            )}
        </div>
    );
};

export default ManageResidents;
