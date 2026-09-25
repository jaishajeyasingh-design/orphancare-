import React, { useState, useEffect, useContext } from 'react';
import { getChildren, getChildById } from '../../services/childService';
import { getPlanByChild, generateDevelopmentPlan, updateGoalStatus } from '../../services/developmentService';
import { AuthContext } from '../../context/AuthContext';
import { TrendingUp, Sparkles, Users, Calendar, CheckCircle2, Clock, AlertCircle, Loader2, Target, BookOpen, Award, ArrowRight, HelpCircle } from 'lucide-react';

const DevelopmentPlans = () => {
  const { user } = useContext(AuthContext);

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  const [plan, setPlan] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Status updating state per goal index
  const [updatingGoalIndex, setUpdatingGoalIndex] = useState(null);

  // Toast / Feedback State
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  // 2. Fetch selected child details & plan whenever selectedChildId changes
  const fetchChildAndPlan = async (childId) => {
    if (!childId) {
      setSelectedChild(null);
      setPlan(null);
      return;
    }

    try {
      setLoadingPlan(true);
      setActionError(null);

      const [childData, planData] = await Promise.allSettled([
        getChildById(childId),
        getPlanByChild(childId)
      ]);

      if (childData.status === 'fulfilled') {
        setSelectedChild(childData.value);
      } else {
        setSelectedChild(null);
      }

      if (planData.status === 'fulfilled' && planData.value) {
        setPlan(planData.value);
      } else {
        setPlan(null);
      }
    } catch (err) {
      setActionError('Failed to load child development details.');
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      fetchChildAndPlan(selectedChildId);
    }
  }, [selectedChildId]);

  // Handle Trigger AI Generation
  const handleGeneratePlan = async () => {
    if (!selectedChildId) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setGenerating(true);
      const res = await generateDevelopmentPlan(selectedChildId);
      setActionSuccess(`Personalized AI Development Plan generated successfully for ${selectedChild?.anonymizedCode || 'child'}.`);
      setPlan(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to generate AI Development Plan.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Goal Status Update
  const handleGoalStatusChange = async (goalIndex, newStatus) => {
    if (!plan?._id) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setUpdatingGoalIndex(goalIndex);
      const res = await updateGoalStatus(plan._id, goalIndex, newStatus);
      setActionSuccess(`Goal #${goalIndex + 1} status updated to '${newStatus.replace('_', ' ')}'.`);
      setPlan(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update goal status.');
    } finally {
      setUpdatingGoalIndex(null);
    }
  };

  // Helper for goal status badge styling
  const getGoalStatusBadge = (status) => {
    switch (status) {
      case 'Achieved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In_Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Target Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner Header */}
      <div className="bg-purple-50/70 border border-purple-200/80 text-slate-900 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-50/40 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={24} />
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                Growth Pathways
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Personalized Development Plans</h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Building long-term independence by translating child aspirations, skills, and approved support into measurable growth milestones.
            </p>
          </div>

          {selectedChildId && (
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition-all text-sm shrink-0"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles size={18} fill="currentColor" />
                  {plan ? 'Regenerate Plan with AI' : 'Generate Plan with AI'}
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

      {/* SECTION 1: CHILD SELECTOR & CONTEXT PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="text-primary-600" size={20} />
              Select Child Profile
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Select an anonymized child profile to view or generate their growth roadmap.
            </p>
          </div>

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

        {/* Selected Child Context Card */}
        {selectedChild ? (
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Child Context & Aspirations</span>
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

            {/* Context Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 text-xs">
              <div>
                <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                  <Target size={14} className="text-amber-600" /> Career Aspirations:
                </span>
                {selectedChild.aspirations?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.aspirations.map((item, i) => (
                      <span key={i} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">🎯 {item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>

              <div>
                <span className="font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Award size={14} className="text-indigo-600" /> Current Skills:
                </span>
                {selectedChild.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.skills.map((item, i) => (
                      <span key={i} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">{item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>

              <div>
                <span className="font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <BookOpen size={14} className="text-primary-600" /> Interests:
                </span>
                {selectedChild.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedChild.interests.map((item, i) => (
                      <span key={i} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">{item}</span>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic">None logged</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Please select a child profile above to view or generate their AI growth plan.
          </div>
        )}
      </div>

      {/* SECTION 2, 4, 5: DEVELOPMENT PLAN & GOALS DISPLAY */}
      <div className="space-y-6">
        {loadingPlan ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
          </div>
        ) : !plan ? (
          /* Empty Plan State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">No Development Plan Generated Yet</h4>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {selectedChild
                ? `Create a growth roadmap for ${selectedChild.anonymizedCode} tailored to their aspirations and needs.`
                : 'Select a child profile to generate their personalized AI development plan.'}
            </p>
            {selectedChildId && (
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                <Sparkles size={16} /> Generate Development Plan with AI
              </button>
            )}
          </div>
        ) : (
          /* Development Plan View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            
            {/* Plan Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-primary-200 flex items-center gap-1">
                    <Sparkles size={12} /> {plan.createdViaAI ? 'AI Generated Roadmap' : 'Development Plan'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Child: {selectedChild?.anonymizedCode}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">{plan.title}</h2>
              </div>

              {/* Goal Stats Bar */}
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold">
                <span className="text-slate-600">Total Goals: <strong className="text-slate-900">{plan.goals?.length || 0}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700">Achieved: <strong>{plan.goals?.filter(g => g.status === 'Achieved').length || 0}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700">In Progress: <strong>{plan.goals?.filter(g => g.status === 'In_Progress').length || 0}</strong></span>
              </div>
            </div>

            {/* Goals List Timeline Cards */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Target className="text-primary-600" size={18} />
                Milestone Growth Goals
              </h3>

              {plan.goals?.map((goal, idx) => (
                <div
                  key={goal._id || idx}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" /> Target: {formatDate(goal.targetDate)}
                      </span>
                    </div>

                    <p className="text-slate-900 font-bold text-base leading-relaxed pl-8">
                      {goal.description}
                    </p>
                  </div>

                  {/* Status Dropdown Controller */}
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pl-8 sm:pl-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getGoalStatusBadge(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>

                    <select
                      value={goal.status}
                      disabled={updatingGoalIndex === idx}
                      onChange={(e) => handleGoalStatusChange(idx, e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white cursor-pointer disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In_Progress">In Progress</option>
                      <option value="Achieved">Achieved</option>
                    </select>

                    {updatingGoalIndex === idx && (
                      <Loader2 size={16} className="text-primary-600 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 7: PROGRESS MODULE CONNECTION NOTICE */}
            <div className="bg-primary-50/60 border border-primary-200/80 rounded-2xl p-4 text-xs text-primary-900 flex items-center gap-3 mt-6">
              <HelpCircle size={18} className="text-primary-600 shrink-0" />
              <span>
                <strong>Progress Tracking Ready:</strong> Each of these milestone goals can be tracked over time with evaluations, ratings, and log updates in the <strong>Progress Module</strong>.
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentPlans;
