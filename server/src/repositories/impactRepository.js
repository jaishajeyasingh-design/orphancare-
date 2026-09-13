const Child = require('../models/Child');
const Opportunity = require('../models/Opportunity');
const Match = require('../models/Match');
const DevelopmentPlan = require('../models/DevelopmentPlan');
const Progress = require('../models/Progress');
const Impact = require('../models/Impact');

class ImpactRepository {
  // Date filter helper
  _getDateFilter(cutoffDate) {
    return cutoffDate ? { createdAt: { $gte: cutoffDate } } : {};
  }

  async getChildStats(cutoffDate) {
    const matchStage = this._getDateFilter(cutoffDate);

    const [total, active, matched, graduated, withNeeds] = await Promise.all([
      Child.countDocuments(matchStage),
      Child.countDocuments({ ...matchStage, status: 'Active' }),
      Child.countDocuments({ ...matchStage, status: 'Matched' }),
      Child.countDocuments({ ...matchStage, status: 'Graduated' }),
      Child.countDocuments({ ...matchStage, 'needs.0': { $exists: true } })
    ]);

    const devPlansDistinct = await DevelopmentPlan.distinct('child', matchStage);
    const progressDistinct = await Progress.distinct('child', matchStage);

    return {
      total,
      active,
      matched,
      graduated,
      withNeeds,
      withActiveDevelopmentPlan: devPlansDistinct.length,
      withRecordedProgress: progressDistinct.length
    };
  }

  async getOpportunityStats(cutoffDate) {
    const matchStage = this._getDateFilter(cutoffDate);

    const [total, open, assigned, completed] = await Promise.all([
      Opportunity.countDocuments(matchStage),
      Opportunity.countDocuments({ ...matchStage, status: 'Open' }),
      Opportunity.countDocuments({ ...matchStage, status: 'Assigned' }),
      Opportunity.countDocuments({ ...matchStage, status: 'Completed' })
    ]);

    return { total, open, assigned, completed };
  }

  async getMatchStats(cutoffDate) {
    const matchStage = this._getDateFilter(cutoffDate);

    const [total, pending, approved, rejected] = await Promise.all([
      Match.countDocuments(matchStage),
      Match.countDocuments({ ...matchStage, status: 'Pending_Admin_Review' }),
      Match.countDocuments({ ...matchStage, status: 'Approved' }),
      Match.countDocuments({ ...matchStage, status: 'Rejected' })
    ]);

    return { total, pending, approved, rejected };
  }

  async getDevelopmentStats(cutoffDate) {
    const matchStage = this._getDateFilter(cutoffDate);

    const plansCount = await DevelopmentPlan.countDocuments(matchStage);

    const pipeline = [];
    if (cutoffDate) {
      pipeline.push({ $match: { createdAt: { $gte: cutoffDate } } });
    }
    pipeline.push(
      { $unwind: "$goals" },
      { $group: { _id: "$goals.status", count: { $sum: 1 } } }
    );

    const goalStatusCounts = await DevelopmentPlan.aggregate(pipeline);

    let pendingGoals = 0;
    let inProgressGoals = 0;
    let achievedGoals = 0;

    for (const item of goalStatusCounts) {
      if (item._id === 'Pending') pendingGoals = item.count;
      else if (item._id === 'In_Progress') inProgressGoals = item.count;
      else if (item._id === 'Achieved') achievedGoals = item.count;
    }

    const totalGoals = pendingGoals + inProgressGoals + achievedGoals;

    return {
      plans: plansCount,
      totalGoals,
      pendingGoals,
      inProgressGoals,
      achievedGoals
    };
  }

  async getProgressStats(cutoffDate) {
    const matchStage = this._getDateFilter(cutoffDate);

    const totalRecords = await Progress.countDocuments(matchStage);

    const pipeline = [];
    if (cutoffDate) {
      pipeline.push({ $match: { createdAt: { $gte: cutoffDate } } });
    }
    pipeline.push(
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    );

    const categoryAggregation = await Progress.aggregate(pipeline);

    const byCategory = {
      Academic: 0,
      Health: 0,
      Skill: 0,
      Behavioral: 0
    };

    for (const item of categoryAggregation) {
      if (item._id && byCategory.hasOwnProperty(item._id)) {
        byCategory[item._id] = item.count;
      }
    }

    // Overall Average Rating
    const overallAvgPipeline = [];
    if (cutoffDate) {
      overallAvgPipeline.push({ $match: { createdAt: { $gte: cutoffDate }, rating: { $ne: null } } });
    } else {
      overallAvgPipeline.push({ $match: { rating: { $ne: null } } });
    }
    overallAvgPipeline.push({ $group: { _id: null, avgRating: { $avg: "$rating" } } });

    const avgResult = await Progress.aggregate(overallAvgPipeline);
    const overallAverageRating = avgResult.length > 0 && avgResult[0].avgRating !== null ? avgResult[0].avgRating : 0;

    return {
      records: totalRecords,
      averageRating: Number(overallAverageRating.toFixed(1)),
      byCategory
    };
  }

  async getSavedMetrics() {
    return await Impact.find().sort({ createdAt: -1 });
  }

  async createMetric(data) {
    return await Impact.create(data);
  }
}

module.exports = new ImpactRepository();
