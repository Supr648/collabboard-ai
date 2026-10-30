import mongoose from 'mongoose';
import { CommunityTemplate } from '../models/CommunityTemplate.js';
import { memoryStore } from '../config/memoryStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/templates/community
export const getCommunityTemplates = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    if (isDbConnected()) {
      const query = { isPublic: true, reported: false };
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search && search.trim()) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
        ];
      }
      const templates = await CommunityTemplate.find(query).sort({ clonesCount: -1 }).lean();
      return res.json({ success: true, templates });
    }

    const templates = memoryStore.getCommunityTemplates({ category, search });
    return res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
};

// POST /api/templates/community/publish
export const publishCommunityTemplate = async (req, res, next) => {
  try {
    const { title, description, category, tags = [], elements = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Template title is required' });
    }

    const templateData = {
      title: title.trim(),
      description: (description || '').trim(),
      category: ['study', 'project', 'business', 'mindmap', 'flowchart'].includes(category) ? category : 'project',
      tags: Array.isArray(tags) ? tags : [],
      elements: Array.isArray(elements) ? elements : [],
      author: {
        id: req.user._id || req.user.id || 'usr_unknown',
        name: req.user.name || 'Collaborator',
        avatar: req.user.avatar || '',
      },
      isPublic: true,
      reported: false,
    };

    if (isDbConnected()) {
      const created = await CommunityTemplate.create(templateData);
      return res.status(201).json({ success: true, template: created });
    }

    const created = memoryStore.createCommunityTemplate(templateData);
    return res.status(201).json({ success: true, template: created });
  } catch (error) {
    next(error);
  }
};

// POST /api/templates/community/:id/clone
export const cloneCommunityTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const template = await CommunityTemplate.findByIdAndUpdate(
        id,
        { $inc: { clonesCount: 1 } },
        { new: true }
      ).lean();
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      return res.json({ success: true, template });
    }

    const template = memoryStore.cloneCommunityTemplate(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, template });
  } catch (error) {
    next(error);
  }
};

// POST /api/templates/community/:id/report
export const reportCommunityTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Flagged by user' } = req.body;

    if (isDbConnected()) {
      const template = await CommunityTemplate.findByIdAndUpdate(
        id,
        { reported: true, reportReason: reason },
        { new: true }
      ).lean();
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      return res.json({ success: true, message: 'Template flagged for moderation.' });
    }

    const template = memoryStore.reportCommunityTemplate(id, reason);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, message: 'Template flagged for moderation.' });
  } catch (error) {
    next(error);
  }
};
