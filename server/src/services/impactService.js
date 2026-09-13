const impactRepository = require('../repositories/impactRepository');

class ImpactService {
  _getCutoffDate(timeframe) {
    const now = Date.now();
    switch (timeframe) {
      case '7d':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now - 90 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return null;
    }
  }

  async getImpactSummary(timeframeInput = 'all') {
    const normalizedTimeframe = ['7d', '30d', '90d', 'all'].includes(timeframeInput) ? timeframeInput : 'all';
    const cutoffDate = this._getCutoffDate(normalizedTimeframe);

    const [children, opportunities, matches, development, progress] = await Promise.all([
      impactRepository.getChildStats(cutoffDate),
      impactRepository.getOpportunityStats(cutoffDate),
      impactRepository.getMatchStats(cutoffDate),
      impactRepository.getDevelopmentStats(cutoffDate),
      impactRepository.getProgressStats(cutoffDate)
    ]);

    const approvalRate = matches.total > 0
      ? Number(((matches.approved / matches.total) * 100).toFixed(1))
      : 0.0;

    const achievementRate = development.totalGoals > 0
      ? Number(((development.achievedGoals / development.totalGoals) * 100).toFixed(1))
      : 0.0;

    return {
      timeframe: normalizedTimeframe,
      children,
      opportunities,
      matches: {
        ...matches,
        approvalRate
      },
      development: {
        ...development,
        achievementRate
      },
      progress
    };
  }

  async getSavedMetrics() {
    return await impactRepository.getSavedMetrics();
  }

  async saveMetric(data) {
    if (!data.metricName || data.value === undefined) {
      const error = new Error('metricName and value are required.');
      error.statusCode = 400;
      throw error;
    }
    return await impactRepository.createMetric(data);
  }
}

module.exports = new ImpactService();
