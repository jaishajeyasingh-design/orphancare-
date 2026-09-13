import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getOpportunities, createOpportunity } from '../../services/opportunityService';
import { AuthContext } from '../../context/AuthContext';
import { Award, Plus, Filter, AlertCircle, ArrowRight, UserCheck, BookOpen, Clock, X, CheckCircle2 } from 'lucide-react';

const OpportunitiesList = () => {
  const { user } = useContext(AuthContext);

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Scholarship',
    description: '',
    supportCategories: '',
    requiredSkills: '',
    targetInterests: '',
    minAge: '',
    maxAge: '',
    educationLevel: '',
    notes: '',
    availability: ''
  });

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const data = await getOpportunities(params);
      setOpportunities(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load opportunities catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [statusFilter, typeFilter]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim(),
        supportCategories: formData.supportCategories ? formData.supportCategories.split(',').map(s => s.trim()).filter(Boolean) : [],
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        targetInterests: formData.targetInterests ? formData.targetInterests.split(',').map(s => s.trim()).filter(Boolean) : [],
        eligibility: {
          minAge: formData.minAge ? Number(formData.minAge) : undefined,
          maxAge: formData.maxAge ? Number(formData.maxAge) : undefined,
          educationLevel: formData.educationLevel.trim() || undefined,
          notes: formData.notes.trim() || undefined
        },
        availability: formData.availability.trim() || undefined
      };

      await createOpportunity(payload);
      setIsModalOpen(false);
      setFormData({
        title: '',
        type: 'Scholarship',
        description: '',
        supportCategories: '',
        requiredSkills: '',
        targetInterests: '',
        minAge: '',
        maxAge: '',
        educationLevel: '',
        notes: '',
        availability: ''
      });
      await fetchOpportunities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  // Roles allowed to post opportunities per backend authorization ('Admin', 'Donor', 'Volunteer')
  const canPost = ['Admin', 'Donor', 'Volunteer'].includes(user?.role);

  // Type badge styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Scholarship':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Mentorship':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Educational':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Medical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Equipment':
      default:
        return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Support Opportunities Directory</h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary-200">
              {opportunities.length} Active
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Browse scholarships, mentorships, medical aid, and educational resources available for children.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0"
          >
            <Plus size={18} />
            Post Opportunity
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter size={18} className="text-primary-600" />
          <span>Filter Catalog:</span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
          >
            <option value="">All Types</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Mentorship">Mentorship</option>
            <option value="Educational">Educational</option>
            <option value="Medical">Medical</option>
            <option value="Equipment">Equipment</option>
          </select>

          {(statusFilter || typeFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
              className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
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
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-150 rounded w-full"></div>
              <div className="h-4 bg-slate-150 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Opportunities Found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            There are currently no support opportunities matching your filter criteria.
          </p>
          {canPost && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <Plus size={18} />
              Post First Opportunity
            </button>
          )}
        </div>
      ) : (
        /* Opportunity Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Pills */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getTypeBadge(opp.type)}`}>
                    {opp.type}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      opp.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : opp.status === 'Assigned'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {opp.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-lg text-slate-900 leading-snug mb-2">{opp.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {opp.description}
                </p>

                {/* Support Categories Chips */}
                {opp.supportCategories?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Categories</span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.supportCategories.map((cat, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility Summary */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-4">
                  {opp.eligibility?.minAge || opp.eligibility?.maxAge ? (
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Target Age:</span>{' '}
                      {opp.eligibility.minAge ? `${opp.eligibility.minAge}+` : ''}{' '}
                      {opp.eligibility.maxAge ? `up to ${opp.eligibility.maxAge} yrs` : ''}
                    </div>
                  ) : null}
                  {opp.eligibility?.educationLevel && (
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-700">Education:</span> {opp.eligibility.educationLevel}
                    </div>
                  )}
                  {opp.sponsor?.name && (
                    <div className="text-slate-500 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                      <UserCheck size={12} className="text-primary-600" />
                      <span>Sponsor: {opp.sponsor.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to={`/opportunities/${opp._id}`}
                className="mt-2 flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-semibold py-2.5 rounded-xl border border-slate-200 transition-colors text-sm"
              >
                <span>View Specification</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Post Opportunity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Award className="text-primary-600" size={20} />
                Post Support Opportunity
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Python Software Engineering Scholarship"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Opportunity Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                >
                  <option value="Scholarship">Scholarship</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Educational">Educational</option>
                  <option value="Medical">Medical</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Detailed description of the opportunity and provided support..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Support Categories (comma separated)
                </label>
                <input
                  type="text"
                  name="supportCategories"
                  value={formData.supportCategories}
                  onChange={handleInputChange}
                  placeholder="e.g. Education, Mentorship"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  placeholder="e.g. Python Basics, High Motivation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Target Interests (comma separated)
                </label>
                <input
                  type="text"
                  name="targetInterests"
                  value={formData.targetInterests}
                  onChange={handleInputChange}
                  placeholder="e.g. Programming, Robotics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {/* Eligibility Sub-section */}
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Eligibility Criteria
                </span>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Min Age</label>
                    <input
                      type="number"
                      name="minAge"
                      value={formData.minAge}
                      onChange={handleInputChange}
                      placeholder="e.g. 12"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Max Age</label>
                    <input
                      type="number"
                      name="maxAge"
                      value={formData.maxAge}
                      onChange={handleInputChange}
                      placeholder="e.g. 18"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-slate-500 mb-1">Target Education Level</label>
                  <input
                    type="text"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    placeholder="e.g. Grade 7+"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Eligibility Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Requires interest in STEM"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Availability / Schedule
                </label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="e.g. Weekly 2 hours on Saturdays"
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
                  {submitting ? 'Posting...' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
