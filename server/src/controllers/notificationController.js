import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { memoryStore } from '../config/memoryStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isDbConnected()) {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      const unreadCount = notifications.filter((n) => !n.read).length;
      return res.json({ success: true, notifications, unreadCount });
    }

    const notifications = memoryStore.getNotificationsByUser(userId);
    const unreadCount = notifications.filter((n) => !n.read).length;
    return res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications
export const createNotification = async (req, res, next) => {
  try {
    const { userId, type = 'system', title, message, link = '' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const targetUserId = userId || req.user._id || req.user.id;

    const notifData = {
      userId: targetUserId,
      type,
      title: title.trim(),
      message: message.trim(),
      link,
      read: false,
    };

    if (isDbConnected()) {
      const created = await Notification.create(notifData);
      return res.status(201).json({ success: true, notification: created });
    }

    const created = memoryStore.createNotification(notifData);
    return res.status(201).json({ success: true, notification: created });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true }).lean();
      return res.json({ success: true, notification: notif });
    }

    const notif = memoryStore.markNotificationRead(id);
    return res.json({ success: true, notification: notif });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isDbConnected()) {
      await Notification.updateMany({ userId, read: false }, { read: true });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    memoryStore.markAllNotificationsRead(userId);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
