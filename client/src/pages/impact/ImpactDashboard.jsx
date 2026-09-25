import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getImpactSummary, getImpactMetrics } from '../../services/impactService';
import { AuthContext } from '../../context/AuthContext';
import {
  TrendingUp,
  Users,
  Sparkles,
  Target,
  Award,
  BookOpen,
  HeartHandshake,
  RefreshCw,
  Calendar,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  BarChart3,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Star
} from 'lucide-react';

const ImpactDashboard = () => {
  const { user } = useContext(AuthContext);

  const [timeframe, setTimeframe] = useState('all');
  const [summary, setSummary] = useState(null);
  const [savedMetrics, setSavedMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (selectedTimeframe, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [summaryRes, savedMetricsRes] = await Promise.all([
        getImpactSummary(selectedTimeframe),
        getImpactMetrics().catch(() => [])
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.data);
      } else if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setSummary(summaryRes);
      }

      if (Array.isArray(savedMetricsRes)) {
        setSavedMetrics(savedMetricsRes);
      }
    } catch (err) {
      console.error('Error fetching impact dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load impact analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(timeframe);
  }, [timeframe, fetchDashboardData]);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const handleRefresh = () => {
    fetchDashboardData(timeframe, true);
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-3">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Pipeline Skeleton */}
        <div className="h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"></div>
      </div>
    );
  }

  // Extract structured values safely with robust fallbacks
  const childrenData = summary?.children || {
    total: 0,
    active: 0,
    matched: 0,
    graduated: 0,
    withNeeds: 0,
    withActiveDevelopmentPlan: 0,
    withRecordedProgress: 0
  };

  const opportunitiesData = summary?.opportunities || {
    total: 0,
    open: 0,
    assigned: 0,
    completed: 0
  };

  const matchesData = summary?.matches || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0
  };

  const developmentData = summary?.development || {
    plans: 0,
    totalGoals: 0,
    pendingGoals: 0,
    inProgressGoals: 0,
    achievedGoals: 0,
    achievementRate: 0
  };

  const progressData = summary?.progress || {
    records: 0,
    averageRating: 0,
    byCategory: { Academic: 0, Health: 0, Skill: 0, Behavioral: 0 }
  };

  const isZeroData = childrenData.total === 0 && opportunitiesData.total === 0 && matchesData.total === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1 — DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-blue-50/70 border border-blue-200/80 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl border border-blue-200 text-blue-600">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Impact Dashboard</h1>
              <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                Measure how OrphanCare AI turns individual needs into meaningful opportunities, development, and progress.
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Refresh Controls */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={timeframe}
              onChange={handleTimeframeChange}
              className="bg-white text-slate-800 pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2.5 rotate-90 pointer-events-none" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs disabled:opacity-50"
            title="Refresh impact metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Zero Data Notification */}
      {isZeroData && !error && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl flex items-start gap-4">
          <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-base font-semibold text-amber-900 dark:text-amber-200">No active impact data yet</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Impact metrics automatically aggregate real-time system activity. As children are enrolled, opportunities created, and development progress recorded, detailed analytics will populate here.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3 — EXECUTIVE IMPACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Children Supported */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Children Supported</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{childrenData.total}</span>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{childrenData.active} Active</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{childrenData.matched} Matched</span>
            </div>
          </div>
        </div>

        {/* Card 2: AI Matches & Approval Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">AI Match Approval</span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {matchesData.approvalRate}%
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Approval Rate</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{matchesData.total} Total Generated</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{matchesData.approved} Approved</span>
            </div>
          </div>
        </div>

        {/* Card 3: Goals Achieved & Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Goal Achievement</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {developmentData.achievementRate}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Achieved</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{developmentData.plans} Active Plans</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{developmentData.achievedGoals} / {developmentData.totalGoals} Goals</span>
            </div>
          </div>
        </div>

        {/* Card 4: Progress Updates & Rating */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Progress Rating</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Star className="w-5 h-5 fill-amber-500/20" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {progressData.averageRating > 0 ? progressData.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">/ 5.0 Rating</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{progressData.records} Progress Updates</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">{childrenData.withRecordedProgress} Children Tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — CHILD DEVELOPMENT PIPELINE */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Child Development Journey Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              End-to-end measurable flow from identification of child needs to achieved life outcomes.
            </p>
          </div>
        </div>

        {/* Pipeline Step Flow Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
          {/* Step 1: Children */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col items-center text-center space-y-1 relative">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Children</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{childrenData.total}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Registered</span>
          </div>

          {/* Step 2: Needs Identified */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Needs</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{childrenData.withNeeds}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Analyzed</span>
          </div>

          {/* Step 3: Opportunities */}
          <div className="bg-violet-50/60 dark:bg-violet-950/30 p-4 rounded-xl border border-violet-100 dark:border-violet-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Opportunities</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{opportunitiesData.total}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Available</span>
          </div>

          {/* Step 4: AI Matches */}
          <div className="bg-purple-50/60 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">AI Matches</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{matchesData.total}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Generated</span>
          </div>

          {/* Step 5: Approved Matches */}
          <div className="bg-teal-50/60 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-100 dark:border-teal-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Approved</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{matchesData.approved}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Human Reviewed</span>
          </div>

          {/* Step 6: Development Plans */}
          <div className="bg-cyan-50/60 dark:bg-cyan-950/30 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Plans</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{developmentData.plans}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">AI Drafted</span>
          </div>

          {/* Step 7: Goals Achieved */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Goals</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{developmentData.achievedGoals}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Achieved</span>
          </div>

          {/* Step 8: Progress Records */}
          <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Updates</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{progressData.records}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Tracked</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: MATCHING & DEVELOPMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 5 — MATCHING IMPACT */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  AI Matching Impact
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Recommendation efficiency & admin decision oversight
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Human-in-the-Loop
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-purple-50/40 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
              "AI recommends opportunities tailored to child aspirations. Admin human reviewers retain final approval."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Generated</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white mt-1 block">{matchesData.total}</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-center">
                <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
                <span className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1 block">{matchesData.pending}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
                <span className="block text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">{matchesData.approved}</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-center">
                <span className="block text-xs font-medium text-rose-600 dark:text-rose-400">Rejected</span>
                <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">{matchesData.rejected}</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar for Approval Rate */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700 dark:text-gray-300">Approval Rate Ratio</span>
              <span className="text-purple-600 dark:text-purple-400">{matchesData.approvalRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(matchesData.approvalRate, 100)}%` }}
                className="bg-purple-600 h-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6 — DEVELOPMENT IMPACT */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Development Goal Outcomes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Structured growth plans and milestone accomplishment
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold">
                {developmentData.plans} Active Plans
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Pending</span>
                <span className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-1 block">{developmentData.pendingGoals}</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
                <span className="block text-xs font-medium text-blue-600 dark:text-blue-400">In Progress</span>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1 block">{developmentData.inProgressGoals}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
                <span className="block text-xs font-medium text-emerald-600 dark:text-emerald-400">Achieved</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">{developmentData.achievedGoals}</span>
              </div>
            </div>
          </div>

          {/* Visual Goal Status Breakdown */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700 dark:text-gray-300">Goal Achievement Rate</span>
              <span className="text-emerald-600 dark:text-emerald-400">{developmentData.achievementRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {developmentData.totalGoals > 0 ? (
                <>
                  <div
                    style={{ width: `${(developmentData.achievedGoals / developmentData.totalGoals) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title="Achieved"
                  />
                  <div
                    style={{ width: `${(developmentData.inProgressGoals / developmentData.totalGoals) * 100}%` }}
                    className="bg-blue-500 h-full transition-all duration-500"
                    title="In Progress"
                  />
                  <div
                    style={{ width: `${(developmentData.pendingGoals / developmentData.totalGoals) * 100}%` }}
                    className="bg-gray-300 dark:bg-gray-600 h-full transition-all duration-500"
                    title="Pending"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Achieved</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> In Progress</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block"></span> Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: PROGRESS CATEGORIES & METRIC DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 7 — PROGRESS IMPACT & CATEGORIES */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Progress Tracking by Category
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Distribution of recorded progress updates across key growth dimensions
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-semibold">
              {progressData.records} Total Updates
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries({
              Academic: { label: 'Academic Growth', color: 'bg-blue-500', count: progressData.byCategory?.Academic || 0 },
              Health: { label: 'Health & Well-being', color: 'bg-rose-500', count: progressData.byCategory?.Health || 0 },
              Skill: { label: 'Skill & Vocational', color: 'bg-amber-500', count: progressData.byCategory?.Skill || 0 },
              Behavioral: { label: 'Behavioral & Social', color: 'bg-purple-500', count: progressData.byCategory?.Behavioral || 0 }
            }).map(([key, info]) => {
              const totalRecs = progressData.records || 1;
              const percentage = Math.round((info.count / totalRecs) * 100);

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">{info.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-bold">{info.count} records</span>
                      <span className="text-gray-500 text-[11px]">({progressData.records > 0 ? percentage : 0}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressData.records > 0 ? percentage : 0}%` }}
                      className={`${info.color} h-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 9 — SUPPORTING METRIC DETAILS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Detailed Breakdown Summary
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Aggregated system health and participation statistics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">Children Status</h4>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Active Roster:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{childrenData.active}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Graduated:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{childrenData.graduated}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Needs Identified:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{childrenData.withNeeds}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>With Active Plan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{childrenData.withActiveDevelopmentPlan}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-1">Opportunities Status</h4>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Total Catalog:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opportunitiesData.total}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Open for Matching:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opportunitiesData.open}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Assigned:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opportunitiesData.assigned}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Completed:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opportunitiesData.completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED CUSTOM METRICS TABLE (If any exist) */}
      {savedMetrics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Saved Custom Impact Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Metric Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Timeframe</th>
                  <th className="p-3 rounded-r-lg">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {savedMetrics.map((m) => (
                  <tr key={m._id || m.metricName} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{m.metricName}</td>
                    <td className="p-3">{m.category}</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{m.value}</td>
                    <td className="p-3">{m.unit}</td>
                    <td className="p-3">{m.timeframe}</td>
                    <td className="p-3">{m.recordedAt ? new Date(m.recordedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactDashboard;
