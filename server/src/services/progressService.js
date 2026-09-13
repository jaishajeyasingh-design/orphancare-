const progressRepository = require('../repositories/progressRepository');
const childRepository = require('../repositories/childRepository');
const developmentRepository = require('../repositories/developmentRepository');

class ProgressService {
  async createProgress(data, userId) {
    if (!data.child) {
      const error = new Error('Child ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const childExists = await childRepository.findById(data.child);
    if (!childExists) {
      const error = new Error('Child not found.');
      error.statusCode = 404;
      throw error;
    }

    const validCategories = ['Academic', 'Health', 'Skill', 'Behavioral'];
    if (!data.category || !validCategories.includes(data.category)) {
      const error = new Error(`Invalid category '${data.category}'. Must be one of: ${validCategories.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (!data.notes || typeof data.notes !== 'string' || data.notes.trim().length === 0) {
      const error = new Error('Notes are required and must be a meaningful non-empty string.');
      error.statusCode = 400;
      throw error;
    }

    if (data.rating !== undefined && data.rating !== null) {
      const numRating = Number(data.rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        const error = new Error('Rating must be an integer or number between 1 and 5.');
        error.statusCode = 400;
        throw error;
      }
    }

    let developmentPlanId = undefined;
    let validatedGoalIndex = undefined;

    if (data.goalIndex !== undefined && data.goalIndex !== null) {
      const plan = await developmentRepository.findByChildId(data.child);
      if (!plan) {
        const error = new Error('No development plan found for this child to link goalIndex.');
        error.statusCode = 400;
        throw error;
      }
      const gIndex = Number(data.goalIndex);
      if (isNaN(gIndex) || gIndex < 0 || gIndex >= plan.goals.length) {
        const error = new Error(`Invalid goal index ${data.goalIndex}. Plan has ${plan.goals.length} goals.`);
        error.statusCode = 400;
        throw error;
      }
      developmentPlanId = plan._id;
      validatedGoalIndex = gIndex;
    }

    const progressData = {
      child: data.child,
      loggedBy: userId, // strictly bind to authenticated user
      category: data.category,
      notes: data.notes.trim(),
      rating: data.rating !== undefined ? Number(data.rating) : undefined,
      developmentPlan: developmentPlanId,
      goalIndex: validatedGoalIndex
    };

    return await progressRepository.create(progressData);
  }

  async getProgressByChild(childId) {
    const childExists = await childRepository.findById(childId);
    if (!childExists) {
      const error = new Error('Child not found.');
      error.statusCode = 404;
      throw error;
    }
    return await progressRepository.findByChildId(childId);
  }

  async getProgressById(id) {
    const progress = await progressRepository.findById(id);
    if (!progress) {
      const error = new Error('Progress record not found.');
      error.statusCode = 404;
      throw error;
    }
    return progress;
  }

  async getAllProgress(filter = {}) {
    return await progressRepository.findAll(filter);
  }

  async updateProgress(id, updateData, user) {
    const existing = await progressRepository.findById(id);
    if (!existing) {
      const error = new Error('Progress record not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = existing.loggedBy && (existing.loggedBy._id || existing.loggedBy).toString() === user._id.toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      const error = new Error('Not authorized to update this progress record.');
      error.statusCode = 403;
      throw error;
    }

    const payload = {};

    if (updateData.category !== undefined) {
      const validCategories = ['Academic', 'Health', 'Skill', 'Behavioral'];
      if (!validCategories.includes(updateData.category)) {
        const error = new Error(`Invalid category '${updateData.category}'. Must be one of: ${validCategories.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      payload.category = updateData.category;
    }

    if (updateData.notes !== undefined) {
      if (typeof updateData.notes !== 'string' || updateData.notes.trim().length === 0) {
        const error = new Error('Notes must be a non-empty string.');
        error.statusCode = 400;
        throw error;
      }
      payload.notes = updateData.notes.trim();
    }

    if (updateData.rating !== undefined) {
      const numRating = Number(updateData.rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        const error = new Error('Rating must be an integer or number between 1 and 5.');
        error.statusCode = 400;
        throw error;
      }
      payload.rating = numRating;
    }

    if (updateData.goalIndex !== undefined) {
      const childId = existing.child._id || existing.child;
      const plan = await developmentRepository.findByChildId(childId);
      if (!plan) {
        const error = new Error('No development plan found for this child to link goalIndex.');
        error.statusCode = 400;
        throw error;
      }
      const gIndex = Number(updateData.goalIndex);
      if (isNaN(gIndex) || gIndex < 0 || gIndex >= plan.goals.length) {
        const error = new Error(`Invalid goal index ${updateData.goalIndex}. Plan has ${plan.goals.length} goals.`);
        error.statusCode = 400;
        throw error;
      }
      payload.developmentPlan = plan._id;
      payload.goalIndex = gIndex;
    }

    return await progressRepository.update(id, payload);
  }

  async deleteProgress(id, user) {
    const existing = await progressRepository.findById(id);
    if (!existing) {
      const error = new Error('Progress record not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = existing.loggedBy && (existing.loggedBy._id || existing.loggedBy).toString() === user._id.toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      const error = new Error('Not authorized to delete this progress record.');
      error.statusCode = 403;
      throw error;
    }

    await progressRepository.delete(id);
    return { success: true, message: 'Progress record deleted successfully.' };
  }
}

module.exports = new ProgressService();
