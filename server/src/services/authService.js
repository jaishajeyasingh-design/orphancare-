const userRepository = require('../repositories/userRepository');

class AuthService {
  async getUserProfile(userId) {
    return await userRepository.findById(userId);
  }
}

module.exports = new AuthService();
