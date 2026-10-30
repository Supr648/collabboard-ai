import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Shield,
  Layers,
  Users,
  BrainCircuit,
  Server,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const AuthShowcase = ({ title = 'One workspace. Unlimited possibilities.', subtitle }) => {
  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-950 text-white select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white/90">
            CollabBoard <span className="text-indigo-400 font-mono text-xs">AI</span>
          </span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-indigo-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Engine Active</span>
        </div>
      </div>

      {/* Interactive Visual Canvas Showcase */}
      <div className="relative z-10 my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative max-w-lg mx-auto rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl shadow-indigo-950/80"
        >
          {/* Canvas Window Chrome */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-300">
                system-architecture-v2.canvas
              </span>
            </div>

            {/* Active Collaborator Avatars */}
            <div className="flex items-center -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 border border-slate-900 flex items-center justify-center text-[10px] font-bold">
                A
              </div>
              <div className="w-6 h-6 rounded-full bg-pink-500 border border-slate-900 flex items-center justify-center text-[10px] font-bold">
                S
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[10px] font-bold">
                D
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-400">
                +4
              </div>
            </div>
          </div>

          {/* Canvas Elements Grid Mockup */}
          <div className="space-y-4">
            {/* Diagram Architecture Flow */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white">Next.js Client</p>
                <p className="text-[9px] text-slate-400">Web / Mobile</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="w-7 h-7 mx-auto rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-indigo-300">API Gateway</p>
                <p className="text-[9px] text-slate-400">Auth & Limits</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-emerald-300">Microservices</p>
                <p className="text-[9px] text-slate-400">Socket & AI</p>
              </div>
            </div>

            {/* Floating Live Cursors (Simulated with Framer Motion) */}
            <motion.div
              animate={{
                x: [0, 18, -10, 0],
                y: [0, -12, 8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-3 right-12 pointer-events-none z-30"
            >
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-pink-400 drop-shadow-md transform -rotate-45"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
                </svg>
                <span className="px-2 py-0.5 rounded-md bg-pink-500/90 text-[10px] font-bold text-white shadow-md">
                  Sarah (Product Lead)
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{
                x: [0, -15, 12, 0],
                y: [0, 10, -8, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-4 left-8 pointer-events-none z-30"
            >
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-indigo-400 drop-shadow-md transform -rotate-45"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
                </svg>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 text-[10px] font-bold text-white shadow-md">
                  Alex (Architect)
                </span>
              </div>
            </motion.div>

            {/* Floating Sticky Note */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs shadow-md"
            >
              <p className="font-bold flex items-center gap-1.5 mb-1 text-[11px] text-amber-300">
                <span>💡 Sprint 4 Deliverable</span>
              </p>
              <p className="text-[10px] text-amber-200/90 leading-relaxed">
                Connect live decision polls to team Kanban roadmap. Verify zero race conditions!
              </p>
            </motion.div>

            {/* AI Assistant Output Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-400/25 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-200">CollabBoard AI Copilot</span>
                  <span className="text-[9px] text-indigo-400 font-mono">Synthesized</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">
                  "Auto-generated 4-phase development plan & interactive mind map from your study notes."
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Showcase Footer */}
      <div className="relative z-10 pt-4 border-t border-white/10">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md leading-relaxed">
          {subtitle ||
            'Bring Ideas Together. Build Something Amazing. From student learning decks to enterprise Kanban sprints.'}
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {['Multi-Tenant Workspaces', 'Live Decision Polls', 'AI Diagram Synthesis', 'Spaced Repetition'].map(
            (badge) => (
              <span
                key={badge}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300"
              >
                {badge}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
