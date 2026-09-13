const Match = require('../models/Match');

class MatchRepository {
  async findAll(filter = {}) {
    return await Match.find(filter)
      .populate('child')
      .populate('opportunity')
      .populate('donor', 'name email')
      .populate('volunteer', 'name email');
  }

  async findById(id) {
    return await Match.findById(id)
      .populate('child')
      .populate('opportunity')
      .populate('donor', 'name email')
      .populate('volunteer', 'name email');
  }

  async findByChildAndOpportunity(childId, opportunityId) {
    return await Match.findOne({ child: childId, opportunity: opportunityId });
  }

  async create(matchData) {
    return await Match.create(matchData);
  }

  async update(id, updateData) {
    return await Match.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true })
      .populate('child')
      .populate('opportunity')
      .populate('donor', 'name email')
      .populate('volunteer', 'name email');
  }
}

module.exports = new MatchRepository();
