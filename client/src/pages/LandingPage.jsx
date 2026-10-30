import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createWhiteboard } from '../api/whiteboard';
import Navbar from '../components/common/Navbar';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Users2,
  Download,
  Share2,
  Shield,
  Layers,
  Pencil,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Interactive Mini Canvas in Hero
  const miniCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [miniColor, setMiniColor] = useState('#6366f1');

  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // Draw initial welcome artwork
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Welcome sketch
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Smile
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - 15, 25, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 15, canvas.height / 2 - 30, 4, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 15, canvas.height / 2 - 30, 4, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const handleMiniMouseDown = (e) => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = miniColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const handleMiniMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMiniMouseUp = () => {
    setIsDrawing(false);
  };

  const clearMiniCanvas = () => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleQuickStart = async () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Create guest room or navigate to register
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glowing aura effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-200 dark:border-indigo-900/60 shadow-sm text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-Time Collaborative Whiteboard • Miro & Excalidraw Inspired</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-900 dark:text-white leading-[1.12]">
          Brainstorm and draw together,{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            in real time.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          The ultimate collaborative canvas for engineering teams, agile sprints, system architecture,
          and visual wireframing with live multi-user cursors.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleQuickStart}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
          >
            {isAuthenticated ? 'My Whiteboards' : 'Sign In with Existing Account'}
          </Link>
        </div>

        {/* Interactive Hero Canvas Preview Mockup */}
        <div className="mt-14 w-full max-w-5xl rounded-3xl p-3 glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative group">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-[16/9] relative flex flex-col">
            {/* Mock Window Header */}
            <div className="h-10 px-4 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-semibold text-slate-500">Live Canvas Sandbox — Try Drawing Here!</span>
              </div>
              <div className="flex items-center gap-2">
                {['#6366f1', '#ec4899', '#10b981', '#f59e0b'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setMiniColor(c)}
                    className={`w-4 h-4 rounded-full border transition-transform ${
                      miniColor === c ? 'scale-125 border-white ring-2 ring-indigo-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  onClick={clearMiniCanvas}
                  className="ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 text-xs flex items-center gap-1"
                  title="Clear Sandbox"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Canvas Interactive Surface */}
            <div className="flex-1 relative cursor-crosshair canvas-grid-light dark:canvas-grid-dark">
              <canvas
                ref={miniCanvasRef}
                onMouseDown={handleMiniMouseDown}
                onMouseMove={handleMiniMouseMove}
                onMouseUp={handleMiniMouseUp}
                className="absolute inset-0 w-full h-full"
              />

              {/* Floating simulated collaborator badges */}
              <div className="absolute top-8 left-12 glass-panel px-2.5 py-1 rounded-full shadow-lg border border-indigo-400 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pointer-events-none animate-bounce">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Alex (Product Designer)</span>
              </div>
              <div className="absolute bottom-12 right-20 glass-panel px-2.5 py-1 rounded-full shadow-lg border border-pink-400 text-[11px] font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Sarah (Architect)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Everything you need for seamless collaboration
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Engineered with modern web standards for high performance, sub-50ms latency, and intuitive tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Sub-50ms Socket.IO Sync
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every stroke, shape, and text element synchronizes instantly across connected clients with room-based WebSocket channels.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Live Multi-User Cursors
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              See teammates’ mouse pointers moving smoothly in real-time, accompanied by their names, colors, and current active tools.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-pink-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Pencil className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              8 Professional Drawing Tools
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Smooth pen, precision eraser, straight lines, directional arrows, rectangles, circles, and inline typography.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Pan, Zoom & Infinite Canvas
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Effortlessly navigate large diagrams with smooth multi-touch wheel zooming (20% to 300%) and spacebar drag panning.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Retina PNG Export
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Download your boards as crystal-clear 2x high-resolution PNG images ready for documentation, Slack, or portfolio presentations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              JWT & MongoDB Atlas Cloud
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Encrypted password hashing with bcrypt, stateless JWT tokens, and persistent board saving with automatic recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Strip */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
            Architected With Modern Production-Grade Tech
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {['React 19', 'Vite', 'Tailwind CSS', 'HTML5 Canvas API', 'Node.js', 'Express', 'Socket.IO', 'MongoDB / Mongoose', 'JWT & Bcrypt'].map((tech) => (
              <span key={tech} className="px-3.5 py-1.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 CollabBoard • Real-Time Collaborative Whiteboard Architecture Portfolio Project</p>
      </footer>
    </div>
  );
};

export default LandingPage;
