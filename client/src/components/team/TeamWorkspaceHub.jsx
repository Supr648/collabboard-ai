import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProjects,
  createProject,
  createPoll,
  votePoll,
  createMeeting,
  generateAIProjectPlan,
} from '../../api/projects';
import Modal from '../common/Modal';
import {
  Kanban,
  Vote,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Check,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TeamWorkspaceHub = () => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'voting', 'meetings'

  // Modals
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [createPollModalOpen, setCreatePollModalOpen] = useState(false);
  const [createMeetingModalOpen, setCreateMeetingModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // New Poll Form State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // New Meeting Form State
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  const wsId = currentWorkspace?._id || currentWorkspace?.id || 'default_ws';

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects(wsId);
      if (res.success && res.projects) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.warn('Failed to load projects:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [wsId]);

  const handleVote = async (projectId, pollId, optionIndex) => {
    try {
      const res = await votePoll(projectId, pollId, optionIndex);
      if (res.success) {
        loadProjects();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.warn('Failed to cast vote:', e.message);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
    try {
      const primaryProj = projects[0];
      if (!primaryProj) return;
      const projId = primaryProj._id || primaryProj.id;
      await createPoll(projId, {
        question: pollQuestion.trim(),
        options: pollOptions.filter(o => o.trim()),
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      setCreatePollModalOpen(false);
      loadProjects();
    } catch (e) {
      console.warn('Failed to create poll:', e.message);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    try {
      const primaryProj = projects[0];
      if (!primaryProj) return;
      const projId = primaryProj._id || primaryProj.id;
      await createMeeting(projId, {
        title: meetingTitle.trim(),
        scheduledAt: meetingTime.trim(),
        agenda: meetingAgenda ? meetingAgenda.split('\n').filter(a => a.trim()) : [],
      });
      setMeetingTitle('');
      setMeetingTime('');
      setMeetingAgenda('');
      setCreateMeetingModalOpen(false);
      loadProjects();
    } catch (e) {
      console.warn('Failed to create meeting:', e.message);
    }
  };

  const handleGenerateAIPlan = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    try {
      setAiLoading(true);
      const res = await generateAIProjectPlan({
        prompt: aiPrompt.trim(),
        workspaceId: wsId,
      });
      if (res.success) {
        setAiPrompt('');
        setCreateProjectModalOpen(false);
        loadProjects();
      }
    } catch (e) {
      console.warn('Failed to generate AI plan:', e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Metric Computations
  let totalMilestones = 0;
  let completedMilestones = 0;
  let totalPolls = 0;
  let totalMeetings = 0;

  projects.forEach((p) => {
    (p.milestones || []).forEach((m) => {
      totalMilestones++;
      if (m.completed) completedMilestones++;
    });
    totalPolls += (p.polls || []).length;
    totalMeetings += (p.meetings || []).length;
  });

  const currentUserId = (user?._id || user?.id || '').toString();

  return (
    <div className="space-y-6">
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {projects.length}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Projects
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {completedMilestones}/{totalMilestones}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Milestones Achieved
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalPolls}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Decision Polls
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateProjectModalOpen(true)}
          className="p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">AI Project Architect</p>
            <p className="text-sm font-black mt-0.5">Generate Strategic Plan</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {[
            { id: 'projects', label: 'Projects & Milestones', icon: Kanban },
            { id: 'voting', label: 'Decision Polls & Voting', icon: Vote },
            { id: 'meetings', label: 'Smart Meetings & Notes', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'voting' && (
            <button
              onClick={() => setCreatePollModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Poll</span>
            </button>
          )}

          {activeTab === 'meetings' && (
            <button
              onClick={() => setCreateMeetingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab: Projects & Milestones */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((proj) => {
            const milestones = proj.milestones || [];
            const doneCount = milestones.filter(m => m.completed).length;
            const pct = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;

            return (
              <div
                key={proj._id || proj.id}
                className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {proj.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {milestones.length} Strategic Milestones
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {proj.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {pct}%
                    </span>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Sprint Progress
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Milestones List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        m.completed
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${m.completed ? 'text-emerald-600' : 'text-slate-400'}`}
                        />
                        <span className="truncate font-semibold">{m.title}</span>
                      </div>
                      {m.dueDate && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                          {m.dueDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Decision Polls & Voting */}
      {activeTab === 'voting' && (
        <div className="space-y-4">
          {projects.flatMap((p) => p.polls || []).map((poll) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || []).length, 0);

            return (
              <div
                key={poll._id || poll.id}
                className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {poll.question}
                  </h4>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60">
                    {totalVotes} Total Votes
                  </span>
                </div>

                <div className="space-y-2.5">
                  {poll.options.map((opt, optIdx) => {
                    const votesCount = (opt.votes || []).length;
                    const pct = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                    const hasVoted = (opt.votes || []).includes(currentUserId);
                    const primaryProj = projects[0];

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleVote(primaryProj._id || primaryProj.id, poll._id || poll.id, optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between text-xs sm:text-sm font-semibold ${
                          hasVoted
                            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/40'
                        }`}
                      >
                        {/* Vote percentage fill bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-purple-500/10 pointer-events-none transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />

                        <div className="relative z-10 flex items-center gap-2">
                          {hasVoted && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                          <span>{opt.text}</span>
                        </div>

                        <span className="relative z-10 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {votesCount} ({pct}%)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Smart Meetings & Notes */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {projects.flatMap((p) => p.meetings || []).map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {m.title}
                  </h4>
                  {m.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{m.scheduledAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {m.agenda && m.agenda.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Agenda
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    {m.agenda.map((ag, i) => (
                      <li key={i}>{ag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {m.decisions && m.decisions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
                  <p className="font-bold mb-1">Decisions Logged</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {m.decisions.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {m.actionItems && m.actionItems.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Action Items
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.actionItems.map((act, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">{act.task}</span>
                        {act.assignedTo && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 ml-2">
                            {act.assignedTo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: AI Project Plan Generator */}
      <Modal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        title="Generate AI Project Plan"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleGenerateAIPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Project Goal or Deliverable
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Real-Time Analytics Dashboard with Snowflake"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={aiLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{aiLoading ? 'Synthesizing Roadmap...' : 'Generate Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Poll */}
      <Modal
        isOpen={createPollModalOpen}
        onClose={() => setCreatePollModalOpen(false)}
        title="Create Team Decision Poll"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Poll Question
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which UI component library should we standardize on?"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Voting Options
            </label>
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const copy = [...pollOptions];
                  copy[i] = e.target.value;
                  setPollOptions(copy);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ))}
            <button
              type="button"
              onClick={() => setPollOptions((prev) => [...prev, ''])}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              + Add Option
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreatePollModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
            >
              Launch Poll
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Meeting */}
      <Modal
        isOpen={createMeetingModalOpen}
        onClose={() => setCreateMeetingModalOpen(false)}
        title="Schedule Smart Meeting"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Meeting Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Architecture RFC Review"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Scheduled Date & Time
            </label>
            <input
              type="text"
              placeholder="e.g. Thursday @ 11:00 AM UTC"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Agenda Items (One per line)
            </label>
            <textarea
              rows="3"
              placeholder="1. Review data schema&#10;2. Performance benchmarks&#10;3. Next sprint actions"
              value={meetingAgenda}
              onChange={(e) => setMeetingAgenda(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateMeetingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              Save Meeting
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamWorkspaceHub;
