import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

// Random vibrant avatar colors
const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#10b981',
  '#f59e0b', '#3b82f6', '#14b8a6', '#ef4444', '#06b6d4',
];

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, primaryWorkspaceType, workspaceType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const chosenType = primaryWorkspaceType || workspaceType || 'team';
    const validTypes = ['student', 'teacher', 'team', 'business', 'personal'];
    const resolvedType = validTypes.includes(chosenType) ? chosenType : 'team';

    if (getIsMongoConnected()) {
      const existingUser = await User.findOne({ email: emailNormalized });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        email: emailNormalized,
        password: hashedPassword,
        avatarColor: getRandomColor(),
        primaryWorkspaceType: resolvedType,
      });

      // Auto-create initial primary workspace
      const typeTitles = {
        student: 'Student Learning Workspace',
        teacher: 'Classroom & Curriculum Workspace',
        team: 'Team Collaborative Workspace',
        business: 'Enterprise Business Workspace',
        personal: 'Personal Productivity Workspace',
      };
      await Workspace.create({
        name: `${name.trim()}'s ${typeTitles[resolvedType] || 'Workspace'}`,
        type: resolvedType,
        owner: user._id,
        members: [{ user: user._id, role: 'owner' }],
        description: `Primary ${resolvedType} workspace environment.`,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          primaryWorkspaceType: user.primaryWorkspaceType,
        },
      });
    } else {
      // Memory store fallback
      const existingUser = memoryStore.findUserByEmail(emailNormalized);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = memoryStore.createUser({
        name: name.trim(),
        email: emailNormalized,
        password: hashedPassword,
        avatarColor: getRandomColor(),
        primaryWorkspaceType: resolvedType,
      });

      // Auto-create initial primary workspace in memory store
      memoryStore.ensureDefaultWorkspace(user._id, resolvedType, name.trim());

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          primaryWorkspaceType: user.primaryWorkspaceType,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    if (getIsMongoConnected()) {
      const user = await User.findOne({ email: emailNormalized });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          primaryWorkspaceType: user.primaryWorkspaceType || 'team',
        },
      });
    } else {
      // Memory store
      const user = memoryStore.findUserByEmail(emailNormalized);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          primaryWorkspaceType: user.primaryWorkspaceType || 'team',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
      primaryWorkspaceType: req.user.primaryWorkspaceType || 'team',
      createdAt: req.user.createdAt,
    },
  });
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    if (getIsMongoConnected()) {
      const user = await User.findOne({ email: emailNormalized });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address. Please register for a new account.',
        });
      }

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      return res.json({
        success: true,
        message: 'Password recovery link generated and dispatched to your email.',
        resetToken,
        resetUrl: `/reset-password/${resetToken}`,
      });
    } else {
      const user = memoryStore.setResetPasswordToken(emailNormalized, resetToken, resetExpires);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address. Please register for a new account.',
        });
      }

      return res.json({
        success: true,
        message: 'Password recovery link generated and dispatched to your email.',
        resetToken,
        resetUrl: `/reset-password/${resetToken}`,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using valid token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.body;
    const password = req.body.password || req.body.newPassword;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (getIsMongoConnected()) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired. Please request a new recovery link.',
        });
      }

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    } else {
      const user = memoryStore.findUserByResetToken(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired. Please request a new recovery link.',
        });
      }

      memoryStore.resetUserPassword(user._id, hashedPassword);

      return res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarColor, primaryWorkspaceType } = req.body;
    const userId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (name && name.trim()) user.name = name.trim();
      if (avatarColor) user.avatarColor = avatarColor;
      if (primaryWorkspaceType) user.primaryWorkspaceType = primaryWorkspaceType;
      await user.save();

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          primaryWorkspaceType: user.primaryWorkspaceType,
        },
      });
    } else {
      const updated = memoryStore.updateUser(userId, {
        name: name ? name.trim() : undefined,
        avatarColor,
        primaryWorkspaceType,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          avatarColor: updated.avatarColor,
          primaryWorkspaceType: updated.primaryWorkspaceType,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
