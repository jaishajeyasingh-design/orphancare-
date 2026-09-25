const Opportunity = require('../models/Opportunity');

class OpportunityRepository {
  async findAll(filter = {}) {
    return await Opportunity.find(filter)
      .populate('sponsor', 'name email role')
      .populate('organization', 'name email phone address')
      .populate('child', 'anonymizedCode age educationLevel');
  }

  async findById(id) {
    return await Opportunity.findById(id)
      .populate('sponsor', 'name email role')
      .populate('organization', 'name email phone address')
      .populate('child', 'anonymizedCode age educationLevel');
  }

  async findBySponsor(sponsorId) {
    return await Opportunity.find({ sponsor: sponsorId })
      .populate('sponsor', 'name email role')
      .populate('organization', 'name email phone address')
      .populate('child', 'anonymizedCode age educationLevel');
  }

  async create(data) {
    return await Opportunity.create(data);
  }

  async update(id, updateData) {
    return await Opportunity.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true })
      .populate('sponsor', 'name email role')
      .populate('organization', 'name email phone address')
      .populate('child', 'anonymizedCode age educationLevel');
  }

  async delete(id) {
    return await Opportunity.findByIdAndDelete(id);
  }
}

module.exports = new OpportunityRepository();
