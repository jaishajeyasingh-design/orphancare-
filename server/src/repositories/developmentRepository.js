const DevelopmentPlan = require('../models/DevelopmentPlan');

class DevelopmentRepository {
  async findAll(filter = {}) {
    return await DevelopmentPlan.find(filter).populate('child');
  }

  async findById(id) {
    return await DevelopmentPlan.findById(id).populate('child');
  }

  async findByChildId(childId) {
    return await DevelopmentPlan.findOne({ child: childId }).populate('child');
  }

  async create(data) {
    return await DevelopmentPlan.create(data);
  }

  async update(id, updateData) {
    return await DevelopmentPlan.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true }).populate('child');
  }

  async delete(id) {
    return await DevelopmentPlan.findByIdAndDelete(id);
  }
}

module.exports = new DevelopmentRepository();
