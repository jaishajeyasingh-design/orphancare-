const matchRepository = require('../repositories/matchRepository');
const opportunityRepository = require('../repositories/opportunityRepository');
const aiService = require('./aiService');

class MatchingService {
  async getMatches(filter = {}) {
    return await matchRepository.findAll(filter);
  }

  async getMatchById(id) {
    return await matchRepository.findById(id);
  }

  async triggerAIMatch(childId) {
    return await aiService.runMatching(childId);
  }

  async approveMatch(matchId) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      const error = new Error('Match record not found.');
      error.statusCode = 404;
      throw error;
    }

    // Update match status to Approved
    const updatedMatch = await matchRepository.update(matchId, { status: 'Approved' });

    // Update associated opportunity status to Assigned
    if (match.opportunity) {
      const oppId = match.opportunity._id || match.opportunity;
      await opportunityRepository.update(oppId, { status: 'Assigned' });
    }

    return updatedMatch;
  }

  async rejectMatch(matchId) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      const error = new Error('Match record not found.');
      error.statusCode = 404;
      throw error;
    }

    return await matchRepository.update(matchId, { status: 'Rejected' });
  }
}

module.exports = new MatchingService();
