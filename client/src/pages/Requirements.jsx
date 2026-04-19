import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Megaphone, Plus, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Requirements = () => {
    const { user } = useContext(AuthContext);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Donation',
        urgency: 'Medium',
        description: ''
    });

    const fetchRequirements = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/requirements');
            setRequirements(data);
        } catch (error) {
            console.error('Failed to fetch requirements', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const handlePostRequirement = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            await axios.post('http://localhost:5000/api/requirements', formData, config);
            setShowForm(false);
            setFormData({ title: '', category: 'Donation', urgency: 'Medium', description: '' });
            fetchRequirements();
        } catch (error) {
            console.error('Failed to post requirement', error);
            alert(error.response?.data?.message || 'Failed to post requirement');
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Megaphone className="text-purple-600" />
                    Manage Requirements
                </h1>
                {user?.role === 'Admin' && (
                    <button className="btn-primary bg-purple-600 hover:bg-purple-700 flex items-center gap-2 px-4 py-2 text-white rounded-lg transition" onClick={() => setShowForm(!showForm)}>
                        <Plus size={18} /> {showForm ? 'Close Form' : 'Post Requirement'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="glass-card mb-8 animate-fade-in border-t-4 border-t-purple-500 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Post a New Requirement</h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handlePostRequirement}>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Requirement Title</label>
                            <input 
                                type="text" 
                                className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                placeholder="e.g. Winter Clothes for Children" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select 
                                className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Food</option>
                                <option>Medical</option>
                                <option>Education</option>
                                <option>Donation</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                            <select 
                                className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                value={formData.urgency}
                                onChange={e => setFormData({...formData, urgency: e.target.value})}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                className="form-input w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                rows="3" 
                                placeholder="Additional details about the requirement..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                required
                            ></textarea>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="bg-purple-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-purple-700 transition shadow-sm">Publish Requirement</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading requirements...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map(req => (
                        <div key={req._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                            {req.urgency === 'High' && (
                                <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                                    <AlertCircle size={12} /> High Priority
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-slate-800 mb-2 mt-2">{req.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {req.description}
                            </p>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Category: {req.category}</span>
                                <span className="text-slate-400 flex items-center gap-1">
                                    <Clock size={14} /> 
                                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {requirements.length === 0 && (
                        <div className="col-span-full bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
                            <Megaphone className="mx-auto text-slate-300 mb-3" size={32} />
                            <h3 className="text-lg font-medium text-slate-700">No requirements posted yet</h3>
                            <p className="text-slate-500">Requirements will appear here once they are published.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Requirements;
