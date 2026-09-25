import apiClient from './api/apiClient';

export const createProgress = async (progressData) => {
  const response = await apiClient.post('/progress', progressData);
  return response.data;
};

export const getProgressByChild = async (childId) => {
  const response = await apiClient.get(`/progress/child/${childId}`);
  return response.data;
};

export const getProgressById = async (id) => {
  const response = await apiClient.get(`/progress/${id}`);
  return response.data;
};

export const updateProgress = async (id, progressData) => {
  const response = await apiClient.put(`/progress/${id}`, progressData);
  return response.data;
};

export const deleteProgress = async (id) => {
  const response = await apiClient.delete(`/progress/${id}`);
  return response.data;
};

export const getAllProgress = async () => {
  const response = await apiClient.get('/progress');
  return response.data;
};
