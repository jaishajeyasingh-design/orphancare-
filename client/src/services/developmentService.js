import apiClient from './api/apiClient';

export const generateDevelopmentPlan = async (childId) => {
  const response = await apiClient.post(`/development/generate/${childId}`);
  return response.data;
};

export const getPlanByChild = async (childId) => {
  const response = await apiClient.get(`/development/child/${childId}`);
  return response.data;
};

export const getPlans = async (params = {}) => {
  const response = await apiClient.get('/development', { params });
  return response.data;
};

export const updateGoalStatus = async (planId, goalIndex, status) => {
  const response = await apiClient.put(`/development/${planId}/goals`, { goalIndex, status });
  return response.data;
};
