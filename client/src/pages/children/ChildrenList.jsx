import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getChildren, createChild } from '../../services/childService';
import { AuthContext } from '../../context/AuthContext';
import { Users, Plus, UserCheck, BookOpen, AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';

const ChildrenList = () => {
  const { user } = useContext(AuthContext);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    educationLevel: '',
    interests: '',
    skills: '',
    aspirations: ''
  });

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChildren();
      setChildrenList(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch children profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      setFormError('Please enter a valid age.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        age: Number(formData.age),
        gender: formData.gender,
        educationLevel: formData.educationLevel.trim() || undefined,
        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        aspirations: formData.aspirations ? formData.aspirations.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      await createChild(payload);
      setIsModalOpen(false);
      setFormData({ age: '', gender: 'Male', educationLevel: '', interests: '', skills: '', aspirations: '' });
      await fetchChildren();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create child profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminOrOrg = user?.role === 'Admin' || user?.role === 'Organization';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Child Profiles Directory</h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary-200">
              Anonymized
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Registered children profiles requiring educational, medical, and developmental support.
          </p>
        </div>

        {isAdminOrOrg && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm"
          >
            <Plus size={18} />
            Add Child Profile
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-150 rounded w-3/4"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : childrenList.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Child Profiles Found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            There are currently no anonymized child profiles in the registry.
          </p>
          {isAdminOrOrg && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <Plus size={18} />
              Register First Child
            </button>
          )}
        </div>
      ) : (
        /* Children Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childrenList.map((child) => (
            <div
              key={child._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">
                      {child.anonymizedCode}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      child.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : child.status === 'Matched'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {child.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Age & Gender:</span>
                    <span className="font-semibold text-slate-700">{child.age} yrs • {child.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Education:</span>
                    <span className="font-semibold text-slate-700">{child.educationLevel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Identified Needs:</span>
                    <span className="font-semibold text-primary-600">
                      {child.needs ? child.needs.length : 0} Needs
                    </span>
                  </div>
                </div>

                {/* Tags Preview */}
                {(child.interests?.length > 0 || child.aspirations?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {child.aspirations?.slice(0, 2).map((asp, i) => (
                      <span key={i} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-md font-medium">
                        🎯 {asp}
                      </span>
                    ))}
                    {child.interests?.slice(0, 2).map((int, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">
                        {int}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to={`/children/${child._id}`}
                className="mt-2 flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-semibold py-2.5 rounded-xl border border-slate-200 transition-colors text-sm"
              >
                <span>View Full Profile</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Child Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Users className="text-primary-600" size={20} />
                Register Anonymized Child Profile
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 12"
                    required
                    min="1"
                    max="21"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Education Level
                </label>
                <input
                  type="text"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  placeholder="e.g. Grade 7, High School"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="e.g. Programming, Chess, Music"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g. Python Basics, Math Problem Solving"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Aspirations (comma separated)
                </label>
                <input
                  type="text"
                  name="aspirations"
                  value={formData.aspirations}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer, Doctor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all"
                >
                  {submitting ? 'Registering...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenList;
