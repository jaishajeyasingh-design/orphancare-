const Progress = require('../models/Progress');

class ProgressRepository {
  async findAll(filter = {}) {
    return await Progress.find(filter)
      .populate('child')
      .populate('loggedBy', 'name email role')
      .populate('developmentPlan')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Progress.findById(id)
      .populate('child')
      .populate('loggedBy', 'name email role')
      .populate('developmentPlan');
  }

  async findByChildId(childId) {
    return await Progress.find({ child: childId })
      .populate('child')
      .populate('loggedBy', 'name email role')
      .populate('developmentPlan')
      .sort({ createdAt: -1 });
  }

  async create(data) {
    const created = await Progress.create(data);
    return await this.findById(created._id);
  }

  async update(id, updateData) {
    return await Progress.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true })
      .populate('child')
      .populate('loggedBy', 'name email role')
      .populate('developmentPlan');
  }

  async delete(id) {
    return await Progress.findByIdAndDelete(id);
  }
}

module.exports = new ProgressRepository();
