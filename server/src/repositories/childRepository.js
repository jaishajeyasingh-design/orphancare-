const Child = require('../models/Child');

class ChildRepository {
  async findAll(filter = {}) {
    return await Child.find(filter).populate('organization', 'name');
  }

  async findById(id) {
    return await Child.findById(id).populate('organization', 'name');
  }

  async findByAnonymizedCode(anonymizedCode) {
    return await Child.findOne({ anonymizedCode }).populate('organization', 'name');
  }

  async create(childData) {
    return await Child.create(childData);
  }

  async update(id, updateData) {
    return await Child.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true }).populate('organization', 'name');
  }

  async delete(id) {
    return await Child.findByIdAndDelete(id);
  }
}

module.exports = new ChildRepository();
