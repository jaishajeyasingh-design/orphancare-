const Match = require('../models/Match');

class MatchRepository {
  async findAll() {
    return await Match.find()
      .populate('child')
      .populate('opportunity')
      .populate('donor', 'name email')
      .populate('volunteer', 'name email');
  }

  async create(matchData) {
    return await Match.create(matchData);
  }
}

module.exports = new MatchRepository();
