import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import PageTransition from '../components/common/PageTransition';
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
  BrainCircuit,
  GitFork,
  MessageSquare,
  FileText,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Interactive Mini Sandbox Canvas in Hero
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

    // Cloud node
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 50, 240, 70);
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('⚡ CollabBoard AI Sandbox', canvas.width / 2 - 95, canvas.height / 2 - 10);
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

  const handleQuickStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Navbar />

      {/* Hero Section */}
      <section className="relative pt-14 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glowing aura effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/25 to-pink-500/15 blur-[130px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-200 dark:border-indigo-900/60 shadow-sm text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>CollabBoard AI • Intelligent Real-Time Collaborative Workspace</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-900 dark:text-white leading-[1.12]">
          Intelligent Canvas for Teams,{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Powered by AI.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          The next-generation collaborative workspace uniting Miro's visual freedom with AI diagram generation,
          decision flowcharts, sticky note brainstorming, and live multi-user cursors.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleQuickStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{isAuthenticated ? 'Open Workspace Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
          >
            {isAuthenticated ? 'View My Whiteboards' : 'Sign In with Demo Account'}
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
                <span className="ml-2 text-xs font-semibold text-slate-500">Live Canvas Sandbox — Draw Here!</span>
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
              <div className="absolute top-8 left-12 glass-panel px-3 py-1 rounded-full shadow-lg border border-indigo-400 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pointer-events-none animate-bounce">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Alex (Cloud Architect)</span>
              </div>
              <div className="absolute bottom-12 right-20 glass-panel px-3 py-1 rounded-full shadow-lg border border-pink-400 text-[11px] font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>CollabBoard AI (Synthesizing Diagram...)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Superpowers Showcase Grid */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI-Driven Collaborative Acceleration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Transform ideas into production diagrams in seconds
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            No blank page syndrome. Generate architectures, workflows, and sticky note ideas with structured AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              AI Architecture Generator
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe your tech stack in natural language. CollabBoard AI synthesizes clients, gateways, microservices, and databases into editable vector canvas elements.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              AI Flowchart Synthesis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Converts complex multi-branch business logic and customer onboarding journeys into decision diamonds, process blocks, and labeled connectors.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-pink-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Live Multi-User Cursors
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience seamless sub-50ms Socket.IO synchronization. Watch peers' pointers glide across the board with author name tags, avatar colors, and tools.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Minimap & Infinite Canvas
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Navigate large systems with bird's-eye minimap tracking, smooth multi-touch wheel zooming (20% to 300%), snap-to-grid alignment, and fit-to-screen centering.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              PNG, SVG & PDF Exports
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Export to 2x retina PNG images, resolution-independent vector SVG graphics, or formatted PDF documents ready for documentation and stakeholder presentations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition-all hover:shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Comments & Live Reactions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Drop pinned threaded discussion markers at exact coordinates and fire real-time floating emojis (👍, ❤️, 🚀, 🔥) across teammates' screens.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 CollabBoard AI • The Intelligent Collaborative Workspace for Teams, Creators & Educators. All rights reserved.</p>
      </footer>
    </div>
  </PageTransition>
  );
};

export default LandingPage;
