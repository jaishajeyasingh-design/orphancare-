import apiClient from './api/apiClient';

export const submitVolunteerRequest = async (payload) => {
  const response = await apiClient.post('/volunteers/requests', payload);
  return response.data;
};

export const getMyVolunteerRequests = async () => {
  const response = await apiClient.get('/volunteers/my-requests');
  return response.data;
};

export const getOrgVolunteerRequests = async (params = {}) => {
  const response = await apiClient.get('/volunteers/org-requests', { params });
  return response.data;
};

export const updateVolunteerRequestStatus = async (id, status) => {
  const response = await apiClient.put(`/volunteers/requests/${id}/status`, { status });
  return response.data;
};

export const getActivities = async () => {
  const response = await apiClient.get('/volunteers/activities');
  return response.data;
};

export const applyForActivity = async (activityId) => {
  const response = await apiClient.post('/volunteers/apply', { activityId });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await apiClient.get('/volunteers/my-applications');
  return response.data;
};
