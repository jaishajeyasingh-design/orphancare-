const opportunityRepository = require('../repositories/opportunityRepository');

class OpportunityService {
  async getOpportunities(filter = {}) {
    return await opportunityRepository.findAll(filter);
  }

  async getOpportunityById(id) {
    return await opportunityRepository.findById(id);
  }

  async getOpportunitiesBySponsor(sponsorId) {
    return await opportunityRepository.findBySponsor(sponsorId);
  }

  async createOpportunity(data, currentUser = null) {
    if (!data.sponsor && currentUser) {
      data.sponsor = currentUser._id || currentUser.id;
    }
    if (!data.organization && currentUser && currentUser.organization) {
      data.organization = currentUser.organization;
    }
    return await opportunityRepository.create(data);
  }

  async updateOpportunity(id, updateData) {
    return await opportunityRepository.update(id, updateData);
  }

  async deleteOpportunity(id) {
    return await opportunityRepository.delete(id);
  }
}

module.exports = new OpportunityService();
