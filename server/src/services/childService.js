const crypto = require('crypto');
const childRepository = require('../repositories/childRepository');

class ChildService {
  generateAnonymizedCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CH-${randomHex}`;
  }

  async getChildren(filter = {}) {
    return await childRepository.findAll(filter);
  }

  async getChildById(id) {
    return await childRepository.findById(id);
  }

  async getChildByAnonymizedCode(code) {
    return await childRepository.findByAnonymizedCode(code);
  }

  async createChild(childData) {
    if (!childData.anonymizedCode) {
      let uniqueCode = this.generateAnonymizedCode();
      while (await childRepository.findByAnonymizedCode(uniqueCode)) {
        uniqueCode = this.generateAnonymizedCode();
      }
      childData.anonymizedCode = uniqueCode;
    }

    const child = await childRepository.create(childData);
    return child;
  }

  async updateChild(id, updateData) {
    return await childRepository.update(id, updateData);
  }

  async deleteChild(id) {
    return await childRepository.delete(id);
  }
}

module.exports = new ChildService();
