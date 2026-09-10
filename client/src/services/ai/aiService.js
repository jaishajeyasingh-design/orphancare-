import apiClient from '../api/apiClient';

export const analyzeNeeds = async (childId, rawData) => {
  const response = await apiClient.post('/ai/analyze-needs', { childId, rawData });
  return response.data;
};

export const triggerMatching = async (childId) => {
  const response = await apiClient.post('/ai/match', { childId });
  return response.data;
};

export const fetchDevelopmentPlan = async (childId) => {
  const response = await apiClient.post('/ai/development-plan', { childId });
  return response.data;
};
