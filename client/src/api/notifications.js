import api from './client';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const createNotification = async (notifData) => {
  const res = await api.post('/notifications', notifData);
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.put('/notifications/read-all');
  return res.data;
};
