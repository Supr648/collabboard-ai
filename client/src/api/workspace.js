import api from './client';

export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

export const createWorkspace = async (workspaceData) => {
  const response = await api.post('/workspaces', workspaceData);
  return response.data;
};

export const getWorkspaceById = async (id) => {
  const response = await api.get(`/workspaces/${id}`);
  return response.data;
};

export const updateWorkspace = async (id, updates) => {
  const response = await api.put(`/workspaces/${id}`, updates);
  return response.data;
};

export const deleteWorkspace = async (id) => {
  const response = await api.delete(`/workspaces/${id}`);
  return response.data;
};
