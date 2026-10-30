# 🚀 CollabBoard AI – Intelligent Real-Time Collaborative SaaS Platform
> "Think Together. Create Together. Build Together."

![CollabBoard AI](https://img.shields.io/badge/CollabBoard%20AI-v2.0.0-6366f1.svg?style=for-the-badge&logo=probot)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg?style=for-the-badge&logo=react)
![Vite 6](https://img.shields.io/badge/Vite-6+-646cff.svg?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?style=for-the-badge&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-v20+-339933.svg?style=for-the-badge&logo=nodedotjs)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-010101.svg?style=for-the-badge&logo=socketdotio)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-47a248.svg?style=for-the-badge&logo=mongodb)
![AI Engine](https://img.shields.io/badge/AI%20Copilot-Gemini%20%7C%20OpenAI%20%7C%20Semantic-ff69b4.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg?style=for-the-badge)

---

## 📖 Executive Summary

**CollabBoard AI** is a commercial-grade, real-time collaborative whiteboard platform built for cross-functional engineering, architecture, and product management teams. Inspired by Figma, Miro, and Excalidraw, CollabBoard AI pairs ultra-smooth 60fps HTML5 Canvas interactions with native **generative AI capabilities**—allowing teams to brainstorm, draft cloud architectures, generate decision flowcharts, parse product requirement documents (PRDs), and track Kanban tasks on a single boundless surface.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js/Express**, **Socket.IO v4**, and **MongoDB Mongoose 8**, the application runs with sub-50ms synchronization latency, automated version checkpoint recovery, resilient offline-first storage fallback, and complete production container/cloud configurations for **Vercel**, **Render**, and **MongoDB Atlas**.

---

## 📑 Table of Contents

1. [System Architecture](#-system-architecture)
2. [Data-Flow & Real-Time Sync Sequences](#-data-flow--real-time-sync-sequences)
3. [Core Feature Matrix](#-core-feature-matrix)
4. [AI Copilot & Generative Suite](#-ai-copilot--generative-suite)
5. [Real-Time Collaboration Protocol](#-real-time-collaboration-protocol)
6. [Security, Rate Limiting & Health Monitoring](#-security-rate-limiting--health-monitoring)
7. [Directory Structure](#-directory-structure)
8. [Environment Variables Reference](#-environment-variables-reference)
9. [Local Development Setup](#-local-development-setup)
10. [Automated Verification & Test Suites](#-automated-verification--test-suites)
11. [Production Deployment Guide](#-production-deployment-guide)
    - [MongoDB Atlas Setup](#1-mongodb-atlas-setup)
    - [Backend Deployment on Render](#2-backend-deployment-on-render)
    - [Frontend Deployment on Vercel](#3-frontend-deployment-on-vercel)
12. [Professional Demonstration Script](#-professional-demonstration-script)
13. [Keyboard Shortcuts](#-keyboard-shortcuts)
14. [License](#-license)

---

## 🏛 System Architecture

CollabBoard AI is engineered with a decoupled, high-throughput microservice-ready topology.

```mermaid
graph TD
    subgraph Client["Frontend Client (Vercel)"]
        UI["React 19 SPA + Framer Motion"]
        Canvas["HTML5 Canvas Engine (60 FPS)"]
        SocketClient["Socket.IO Client (Auto Reconnect)"]
        Axios["Axios REST Client (JWT Interceptor)"]
    end

    subgraph CDN["Edge & Static Delivery"]
        VercelEdge["Vercel Global CDN (Gzip / Brotli)"]
        SPA["SPA Rewrites & Asset Caching"]
    end

    subgraph API["Backend API Service (Render)"]
        Express["Express.js HTTP Gateway"]
        Security["Security Headers + Rate Limiters"]
        Health["/api/health Health Check & Metrics"]
        AuthModule["JWT Auth (Bcrypt.js Salts)"]
        WhiteboardModule["Whiteboard & Version Manager"]
        TaskModule["Board Kanban Task Controller"]
        AIService["AI Engine (Gemini / OpenAI / Semantic Synthesizer)"]
        SocketServer["Socket.IO Server (Room Multiplexing)"]
    end

    subgraph Persistence["Storage & Database Layer"]
        Atlas[("MongoDB Atlas Cloud Cluster")]
        MemoryFallback[("Resilient Local JSON Fallback Store")]
    end

    Client -->|HTTPS Requests| Express
    Client <==>|WSS Bi-Directional Stream| SocketServer
    Express --> Security
    Security --> AuthModule
    Security --> WhiteboardModule
    Security --> TaskModule
    Security --> AIService
    Express --> Health

    WhiteboardModule --> Atlas
    WhiteboardModule -.->|Offline Fallback| MemoryFallback
    AuthModule --> Atlas
    AuthModule -.->|Offline Fallback| MemoryFallback
    TaskModule --> Atlas
    TaskModule -.->|Offline Fallback| MemoryFallback
```

---

## 🔄 Data-Flow & Real-Time Sync Sequences

### Real-Time Dual-User Collaborative Canvas Flow
```mermaid
sequenceDiagram
    autonumber
    actor Alice as User A (Alice - Editor)
    participant ClientA as Alice's Browser
    participant Gateway as Express / Socket.IO
    participant ClientB as Bob's Browser
    actor Bob as User B (Bob - Viewer/Editor)

    Note over Alice,Bob: Room Connection & Discovery
    Alice->>ClientA: Navigates to /board/:roomId
    ClientA->>Gateway: REST GET /api/whiteboards/room/:roomId
    Gateway-->>ClientA: Returns Board State & Version History
    ClientA->>Gateway: Socket.IO emit 'join-room' {roomId, user}
    Gateway-->>ClientA: emit 'room-users' (Active Collaborators)
    Gateway-->>ClientB: emit 'user-joined' (Alice joined)

    Note over Alice,Bob: Live Real-Time Collaboration
    Alice->>ClientA: Draws pen stroke on canvas
    ClientA->>Gateway: emit 'draw-stroke' (x, y points stream)
    Gateway-->>ClientB: broadcast 'remote-stroke' (Smooth Bezier)
    Alice->>ClientA: Mouse movement across infinite viewport
    ClientA->>Gateway: emit 'cursor-move' {x, y, activeTool, name}
    Gateway-->>ClientB: broadcast 'remote-cursor' (Smooth lerp cursor)

    Note over Alice,Bob: AI Synthesis & Canvas Delta
    Alice->>ClientA: AI: "Generate Microservices Cloud Architecture"
    ClientA->>Gateway: POST /api/ai/diagram {prompt}
    Gateway-->>ClientA: Returns 11 Connected Canvas Primitives
    ClientA->>Gateway: emit 'element-add' (Elements array)
    Gateway-->>ClientB: broadcast 'remote-element-add'
    ClientA->>Gateway: Auto-save debounce (PUT /api/whiteboards/room/:roomId)
    Gateway->>Gateway: Update MongoDB & create version snapshot
```

---

## 🌟 Core Feature Matrix

| Functional Module | Detailed Capabilities | Production Status |
| :--- | :--- | :--- |
| **Canvas Drawing Engine** | Freehand pen with smooth Bezier curves, highlighter with translucent blending, eraser, straight lines, bi-directional arrows, rounded rectangles, ellipses, triangles, and sticky notes. | ✅ Production Ready |
| **Rich Typography** | Canvas text tool with inline editing, dynamic font families (sans, serif, mono), font scaling, and alignment. | ✅ Production Ready |
| **Object Manipulation** | 4-corner multi-directional resize bounding boxes, drag-and-drop movement, marquee multi-selection, z-index management (`bring to front`, `send to back`), element locking, and grouping. | ✅ Production Ready |
| **Clipboard & History** | Deep Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`), Copy (`Ctrl+C`), Paste (`Ctrl+V`) with positional offsetting, Duplicate (`Ctrl+D`), and Delete (`Del`). | ✅ Production Ready |
| **Infinite Navigation** | Coordinate panning via Spacebar+drag or middle-click, smooth zoom from 20% to 300%, snap-to-grid toggle, and bird's-eye minimap with draggable viewport indicator. | ✅ Production Ready |
| **Live Collaboration** | Colored multi-client live cursor tracking with name badges and active tool indicators, instant stroke broadcasting, participant roster stack. | ✅ Production Ready |
| **Interactive Reactions** | Floating animated emoji reactions (`👍`, `❤️`, `🚀`, `🔥`, `💡`, `🎉`) rendered directly over collaborators' coordinates. | ✅ Production Ready |
| **Presentation Mode** | Distraction-free full-screen presentation mode with synchronized laser pointer broadcasting (`emitLaserPointer`) and slide navigation. | ✅ Production Ready |
| **Threaded Comments** | Pinned canvas comment markers with collaborative thread replies, resolve status, and deletion. | ✅ Production Ready |
| **Kanban Task Board** | In-canvas project management drawer with Backlog, In Progress, In Review, and Done swimlanes linked to the current room. | ✅ Production Ready |
| **Multi-Format Export** | High-DPI Retina PNG (2x), scalable vector SVG, and multi-page printable PDF generation powered by `jspdf`. | ✅ Production Ready |
| **Version Snapshots** | Automated debounced auto-save, explicit snapshot checkpoints with timestamped recovery and rollback. | ✅ Production Ready |

---

## 🧠 AI Copilot & Generative Suite

CollabBoard AI includes an intelligent multi-provider generative pipeline that connects to **Google Gemini**, **OpenAI**, or runs with our built-in **Deterministic Semantic Architecture Synthesizer** (allowing 100% functionality even without third-party API keys).

| Endpoint | Method | Input | Output Generated on Canvas |
| :--- | :--- | :--- | :--- |
| `/api/ai/diagram` | `POST` | Natural language prompt (e.g. "AWS Serverless E-Commerce") | Cohesive cloud architecture diagram with clients, API gateways, microservices, databases, and directional connectors. |
| `/api/ai/flowchart` | `POST` | Business process description (e.g. "User Onboarding & KYC") | Decision flowcharts with start nodes, process blocks, conditional decision diamonds, and labeled branches. |
| `/api/ai/mindmap` | `POST` | Central topic query (e.g. "Product Growth Strategy") | Radial mind map radiating outward across 4 hierarchical pillars with child sub-nodes. |
| `/api/ai/brainstorm` | `POST` | Brainstorming prompt | Categorized, color-coded sticky note clusters (Strengths, Opportunities, Risks, Innovations). |
| `/api/ai/summarize` | `POST` | Canvas element collection | Structured executive markdown summary and key takeaway breakdown. |
| `/api/ai/explain` | `POST` | Board diagram elements | Narrative architectural walkthrough explaining components, dependencies, and data flows. |
| `/api/ai/command` | `POST` | Natural language edit instruction (e.g. "turn all cards emerald green") | Semantic element updates directly applied to selected canvas objects. |
| `/api/ai/document-intelligence` | `POST` | Unstructured PRD text or release notes | Automatic parsing and extraction of functional requirements into Kanban sticky cards. |
| `/api/ai/critique` | `POST` | Board elements array | Layout Doctor audit analyzing element density, alignment, contrast, and cognitive load score. |

---

## 🔒 Security, Rate Limiting & Health Monitoring

### Enterprise Security Safeguards
1. **Security Headers**: Injected on every HTTP response:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
2. **Dual-Tier Rate Limiting**:
   - General API Limiter: 1,000 requests per 15-minute window per IP.
   - Strict Auth Limiter: 100 login/register attempts per 15-minute window to thwart credential stuffing.
3. **Payload Sanitization**: Strict input validation using Bcrypt.js password hashing (10 salt rounds) and JWT verification tokens.
4. **Structured HTTP Logging**: Production-grade latency and error telemetry logging client IP, method, status code, and duration in milliseconds.

### Production Health Check Endpoint (`GET /api/health`)
Provides real-time diagnostics for load balancers and orchestrators:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-10-30T16:54:35.264Z",
  "service": "CollabBoard AI Production API",
  "version": "2.0.0",
  "environment": "production",
  "uptime": {
    "seconds": 3840,
    "formatted": "1h 4m 0s"
  },
  "database": {
    "connected": true,
    "mode": "MongoDB Atlas Cluster",
    "status": "operational"
  },
  "realtime": {
    "engine": "Socket.IO v4",
    "activeSockets": 12,
    "status": "listening"
  },
  "system": {
    "nodeVersion": "v20.18.0",
    "platform": "linux",
    "memory": {
      "heapUsedMB": 24.12,
      "heapTotalMB": 32.55,
      "rssMB": 82.41
    }
  }
}
```

---

## 📁 Directory Structure

```text
collaborative-whiteboard/
├── render.yaml                    # Render Infrastructure as Code (Blueprint)
├── README.md                      # Complete SaaS Architecture & Deployment Manual
├── package.json                   # Root workspace scripts
│
├── client/                        # React 19 + Vite Frontend SPA
│   ├── .env.example               # Frontend environment template
│   ├── .env.production            # Production Vercel environment presets
│   ├── vercel.json                # Vercel SPA routing and caching rules
│   ├── vite.config.js             # Vite 6 config with vendor chunking
│   ├── index.html                 # HTML5 viewport entrypoint
│   └── src/
│       ├── api/                   # Axios API client & endpoints
│       ├── components/
│       │   ├── canvas/            # Canvas.jsx (60fps rendering layer)
│       │   ├── common/            # Modal, Toast, LoadingScreen, ShortcutsModal
│       │   ├── dashboard/         # BoardCard, TemplatesModal, TagFilter
│       │   └── whiteboard/        # Toolbar, PropertiesBar, MiniMap, RemoteCursors,
│       │                          # TasksModal, CommentsOverlay, AiCopilotDrawer
│       ├── context/               # AuthContext.jsx & ThemeContext.jsx
│       ├── hooks/                 # useCollaboration.js (Socket.IO lifecycle)
│       ├── pages/                 # LandingPage, LoginPage, DashboardPage, WhiteboardPage
│       └── utils/                 # canvasUtils.js, exportUtils.js, math.js
│
└── server/                        # Node.js + Express + Socket.IO Backend
    ├── .env.example               # Backend environment template
    ├── package.json               # Backend dependencies & test scripts
    ├── test_full_suite.js         # 24-point E2E automated test runner
    ├── test_qa_audit.js           # 36-point deep functionality audit suite
    └── src/
        ├── config/                # db.js (MongoDB) & memoryStore.js (Resilient Fallback)
        ├── controllers/           # authController, whiteboardController, aiController, taskController
        ├── middleware/            # authMiddleware.js, errorHandler.js
        ├── models/                # User.js, Whiteboard.js, Task.js
        ├── routes/                # authRoutes, whiteboardRoutes, aiRoutes, taskRoutes
        ├── sockets/               # socketHandler.js (Real-time room broadcasting)
        └── server.js              # Express app bootstrap & HTTP/WS server
```

---

## ⚙️ Environment Variables Reference

### Client Configuration (`client/.env`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for REST API endpoints | `https://collabboard-api.onrender.com/api` |
| `VITE_SOCKET_URL` | WebSocket URL for real-time Socket.IO | `https://collabboard-api.onrender.com` |

### Server Configuration (`server/.env`)
| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Local or production port | `5000` |
| `NODE_ENV` | Runtime environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://admin:pass@cluster.mongodb.net/whiteboard` |
| `JWT_SECRET` | Secret token signing key | `secure_random_64_character_hex_string` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://collabboard-ai.vercel.app` |
| `GEMINI_API_KEY`| *(Optional)* Google Gemini API Key | `AIzaSy...` |
| `OPENAI_API_KEY`| *(Optional)* OpenAI API Key | `sk-proj-...` |

---

## 🛠 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/your-username/collabboard-ai.git
cd collabboard-ai

# 2. Install all dependencies
npm run install-all

# 3. Start both Client & Server concurrently
npm run dev
```

The application will be live at:
- **Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Verification & Test Suites

The codebase includes two automated E2E test suites with zero external test runner dependencies.

### 1. Comprehensive System Suite (24/24 Passed)
```bash
cd server
npm test
```
Tests: Authentication, CRUD boards, duplication, 9 AI endpoints, Kanban tasks, and Socket.IO real-time channels.

### 2. Deep QA Audit & Concurrency Suite (36/36 Passed)
```bash
cd server
node test_qa_audit.js
```
Tests:
- Rate limiting and input validation
- Dual-user concurrent drawing without race conditions
- Live cursor position interpolation
- Pinned comment broadcasting
- Version snapshot checkpoints & rollback
- Multi-collaborator simultaneous object movement

---

## 🚀 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an **M0 Free Cluster**.
2. Under **Database Access**, create a database user (e.g. `collab_admin`) with password.
3. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
4. In **Clusters** → **Connect** → **Drivers**, copy the connection string:
   ```env
   MONGODB_URI=mongodb+srv://collab_admin:<password>@cluster0.abcde.mongodb.net/collabboard?retryWrites=true&w=majority
   ```

### 2. Backend Deployment on Render
1. Sign in to [Render](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Specify the service settings:
   - **Name**: `collabboard-ai-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Health Check Path**: `/api/health`
4. Add the Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: *(Generate a secure 64-char key)*
   - `MONGODB_URI`: *(Your MongoDB Atlas URI)*
   - `CLIENT_URL`: `https://your-collabboard.vercel.app`
5. Click **Create Web Service**. Your public URL will be `https://collabboard-ai-api.onrender.com`.

### 3. Frontend Deployment on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the Environment Variables:
   - `VITE_API_URL`: `https://collabboard-ai-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://collabboard-ai-api.onrender.com`
5. Click **Deploy**. Vercel will build and distribute the production bundle globally.

---

## 🎬 Professional Demonstration Script

*Use this script for product showcases, client demos, or technical portfolio presentations.*

| Time | Scene | Demonstration Actions | Key Technical Narrative |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | **Executive Intro & Landing** | Open Landing page. Showcase ambient dark/light mode toggle, dynamic hero gradients, feature carousel, and animated CTA. | *"CollabBoard AI is a production SaaS platform designed for cross-functional engineering teams. It unites real-time vector graphics with deep AI automation."* |
| **0:45 - 1:30** | **Authentication & Dashboard** | Log in as demo user. Show dashboard with workspace statistics, favorite filter, search filter (`Ctrl+K`), and template gallery. | *"Protected routes verify JWT credentials. Whiteboards persist to MongoDB Atlas with an automatic offline-resilient local cache fallback."* |
| **1:30 - 2:45** | **The 60FPS Canvas Engine** | Open a blank board. Demonstrate freehand drawing, geometric shapes, sticky notes, color palettes, and marquee multi-selection. | *"Built on an optimized HTML5 Canvas render loop supporting smooth Bezier interpolation, infinite pan-and-zoom from 20% to 300%, and an interactive bird's-eye minimap."* |
| **2:45 - 4:00** | **Real-Time Collaboration** | Open a second incognito browser window. Join the same room. Move cursors simultaneously. Send live emoji reactions (`🚀`, `🔥`). | *"Socket.IO room multiplexing synchronizes cursor coordinates and pen strokes with sub-50ms latency. No race conditions, zero data loss."* |
| **4:00 - 5:15** | **AI Copilot in Action** | Click **AI Copilot**. Enter prompt: *"Design a resilient Fintech Payment Processing Architecture"*. Watch 11 connected cloud primitives populate the canvas instantly. | *"The generative engine structures architectural components into exact coordinate topologies, creating editable canvas objects instead of static images."* |
| **5:15 - 6:00** | **Task Management & Export** | Open the Kanban drawer, drag a task from 'In Progress' to 'Done'. Click **Export** → **Export as PDF**. | *"Teams can manage execution directly on the canvas and export high-res vector assets for executive reviews."* |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Function | Context |
| :--- | :--- | :--- |
| `V` / `Escape` | Selection Tool | Canvas |
| `P` | Freehand Pen | Canvas |
| `H` | Translucent Highlighter | Canvas |
| `E` | Eraser Tool | Canvas |
| `R` | Rectangle Shape | Canvas |
| `O` | Ellipse / Circle Shape | Canvas |
| `S` | Sticky Note Tool | Canvas |
| `T` | Rich Text Block | Canvas |
| `Ctrl + Z` | Undo Canvas Action | Universal |
| `Ctrl + Y` | Redo Canvas Action | Universal |
| `Ctrl + C` | Copy Selected Objects | Selection |
| `Ctrl + V` | Paste Copied Objects | Selection |
| `Ctrl + D` | Duplicate Objects | Selection |
| `Delete` / `Backspace` | Delete Selected Objects | Selection |
| `Spacebar + Drag` | Pan Viewport | Canvas |
| `Ctrl + K` | Global Command Palette | Dashboard / Canvas |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
