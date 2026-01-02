import api from './axios';

export const fetchProjects = () =>
  api.get('/projects');

export const createProject = (payload) =>
  api.post('/projects', payload);

export const updateProject = (projectId, payload) =>
  api.put(`/projects/${projectId}`, payload);

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);
