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

export const generateAiMindMap = async (topic) => {
  const response = await api.post('/ai/mindmap', { topic });
  return response.data;
};

export const executeAiCanvasCommand = async (command, elements = [], selectedElements = []) => {
  const response = await api.post('/ai/command', { command, elements, selectedElements });
  return response.data;
};

export const extractAiDocumentIntelligence = async (content, title = 'Document') => {
  const response = await api.post('/ai/document-intelligence', { content, title });
  return response.data;
};

export const critiqueAiBoard = async (elements = []) => {
  const response = await api.post('/ai/critique', { elements });
  return response.data;
};

