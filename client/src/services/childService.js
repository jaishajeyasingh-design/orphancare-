import apiClient from './api/apiClient';

export const getChildren = async (params = {}) => {
  const response = await apiClient.get('/children', { params });
  return response.data;
};

export const getChildById = async (id) => {
  const response = await apiClient.get(`/children/${id}`);
  return response.data;
};

export const createChild = async (childData) => {
  const response = await apiClient.post('/children', childData);
  return response.data;
};

export const updateChild = async (id, childData) => {
  const response = await apiClient.put(`/children/${id}`, childData);
  return response.data;
};

export const deleteChild = async (id) => {
  const response = await apiClient.delete(`/children/${id}`);
  return response.data;
};
