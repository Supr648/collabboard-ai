import api from './client';

export const generateAiDiagram = async (prompt) => {
  const response = await api.post('/ai/diagram', { prompt });
  return response.data;
};

export const generateAiFlowchart = async (workflow) => {
  const response = await api.post('/ai/flowchart', { workflow });
  return response.data;
};

export const generateAiBrainstorm = async (topic) => {
  const response = await api.post('/ai/brainstorm', { topic });
  return response.data;
};

export const summarizeBoardContent = async (elements, title) => {
  const response = await api.post('/ai/summarize', { elements, title });
  return response.data;
};

export const explainBoardDiagram = async (elements) => {
  const response = await api.post('/ai/explain', { elements });
  return response.data;
};
