import React, { useState, useEffect, useContext } from 'react';
import { getChildren, getChildById } from '../../services/childService';
import { getMatches, triggerAIMatch, approveMatch, rejectMatch } from '../../services/matchingService';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, Users, Award, CheckCircle2, XCircle, AlertCircle, Filter, Loader2, ArrowRight, ShieldCheck, HeartHandshake, HelpCircle } from 'lucide-react';

const MatchingDashboard = () => {
  const { user } = useContext(AuthContext);

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  const [matches, setMatches] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Toast / Feedback State
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Action Loading State per match ID
  const [processingMatchId, setProcessingMatchId] = useState(null);

  // 1. Fetch initial children directory
  useEffect(() => {
    const fetchChildrenList = async () => {
      try {
        setLoadingChildren(true);
        const data = await getChildren();
        setChildrenList(data);
        if (data.length > 0) {
          setSelectedChildId(data[0]._id);
        }
      } catch (err) {
        setActionError('Failed to load child directory.');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildrenList();
  }, []);

  // 2. Fetch selected child details & existing matches whenever selectedChildId changes
  const fetchChildAndMatches = async (childId, status = statusFilter) => {
    if (!childId) {
      setSelectedChild(null);
      setMatches([]);
      return;
    }

    try {
      setLoadingMatches(true);
      setActionError(null);

      const [childData, matchesData] = await Promise.all([
        getChildById(childId),
        getMatches({ child: childId, ...(status ? { status } : {}) })
      ]);

      setSelectedChild(childData);
      setMatches(matchesData);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to load match recommendations.');
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      fetchChildAndMatches(selectedChildId, statusFilter);
    }
  }, [selectedChildId, statusFilter]);

  // Handle Triggering AI Match
  const handleTriggerMatching = async () => {
    if (!selectedChildId) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setTriggering(true);
      const res = await triggerAIMatch(selectedChildId);
      setActionSuccess(`AI Matching Engine executed successfully for ${selectedChild?.anonymizedCode || 'child'}.`);
      await fetchChildAndMatches(selectedChildId, statusFilter);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to run AI Matching Engine.');
    } finally {
      setTriggering(false);
    }
  };

  // Handle Admin Approve Match
  const handleApproveMatch = async (matchId) => {
    setActionError(null);
    setActionSuccess(null);

    try {
      setProcessingMatchId(matchId);
      await approveMatch(matchId);
      setActionSuccess('Match approved successfully! Opportunity status updated to Assigned.');
      await fetchChildAndMatches(selectedChildId, statusFilter);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve match.');
    } finally {
      setProcessingMatchId(null);
    }
  };

  // Handle Admin Reject Match
  const handleRejectMatch = async (matchId) => {
    setActionError(null);
    setActionSuccess(null);

    try {
      setProcessingMatchId(matchId);
      await rejectMatch(matchId);
      setActionSuccess('Match rejected by Admin.');
      await fetchChildAndMatches(selectedChildId, statusFilter);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject match.');
    } finally {
      setProcessingMatchId(null);
    }
  };

  const isAdmin = user?.role === 'Admin';

  // Helper for displaying AI confidence score (0..1 to 0..100%)
  const formatConfidenceScore = (score) => {
    if (score === undefined || score === null) return 0;
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner Header */}
      <div className="bg-purple-50/70 border border-purple-200/80 text-slate-900 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-50/40 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-600" size={24} fill="currentColor" />
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                Core Hackathon USP
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Intelligent Matching Engine</h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Automated alignment between child support needs and available donor/volunteer opportunities with transparent AI scoring and Human-in-the-Loop review.
            </p>
          </div>

          {selectedChildId && (
            <button
              onClick={handleTriggerMatching}
              disabled={triggering}
              className="flex items-center gap-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition-all text-sm shrink-0"
            >
              {triggering ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Running AI Match Engine...
                </>
              ) : (
                <>
                  <Sparkles size={18} fill="currentColor" />
                  Find Best Opportunities with AI
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {/* SECTION 1: CHILD SELECTOR & PROFILE SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="text-primary-600" size={20} />
              Select Target Child Profile
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Choose an anonymized child to analyze profile alignment against available opportunities.
            </p>
          </div>

          {/* Child Dropdown */}
          <div className="w-full sm:w-72">
            {loadingChildren ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : (
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white shadow-2xs"
              >
                <option value="">-- Select Child Profile --</option>
                {childrenList.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.anonymizedCode} ({child.age} yrs • {child.status})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Selected Child Summary Card */}
        {selectedChild ? (
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Profile Summary</span>
                <h4 className="font-extrabold text-xl text-slate-900">{selectedChild.anonymizedCode}</h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Age {selectedChild.age} • {selectedChild.gender || 'Unspecified'} • Education: {selectedChild.educationLevel || 'N/A'}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                selectedChild.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {selectedChild.status}
              </span>
            </div>

            {/* Profile Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block mb-1">Interests:</span>
                {selectedChild.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.interests.map((item, i) => (
                      <span key={i} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">{item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">Skills:</span>
                {selectedChild.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.skills.map((item, i) => (
                      <span key={i} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">{item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">Aspirations:</span>
                {selectedChild.aspirations?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.aspirations.map((item, i) => (
                      <span key={i} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">🎯 {item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>
            </div>

            {/* Support Needs Summary */}
            {selectedChild.needs?.length > 0 && (
              <div className="pt-3 border-t border-slate-200/60">
                <span className="font-semibold text-slate-500 text-xs block mb-1">Identified Support Needs ({selectedChild.needs.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChild.needs.map((need, i) => (
                    <span key={i} className="bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-0.5 rounded-lg font-medium">
                      {need.category}: {need.description}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Please select a child profile above to view details and evaluate AI matching.
          </div>
        )}
      </div>

      {/* SECTION 3, 4, 5, 6: MATCH RESULTS & REVIEW */}
      <div className="space-y-6">
        {/* Results Header & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">AI Recommended Matches</h3>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {matches.length} Results
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending_Admin_Review">Needs Admin Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loadingMatches ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          /* Empty Match State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">No AI Matches Found</h4>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {selectedChild
                ? `No AI match recommendations exist yet for ${selectedChild.anonymizedCode}.`
                : 'Select a child and trigger the AI matching engine to evaluate best support opportunities.'}
            </p>
            {selectedChildId && (
              <button
                onClick={handleTriggerMatching}
                disabled={triggering}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                <Sparkles size={16} /> Run AI Matching Engine Now
              </button>
            )}
          </div>
        ) : (
          /* Match Cards Feed */
          <div className="space-y-6">
            {matches.map((match) => {
              const confidencePercent = formatConfidenceScore(match.aiConfidenceScore);
              const oppTitle = match.opportunity?.title || 'Support Opportunity';
              const oppType = match.opportunity?.type || 'General';
              const oppDesc = match.opportunity?.description || '';

              return (
                <div
                  key={match._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* Top Row: Title, Confidence Score, Status Badge */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-primary-200">
                            {oppType}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            Child: {match.child?.anonymizedCode || selectedChild?.anonymizedCode}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-xl text-slate-900">{oppTitle}</h3>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                            match.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : match.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          }`}
                        >
                          {match.status === 'Approved' && <CheckCircle2 size={14} className="text-emerald-600" />}
                          {match.status === 'Rejected' && <XCircle size={14} className="text-rose-600" />}
                          {match.status === 'Pending_Admin_Review' && <AlertCircle size={14} className="text-amber-600" />}
                          {match.status === 'Pending_Admin_Review' ? 'Needs Admin Review' : match.status}
                        </span>
                      </div>
                    </div>

                    {/* AI Score & Recommendation Rationale Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      
                      {/* Score Badge Widget */}
                      <div className="bg-purple-50 border border-purple-200 text-slate-900 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI Match Fit</span>
                        <div className="text-4xl font-extrabold text-purple-700 tracking-tight">{confidencePercent}%</div>
                        <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden border border-purple-200 mt-1">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Deterministic Confidence Score</span>
                      </div>

                      {/* "Why This Match?" AI Rationale Box */}
                      <div className="md:col-span-3 bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 space-y-2 relative">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-amber-600" size={18} fill="currentColor" />
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Why this match?</h4>
                        </div>

                        <p className="text-slate-800 text-sm leading-relaxed font-medium">
                          "{match.aiRecommendationReason || 'The AI matching engine identified strong alignment between the child profile needs and this opportunity.'}"
                        </p>

                        {oppDesc && (
                          <p className="text-slate-500 text-xs border-t border-amber-200/60 pt-2 mt-2">
                            <strong className="font-semibold text-slate-700">Opportunity Note:</strong> {oppDesc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SECTION 6: ADMIN REVIEW & APPROVAL ACTIONS */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-slate-400" />
                        <span>Human-in-the-Loop Safeguard: Admin approval required to finalize assignment.</span>
                      </div>

                      {isAdmin && match.status === 'Pending_Admin_Review' && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleRejectMatch(match._id)}
                            disabled={processingMatchId === match._id}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 font-semibold px-4 py-2 rounded-xl border border-rose-300 text-xs transition-colors disabled:opacity-50"
                          >
                            {processingMatchId === match._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                            Reject Match
                          </button>

                          <button
                            onClick={() => handleApproveMatch(match._id)}
                            disabled={processingMatchId === match._id}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                          >
                            {processingMatchId === match._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Approve Match
                          </button>
                        </div>
                      )}

                      {match.status === 'Approved' && (
                        <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 size={16} /> Approved & Assigned to Child
                        </div>
                      )}

                      {match.status === 'Rejected' && (
                        <div className="text-rose-700 font-bold text-xs flex items-center gap-1.5 bg-rose-100/70 px-3 py-1.5 rounded-lg border border-rose-200">
                          <XCircle size={16} /> Match Rejected by Admin
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingDashboard;
