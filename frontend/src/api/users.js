import api from './axios';

export const fetchUsersByTenant = (tenantId) =>
  api.get(`/tenants/${tenantId}/users`);

export const addUserToTenant = (tenantId, payload) =>
  api.post(`/tenants/${tenantId}/users`, payload);
