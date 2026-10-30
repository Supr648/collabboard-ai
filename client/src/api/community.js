import api from './client';

export const getCommunityTemplates = async (params = {}) => {
  const res = await api.get('/templates/community', { params });
  return res.data;
};

export const publishCommunityTemplate = async (templateData) => {
  const res = await api.post('/templates/community/publish', templateData);
  return res.data;
};

export const cloneCommunityTemplate = async (id) => {
  const res = await api.post(`/templates/community/${id}/clone`);
  return res.data;
};

export const reportCommunityTemplate = async (id, reason) => {
  const res = await api.post(`/templates/community/${id}/report`, { reason });
  return res.data;
};
