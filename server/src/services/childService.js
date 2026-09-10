const childRepository = require('../repositories/childRepository');
const aiService = require('./aiService');

class ChildService {
  async getChildren() {
    return await childRepository.findAll();
  }

  async getChildById(id) {
    return await childRepository.findById(id);
  }

  async createChild(childData) {
    const child = await childRepository.create(childData);
    // Asynchronously trigger AI analysis boundary placeholder
    aiService.analyzeChildNeeds(child._id, childData).catch(console.error);
    return child;
  }
}

module.exports = new ChildService();
