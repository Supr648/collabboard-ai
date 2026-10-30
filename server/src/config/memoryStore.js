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
    this.tasks = new Map();
    this.workspaces = new Map();
    this.studyDecks = new Map();
    this.projects = new Map();
    this.classrooms = new Map();
    this.planners = new Map();
    this.communityTemplates = new Map();
    this.notifications = new Map();
    this.loadFromFile();
    this.seedCommunityTemplatesIfEmpty();
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
        if (Array.isArray(data.tasks)) {
          data.tasks.forEach((t) => this.tasks.set(t._id || t.id, t));
        }
        if (Array.isArray(data.workspaces)) {
          data.workspaces.forEach((w) => this.workspaces.set(w._id || w.id, w));
        }
        if (Array.isArray(data.studyDecks)) {
          data.studyDecks.forEach((s) => this.studyDecks.set(s._id || s.id, s));
        }
        if (Array.isArray(data.projects)) {
          data.projects.forEach((p) => this.projects.set(p._id || p.id, p));
        }
        if (Array.isArray(data.classrooms)) {
          data.classrooms.forEach((c) => this.classrooms.set(c._id || c.id, c));
        }
        if (Array.isArray(data.planners)) {
          data.planners.forEach((pl) => this.planners.set(pl.userId, pl));
        }
        if (Array.isArray(data.communityTemplates)) {
          data.communityTemplates.forEach((ct) => this.communityTemplates.set(ct._id || ct.id, ct));
        }
        if (Array.isArray(data.notifications)) {
          data.notifications.forEach((n) => this.notifications.set(n._id || n.id, n));
        }
        console.log(`Loaded ${this.users.size} users, ${this.whiteboards.size} whiteboards, ${this.workspaces.size} workspaces, and ${this.communityTemplates.size} templates.`);
      }
    } catch (e) {
      console.warn('Local store read error, initialized with clean memory store:', e.message);
    }
  }

  seedCommunityTemplatesIfEmpty() {
    if (this.communityTemplates.size === 0) {
      const seedTemplates = [
        {
          _id: 'tpl_comm_1',
          id: 'tpl_comm_1',
          title: 'Full-Stack SaaS MVP Sprint Roadmap',
          description: 'Structured 4-sprint plan for bootstrapping a SaaS MVP with auth, payments, and metrics.',
          category: 'project',
          tags: ['saas', 'agile', 'mvp'],
          author: { id: 'auth_1', name: 'Alex M.', avatar: '' },
          clonesCount: 42,
          likesCount: 88,
          isPublic: true,
          reported: false,
          elements: [
            { id: 'el_1', type: 'rectangle', x1: 100, y1: 100, x2: 300, y2: 240, strokeColor: '#3b82f6', fillColor: '#dbeafe', text: 'Sprint 1: Core Engine\n• Schema Setup\n• JWT Auth' },
            { id: 'el_2', type: 'rectangle', x1: 340, y1: 100, x2: 540, y2: 240, strokeColor: '#8b5cf6', fillColor: '#ede9fe', text: 'Sprint 2: Payments\n• Stripe Webhooks\n• Subscriptions' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'tpl_comm_2',
          id: 'tpl_comm_2',
          title: 'Organic Chemistry Reaction Mechanisms',
          description: 'Nucleophilic substitution, elimination, and arrow-pushing mechanisms with revision notes.',
          category: 'study',
          tags: ['chemistry', 'stem', 'exam'],
          author: { id: 'auth_2', name: 'Dr. Evelyn Reed', avatar: '' },
          clonesCount: 65,
          likesCount: 112,
          isPublic: true,
          reported: false,
          elements: [
            { id: 'el_c1', type: 'sticky', x1: 120, y1: 120, x2: 320, y2: 260, strokeColor: '#10b981', fillColor: '#d1fae5', text: 'SN2 Mechanism:\n• Concerted 1-step\n• Inversion of stereochemistry' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'tpl_comm_3',
          id: 'tpl_comm_3',
          title: 'Lean Canvas Business Model',
          description: 'Problem, Customer Segments, Unique Value Proposition, Solution, and Channels matrix.',
          category: 'business',
          tags: ['startup', 'lean', 'strategy'],
          author: { id: 'auth_3', name: 'Sarah K.', avatar: '' },
          clonesCount: 93,
          likesCount: 145,
          isPublic: true,
          reported: false,
          elements: [
            { id: 'el_b1', type: 'rectangle', x1: 80, y1: 100, x2: 280, y2: 260, strokeColor: '#f59e0b', fillColor: '#fef3c7', text: 'Problem:\n1. Top 3 user pain points\n2. Existing alternatives' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'tpl_comm_4',
          id: 'tpl_comm_4',
          title: 'OAuth2 & JWT Token Refresh Flowchart',
          description: 'Step-by-step token exchange, refresh token rotation, and security barriers visual flow.',
          category: 'flowchart',
          tags: ['security', 'auth', 'architecture'],
          author: { id: 'auth_4', name: 'David R.', avatar: '' },
          clonesCount: 110,
          likesCount: 204,
          isPublic: true,
          reported: false,
          elements: [
            { id: 'el_f1', type: 'circle', x1: 100, y1: 120, x2: 220, y2: 200, strokeColor: '#10b981', fillColor: '#d1fae5', text: 'Client Login' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'tpl_comm_5',
          id: 'tpl_comm_5',
          title: 'Distributed System Design Mind Map',
          description: 'Scalability, Load Balancing, Caching, Sharding, and Consistency tradeoffs radial tree.',
          category: 'mindmap',
          tags: ['system-design', 'backend', 'cloud'],
          author: { id: 'auth_1', name: 'Alex M.', avatar: '' },
          clonesCount: 154,
          likesCount: 290,
          isPublic: true,
          reported: false,
          elements: [
            { id: 'el_m1', type: 'rectangle', x1: 400, y1: 200, x2: 600, y2: 280, strokeColor: '#6366f1', fillColor: '#e0e7ff', text: 'Distributed Systems Core' },
          ],
          createdAt: new Date().toISOString(),
        },
      ];
      seedTemplates.forEach((t) => this.communityTemplates.set(t._id, t));
      this.saveToFile();
    }
  }

  saveToFile() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        whiteboards: Array.from(this.whiteboards.values()),
        tasks: Array.from(this.tasks.values()),
        workspaces: Array.from(this.workspaces.values()),
        studyDecks: Array.from(this.studyDecks.values()),
        projects: Array.from(this.projects.values()),
        classrooms: Array.from(this.classrooms.values()),
        planners: Array.from(this.planners.values()),
        communityTemplates: Array.from(this.communityTemplates.values()),
        notifications: Array.from(this.notifications.values()),
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

  setResetPasswordToken(email, token, expires) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    this.users.set(user._id, user);
    this.saveToFile();
    return user;
  }

  findUserByResetToken(token) {
    const now = Date.now();
    for (const user of this.users.values()) {
      if (
        user.resetPasswordToken === token &&
        user.resetPasswordExpires &&
        new Date(user.resetPasswordExpires).getTime() > now
      ) {
        return user;
      }
    }
    return null;
  }

  resetUserPassword(userId, newHashedPassword) {
    const user = this.users.get(userId);
    if (!user) return null;
    user.password = newHashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.updatedAt = new Date().toISOString();
    this.users.set(userId, user);
    this.saveToFile();
    return user;
  }

  updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.avatarColor) user.avatarColor = updates.avatarColor;
    if (updates.primaryWorkspaceType) user.primaryWorkspaceType = updates.primaryWorkspaceType;
    user.updatedAt = new Date().toISOString();
    this.users.set(userId, user);
    this.saveToFile();
    return user;
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
      versionHistory: boardData.versionHistory || [],
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

  // Task operations for Kanban Project Management
  createTask(taskData) {
    const id = taskData._id || 'task_' + Math.random().toString(36).substr(2, 9);
    const task = {
      _id: id,
      id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'backlog',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || '',
      boardId: taskData.boardId,
      originElementId: taskData.originElementId || '',
      assignedTo: taskData.assignedTo || 'Unassigned',
      createdBy: taskData.createdBy || 'Collaborator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    this.saveToFile();
    return task;
  }

  findTasksByBoardId(boardId) {
    const list = [];
    for (const task of this.tasks.values()) {
      if (task.boardId === boardId) {
        list.push(task);
      }
    }
    return list;
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteTask(id) {
    const res = this.tasks.delete(id);
    this.saveToFile();
    return res;
  }

  // Workspace operations
  createWorkspace(workspaceData) {
    const id = workspaceData._id || 'ws_' + Math.random().toString(36).substr(2, 9);
    const workspace = {
      _id: id,
      id,
      name: workspaceData.name || 'My Workspace',
      type: workspaceData.type || 'team',
      description: workspaceData.description || '',
      owner: workspaceData.owner,
      members: workspaceData.members || [
        {
          user: workspaceData.owner,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      settings: workspaceData.settings || {
        colorTheme: '#6366f1',
        allowPublicSharing: true,
        defaultRole: 'editor',
      },
      createdAt: workspaceData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workspaces.set(id, workspace);
    this.saveToFile();
    return workspace;
  }

  findWorkspacesByUser(userId) {
    const list = [];
    for (const ws of this.workspaces.values()) {
      const isOwner = ws.owner && (ws.owner.toString() === userId || ws.owner._id === userId);
      const isMember = Array.isArray(ws.members) && ws.members.some(
        (m) => (m.user && (m.user.toString() === userId || m.user._id === userId))
      );
      if (isOwner || isMember) {
        list.push(ws);
      }
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  findWorkspaceById(id) {
    return this.workspaces.get(id) || null;
  }

  updateWorkspace(id, updates) {
    const ws = this.workspaces.get(id);
    if (!ws) return null;
    const updated = {
      ...ws,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.workspaces.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteWorkspace(id) {
    const res = this.workspaces.delete(id);
    this.saveToFile();
    return res;
  }

  ensureDefaultWorkspace(userId, type = 'team', userName = '') {
    const existing = this.findWorkspacesByUser(userId);
    if (existing.length > 0) {
      return existing[0];
    }
    const typeTitles = {
      student: 'Student Learning Workspace',
      teacher: 'Classroom & Curriculum Workspace',
      team: 'Team Collaborative Workspace',
      business: 'Enterprise Business Workspace',
      personal: 'Personal Productivity Workspace',
    };
    const name = userName ? `${userName}'s ${typeTitles[type] || 'Workspace'}` : (typeTitles[type] || 'Primary Workspace');
    return this.createWorkspace({
      name,
      type,
      owner: userId,
      description: `Default ${type} environment for collaboration and productivity.`,
    });
  }

  // Student Study Deck Operations
  createStudyDeck(deckData) {
    const id = deckData._id || 'deck_' + Math.random().toString(36).substr(2, 9);
    const deck = {
      _id: id,
      id,
      title: deckData.title || 'Untitled Study Deck',
      subject: deckData.subject || 'General',
      userId: deckData.userId,
      type: deckData.type || 'flashcards',
      cards: deckData.cards || [],
      questions: deckData.questions || [],
      quizAttempts: deckData.quizAttempts || [],
      revisionSchedule: deckData.revisionSchedule || [],
      createdAt: deckData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.studyDecks.set(id, deck);
    this.saveToFile();
    return deck;
  }

  findStudyDecksByUser(userId, type = null) {
    const list = [];
    for (const d of this.studyDecks.values()) {
      if ((d.userId && d.userId.toString() === userId.toString())) {
        if (!type || d.type === type) {
          list.push(d);
        }
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  findStudyDeckById(id) {
    return this.studyDecks.get(id) || null;
  }

  updateStudyDeck(id, updates) {
    const deck = this.studyDecks.get(id);
    if (!deck) return null;
    const updated = {
      ...deck,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.studyDecks.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteStudyDeck(id) {
    const res = this.studyDecks.delete(id);
    this.saveToFile();
    return res;
  }

  // Project and Team Operations
  createProject(projData) {
    const id = projData._id || 'proj_' + Math.random().toString(36).substr(2, 9);
    const project = {
      _id: id,
      id,
      name: projData.name || 'Untitled Project',
      description: projData.description || '',
      workspaceId: projData.workspaceId,
      owner: projData.owner,
      status: projData.status || 'active',
      milestones: projData.milestones || [],
      polls: projData.polls || [],
      meetings: projData.meetings || [],
      createdAt: projData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, project);
    this.saveToFile();
    return project;
  }

  findProjectsByWorkspace(workspaceId) {
    const list = [];
    for (const p of this.projects.values()) {
      if (p.workspaceId && p.workspaceId.toString() === workspaceId.toString()) {
        list.push(p);
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  findProjectById(id) {
    return this.projects.get(id) || null;
  }

  updateProject(id, updates) {
    const project = this.projects.get(id);
    if (!project) return null;
    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteProject(id) {
    const res = this.projects.delete(id);
    this.saveToFile();
    return res;
  }

  // Teacher Classroom Operations
  createClassroom(classData) {
    const id = classData._id || 'cls_' + Math.random().toString(36).substr(2, 9);
    const classroom = {
      _id: id,
      id,
      name: classData.name || 'Untitled Classroom',
      subject: classData.subject || 'General',
      teacherId: classData.teacherId,
      students: classData.students || [],
      assignments: classData.assignments || [],
      submissions: classData.submissions || [],
      createdAt: classData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.classrooms.set(id, classroom);
    this.saveToFile();
    return classroom;
  }

  findClassroomsByTeacher(teacherId) {
    const list = [];
    for (const c of this.classrooms.values()) {
      if (c.teacherId && c.teacherId.toString() === teacherId.toString()) {
        list.push(c);
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  findClassroomById(id) {
    return this.classrooms.get(id) || null;
  }

  updateClassroom(id, updates) {
    const cls = this.classrooms.get(id);
    if (!cls) return null;
    const updated = {
      ...cls,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.classrooms.set(id, updated);
    this.saveToFile();
    return updated;
  }

  // Personal Planner Operations
  getPersonalPlanner(userId) {
    let planner = this.planners.get(userId.toString());
    if (!planner) {
      planner = {
        userId: userId.toString(),
        dailyTasks: [
          { text: 'Review strategic system design RFC', completed: true, priority: 'high' },
          { text: 'Complete 30-min deep active recall session', completed: false, priority: 'medium' },
          { text: 'Review team pull requests and performance logs', completed: false, priority: 'high' },
        ],
        weeklyGoals: [
          {
            title: 'Ship CollabBoard AI 2.1 Multi-Purpose SaaS Platform',
            targetDate: 'Sunday',
            completed: false,
            subtasks: [
              { text: 'Deploy student learning workspace', done: true },
              { text: 'Implement virtual classrooms & assignments', done: true },
              { text: 'Verify automated regression test suite', done: false },
            ],
          },
        ],
        habits: [
          { name: 'Morning Focus & Deep Work', streak: 12, history: ['2026-10-28', '2026-10-29', '2026-10-30'] },
          { name: 'Daily Algorithmic Problem Solving', streak: 5, history: ['2026-10-29', '2026-10-30'] },
          { name: '10k Steps & Mindfulness', streak: 8, history: ['2026-10-28', '2026-10-29', '2026-10-30'] },
        ],
        updatedAt: new Date().toISOString(),
      };
      this.planners.set(userId.toString(), planner);
      this.saveToFile();
    }
    return planner;
  }

  updatePersonalPlanner(userId, updates) {
    const planner = this.getPersonalPlanner(userId);
    const updated = {
      ...planner,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.planners.set(userId.toString(), updated);
    this.saveToFile();
    return updated;
  }

  // Community Templates Operations
  getCommunityTemplates({ category, search }) {
    let list = Array.from(this.communityTemplates.values()).filter((t) => t.isPublic && !t.reported);
    if (category && category !== 'all') {
      list = list.filter((t) => t.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => (b.clonesCount || 0) - (a.clonesCount || 0));
  }

  getCommunityTemplateById(id) {
    return this.communityTemplates.get(id) || null;
  }

  createCommunityTemplate(data) {
    const id = data._id || 'tpl_' + Math.random().toString(36).substr(2, 9);
    const template = {
      _id: id,
      id,
      clonesCount: 0,
      likesCount: 0,
      isPublic: true,
      reported: false,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.communityTemplates.set(id, template);
    this.saveToFile();
    return template;
  }

  cloneCommunityTemplate(id) {
    const tpl = this.communityTemplates.get(id);
    if (!tpl) return null;
    tpl.clonesCount = (tpl.clonesCount || 0) + 1;
    this.communityTemplates.set(id, tpl);
    this.saveToFile();
    return tpl;
  }

  reportCommunityTemplate(id, reason = 'Flagged by community user') {
    const tpl = this.communityTemplates.get(id);
    if (!tpl) return null;
    tpl.reported = true;
    tpl.reportReason = reason;
    this.communityTemplates.set(id, tpl);
    this.saveToFile();
    return tpl;
  }

  // Notifications Operations
  getNotificationsByUser(userId) {
    const list = Array.from(this.notifications.values()).filter(
      (n) => (n.userId ? n.userId.toString() : '') === userId.toString()
    );
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification(data) {
    const id = data._id || 'notif_' + Math.random().toString(36).substr(2, 9);
    const notif = {
      _id: id,
      id,
      read: false,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notifications.set(id, notif);
    this.saveToFile();
    return notif;
  }

  markNotificationRead(id) {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.read = true;
      notif.updatedAt = new Date().toISOString();
      this.notifications.set(id, notif);
      this.saveToFile();
      return notif;
    }
    return null;
  }

  markAllNotificationsRead(userId) {
    for (const [id, notif] of this.notifications.entries()) {
      if ((notif.userId ? notif.userId.toString() : '') === userId.toString()) {
        notif.read = true;
        this.notifications.set(id, notif);
      }
    }
    this.saveToFile();
    return true;
  }
}

export const memoryStore = new MemoryStore();

