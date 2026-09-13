import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOpportunityById } from '../../services/opportunityService';
import { ArrowLeft, Award, UserCheck, BookOpen, Clock, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const OpportunityDetail = () => {
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOpportunityById(id);
        setOpportunity(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load opportunity specifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Scholarship':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Mentorship':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Educational':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Medical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Equipment':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 size={36} className="text-primary-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading opportunity details...</p>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="space-y-6">
        <Link to="/opportunities" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Opportunities Catalog
        </Link>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-800 text-lg">Opportunity Not Found</h3>
          <p className="text-rose-600 text-sm mt-1 mb-4">{error || 'The requested opportunity could not be found.'}</p>
          <Link to="/opportunities" className="inline-block bg-white border border-rose-200 text-rose-700 font-medium px-4 py-2 rounded-xl text-sm shadow-sm">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back Button */}
      <div>
        <Link to="/opportunities" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Opportunities Catalog
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getTypeBadge(opportunity.type)}`}>
              {opportunity.type}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                opportunity.status === 'Open'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : opportunity.status === 'Assigned'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                  : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
              }`}
            >
              Status: {opportunity.status}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">{opportunity.title}</h1>

          {opportunity.sponsor?.name && (
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-primary-400" /> Sponsored by{' '}
              <strong className="text-white font-semibold">{opportunity.sponsor.name}</strong> ({opportunity.sponsor.role})
            </p>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                <Award size={20} className="text-primary-600" /> Program Specification & Description
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>

            {/* Categories & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Support Categories</h4>
                {opportunity.supportCategories?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.supportCategories.map((cat, idx) => (
                      <span key={idx} className="bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">General support</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Required Skills / Prerequisites</h4>
                {opportunity.requiredSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No specific prerequisites required.</p>
                )}
              </div>
            </div>

            {/* Target Interests */}
            {opportunity.targetInterests?.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Target Interests & Alignment</h4>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.targetInterests.map((int, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                      🎯 {int}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Eligibility & Availability */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary-600" /> Eligibility Criteria
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Age Range:</span>
                <span className="font-semibold text-slate-800">
                  {opportunity.eligibility?.minAge || opportunity.eligibility?.maxAge
                    ? `${opportunity.eligibility.minAge || 0} - ${opportunity.eligibility.maxAge || 'Any'} yrs`
                    : 'All Ages'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Education Level:</span>
                <span className="font-semibold text-slate-800">
                  {opportunity.eligibility?.educationLevel || 'Any'}
                </span>
              </div>

              {opportunity.eligibility?.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 font-medium text-xs block mb-1">Additional Criteria Notes:</span>
                  <p className="text-slate-700 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {opportunity.eligibility.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Availability Card */}
          {opportunity.availability && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" /> Schedule & Availability
              </h3>
              <p className="text-slate-700 text-sm font-medium">
                {opportunity.availability}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
