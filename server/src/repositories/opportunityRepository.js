const Opportunity = require('../models/Opportunity');

class OpportunityRepository {
  async findAll() {
    return await Opportunity.find().populate('sponsor', 'name email');
  }

  async create(data) {
    return await Opportunity.create(data);
  }
}

module.exports = new OpportunityRepository();
