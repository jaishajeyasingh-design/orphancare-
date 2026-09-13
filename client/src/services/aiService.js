import apiClient from './api/apiClient';

export const analyzeChildNeeds = async (childId) => {
  const response = await apiClient.post('/ai/analyze-needs', { childId });
  return response.data;
};

export const triggerAIMatch = async (childId) => {
  const response = await apiClient.post('/ai/match', { childId });
  return response.data;
};

export const generateDevelopmentPlan = async (childId) => {
  const response = await apiClient.post('/ai/development-plan', { childId });
  return response.data;
};
