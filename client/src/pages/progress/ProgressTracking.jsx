import React, { useState, useEffect, useContext } from 'react';
import { getChildren, getChildById } from '../../services/childService';
import { getPlanByChild } from '../../services/developmentService';
import { getProgressByChild, createProgress, updateProgress, deleteProgress } from '../../services/progressService';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Plus, Users, Star, Target, Calendar, UserCheck, AlertCircle, CheckCircle2, Loader2, Edit3, Trash2, X, Filter, TrendingUp, HelpCircle } from 'lucide-react';

const ProgressTracking = () => {
  const { user } = useContext(AuthContext);

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  const [devPlan, setDevPlan] = useState(null);
  const [progressRecords, setProgressRecords] = useState([]);

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Toast / Feedback State
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Log Progress Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logFormError, setLogFormError] = useState(null);
  const [logForm, setLogForm] = useState({
    category: 'Skill',
    rating: 4,
    notes: '',
    goalIndex: ''
  });

  // Edit Progress Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [editForm, setEditForm] = useState({
    category: 'Skill',
    rating: 4,
    notes: '',
    goalIndex: ''
  });

  // Delete Dialog State
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch initial children directory
  useEffect(() => {
    const fetchChildrenList = async () => {
      try {
        setLoadingChildren(true);
        const data = await getChildren();
        const childrenArray = Array.isArray(data) ? data : (data?.data || data?.children || []);
        setChildrenList(childrenArray);
        if (childrenArray.length > 0) {
          setSelectedChildId(childrenArray[0]._id);
        }
      } catch (err) {
        setActionError('Failed to load child directory.');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildrenList();
  }, []);

  // 2. Fetch selected child details, plan, & progress history
  const fetchChildContextAndProgress = async (childId) => {
    if (!childId) {
      setSelectedChild(null);
      setDevPlan(null);
      setProgressRecords([]);
      return;
    }

    try {
      setLoadingHistory(true);
      setActionError(null);

      const [childRes, planRes, progressRes] = await Promise.allSettled([
        getChildById(childId),
        getPlanByChild(childId),
        getProgressByChild(childId)
      ]);

      if (childRes.status === 'fulfilled') {
        setSelectedChild(childRes.value);
      } else {
        setSelectedChild(null);
      }

      if (planRes.status === 'fulfilled' && planRes.value) {
        setDevPlan(planRes.value);
      } else {
        setDevPlan(null);
      }

      if (progressRes.status === 'fulfilled') {
        setProgressRecords(progressRes.value || []);
      } else {
        setProgressRecords([]);
      }
    } catch (err) {
      setActionError('Failed to load progress records.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      fetchChildContextAndProgress(selectedChildId);
    }
  }, [selectedChildId]);

  // Handle Log Progress Form Submit
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogFormError(null);

    if (!selectedChildId) {
      setLogFormError('Please select a child profile first.');
      return;
    }

    if (!logForm.notes.trim()) {
      setLogFormError('Notes are required.');
      return;
    }

    try {
      setSubmittingLog(true);
      const payload = {
        child: selectedChildId,
        category: logForm.category,
        notes: logForm.notes.trim(),
        rating: Number(logForm.rating),
        goalIndex: logForm.goalIndex !== '' ? Number(logForm.goalIndex) : undefined
      };

      await createProgress(payload);
      setActionSuccess('Progress update logged successfully!');
      setIsLogModalOpen(false);
      setLogForm({ category: 'Skill', rating: 4, notes: '', goalIndex: '' });
      await fetchChildContextAndProgress(selectedChildId);
    } catch (err) {
      setLogFormError(err.response?.data?.message || 'Failed to log progress record.');
    } finally {
      setSubmittingLog(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditFormError(null);
    setEditForm({
      category: record.category || 'Skill',
      rating: record.rating || 4,
      notes: record.notes || '',
      goalIndex: record.goalIndex !== undefined && record.goalIndex !== null ? String(record.goalIndex) : ''
    });
  };

  // Handle Edit Progress Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord?._id) return;
    setEditFormError(null);

    if (!editForm.notes.trim()) {
      setEditFormError('Notes are required.');
      return;
    }

    try {
      setSubmittingEdit(true);
      const payload = {
        category: editForm.category,
        notes: editForm.notes.trim(),
        rating: Number(editForm.rating),
        goalIndex: editForm.goalIndex !== '' ? Number(editForm.goalIndex) : undefined
      };

      await updateProgress(editingRecord._id, payload);
      setActionSuccess('Progress update revised successfully!');
      setEditingRecord(null);
      await fetchChildContextAndProgress(selectedChildId);
    } catch (err) {
      setEditFormError(err.response?.data?.message || 'Failed to update progress record.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Delete Progress Record
  const handleDeleteRecord = async () => {
    if (!deletingRecordId) return;

    try {
      setDeleting(true);
      await deleteProgress(deletingRecordId);
      setActionSuccess('Progress record deleted successfully.');
      setDeletingRecordId(null);
      await fetchChildContextAndProgress(selectedChildId);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete progress record.');
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user is owner of record or Admin
  const canModifyRecord = (record) => {
    if (user?.role === 'Admin') return true;
    const authorId = record.loggedBy?._id || record.loggedBy;
    return authorId && user?._id && authorId.toString() === user._id.toString();
  };

  // Category badge helper
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Health':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Skill':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Behavioral':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // Calculate Progress Summary Metrics
  const totalRecords = progressRecords.length;
  const avgRating = totalRecords > 0
    ? (progressRecords.reduce((acc, r) => acc + (r.rating || 0), 0) / totalRecords).toFixed(1)
    : 0;

  const categoryCounts = {
    Academic: progressRecords.filter(r => r.category === 'Academic').length,
    Health: progressRecords.filter(r => r.category === 'Health').length,
    Skill: progressRecords.filter(r => r.category === 'Skill').length,
    Behavioral: progressRecords.filter(r => r.category === 'Behavioral').length
  };

  const linkedRecordsCount = progressRecords.filter(r => r.goalIndex !== undefined && r.goalIndex !== null).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner Header */}
      <div className="bg-blue-50/70 border border-blue-200/80 text-slate-900 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-50/40 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-600" size={24} />
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                Evaluation & Growth
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Child Progress Tracking</h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Measuring meaningful growth, ratings, and feedback against each child's personalized development goals.
            </p>
          </div>

          {selectedChildId && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition-all text-sm shrink-0"
            >
              <Plus size={18} />
              Log Progress Update
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

      {/* SECTION 1: CHILD SELECTOR & CONTEXT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="text-primary-600" size={20} />
              Select Child Profile
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Select an anonymized child profile to view progress evaluations and log updates.
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Profile Context</span>
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

            {/* Development Plan Context Summary */}
            {devPlan ? (
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-primary-600 shrink-0" />
                  <span className="text-slate-700 font-semibold">Active Development Plan:</span>
                  <span className="text-slate-900 font-bold">{devPlan.title}</span>
                  <span className="text-slate-400">({devPlan.goals?.length || 0} goals)</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200/60 text-xs text-slate-500 italic">
                No development plan generated yet. Progress can still be logged or linked once a plan is created.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Please select a child profile above to evaluate progress records.
          </div>
        )}
      </div>

      {/* SECTION 7: SUMMARY METRICS */}
      {selectedChildId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Updates</span>
            <div className="text-3xl font-extrabold text-slate-900">{totalRecords}</div>
            <span className="text-xs text-slate-500 font-medium">Logged evaluation entries</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Rating</span>
            <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-1">
              <span>{avgRating}</span>
              <Star size={24} fill="currentColor" className="text-amber-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Out of 5 scale</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Goal-Linked</span>
            <div className="text-3xl font-extrabold text-primary-600">{linkedRecordsCount}</div>
            <span className="text-xs text-slate-500 font-medium">Linked to growth milestones</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Categories</span>
            <div className="flex gap-1.5 mt-1 text-[11px] font-bold">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Acad: {categoryCounts.Academic}</span>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">Skill: {categoryCounts.Skill}</span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">Beh: {categoryCounts.Behavioral}</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PROGRESS HISTORY TIMELINE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="text-primary-600" size={20} />
              Evaluation History Feed
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Chronological progress logs and evaluation updates.
            </p>
          </div>

          {selectedChildId && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-xl shadow-2xs text-xs transition-all"
            >
              <Plus size={16} /> Log Progress Update
            </button>
          )}
        </div>

        {loadingHistory ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200/60 rounded"></div>
              </div>
            ))}
          </div>
        ) : progressRecords.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-md mx-auto">
            <FileText size={36} className="text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">No Progress Updates Recorded Yet</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto mb-4">
              Log periodic evaluations and feedback to track progress against this child's development goals.
            </p>
            {selectedChildId && (
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all"
              >
                <Plus size={14} /> Log First Update
              </button>
            )}
          </div>
        ) : (
          /* Progress Records Feed */
          <div className="space-y-4">
            {progressRecords.map((record) => {
              const linkedGoal = devPlan && record.goalIndex !== undefined && record.goalIndex !== null && devPlan.goals
                ? devPlan.goals[record.goalIndex]
                : null;

              return (
                <div
                  key={record._id}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadge(record.category)}`}>
                        {record.category}
                      </span>

                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <Star size={14} fill="currentColor" className="text-amber-400" />
                        <span>Rating: {record.rating} / 5</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {record.loggedBy?.name && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <UserCheck size={14} className="text-primary-600" /> Logged by {record.loggedBy.name}
                        </span>
                      )}
                      <span>{new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      
                      {canModifyRecord(record) && (
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1 text-slate-400 hover:text-primary-600 rounded transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingRecordId(record._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <p className="text-slate-800 text-sm font-medium leading-relaxed">
                    "{record.notes}"
                  </p>

                  {/* Linked Goal Callout */}
                  {linkedGoal && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs flex items-start gap-2">
                      <Target size={16} className="text-primary-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700">Linked Growth Goal #{record.goalIndex + 1}:</span>{' '}
                        <span className="text-slate-600 font-medium">{linkedGoal.description}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          linkedGoal.status === 'Achieved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {linkedGoal.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3 & 4: LOG PROGRESS MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileText className="text-primary-600" size={20} />
                Log Progress Update
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              {logFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{logFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Target Child
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedChild ? `${selectedChild.anonymizedCode} (Age ${selectedChild.age})` : ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={logForm.category}
                    onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Health">Health</option>
                    <option value="Skill">Skill</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Rating Assessment (1-5) *
                  </label>
                  <select
                    value={logForm.rating}
                    onChange={(e) => setLogForm({ ...logForm, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-amber-600 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="1">1 - Minimal Progress</option>
                    <option value="2">2 - Developing</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="4">4 - Good Progress</option>
                    <option value="5">5 - Excellent Mastery</option>
                  </select>
                </div>
              </div>

              {/* Optional Development Goal Link */}
              {devPlan && devPlan.goals?.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Link to Growth Goal (Optional)
                  </label>
                  <select
                    value={logForm.goalIndex}
                    onChange={(e) => setLogForm({ ...logForm, goalIndex: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Standalone Evaluation (No Goal Link) --</option>
                    {devPlan.goals.map((g, idx) => (
                      <option key={idx} value={idx}>
                        Goal #{idx + 1}: {g.description.substring(0, 45)}... ({g.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Evaluation Notes & Feedback *
                </label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Detailed notes regarding progress made, exercises completed, or behavioral observations..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all"
                >
                  {submittingLog ? 'Saving...' : 'Log Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 8: EDIT PROGRESS MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Edit3 className="text-primary-600" size={20} />
                Edit Progress Record
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{editFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Health">Health</option>
                    <option value="Skill">Skill</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Rating (1-5) *
                  </label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-amber-600 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="1">1 - Minimal Progress</option>
                    <option value="2">2 - Developing</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="4">4 - Good Progress</option>
                    <option value="5">5 - Excellent Mastery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Evaluation Notes & Feedback *
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all"
                >
                  {submittingEdit ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 9: DELETE CONFIRMATION DIALOG */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle size={24} />
              <h3 className="font-bold text-slate-800 text-lg">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Are you sure you want to delete this progress evaluation entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProgressTracking;
