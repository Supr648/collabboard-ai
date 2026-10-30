import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err.message);
  }
}

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.whiteboards = new Map();
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
          data.users.forEach((u) => this.users.set(u._id || u.id, u));
        }
        if (Array.isArray(data.whiteboards)) {
          data.whiteboards.forEach((wb) => this.whiteboards.set(wb._id || wb.id, wb));
        }
        console.log(`Loaded ${this.users.size} users and ${this.whiteboards.size} whiteboards from local cache store.`);
      }
    } catch (e) {
      console.warn('Local store read error, initialized with clean memory store:', e.message);
    }
  }

  saveToFile() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        whiteboards: Array.from(this.whiteboards.values()),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Non-blocking write error
    }
  }

  // User operations
  createUser(userData) {
    const id = userData._id || 'usr_' + Math.random().toString(36).substr(2, 9);
    const user = {
      _id: id,
      id,
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };
    this.users.set(id, user);
    this.saveToFile();
    return user;
  }

  findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === normalized) {
        return user;
      }
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  // Whiteboard operations
  createWhiteboard(boardData) {
    const id = boardData._id || 'wb_' + Math.random().toString(36).substr(2, 9);
    const board = {
      _id: id,
      id,
      title: boardData.title || 'Untitled Whiteboard',
      roomId: boardData.roomId,
      owner: boardData.owner,
      elements: boardData.elements || [],
      thumbnail: boardData.thumbnail || '',
      collaborators: boardData.collaborators || [],
      isPublic: boardData.isPublic !== undefined ? boardData.isPublic : true,
      createdAt: boardData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.whiteboards.set(id, board);
    this.saveToFile();
    return board;
  }

  findWhiteboardsByOwnerOrCollaborator(userId, searchQuery = '') {
    const query = (searchQuery || '').toLowerCase().trim();
    const results = [];
    for (const wb of this.whiteboards.values()) {
      const isOwner = wb.owner && (wb.owner.toString() === userId || wb.owner._id === userId);
      const isCollab = Array.isArray(wb.collaborators) && wb.collaborators.some((c) => (c._id || c.toString()) === userId);

      if (isOwner || isCollab) {
        if (!query || wb.title.toLowerCase().includes(query)) {
          results.push(wb);
        }
      }
    }
    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  findWhiteboardByRoomId(roomId) {
    for (const wb of this.whiteboards.values()) {
      if (wb.roomId === roomId) {
        return wb;
      }
    }
    return null;
  }

  findWhiteboardById(id) {
    return this.whiteboards.get(id) || null;
  }

  updateWhiteboard(id, updates) {
    const wb = this.whiteboards.get(id);
    if (!wb) return null;
    const updated = {
      ...wb,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.whiteboards.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteWhiteboard(id) {
    const res = this.whiteboards.delete(id);
    this.saveToFile();
    return res;
  }
}

export const memoryStore = new MemoryStore();
