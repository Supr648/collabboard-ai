import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
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
    const { name, email, password } = req.body;

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
      createdAt: req.user.createdAt,
    },
  });
};
