import apiClient from './api/apiClient';

export const getMatches = async (params = {}) => {
  const response = await apiClient.get('/matches', { params });
  return response.data;
};

export const triggerAIMatch = async (childId) => {
  const response = await apiClient.post('/matches/trigger', { childId });
  return response.data;
};

export const approveMatch = async (id) => {
  const response = await apiClient.put(`/matches/${id}/approve`);
  return response.data;
};

export const rejectMatch = async (id) => {
  const response = await apiClient.put(`/matches/${id}/reject`);
  return response.data;
};
