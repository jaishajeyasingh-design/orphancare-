const opportunityRepository = require('../repositories/opportunityRepository');

class OpportunityService {
  async getOpportunities() {
    return await opportunityRepository.findAll();
  }

  async createOpportunity(data) {
    return await opportunityRepository.create(data);
  }
}

module.exports = new OpportunityService();
