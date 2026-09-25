import apiClient from './api/apiClient';

export const getOpportunities = async (params = {}) => {
  const response = await apiClient.get('/opportunities', { params });
  return response.data;
};

export const getOpportunityById = async (id) => {
  const response = await apiClient.get(`/opportunities/${id}`);
  return response.data;
};

export const createOpportunity = async (data) => {
  const response = await apiClient.post('/opportunities', data);
  return response.data;
};

export const updateOpportunity = async (id, data) => {
  const response = await apiClient.put(`/opportunities/${id}`, data);
  return response.data;
};

export const deleteOpportunity = async (id) => {
  const response = await apiClient.delete(`/opportunities/${id}`);
  return response.data;
};
