import { Workspace } from '../models/Workspace.js';
import { User } from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// @desc    Get all workspaces accessible by the current user
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userName = req.user.name || 'User';

    if (getIsMongoConnected()) {
      let workspaces = await Workspace.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
      }).sort({ createdAt: 1 });

      // If user has no workspaces, auto-create their default primary workspace
      if (workspaces.length === 0) {
        const defaultType = req.user.primaryWorkspaceType || 'team';
        const defaultTitle = `${userName}'s Workspace`;
        const newWorkspace = await Workspace.create({
          name: defaultTitle,
          type: defaultType,
          owner: userId,
          members: [{ user: userId, role: 'owner' }],
          description: `Primary ${defaultType} workspace environment.`,
        });
        workspaces = [newWorkspace];
      }

      return res.json({
        success: true,
        count: workspaces.length,
        workspaces,
      });
    } else {
      // Memory store fallback
      let workspaces = memoryStore.findWorkspacesByUser(userId);
      if (workspaces.length === 0) {
        const defaultType = req.user.primaryWorkspaceType || 'team';
        const defaultWs = memoryStore.ensureDefaultWorkspace(userId, defaultType, userName);
        workspaces = [defaultWs];
      }

      return res.json({
        success: true,
        count: workspaces.length,
        workspaces,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = async (req, res, next) => {
  try {
    const { name, type, description, settings } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required',
      });
    }

    const validTypes = ['student', 'teacher', 'team', 'business', 'personal'];
    const workspaceType = validTypes.includes(type) ? type : 'team';

    if (getIsMongoConnected()) {
      const workspace = await Workspace.create({
        name: name.trim(),
        type: workspaceType,
        description: description || '',
        owner: userId,
        members: [{ user: userId, role: 'owner' }],
        settings: settings || {
          colorTheme: '#6366f1',
          allowPublicSharing: true,
          defaultRole: 'editor',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        workspace,
      });
    } else {
      const workspace = memoryStore.createWorkspace({
        name: name.trim(),
        type: workspaceType,
        description: description || '',
        owner: userId,
        members: [{ user: userId, role: 'owner', joinedAt: new Date().toISOString() }],
        settings: settings || {
          colorTheme: '#6366f1',
          allowPublicSharing: true,
          defaultRole: 'editor',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        workspace,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
export const getWorkspaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      const workspace = await Workspace.findById(id).populate('owner', 'name email avatarColor');
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      // Check access permission
      const isOwner = workspace.owner._id.toString() === userId.toString();
      const isMember = workspace.members.some((m) => m.user.toString() === userId.toString());

      if (!isOwner && !isMember) {
        return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
      }

      return res.json({ success: true, workspace });
    } else {
      const workspace = memoryStore.findWorkspaceById(id);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      const isOwner = workspace.owner.toString() === userId.toString();
      const isMember = workspace.members.some((m) => (m.user || '').toString() === userId.toString());

      if (!isOwner && !isMember) {
        return res.status(403).json({ success: false, message: 'Access denied to this workspace' });
      }

      return res.json({ success: true, workspace });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update workspace details
// @route   PUT /api/workspaces/:id
// @access  Private
export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, settings, type } = req.body;
    const userId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      const workspace = await Workspace.findById(id);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      if (workspace.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Only workspace owners can update settings' });
      }

      if (name) workspace.name = name.trim();
      if (description !== undefined) workspace.description = description;
      if (type) workspace.type = type;
      if (settings) workspace.settings = { ...workspace.settings, ...settings };

      await workspace.save();
      return res.json({ success: true, message: 'Workspace updated', workspace });
    } else {
      const workspace = memoryStore.findWorkspaceById(id);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      if (workspace.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Only workspace owners can update settings' });
      }

      const updates = {};
      if (name) updates.name = name.trim();
      if (description !== undefined) updates.description = description;
      if (type) updates.type = type;
      if (settings) updates.settings = { ...workspace.settings, ...settings };

      const updated = memoryStore.updateWorkspace(id, updates);
      return res.json({ success: true, message: 'Workspace updated', workspace: updated });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
export const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      const workspace = await Workspace.findById(id);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      if (workspace.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Only workspace owners can delete this workspace' });
      }

      await Workspace.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Workspace deleted successfully' });
    } else {
      const workspace = memoryStore.findWorkspaceById(id);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      if (workspace.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Only workspace owners can delete this workspace' });
      }

      memoryStore.deleteWorkspace(id);
      return res.json({ success: true, message: 'Workspace deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
