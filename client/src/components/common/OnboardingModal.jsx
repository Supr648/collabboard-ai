import React, { useState } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Users,
  CheckSquare,
  Bot,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to CollabBoard AI',
    subtitle: 'Think Together. Create Together. Build Together.',
    badge: 'Overview',
    icon: Sparkles,
    color: 'from-indigo-600 to-purple-600',
    description:
      'CollabBoard AI combines the freedom of an infinite vector canvas, real-time multi-user synchronization, and state-of-the-art AI intelligence to accelerate team collaboration.',
    highlights: [
      'Infinite vector canvas with 60FPS pan and zoom',
      'Magnetic connectors that automatically snap to shapes',
      'Multi-selection, grouping, lock protection, and layering',
    ],
  },
  {
    title: 'AI Copilot & Natural Language Commands',
    subtitle: 'Synthesize complex visual assets in seconds',
    badge: 'AI Studio',
    icon: Bot,
    color: 'from-purple-600 to-pink-600',
    description:
      'Open the AI Copilot drawer or AI Studio to generate complete system architecture diagrams, procedural flowcharts, radial mind maps, or execute plain English canvas instructions.',
    highlights: [
      'Text-to-Diagram & Text-to-Flowchart generation',
      'Radial hierarchical mind map generation',
      'Plain English canvas commands: "align sticky notes", "add API Gateway"',
    ],
  },
  {
    title: 'Live Collaboration & Laser Pointer',
    subtitle: 'Work together like you are in the same room',
    badge: 'Real-Time',
    icon: Users,
    color: 'from-pink-600 to-rose-600',
    description:
      'Collaborate live with multi-cursor presence, pinned canvas comment threads, instant emoji reactions, and live laser pointer trails.',
    highlights: [
      'User presence and custom collaborator cursor colors',
      'Interactive laser pointer trail with instant broadcast',
      'Synchronized presentation mode with presenter view control',
    ],
  },
  {
    title: 'Integrated Project Management',
    subtitle: 'Turn brainstorms into actionable deliverables',
    badge: 'Productivity',
    icon: CheckSquare,
    color: 'from-emerald-600 to-teal-600',
    description:
      'Transform whiteboard sticky notes into Kanban tasks with one click. Manage priorities, track due dates, and shift tasks across Backlog, In Progress, In Review, and Done.',
    highlights: [
      '4-column Kanban board built into every whiteboard',
      'Right-click any sticky note or shape to convert to a task',
      'Real-time task synchronization across all team members',
    ],
  },
];

const OnboardingModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('collabboard_onboarded', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CollabBoard AI Tour" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Step indicator pills */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, idx) => (
            <div
              key={s.title}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  : idx < currentStep
                  ? 'bg-indigo-400 dark:bg-indigo-700'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl bg-gradient-to-tr ${step.color} text-white shadow-lg shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  {step.badge} • Step {currentStep + 1} of {STEPS.length}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {step.description}
            </p>

            <div className="glass-panel p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              {step.highlights.map((h) => (
                <div key={h} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.setItem('collabboard_onboarded', 'true');
                onClose();
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>{currentStep === STEPS.length - 1 ? 'Start Creating' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
