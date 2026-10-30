import { v4 as uuidv4 } from 'uuid';
import { Whiteboard } from '../models/Whiteboard.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// Helper to generate concise, friendly room ID
const generateRoomId = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12);
};

// @desc    Create a new whiteboard
// @route   POST /api/whiteboards
// @access  Private
export const createWhiteboard = async (req, res, next) => {
  try {
    const { title, isPublic } = req.body;
    const userId = req.user._id || req.user.id;
    const roomId = generateRoomId();

    const boardData = {
      title: (title || 'Untitled Whiteboard').trim(),
      roomId,
      owner: userId,
      elements: [],
      thumbnail: '',
      collaborators: [],
      isPublic: isPublic !== undefined ? isPublic : true,
    };

    if (getIsMongoConnected()) {
      const board = await Whiteboard.create(boardData);
      const populatedBoard = await Whiteboard.findById(board._id).populate('owner', 'name email avatarColor');
      return res.status(201).json({
        success: true,
        whiteboard: populatedBoard,
      });
    } else {
      const board = memoryStore.createWhiteboard(boardData);
      return res.status(201).json({
        success: true,
        whiteboard: {
          ...board,
          owner: {
            _id: userId,
            id: userId,
            name: req.user.name,
            email: req.user.email,
            avatarColor: req.user.avatarColor,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all whiteboards for user
// @route   GET /api/whiteboards
// @access  Private
export const getWhiteboards = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { search } = req.query;

    if (getIsMongoConnected()) {
      const query = {
        $or: [{ owner: userId }, { collaborators: userId }],
      };

      if (search && search.trim()) {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      const whiteboards = await Whiteboard.find(query)
        .populate('owner', 'name email avatarColor')
        .sort({ updatedAt: -1 });

      return res.json({
        success: true,
        count: whiteboards.length,
        whiteboards,
      });
    } else {
      const whiteboards = memoryStore.findWhiteboardsByOwnerOrCollaborator(userId.toString(), search);
      return res.json({
        success: true,
        count: whiteboards.length,
        whiteboards,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get whiteboard by Room ID
// @route   GET /api/whiteboards/room/:roomId
// @access  Public (with optional user context)
export const getWhiteboardByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (getIsMongoConnected()) {
      const board = await Whiteboard.findOne({ roomId }).populate('owner', 'name email avatarColor');

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Whiteboard not found with the specified Room ID',
        });
      }

      return res.json({
        success: true,
        whiteboard: board,
      });
    } else {
      const board = memoryStore.findWhiteboardByRoomId(roomId);
      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Whiteboard not found with the specified Room ID',
        });
      }

      // If owner is ID, attempt to populate user info
      let ownerInfo = board.owner;
      if (typeof ownerInfo === 'string') {
        const user = memoryStore.findUserById(ownerInfo);
        if (user) {
          ownerInfo = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            avatarColor: user.avatarColor,
          };
        }
      }

      return res.json({
        success: true,
        whiteboard: {
          ...board,
          owner: ownerInfo,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update whiteboard details (rename, etc.)
// @route   PUT /api/whiteboards/:id
// @access  Private
export const updateWhiteboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, isPublic } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (getIsMongoConnected()) {
      const board = await Whiteboard.findById(id);
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      if (board.owner.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the board owner can update board settings' });
      }

      if (title !== undefined) board.title = title.trim();
      if (isPublic !== undefined) board.isPublic = isPublic;

      await board.save();
      const updated = await Whiteboard.findById(id).populate('owner', 'name email avatarColor');

      return res.json({
        success: true,
        whiteboard: updated,
      });
    } else {
      const board = memoryStore.findWhiteboardById(id);
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      const boardOwnerId = (board.owner._id || board.owner).toString();
      if (boardOwnerId !== userId) {
        return res.status(403).json({ success: false, message: 'Only the board owner can update board settings' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (isPublic !== undefined) updates.isPublic = isPublic;

      const updated = memoryStore.updateWhiteboard(id, updates);
      return res.json({
        success: true,
        whiteboard: updated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Save canvas elements and thumbnail snapshot
// @route   PUT /api/whiteboards/room/:roomId/save
// @access  Public / Private
export const saveWhiteboardState = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { elements, thumbnail } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ success: false, message: 'Elements must be an array' });
    }

    if (getIsMongoConnected()) {
      const board = await Whiteboard.findOne({ roomId });
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      board.elements = elements;
      if (thumbnail !== undefined) {
        board.thumbnail = thumbnail;
      }
      board.updatedAt = new Date();
      await board.save();

      return res.json({
        success: true,
        message: 'Canvas state saved successfully',
        updatedAt: board.updatedAt,
      });
    } else {
      const board = memoryStore.findWhiteboardByRoomId(roomId);
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      const updates = { elements };
      if (thumbnail !== undefined) {
        updates.thumbnail = thumbnail;
      }

      const updated = memoryStore.updateWhiteboard(board._id || board.id, updates);
      return res.json({
        success: true,
        message: 'Canvas state saved successfully',
        updatedAt: updated.updatedAt,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete whiteboard
// @route   DELETE /api/whiteboards/:id
// @access  Private
export const deleteWhiteboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (getIsMongoConnected()) {
      const board = await Whiteboard.findById(id);
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      if (board.owner.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the board owner can delete this whiteboard' });
      }

      await Whiteboard.deleteOne({ _id: id });
      return res.json({
        success: true,
        message: 'Whiteboard deleted successfully',
      });
    } else {
      const board = memoryStore.findWhiteboardById(id);
      if (!board) {
        return res.status(404).json({ success: false, message: 'Whiteboard not found' });
      }

      const boardOwnerId = (board.owner._id || board.owner).toString();
      if (boardOwnerId !== userId) {
        return res.status(403).json({ success: false, message: 'Only the board owner can delete this whiteboard' });
      }

      memoryStore.deleteWhiteboard(id);
      return res.json({
        success: true,
        message: 'Whiteboard deleted successfully',
      });
    }
  } catch (error) {
    next(error);
  }
};
