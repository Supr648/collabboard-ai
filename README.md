# 🎨 CollabBoard — Real-Time Collaborative Whiteboard

![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6+-purple.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-black.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-brightgreen.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

A modern, responsive, full-stack real-time collaborative whiteboard web application inspired by **Miro** and **Excalidraw**. Built for engineering teams, agile planning, architecture wireframing, and visual brainstorming.

Designed with high performance, sub-50ms WebSocket latency, high-DPI canvas rendering, multi-user live cursor synchronization, infinite canvas panning & zooming, JWT authentication, and MongoDB Atlas persistence.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Local Setup & Installation](#-local-setup--installation)
- [Database Schemas](#-database-schemas)
- [API Documentation](#-api-documentation)
- [Socket.IO Real-Time Events](#-socketio-real-time-events)
- [Automated & Manual Testing](#-automated--manual-testing)
- [Deployment Guide](#-deployment-guide)
  - [MongoDB Atlas Setup](#1-mongodb-atlas-cloud-database)
  - [Backend Deployment (Render)](#2-backend-deployment-on-render)
  - [Frontend Deployment (Vercel)](#3-frontend-deployment-on-vercel)
- [GitHub Upload Guide](#-github-upload-guide)

---

## 🏛 System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                Client Layer (React + Vite)             │
       │  HTML5 Canvas  •  Tailwind CSS  •  Socket.IO Client    │
       └────────────────────────┬───┬───────────────────────────┘
                                │   │
             HTTP / REST APIs   │   │  WebSockets (Duplex)
       (Auth, CRUD, Snapshots)  │   │  (Live Cursors, Strokes)
                                │   │
                                ▼   ▼
       ┌────────────────────────────────────────────────────────┐
       │                Backend Server (Node.js + Express)      │
       │  Socket.IO Hub  •  JWT Middleware  •  Controllers       │
       └────────────────────────┬───┬───────────────────────────┘
                                │   │
           Persistent Store     │   │  Zero-Config Dev Cache
                                ▼   ▼
       ┌────────────────────────────────────────────────────────┐
       │         MongoDB Atlas (Mongoose) / Local Store         │
       │             Users  •  Whiteboards  •  Elements         │
       └────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Authentication & Security
- **User Registration & Login** with secure password hashing via `bcryptjs` (salt rounds: 10).
- **Stateless JWT Authentication** with token storage and automatic authorization header interception.
- **Protected Routes** guarding dashboards and workspace access.
- **Instant Demo Fill** button for recruiters and hiring managers to review in 1 click.

### 2. Whiteboard Editor (HTML5 Canvas Engine)
- **8 Drawing Tools**:
  1. **Freehand Pen**: Quadratic bezier curve smoothing for organic ink strokes.
  2. **Eraser**: Precision click and drag eraser with proximity detection.
  3. **Line Tool**: Straight lines with crisp vector rendering.
  4. **Rectangle Tool**: Wireframing boxes with optional translucent tint or solid fills.
  5. **Circle / Ellipse Tool**: Geometric circles and ellipses.
  6. **Arrow Tool**: Directional architecture connectors with sharp arrowheads.
  7. **Text Tool**: Inline typography placement for notes and labels.
  8. **Select / Pan Tool**: Move freely across the canvas.
- **Custom Properties Palette**: 10 curated color swatches + native hex picker, 4 stroke widths (Fine, Medium, Thick, Heavy), and shape fill modes.
- **Undo / Redo History**: Complete state history snapshots with hotkeys (`Ctrl+Z`, `Ctrl+Y`).
- **Infinite Navigation**: Mouse wheel zooming (20% to 300%) with centering, and spacebar/middle-click drag panning.
- **Export to PNG**: Generates 2x high-resolution retina PNG images ready for presentations or documentation.
- **Light & Dark Mode**: Seamless toggle between sleek dark canvas grid and clean paper grid.

### 3. Real-Time Collaboration (Socket.IO)
- **Unique Room IDs**: Automatic generation of room keys for isolated workspaces.
- **Shareable Invitation Link**: 1-click URL copying with animated toast alerts.
- **Live Multi-User Cursors**: Visualizes remote collaborators' mouse pointers with their name tags, avatar colors, and currently active tools.
- **Sub-50ms Stroke Synchronization**: Live stroke rendering broadcasting intermediate points for fluid real-time drawing.
- **Active Participant Presence**: Real-time avatar stack displaying active user count and member names.
- **Reconnection Handling**: Exponential backoff reconnects clients automatically after network interruptions.
- **Cloud Auto-Save**: Debounced background persistence ensures zero work is lost.

### 4. Dashboard Management
- Responsive sidebar with quick filters and board counter.
- Whiteboard grid cards displaying live element count, canvas thumbnail snapshots, and relative timestamps (`Edited 2m ago`).
- Instant board title renaming and deletion modals.
- Real-time search filter by whiteboard title.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, HTML5 Canvas API, Lucide React, Socket.IO Client, Axios |
| **Backend** | Node.js (v20+), Express.js 4, Socket.IO 4.8, Mongoose 8, JWT, Bcryptjs, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud) with resilient in-memory persistent local fallback |
| **Deployment** | Vercel (Client), Render (Server), MongoDB Atlas (Database) |

---

## 📂 Project Directory Structure

```text
collaborative-whiteboard/
├── client/                               # Frontend React + Vite
│   ├── public/                           # Static assets & favicons
│   ├── src/
│   │   ├── api/                          # Axios API clients
│   │   │   ├── client.js                 # Axios instance with JWT interceptor
│   │   │   ├── auth.js                   # Login, register, me endpoints
│   │   │   └── whiteboard.js             # Board CRUD & save operations
│   │   ├── context/                      # React context providers
│   │   │   ├── AuthContext.jsx           # Global user state & credentials
│   │   │   └── ThemeContext.jsx          # Dark / Light theme toggle
│   │   ├── socket/                       # Socket.IO connection manager
│   │   │   └── socket.js                 # Socket singleton with reconnect logic
│   │   ├── hooks/                        # Custom React hooks
│   │   │   └── useCollaboration.js       # Live cursors, strokes & room presence
│   │   ├── utils/                        # Drawing & formatting helpers
│   │   │   ├── canvasUtils.js            # Shape math, rendering, export PNG
│   │   │   └── formatters.js             # Dates & initials formatters
│   │   ├── components/
│   │   │   ├── common/                   # Navbar, ProtectedRoute, Toast, Modal
│   │   │   ├── dashboard/                # Sidebar, BoardCard, CreateBoardModal
│   │   │   └── whiteboard/               # Canvas, Toolbar, PropertiesBar, ActionControls,
│   │   │                                 # CollaboratorsBar, RemoteCursors, ShareModal
│   │   ├── pages/                        # Route pages
│   │   │   ├── LandingPage.jsx           # Marketing hero with live sandbox
│   │   │   ├── LoginPage.jsx             # User login
│   │   │   ├── RegisterPage.jsx          # User registration
│   │   │   ├── DashboardPage.jsx         # Boards workspace & search
│   │   │   ├── WhiteboardPage.jsx        # Collaborative editor
│   │   │   └── NotFoundPage.jsx          # 404 page
│   │   ├── App.jsx                       # Application router
│   │   ├── main.jsx                      # React DOM entry
│   │   └── index.css                     # Tailwind v4 styles & grid canvas
│   ├── .env.example                      # Client environment template
│   ├── vite.config.js                    # Vite configuration with proxy
│   └── package.json
│
├── server/                               # Backend Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                     # MongoDB connection with fallback
│   │   │   └── memoryStore.js            # Resilient persistent cache store
│   │   ├── models/
│   │   │   ├── User.js                   # Mongoose user schema
│   │   │   └── Whiteboard.js             # Mongoose whiteboard schema
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT auth & optional guest auth
│   │   │   └── errorHandler.js           # Centralized error handler
│   │   ├── controllers/
│   │   │   ├── authController.js         # Auth controller logic
│   │   │   └── whiteboardController.js   # Whiteboard CRUD & state storage
│   │   ├── routes/
│   │   │   ├── authRoutes.js             # /api/auth/*
│   │   │   └── whiteboardRoutes.js       # /api/whiteboards/*
│   │   ├── sockets/
│   │   │   └── socketHandler.js          # Room channels, cursor & stroke sync
│   │   └── server.js                     # Express app & HTTP/Socket server
│   ├── .env.example                      # Server environment template
│   └── package.json
│
├── test_api.js                           # Automated REST API test suite
├── test_socket.js                        # Automated Socket.IO collaboration test
├── .gitignore                            # Git ignore configuration
├── package.json                          # Root orchestration scripts
└── README.md                             # Documentation & Deployment Guide
```

---

## 💻 Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/collaborative-whiteboard.git
cd collaborative-whiteboard
```

### Step 2: Install Dependencies
You can install dependencies for both `server` and `client` with one command:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` separately and run `npm install`)*

### Step 3: Configure Environment Variables

**Server Configuration (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
# Optional: Provide MongoDB Atlas URI (if left blank, server runs with persistent local fallback)
MONGODB_URI=
JWT_SECRET=super_secret_collaborative_whiteboard_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

**Client Configuration (`client/.env`):**
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🗄 Database Schemas

### 1. User Schema (`server/src/models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 }, // Bcrypt hashed
  avatarColor: { type: String, default: '#6366f1' },       // Random vibrant color
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 2. Whiteboard Schema (`server/src/models/Whiteboard.js`)
```javascript
{
  title: { type: String, default: 'Untitled Whiteboard', trim: true, maxlength: 100 },
  roomId: { type: String, required: true, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  elements: [
    {
      id: String,
      type: String,             // 'pen' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text'
      points: [{ x: Number, y: Number }], // For freehand pen
      x1: Number, y1: Number, x2: Number, y2: Number, // For shapes & lines
      x: Number, y: Number, text: String, fontSize: Number, // For text
      strokeColor: String,
      strokeWidth: Number,
      fillColor: String
    }
  ],
  thumbnail: { type: String, default: '' }, // Data URI thumbnail snapshot
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### 1. Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_...",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "avatarColor": "#6366f1"
    }
  }
  ```

#### 2. Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "...", "email": "..." }
  }
  ```

#### 3. Get Current User Profile
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { "id": "...", "name": "...", "email": "...", "avatarColor": "..." }
  }
  ```

---

### Whiteboard Endpoints

#### 4. Create New Whiteboard
- **POST** `/whiteboards`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Architecture Sprint",
    "isPublic": true
  }
  ```
- **Response (201 Created):** Returns populated whiteboard object with unique `roomId`.

#### 5. List User Whiteboards (with Search)
- **GET** `/whiteboards?search=Sprint`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "whiteboards": [...]
  }
  ```

#### 6. Get Whiteboard by Room ID
- **GET** `/whiteboards/room/:roomId`
- **Response (200 OK):** Returns board elements, owner details, and room metadata.

#### 7. Update Whiteboard Settings (Rename)
- **PUT** `/whiteboards/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "title": "New Title" }`

#### 8. Auto-Save Canvas State
- **PUT** `/whiteboards/room/:roomId/save`
- **Body:**
  ```json
  {
    "elements": [...],
    "thumbnail": "data:image/jpeg;base64,..."
  }
  ```

#### 9. Delete Whiteboard
- **DELETE** `/whiteboards/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** `{ "success": true, "message": "Whiteboard deleted successfully" }`

---

## 📡 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, user }` | Joins room and announces presence |
| `room-joined` | Server ➔ Client | `{ self, participants, count }` | Confirms room entry to joiner |
| `room-participants` | Server ➔ All | `{ participants, count }` | Broadcasts updated online list |
| `user-joined` | Server ➔ Room | `{ user, count }` | Emits alert when teammate connects |
| `user-left` | Server ➔ Room | `{ user, count }` | Emits alert when teammate disconnects |
| `cursor-move` | Client ➔ Server | `{ roomId, x, y, activeTool }` | Throttled mouse position (30ms) |
| `cursor-update` | Server ➔ Room | `{ socketId, user, x, y, activeTool }` | Broadcasts live cursor to peers |
| `cursor-remove` | Server ➔ Room | `{ socketId }` | Removes remote cursor on disconnect |
| `draw-stroke-live` | Client ➔ Server | `{ roomId, stroke }` | Intermediate live freehand points |
| `remote-draw-live` | Server ➔ Room | `stroke` | Draws live line as user drags mouse |
| `element-add` | Client ➔ Server | `{ roomId, element }` | Committed element creation |
| `remote-element-add` | Server ➔ Room | `element` | Adds element to peer canvases |
| `element-delete` | Client ➔ Server | `{ roomId, elementId }` | Eraser removal event |
| `remote-element-delete`| Server ➔ Room | `{ elementId }` | Removes element from peer canvases |
| `canvas-clear` | Client ➔ Server | `{ roomId }` | Canvas wipe event |
| `remote-canvas-clear` | Server ➔ Room | `{ by }` | Wipes peers' canvases |
| `canvas-sync` | Client ➔ Server | `{ roomId, elements, action }` | Undo/redo synchronized state |
| `remote-canvas-sync` | Server ➔ Room | `{ elements, action }` | Updates peer undo/redo canvas |

---

## 🧪 Automated & Manual Testing

### Running Automated Test Suites

The project includes two built-in automated test suites:

#### 1. REST API Test Suite
Tests all 11 endpoints including authentication, JWT verification, board creation, search, persistence, state saving, and deletion:
```bash
node test_api.js
```

#### 2. Real-Time Multi-User Socket Test Suite
Spawns two simultaneous socket clients, verifies room joining, live multi-user presence, cursor coordinates broadcasting, real-time shape creation, and clean disconnection:
```bash
cd server
node test_socket.js
```

---

### Manual Multi-Browser Verification Steps

1. **Simultaneous Multi-User Drawing**:
   - Open `http://localhost:5173` in **Browser Window A** (Chrome) and sign in.
   - Create a board and click **"Share"** to copy the invitation URL.
   - Open an **Incognito Window / Browser Window B** (Edge / Firefox) and paste the link.
   - Notice the live collaborator badge update to **2 active participants**.
   - Move mouse in Browser A: observe Browser B displaying the live cursor with name badge.
   - Draw a rectangle in Browser A: observe it appearing instantly in Browser B without refreshing.
2. **Undo & Redo Sync**:
   - Click Undo in Browser A (`Ctrl+Z`): verify state rolls back simultaneously.
3. **Download as PNG**:
   - Click **"Export PNG"** in the bottom right: observe confetti celebration and download of retina 2x image.
4. **Re-opening Saved Boards**:
   - Log out, sign back in, and navigate to `/dashboard`: observe board thumbnail and element count preserved from MongoDB / cache.

---

## 🚀 Deployment Guide

### 1. MongoDB Atlas (Cloud Database)
1. Sign up for a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user with username and password.
4. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** > **Drivers** (Node.js) and copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/collaborative-whiteboard?retryWrites=true&w=majority
   ```

---

### 2. Backend Deployment on Render
1. Push your repository to GitHub.
2. Go to [render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_production_jwt_secret_key`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Click **Create Web Service**. Copy the deployed backend URL (e.g. `https://collabboard-api.onrender.com`).

---

### 3. Frontend Deployment on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set the following configuration:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://collabboard-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://collabboard-api.onrender.com`
5. Click **Deploy**. Your collaborative whiteboard is now live on the web!

---

## 🐙 GitHub Upload Guide

To upload this project to your GitHub account:

```bash
# 1. Initialize git in the collaborative-whiteboard directory
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "feat: complete real-time collaborative whiteboard full-stack application"

# 4. Set main branch
git branch -M main

# 5. Add remote repository URL (replace with your repository)
git remote add origin https://github.com/<your-username>/collaborative-whiteboard.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
