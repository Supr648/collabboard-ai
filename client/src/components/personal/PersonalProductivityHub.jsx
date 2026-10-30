import React, { useState, useEffect } from 'react';
import {
  getPersonalPlanner,
  updateDailyTasks,
  updateWeeklyGoals,
  checkinHabit,
  generateAIGoalBreakdown,
} from '../../api/personal';
import Modal from '../common/Modal';
import {
  CalendarCheck,
  Target,
  Zap,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PersonalProductivityHub = () => {
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // AI Modal
  const [aiGoalModalOpen, setAiGoalModalOpen] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [aiBreakdownResult, setAiBreakdownResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadPlanner = async () => {
    try {
      setLoading(true);
      const res = await getPersonalPlanner();
      if (res.success && res.planner) {
        setPlanner(res.planner);
      }
    } catch (e) {
      console.warn('Failed to load personal planner:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner();
  }, []);

  // Daily Tasks
  const handleToggleTask = async (taskIndex) => {
    if (!planner || !planner.dailyTasks) return;
    const updated = [...planner.dailyTasks];
    updated[taskIndex].completed = !updated[taskIndex].completed;
    setPlanner((prev) => ({ ...prev, dailyTasks: updated }));
    if (updated[taskIndex].completed) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
    try {
      await updateDailyTasks(updated);
    } catch (e) {
      console.warn('Failed to save task update:', e.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
    };
    const updated = [...(planner?.dailyTasks || []), newTask];
    setPlanner((prev) => ({ ...prev, dailyTasks: updated }));
    setNewTaskText('');
    try {
      await updateDailyTasks(updated);
    } catch (e) {
      console.warn('Failed to save new task:', e.message);
    }
  };

  // Weekly Goals Subtask Toggle
  const handleToggleSubtask = async (goalIdx, subtaskIdx) => {
    if (!planner || !planner.weeklyGoals) return;
    const updatedGoals = [...planner.weeklyGoals];
    const sub = updatedGoals[goalIdx].subtasks[subtaskIdx];
    sub.done = !sub.done;

    // Auto mark goal complete if all subtasks are done
    const allDone = updatedGoals[goalIdx].subtasks.every((s) => s.done);
    updatedGoals[goalIdx].completed = allDone;

    setPlanner((prev) => ({ ...prev, weeklyGoals: updatedGoals }));
    try {
      await updateWeeklyGoals(updatedGoals);
    } catch (e) {
      console.warn('Failed to update goal subtask:', e.message);
    }
  };

  // Habit Check-in
  const handleHabitCheckin = async (habitIdx) => {
    try {
      const res = await checkinHabit(habitIdx);
      if (res.success && res.planner) {
        setPlanner(res.planner);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.warn('Failed to check in habit:', e.message);
    }
  };

  // AI Goal Breakdown
  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!aiGoalInput.trim()) return;
    try {
      setAiLoading(true);
      const res = await generateAIGoalBreakdown(aiGoalInput.trim());
      if (res.success && res.breakdown) {
        setAiBreakdownResult(res.breakdown);
      }
    } catch (e) {
      console.warn('Failed to generate goal breakdown:', e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAIGoal = async () => {
    if (!aiBreakdownResult) return;
    const newGoal = {
      title: aiBreakdownResult.title,
      targetDate: aiBreakdownResult.estimatedDuration || '2 Weeks',
      completed: false,
      subtasks: aiBreakdownResult.subtasks.map((s) => ({ text: s.text, done: false })),
    };
    const updated = [...(planner?.weeklyGoals || []), newGoal];
    setPlanner((prev) => ({ ...prev, weeklyGoals: updated }));
    setAiGoalModalOpen(false);
    setAiGoalInput('');
    setAiBreakdownResult(null);
    try {
      await updateWeeklyGoals(updated);
    } catch (e) {
      console.warn('Failed to save AI goal:', e.message);
    }
  };

  // Metrics
  const dailyTasks = planner?.dailyTasks || [];
  const completedTasks = dailyTasks.filter((t) => t.completed).length;
  const weeklyGoals = planner?.weeklyGoals || [];
  const completedGoals = weeklyGoals.filter((g) => g.completed).length;
  const habits = planner?.habits || [];
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {completedTasks}/{dailyTasks.length}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Daily Tasks Done
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {completedGoals}/{weeklyGoals.length}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Weekly Goals Hit
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {maxStreak} Days 🔥
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Best Habit Streak
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setAiBreakdownResult(null);
            setAiGoalModalOpen(true);
          }}
          className="p-4 rounded-3xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">AI Goal Architect</p>
            <p className="text-sm font-black mt-0.5">Breakdown Big Goals</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Daily Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Checklist */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Priority Agenda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Focus on high-leverage execution
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60">
                {dailyTasks.length} Planned
              </span>
            </div>

            {/* Add Task Input Form */}
            <form onSubmit={handleAddTask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a new priority task for today..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                type="submit"
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task Items */}
            <div className="space-y-2">
              {dailyTasks.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleTask(idx)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                    task.completed
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 opacity-70'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.text}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals with Subtasks */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Milestone Objectives
            </h3>

            <div className="space-y-3">
              {weeklyGoals.map((goal, gIdx) => {
                const subtasks = goal.subtasks || [];
                const doneSubs = subtasks.filter((s) => s.done).length;
                const pct = subtasks.length > 0 ? Math.round((doneSubs / subtasks.length) * 100) : 0;

                return (
                  <div
                    key={gIdx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {subtasks.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => handleToggleSubtask(gIdx, sIdx)}
                          className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white"
                        >
                          <input
                            type="checkbox"
                            checked={sub.done}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className={sub.done ? 'line-through opacity-60' : ''}>
                            {sub.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Habit Tracker */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Habit Streaks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click to log today's completion
              </p>
            </div>

            <div className="space-y-3">
              {habits.map((habit, hIdx) => {
                const checkedToday = (habit.history || []).includes(todayStr);

                return (
                  <div
                    key={hIdx}
                    onClick={() => handleHabitCheckin(hIdx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                      checkedToday
                        ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-400/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white/70 dark:bg-slate-900/70'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{habit.streak || 0} Day Streak</span>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                        checkedToday
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {checkedToday ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: AI Goal Breakdown */}
      <Modal
        isOpen={aiGoalModalOpen}
        onClose={() => setAiGoalModalOpen(false)}
        title="AI Goal Decomposition"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <form onSubmit={handleGenerateBreakdown} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Ambitious Goal Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Master React 19 Concurrent Rendering"
                value={aiGoalInput}
                onChange={(e) => setAiGoalInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{aiLoading ? 'Decomposing Goal...' : 'Decompose into Actionable Subtasks'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>

          {aiBreakdownResult && (
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {aiBreakdownResult.title}
                </p>
                <span className="text-[10px] text-pink-600 font-semibold">
                  Estimated Timeline: {aiBreakdownResult.estimatedDuration}
                </span>
              </div>

              <div className="space-y-1">
                {aiBreakdownResult.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{sub.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyAIGoal}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-sm mt-2"
              >
                Add Goal to My Weekly Planner
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PersonalProductivityHub;
