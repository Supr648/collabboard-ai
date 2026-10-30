import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_collaborative_whiteboard_jwt_key_2026';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no access token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getIsMongoConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
    } else {
      const user = memoryStore.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getIsMongoConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || null;
    } else {
      const user = memoryStore.findUserById(decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      } else {
        req.user = null;
      }
    }
  } catch (err) {
    req.user = null;
  }

  next();
};
