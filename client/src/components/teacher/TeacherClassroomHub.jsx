import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getClassrooms,
  createClassroom,
  createAssignment,
  generateAITeachingMaterial,
} from '../../api/teacher';
import { createWhiteboard } from '../../api/whiteboard';
import Modal from '../common/Modal';
import {
  Compass,
  CheckSquare,
  Users,
  Award,
  Sparkles,
  Plus,
  BookOpen,
  Lock,
  ArrowRight,
  Eye,
} from 'lucide-react';

const TeacherClassroomHub = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classrooms'); // 'classrooms', 'assignments', 'submissions'

  // Modals
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [createAsgModalOpen, setCreateAsgModalOpen] = useState(false);
  const [aiMaterialModalOpen, setAiMaterialModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Forms
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [asgTitle, setAsgTitle] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgPoints, setAsgPoints] = useState('100');

  // AI Form
  const [aiTopic, setAiTopic] = useState('');
  const [aiMaterialResult, setAiMaterialResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const res = await getClassrooms();
      if (res.success && res.classrooms) {
        setClassrooms(res.classrooms);
        if (res.classrooms.length > 0) {
          setSelectedClassId(res.classrooms[0]._id || res.classrooms[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to load classrooms:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    try {
      await createClassroom({ name: className.trim(), subject: classSubject.trim() });
      setClassName('');
      setClassSubject('');
      setCreateClassModalOpen(false);
      loadClassrooms();
    } catch (e) {
      console.warn('Failed to create classroom:', e.message);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asgTitle.trim() || !selectedClassId) return;
    try {
      await createAssignment(selectedClassId, {
        title: asgTitle.trim(),
        instructions: asgInstructions.trim(),
        dueDate: asgDueDate.trim(),
        points: Number(asgPoints),
      });
      setAsgTitle('');
      setAsgInstructions('');
      setAsgDueDate('');
      setCreateAsgModalOpen(false);
      loadClassrooms();
    } catch (e) {
      console.warn('Failed to create assignment:', e.message);
    }
  };

  const handleGenerateAIMaterial = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    try {
      setAiLoading(true);
      const res = await generateAITeachingMaterial({ topic: aiTopic.trim() });
      if (res.success && res.material) {
        setAiMaterialResult(res.material);
      }
    } catch (e) {
      console.warn('Failed to generate teaching material:', e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateLessonBoard = async (topicTitle) => {
    try {
      const res = await createWhiteboard({
        title: `${topicTitle} – Interactive Lesson Board`,
      });
      if (res.success && res.whiteboard) {
        navigate(`/board/${res.whiteboard.roomId}`);
      }
    } catch (e) {
      console.warn('Failed to launch whiteboard:', e.message);
    }
  };

  // Metrics
  let totalStudents = 0;
  let totalAssignments = 0;
  let totalSubmissions = 0;

  classrooms.forEach((c) => {
    totalStudents += (c.students || []).length;
    totalAssignments += (c.assignments || []).length;
    totalSubmissions += (c.submissions || []).length;
  });

  return (
    <div className="space-y-6">
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {classrooms.length}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Virtual Classrooms
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalStudents}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Enrolled Students
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3.5 bg-white/50 dark:bg-slate-900/40">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {totalAssignments}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Assignments
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setAiMaterialResult(null);
            setAiMaterialModalOpen(true);
          }}
          className="p-4 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">AI Lesson Architect</p>
            <p className="text-sm font-black mt-0.5">Generate Lesson Material</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-4 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Student Privacy Barrier:</strong> Teachers can only view learning materials and whiteboards that students have explicitly submitted or shared with the classroom.
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {[
            { id: 'classrooms', label: 'Classrooms & Rosters', icon: Compass },
            { id: 'assignments', label: 'Assignments & Deadlines', icon: CheckSquare },
            { id: 'submissions', label: 'Student Submissions', icon: Award },
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
          {activeTab === 'classrooms' && (
            <button
              onClick={() => setCreateClassModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Classroom</span>
            </button>
          )}

          {activeTab === 'assignments' && (
            <button
              onClick={() => setCreateAsgModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab: Classrooms & Rosters */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          {classrooms.map((cls) => (
            <div
              key={cls._id || cls.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {cls.subject}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {cls.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleCreateLessonBoard(cls.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Lesson Board</span>
                </button>
              </div>

              {/* Enrolled Students Roster */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Enrolled Students ({(cls.students || []).length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(cls.students || []).map((st, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{st.name}</span>
                      <span className="text-[10px] text-slate-400">{st.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Assignments & Deadlines */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {classrooms.flatMap((c) => c.assignments || []).map((asg) => (
            <div
              key={asg._id || asg.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {asg.instructions}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {asg.points} Points
                  </span>
                  {asg.dueDate && (
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      Due: {asg.dueDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Student Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {classrooms.flatMap((c) => c.submissions || []).map((sub, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl glass-panel border border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3 shadow-sm"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {sub.studentName}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Submitted Board: <span className="font-mono">{sub.boardRoomId}</span>
                </p>
                {sub.feedback && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                    Feedback: {sub.feedback}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {sub.grade !== null && (
                  <span className="text-sm font-black text-emerald-600">
                    Grade: {sub.grade}/100
                  </span>
                )}
                <button
                  onClick={() => navigate(`/board/${sub.boardRoomId}?role=viewer`)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Submission</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Classroom */}
      <Modal
        isOpen={createClassModalOpen}
        onClose={() => setCreateClassModalOpen(false)}
        title="Create Virtual Classroom"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateClassroom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Classroom Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CS 240: Distributed Systems"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science, Physics, Calculus"
              value={classSubject}
              onChange={(e) => setClassSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateClassModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Create Classroom
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Assignment */}
      <Modal
        isOpen={createAsgModalOpen}
        onClose={() => setCreateAsgModalOpen(false)}
        title="Distribute New Assignment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Assignment Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lab 3: Sharded Database Topology"
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Instructions
            </label>
            <textarea
              rows="3"
              placeholder="Describe requirements and canvas elements students should produce..."
              value={asgInstructions}
              onChange={(e) => setAsgInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                placeholder="e.g. Dec 10 @ 23:59"
                value={asgDueDate}
                onChange={(e) => setAsgDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Points
              </label>
              <input
                type="number"
                value={asgPoints}
                onChange={(e) => setAsgPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateAsgModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              Distribute
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: AI Teaching Material Generator */}
      <Modal
        isOpen={aiMaterialModalOpen}
        onClose={() => setAiMaterialModalOpen(false)}
        title="AI Lesson Architect"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleGenerateAIMaterial} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Curriculum Topic
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Event-Driven Architecture with Kafka"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{aiLoading ? 'Synthesizing Lesson Plan...' : 'Synthesize Curriculum Material'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>

          {aiMaterialResult && (
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 dark:text-white">
                {aiMaterialResult.title}
              </h5>

              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Practice Questions:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  {aiMaterialResult.practiceQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suggested Collaborative Activities:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  {aiMaterialResult.suggestedActivities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TeacherClassroomHub;
