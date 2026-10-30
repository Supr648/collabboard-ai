# 🚀 CollabBoard AI – Intelligent Real-Time Collaborative Workspace

![CollabBoard AI](https://img.shields.io/badge/CollabBoard%20AI-v2.0.0-6366f1.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Vite 6](https://img.shields.io/badge/Vite-6+-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-black.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)
![AI Enabled](https://img.shields.io/badge/AI%20Engine-Gemini%20%7C%20OpenAI%20%7C%20Semantic%20Synthesis-ff69b4.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

**CollabBoard AI** is an advanced, production-quality real-time collaborative workspace inspired by **Miro**, **FigJam**, and **Excalidraw**, supercharged with native **AI diagram generation, workflow synthesis, brainstorming sticky note clusters, board summarization, and architecture explanation**.

Engineered for cross-functional product, architecture, and engineering teams, CollabBoard AI combines high-framerate HTML5 Canvas rendering, sub-50ms WebSocket synchronization, multi-format vector exports (PNG, SVG, PDF), threaded pinned comments, floating live reactions, version snapshots, and enterprise-grade access control.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Complete Feature Matrix](#-complete-feature-matrix)
- [AI Engine & Capabilities](#-ai-engine--capabilities)
- [Canvas & Drawing Engine](#-canvas--drawing-engine)
- [Real-Time Collaboration Protocol](#-real-time-collaboration-protocol)
- [Database Models & Persistence](#-database-models--persistence)
- [Security, Rate Limiting & Performance](#-security-rate-limiting--performance)
- [Technology Stack](#-technology-stack)
- [Project Directory Layout](#-project-directory-layout)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [API Reference](#-api-reference)
- [Automated Verification & Test Suite](#-automated-verification--test-suite)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Frontend Deployment (Vercel)](#frontend-deployment-on-vercel)
  - [Backend Deployment (Render)](#backend-deployment-on-render)
  - [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)

---

## 🏛 Architectural Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Client Layer (React 19 + Vite + Tailwind CSS)          │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │ HTML5 Canvas Engine  │  │ Interactive Toolbar  │  │ Bird's-Eye Minimap│  │
│  │ Multi-Select/Resize  │  │ Properties Bar       │  │ Real-Time Panning │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             │                         │                        │            │
│  ┌──────────▼─────────────────────────▼────────────────────────▼──────────┐  │
│  │ Collaboration Hub: Live Cursors • Reactions • Pinned Comments • Roles  │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
           HTTP / REST & AI Requests    │    Bi-Directional WebSockets
           (Auth, CRUD, Gemini/OpenAI)  │    (Strokes, Cursors, Emojis, Comments)
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────┐
│                     Backend Server (Node.js + Express.js)                   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │ Express Rate Limiter │  │ JWT Auth Middleware  │  │ AI Synthesizer    │  │
│  │ 1000 req / 15 min    │  │ Role-Based Control   │  │ JSON Schemas      │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             │                         │                        │            │
│  ┌──────────▼─────────────────────────▼────────────────────────▼──────────┐  │
│  │ Socket.IO Server: Room Multiplexing • Participant Map • Delta Sync    │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
                      Mongoose 8 ODM    │    Resilient Cache Fallback
                      (Atlas Cloud)     │    (.data/store.json)
                                        │
┌───────────────────────────────────────▼─────────────────────────────────────┐
│                            Persistent Data Layer                            │
│  Users • Whiteboards • Comments • BoardVersions • ActivityLogs • Alerts     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Complete Feature Matrix

| Category | Capability | Status |
| :--- | :--- | :--- |
| **Canvas Tools** | Freehand pen (smooth beziers), Highlighter (translucent overlay), Eraser, Lines, Arrows, Rectangles, Circles, Triangles, Sticky Notes, Rich Text, Image Uploads | ✅ Production Ready |
| **Object Editing** | Drag & Move, 4-corner multi-directional resizing, Marquee multi-selection, Keyboard shortcuts (Copy `Ctrl+C`, Paste `Ctrl+V`, Duplicate `Ctrl+D`, Delete `Del`), Undo/Redo | ✅ Production Ready |
| **Infinite Navigation** | Pan via middle-click/spacebar, Zoom in/out (20%-300%), Fit to Screen, Coordinate snap-to-grid toggle, Interactive Bird's-eye Minimap viewport | ✅ Production Ready |
| **AI Assistants** | Architecture Diagram Generator, Decision Flowchart Generator, Brainstorming Sticky Note Clusters, Board Summarizer, Diagram Explainer | ✅ Production Ready |
| **Collaboration** | Live multi-user cursors with name tags & tools, Real-time stroke broadcasting, Participant avatar stacks, Animated floating emoji reactions (`👍`, `❤️`, `🚀`, `🔥`, `💡`, `🎉`) | ✅ Production Ready |
| **Productivity** | Pinned canvas comments with thread replies & resolution, Presentation Mode (distraction-free viewport), 4 Professional blueprint templates, Board duplication | ✅ Production Ready |
| **Export Formats** | High-Res Retina PNG (2x), Vector SVG format, Printable Multi-page PDF via `jspdf` | ✅ Production Ready |
| **Permissions** | Board ownership, Role-based invitation links (`?role=editor` vs `?role=viewer`), Read-only toolbar lockouts | ✅ Production Ready |
| **Database & Audits**| MongoDB Atlas persistence with Mongoose models, Version checkpoints & 1-click restore, Activity logs audit trail, Zero-config local cache fallback | ✅ Production Ready |

---

## 🧠 AI Engine & Capabilities

CollabBoard AI provides 5 specialized AI synthesis capabilities accessible via the dedicated backend API (`/api/ai/*`) or directly inside the whiteboard using the AI Assistant modal.

### Architecture
- **Dual Engine Strategy**: If `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `AI_API_KEY` is set in `server/.env`, the backend communicates with cloud LLMs using strict JSON response schemas. If unconfigured, the built-in **Semantic Synthesis Engine** analyzes prompt keywords to construct diagrams, connectors, and notes out of the box with zero external dependencies.
- **Validation**: Every generated element is sanitized and validated through `validateElements()` before insertion to guarantee canvas stability.

### The 5 AI Engines:
1. **AI Diagram Generator (`POST /api/ai/diagram`)**:
   - Accepts prompt (e.g., *"Create a food delivery system architecture"* or *"Microservices Kubernetes Cluster"*).
   - Generates client nodes, API gateways, worker pools, queues, databases, and directional connectors with proper positioning.
2. **AI Flowchart Generator (`POST /api/ai/flowchart`)**:
   - Converts natural language procedures into decision flowcharts (Start node ➔ Action steps ➔ Decision diamond ➔ Yes/No branches ➔ Terminal endpoints).
3. **AI Brainstorming Assistant (`POST /api/ai/brainstorm`)**:
   - Generates categorized sticky note clusters across 4 strategic pillars: *Core Opportunities*, *Innovative Features*, *User Experience*, and *Challenges*.
4. **AI Board Summarizer (`POST /api/ai/summarize`)**:
   - Reads canvas text elements and sticky notes to deliver an executive summary, top takeaways, and actionable next steps.
5. **AI Diagram Explainer (`POST /api/ai/explain`)**:
   - Analyzes selected or active diagram components and generates an architectural explanation of data flows and latency boundaries.

---

## 🎨 Canvas & Drawing Engine

The canvas engine (`client/src/utils/canvasUtils.js` & `client/src/components/whiteboard/Canvas.jsx`) is built with the native HTML5 Canvas API for raw performance:

- **Geometric Math & Bounding Boxes**: `getElementBoundingBox(el)` computes precise element bounds for rectangles, circles, triangles, sticky notes, lines, arrows, text, and images.
- **4-Corner Transform Handles**: `getHandleAtPoint(x, y, el)` provides `tl`, `tr`, `bl`, `br` bounding anchors allowing multi-axis resizing.
- **Snap-to-Grid Coordinate Alignment**: When enabled via the bottom action bar, element points snap to nearest 20px grid intervals.
- **Sticky Note Themes**: Yellow (`#fef08a`), Coral Pink (`#fbcfe8`), Emerald Green (`#a7f3d0`), Sky Blue (`#bae6fd`), and Violet (`#ddd6fe`) with realistic drop-shadow depth.
- **Typography Engine**: Supports bold, italic, underline, alignment (left/center/right), and font sizes from 12px to 48px.
- **Multi-Format Export Engine**:
  - `exportBoardAsPNG()`: 2x retina rasterization with transparent or white background.
  - `exportBoardAsSVG()`: Clean vector SVG XML representation with styled shapes and text.
  - `exportBoardAsPDF()`: Formatted landscape PDF document using `jspdf`.

---

## 📡 Real-Time Collaboration Protocol

CollabBoard AI uses Socket.IO with isolated room channels:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, user, role }` | Joins isolated room channel with permission role |
| `room-joined` | Server ➔ Client | `{ self, participants, count }` | Confirms connection and returns initial member roster |
| `room-participants` | Server ➔ All | `{ participants, count }` | Real-time presence roster updates |
| `cursor-move` | Client ➔ Server | `{ roomId, x, y, activeTool }` | Throttled cursor position with active tool badge |
| `cursor-update` | Server ➔ Peers | `{ socketId, user, x, y, activeTool }` | Renders peer cursor tag with avatar color |
| `element-add` | Client ➔ Server | `{ roomId, element }` | Synchronizes committed drawing element |
| `remote-element-add`| Server ➔ Peers | `element` | Instantly inserts peer's new element |
| `element-update` | Client ➔ Server | `{ roomId, element }` | Real-time move, resize, or styling edit |
| `remote-element-update`| Server ➔ Peers | `element` | Updates modified element coordinates |
| `element-delete` | Client ➔ Server | `{ roomId, elementId }` | Element removal via eraser or Delete key |
| `reaction-trigger`| Client ➔ Server | `{ roomId, emoji, x, y }` | Triggers floating animated reaction emoji |
| `reaction-receive`| Server ➔ Peers | `{ id, emoji, x, y, from }` | Animates reaction on peer canvases |
| `comment-add` | Client ➔ Server | `{ roomId, comment }` | Synchronizes pinned comment badge and thread |
| `comment-sync` | Server ➔ Peers | `{ comment }` | Renders pinned comment pin on peer screens |
| `typing-status` | Client ➔ Server | `{ roomId, isTyping }` | Broadcasts collaborator typing indicator |

---

## 🗄 Database Models & Persistence

The backend provides complete Mongoose 8 database models (`server/src/models/`):

1. **User (`User.js`)**: Name, unique lowercase email, bcrypt-hashed password (cost factor 10), avatar color theme, role, timestamps.
2. **Whiteboard (`Whiteboard.js`)**: Title, unique 12-char `roomId`, owner ref, element array (points, coords, colors, dimensions), thumbnail snapshot, collaborator refs, public visibility.
3. **Comment (`Comment.js`)**: Board ref, element ref, coordinate pins (`x`, `y`), author ref, message body, resolution status, threaded replies.
4. **BoardVersion (`BoardVersion.js`)**: Snapshot checkpoints, element count, trigger action (*manual*, *auto-save*, *ai-generate*), author ref, timestamp.
5. **ActivityLog (`ActivityLog.js`)**: Audit trail documenting user actions (*created-board*, *invited-user*, *exported-canvas*, *cleared-board*), IP address, metadata.
6. **Notification (`Notification.js`)**: Real-time user notifications for invitations, mentions, and shared boards.

*Note: If `MONGODB_URI` is not configured, the server automatically uses a resilient, thread-safe persistent file cache (`.data/store.json`) so your boards persist across server restarts.*

---

## 🛡 Security, Rate Limiting & Performance

- **Express Rate Limiting**: `express-rate-limit` enforces a threshold of 1000 requests per 15-minute window on all `/api` endpoints.
- **JWT Protection**: Stateless verification via `jsonwebtoken` protects board creation, deletion, duplication, and user profiles.
- **Role-Based Authorization**: Invitations can be generated with `role=editor` or `role=viewer` parameters. Viewers are prevented from drawing or mutating canvas state.
- **Payload Limits**: 35MB JSON body limits support large canvas snapshots and embedded images without memory crashes.
- **Clean Production Builds**: Vite frontend bundles with zero lint or build errors in ~1.2s.

---

## 💻 Getting Started & Local Setup

### Prerequisites
- Node.js v18 or higher (v20+ recommended)
- npm v9 or higher

### Step 1: Install Dependencies
```bash
# In the root repository directory
npm run install:all
```
*(Or install inside `server` and `client` folders via `npm install`)*

### Step 2: Configure Environment Files

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=super_secret_collabboard_jwt_key_2026
CLIENT_URL=http://localhost:5173

# Optional: Add your API key for live external LLM generation
GEMINI_API_KEY=
OPENAI_API_KEY=
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite client ready at http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Automated Verification & Test Suite

The project includes an end-to-end automated verification script (`server/test_full_suite.js`) covering:
- Health check & server diagnostics
- Auth flows: User registration & JWT login
- Board CRUD & board duplication
- All 5 AI endpoints (`/api/ai/diagram`, `/flowchart`, `/brainstorm`, `/summarize`, `/explain`)
- Socket.IO multi-client real-time synchronization (drawing, reactions, comments)

Run the test suite anytime:
```bash
cd server
node test_full_suite.js
```

**Expected output:**
```text
====================================================
🧪 COLLABBOARD AI COMPREHENSIVE TEST SUITE
====================================================

✅ [PASS] Backend Health Check
✅ [PASS] Auth: User Registration
✅ [PASS] Auth: User Login
✅ [PASS] Board: Create New Board
✅ [PASS] Board: Fetch Board By ID
✅ [PASS] Board: Duplicate Board
✅ [PASS] AI: Diagram Generator (/api/ai/diagram)
✅ [PASS] AI: Flowchart Generator (/api/ai/flowchart)
✅ [PASS] AI: Brainstorm Assistant (/api/ai/brainstorm)
✅ [PASS] AI: Board Summarizer (/api/ai/summarize)
✅ [PASS] AI: Diagram Explainer (/api/ai/explain)
✅ [PASS] Socket.IO: Live Reaction Broadcasting
✅ [PASS] Socket.IO: Live Drawing Synchronization
✅ [PASS] Socket.IO: Live Comments Synchronization

====================================================
📊 TEST SUITE SUMMARY: 14/14 TESTS PASSED (100%)
====================================================

🎉 ALL SYSTEM TESTS PASSED CLEANLY! CollabBoard AI is production-ready.
```

---

## 🚀 Production Deployment Guide

### Database Setup (MongoDB Atlas)
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. In **Database Access**, create a user with read/write privileges.
3. In **Network Access**, add `0.0.0.0/0` (allow connections from anywhere).
4. Copy the connection URI:
   `mongodb+srv://<username>:<password>@cluster.mongodb.net/collabboard?retryWrites=true&w=majority`

---

### Backend Deployment on Render
1. Push your repository to GitHub.
2. Log into [Render](https://render.com) and create a **New Web Service**.
3. Select your repository and configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. In **Environment Variables**, set:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `your_mongodb_atlas_uri`
   - `JWT_SECRET`: `your_random_secure_jwt_secret`
   - `CLIENT_URL`: `https://your-app.vercel.app`
   - `GEMINI_API_KEY`: *(optional)*
   - `OPENAI_API_KEY`: *(optional)*
5. Click **Create Web Service**. Note your public URL (e.g., `https://collabboard-api.onrender.com`).

---

### Frontend Deployment on Vercel
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the build settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, configure:
   - `VITE_API_URL`: `https://collabboard-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://collabboard-api.onrender.com`
5. Click **Deploy**. Your CollabBoard AI workspace is live!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Undo last canvas action |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo action |
| `Ctrl + C` / `Cmd + C` | Copy selected canvas elements |
| `Ctrl + V` / `Cmd + V` | Paste copied elements with offset |
| `Ctrl + D` / `Cmd + D` | Duplicate selected elements |
| `Delete` / `Backspace` | Delete selected elements |
| `Spacebar + Drag` | Pan across infinite canvas |
| `Mouse Wheel` | Zoom in / Zoom out |

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).
