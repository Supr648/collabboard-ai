import api from './client';

export const createWhiteboard = async (boardData) => {
  const response = await api.post('/whiteboards', boardData);
  return response.data;
};

export const getWhiteboards = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await api.get(`/whiteboards${query}`);
  return response.data;
};

export const getWhiteboardByRoomId = async (roomId) => {
  const response = await api.get(`/whiteboards/room/${roomId}`);
  return response.data;
};

export const updateWhiteboard = async (id, updateData) => {
  const response = await api.put(`/whiteboards/${id}`, updateData);
  return response.data;
};

export const saveWhiteboardState = async (roomId, elements, thumbnail) => {
  const response = await api.put(`/whiteboards/room/${roomId}/save`, { elements, thumbnail });
  return response.data;
};

export const deleteWhiteboard = async (id) => {
  const response = await api.delete(`/whiteboards/${id}`);
  return response.data;
};
