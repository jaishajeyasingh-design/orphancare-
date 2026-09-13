import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChildById } from '../../services/childService';
import { analyzeChildNeeds } from '../../services/aiService';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Sparkles, User, BookOpen, Target, Award, HeartHandshake, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ChildDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Needs Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const fetchChildDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChildById(id);
      setChild(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load child profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildDetail();
  }, [id]);

  const handleRunAINeedsAnalysis = async () => {
    if (!child?._id) return;
    setAnalysisError(null);
    setAnalysisSuccess(null);

    try {
      setAnalyzing(true);
      const res = await analyzeChildNeeds(child._id);
      setAnalysisSuccess(`AI Analysis complete! Needs updated for ${child.anonymizedCode}.`);
      
      // Re-fetch child profile to update needs UI with fresh database state
      const updatedChild = await getChildById(child._id);
      setChild(updatedChild);
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Failed to complete AI Needs Analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Organization';

  // Urgency badge helper
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 size={36} className="text-primary-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading child profile...</p>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="space-y-6">
        <Link to="/children" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Children Directory
        </Link>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-rose-800 text-lg">Child Profile Error</h3>
          <p className="text-rose-600 text-sm mt-1 mb-4">{error || 'Child not found.'}</p>
          <Link to="/children" className="inline-block bg-white border border-rose-200 text-rose-700 font-medium px-4 py-2 rounded-xl text-sm shadow-sm">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back Link */}
      <div>
        <Link to="/children" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Children Directory
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl transform skew-x-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary-500/20 text-primary-300 text-xs font-semibold px-3 py-1 rounded-full border border-primary-400/30">
                Anonymized Record
              </span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  child.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : child.status === 'Matched'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                }`}
              >
                {child.status}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">{child.anonymizedCode}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Age {child.age} • {child.gender || 'Unspecified'} • Education: {child.educationLevel || 'N/A'}
            </p>
          </div>

          {/* AI Analysis Action */}
          {isAdmin && (
            <button
              onClick={handleRunAINeedsAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-primary-500/25 transition-all text-sm shrink-0"
            >
              {analyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing Needs with AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} fill="currentColor" />
                  Analyze Needs with AI
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {analysisSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{analysisSuccess}</span>
          </div>
          <button onClick={() => setAnalysisSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {analysisError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <span>{analysisError}</span>
          </div>
          <button onClick={() => setAnalysisError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Details */}
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-600" /> Profile Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Anonymized Code:</span>
                <span className="font-bold text-slate-800">{child.anonymizedCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Age:</span>
                <span className="font-semibold text-slate-800">{child.age} years old</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Gender:</span>
                <span className="font-semibold text-slate-800">{child.gender || 'Unspecified'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Education Level:</span>
                <span className="font-semibold text-slate-800">{child.educationLevel || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Current Status:</span>
                <span className="font-semibold text-primary-600">{child.status}</span>
              </div>
            </div>
          </div>

          {/* Interests & Skills */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-primary-600" /> Interests
              </h3>
              {child.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {child.interests.map((item, idx) => (
                    <span key={idx} className="bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No interests logged yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Award size={16} className="text-indigo-600" /> Skills & Competencies
              </h3>
              {child.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {child.skills.map((item, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No skills logged yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Target size={16} className="text-amber-600" /> Aspirations & Goals
              </h3>
              {child.aspirations?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {child.aspirations.map((item, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                      🎯 {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">No aspirations logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Identified Support Needs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <HeartHandshake className="text-primary-600" size={22} />
                  Identified Support Needs
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Categorized support requirements prioritized by urgency.
                </p>
              </div>

              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                {child.needs?.length || 0} Total Needs
              </span>
            </div>

            {!child.needs || child.needs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Sparkles size={36} className="text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700">No Needs Identified Yet</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto mb-4">
                  Run the AI Needs Analysis engine to evaluate this profile and generate structured support needs.
                </p>
                {isAdmin && (
                  <button
                    onClick={handleRunAINeedsAnalysis}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all"
                  >
                    <Sparkles size={14} /> Run AI Needs Analysis
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {child.needs.map((need, idx) => (
                  <div
                    key={need._id || idx}
                    className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-white text-slate-800 font-semibold text-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {need.category}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(need.urgency)}`}>
                        {need.urgency} Urgency
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium text-sm leading-relaxed">
                      {need.description}
                    </p>

                    {need.reason && (
                      <p className="text-slate-500 text-xs italic bg-white/60 p-2.5 rounded-xl border border-slate-100">
                        <strong className="font-semibold text-slate-600">AI Rationale:</strong> {need.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChildDetail;
