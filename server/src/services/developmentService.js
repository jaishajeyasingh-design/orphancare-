const developmentRepository = require('../repositories/developmentRepository');
const aiService = require('./aiService');

class DevelopmentService {
  async generatePlanForChild(childId) {
    if (!childId) {
      throw new Error('Child ID is required to generate a development plan.');
    }

    const aiPlanResult = await aiService.generateDevelopmentPlan(childId);

    const existingPlan = await developmentRepository.findByChildId(childId);

    let savedPlan;
    if (existingPlan) {
      savedPlan = await developmentRepository.update(existingPlan._id, {
        title: aiPlanResult.title,
        goals: aiPlanResult.goals,
        createdViaAI: true
      });
    } else {
      savedPlan = await developmentRepository.create({
        child: childId,
        title: aiPlanResult.title,
        goals: aiPlanResult.goals,
        createdViaAI: true
      });
    }

    return savedPlan;
  }

  async getPlanByChild(childId) {
    return await developmentRepository.findByChildId(childId);
  }

  async getPlans(filter = {}) {
    return await developmentRepository.findAll(filter);
  }

  async updateGoalStatus(planId, goalIndex, newStatus) {
    const validStatuses = ['Pending', 'In_Progress', 'Achieved'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status '${newStatus}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    const plan = await developmentRepository.findById(planId);
    if (!plan) {
      const error = new Error('Development plan not found.');
      error.statusCode = 404;
      throw error;
    }

    if (goalIndex < 0 || goalIndex >= plan.goals.length) {
      throw new Error(`Invalid goal index ${goalIndex}. Plan has ${plan.goals.length} goals.`);
    }

    plan.goals[goalIndex].status = newStatus;
    return await developmentRepository.update(planId, { goals: plan.goals });
  }
}

module.exports = new DevelopmentService();
