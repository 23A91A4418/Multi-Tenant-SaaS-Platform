import api from './axios';

export const fetchTasksByProject = (projectId) =>
  api.get(`/projects/${projectId}/tasks`);

export const createTask = (projectId, payload) =>
  api.post(`/projects/${projectId}/tasks`, payload);

export const updateTaskStatus = (taskId, status) =>
  api.patch(`/tasks/${taskId}/status`, { status });

export const deleteTask = (taskId) =>
  api.delete(`/tasks/${taskId}`);
