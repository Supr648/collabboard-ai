import api from './client';

export const getProjects = async (workspaceId = '') => {
  const url = workspaceId ? `/projects?workspaceId=${workspaceId}` : '/projects';
  const response = await api.get(url);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const createPoll = async (projectId, pollData) => {
  const response = await api.post(`/projects/${projectId}/polls`, pollData);
  return response.data;
};

export const votePoll = async (projectId, pollId, optionIndex) => {
  const response = await api.post(`/projects/${projectId}/polls/${pollId}/vote`, {
    optionIndex,
  });
  return response.data;
};

export const createMeeting = async (projectId, meetingData) => {
  const response = await api.post(`/projects/${projectId}/meetings`, meetingData);
  return response.data;
};

export const generateAIProjectPlan = async (data) => {
  const response = await api.post('/projects/ai-plan', data);
  return response.data;
};

export const generateAIMeetingSummary = async (data) => {
  const response = await api.post('/projects/ai-meeting-summary', data);
  return response.data;
};
