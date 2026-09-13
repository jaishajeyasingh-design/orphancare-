import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const isValidToken = (token) => {
  return (
    typeof token === 'string' &&
    token.trim() !== '' &&
    token !== 'undefined' &&
    token !== 'null'
  );
};

apiClient.interceptors.request.use((config) => {
  let token = null;

  // 1. Prefer token from active session in 'userInfo'
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (isValidToken(parsed?.token)) {
        token = parsed.token;
      }
    } catch (e) {
      // ignore parse error
    }
  }

  // 2. Fall back to standalone 'token' key if userInfo.token is unavailable
  if (!isValidToken(token)) {
    const rawToken = localStorage.getItem('token');
    if (isValidToken(rawToken)) {
      token = rawToken;
    }
  }

  // 3. Attach Authorization header if valid token exists
  if (isValidToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
