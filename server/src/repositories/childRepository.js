const Child = require('../models/Child');

class ChildRepository {
  async findAll() {
    return await Child.find().populate('organization', 'name');
  }

  async findById(id) {
    return await Child.findById(id).populate('organization', 'name');
  }

  async create(childData) {
    return await Child.create(childData);
  }
}

module.exports = new ChildRepository();
