import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB, getIsMongoConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import whiteboardRoutes from './routes/whiteboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import personalRoutes from './routes/personalRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Structured Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'production' || process.env.DEBUG_LOGS === 'true') {
      console.log(`[HTTP] ${new Date().toISOString()} ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms - ${req.ip || req.socket.remoteAddress}`);
    }
  });
  next();
});

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers with generous limits for canvas snapshots
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Rate limiting for general API security
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Dedicated strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login/register requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Attach Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8, // 100MB
});

// Setup Real-Time Socket Handlers
setupSocketHandlers(io);

// Favicon and Service Worker handlers
app.get('/service-worker.js', (req, res) => res.status(204).end());
app.get('/favicon.ico', (req, res) => {
  if (hasClientDist && fs.existsSync(path.join(clientDistPath, 'favicon.ico'))) {
    return res.sendFile(path.join(clientDistPath, 'favicon.ico'));
  }
  res.status(204).end();
});

// Root endpoint: intelligently responds with SPA HTML for browser navigations,
// or JSON service diagnostics for API clients/health probes
app.get('/', (req, res) => {
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  if (hasClientDist && acceptsHtml) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.json({
    success: true,
    service: 'CollabBoard AI Intelligent Real-Time Collaborative Workspace API',
    status: 'healthy',
    version: '2.0.0',
    documentation: '/api/health',
  });
});

// Production Health & Diagnostics Check Endpoint
const healthHandler = (req, res) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CollabBoard AI Production API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: uptimeSeconds,
      formatted: `${hours}h ${minutes}m ${seconds}s`,
    },
    database: {
      connected: getIsMongoConnected(),
      mode: getIsMongoConnected() ? 'MongoDB Atlas Cluster' : 'Resilient In-Memory/JSON Storage',
      status: 'operational',
    },
    realtime: {
      engine: 'Socket.IO v4',
      activeSockets: io.engine ? io.engine.clientsCount : 0,
      status: 'listening',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/notifications', notificationRoutes);

// Static SPA client serving (for single-service / monolith deployments)
if (hasClientDist) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 CollabBoard AI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 Socket.IO server ready for real-time collaboration`);
  });
};

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
