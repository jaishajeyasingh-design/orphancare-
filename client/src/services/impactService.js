import apiClient from './api/apiClient';

export const getImpactSummary = async (timeframe = 'all') => {
  const response = await apiClient.get('/impact/summary', {
    params: { timeframe }
  });
  return response.data;
};

export const getImpactMetrics = async () => {
  const response = await apiClient.get('/impact/metrics');
  return response.data;
};

export const saveImpactMetric = async (metricData) => {
  const response = await apiClient.post('/impact/metrics', metricData);
  return response.data;
};

export const getImpact = async (timeframe = 'all') => {
  const response = await apiClient.get('/impact', {
    params: { timeframe }
  });
  return response.data;
};
