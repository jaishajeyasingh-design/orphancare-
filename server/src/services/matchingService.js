const matchRepository = require('../repositories/matchRepository');
const aiService = require('./aiService');

class MatchingService {
  async getMatches() {
    return await matchRepository.findAll();
  }

  async triggerAIMatch(childId) {
    const aiRecommendation = await aiService.runMatching(childId);
    return await matchRepository.create({
      child: childId,
      aiConfidenceScore: aiRecommendation.score,
      aiRecommendationReason: aiRecommendation.explanation,
      status: 'Pending_Admin_Review'
    });
  }
}

module.exports = new MatchingService();
