import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  async getOrCreateUser(username) {
    const response = await api.post('/users', { username });
    return response.data;
  },

  async getUser(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async updateUserProgress(userId, taskId, xpEarned) {
    const response = await api.post(`/users/${userId}/progress`, { taskId, xpEarned });
    return response.data;
  },

  async getLeaderboard() {
    const response = await api.get('/users/leaderboard');
    return response.data;
  },
};

export const codeService = {
  async executeCode(code, testCases, taskId) {
    const response = await api.post('/code/execute', { code, testCases, taskId });
    return response.data;
  },
};

export default api;

