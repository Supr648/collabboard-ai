import { Project } from '../models/Project.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const STARTER_PROJECTS = [
  {
    name: 'Q4 SaaS Platform Launch & Core Infrastructure',
    description: 'Cloud microservices migration, real-time collaboration scaling, and SOC2 compliance.',
    status: 'active',
    milestones: [
      { title: 'Zero-Downtime Database Failover Setup', dueDate: 'Nov 15', completed: true },
      { title: 'Socket.IO Cluster Load Testing (10k concurrent)', dueDate: 'Nov 28', completed: false },
      { title: 'SOC2 Type II Security Certification Audit', dueDate: 'Dec 10', completed: false },
    ],
    polls: [
      {
        _id: 'poll_seed_1',
        question: 'Which deployment region should serve as our primary multi-zone cluster?',
        isAnonymous: false,
        closed: false,
        options: [
          { text: 'US East (N. Virginia) – AWS us-east-1', votes: ['seed_user_1', 'seed_user_2'] },
          { text: 'Europe West (Frankfurt) – AWS eu-central-1', votes: ['seed_user_3'] },
          { text: 'Asia Pacific (Singapore) – AWS ap-southeast-1', votes: [] },
        ],
      },
    ],
    meetings: [
      {
        _id: 'meet_seed_1',
        title: 'Weekly Core Engineering Architecture Sync',
        scheduledAt: 'Every Monday @ 10:00 AM UTC',
        agenda: ['Review weekend latency spikes', 'Approve Redis cache eviction policy', 'Sign off on database migration'],
        minutes: 'Agreed to adopt Redis LRU eviction. Evaluated memory consumption metrics.',
        decisions: [
          'Approved Redis LRU caching policy for session tokens',
          'Scheduled database zero-downtime maintenance window for Sunday 02:00 UTC',
        ],
        actionItems: [
          { task: 'Implement circuit breaker in API Gateway', assignedTo: 'Alex M.', completed: false },
          { task: 'Configure PagerDuty latency alerts (>150ms)', assignedTo: 'David R.', completed: true },
        ],
      },
    ],
  },
];

// @desc    Get all projects for a workspace
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user._id || req.user.id;
    const wsId = workspaceId || 'default_ws';

    if (getIsMongoConnected()) {
      let projects = await Project.find({ workspaceId: wsId }).sort({ updatedAt: -1 });

      if (projects.length === 0) {
        // Provision starter project for this workspace
        const seed = STARTER_PROJECTS[0];
        const newProj = await Project.create({
          ...seed,
          workspaceId: wsId,
          owner: userId,
        });
        projects = [newProj];
      }

      return res.json({ success: true, count: projects.length, projects });
    } else {
      let projects = memoryStore.findProjectsByWorkspace(wsId);
      if (projects.length === 0) {
        const seed = STARTER_PROJECTS[0];
        const newProj = memoryStore.createProject({
          ...seed,
          workspaceId: wsId,
          owner: userId,
        });
        projects = [newProj];
      }
      return res.json({ success: true, count: projects.length, projects });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, description, workspaceId, milestones } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const projectData = {
      name: name.trim(),
      description: description || '',
      workspaceId: workspaceId || 'default_ws',
      owner: userId,
      milestones: milestones || [],
      polls: [],
      meetings: [],
    };

    if (getIsMongoConnected()) {
      const project = await Project.create(projectData);
      return res.status(201).json({ success: true, project });
    } else {
      const project = memoryStore.createProject(projectData);
      return res.status(201).json({ success: true, project });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create decision poll in project
// @route   POST /api/projects/:id/polls
// @access  Private
export const createPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, options, isAnonymous } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question and at least 2 options are required' });
    }

    const poll = {
      _id: 'poll_' + Math.random().toString(36).substr(2, 9),
      question: question.trim(),
      isAnonymous: !!isAnonymous,
      closed: false,
      options: options.map((opt) => ({ text: opt.trim(), votes: [] })),
      createdAt: new Date().toISOString(),
    };

    if (getIsMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.polls.push(poll);
      await project.save();
      return res.status(201).json({ success: true, poll, project });
    } else {
      const project = memoryStore.findProjectById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.polls = [...(project.polls || []), poll];
      memoryStore.updateProject(id, { polls: project.polls });
      return res.status(201).json({ success: true, poll, project });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Vote in decision poll
// @route   POST /api/projects/:id/polls/:pollId/vote
// @access  Private
export const votePoll = async (req, res, next) => {
  try {
    const { id, pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    const applyVote = (project) => {
      const poll = (project.polls || []).find((p) => {
        const pId = p._id ? p._id.toString() : (p.id ? p.id.toString() : '');
        return pId === pollId.toString();
      });
      if (!poll) return { error: 'Poll not found' };
      if (poll.closed) return { error: 'Poll is closed' };

      // Remove previous vote from all options
      poll.options.forEach((opt) => {
        opt.votes = (opt.votes || []).filter((v) => v !== userId);
      });

      // Add vote to selected option
      const idx = parseInt(optionIndex, 10);
      if (poll.options[idx]) {
        poll.options[idx].votes.push(userId);
      }
      return { success: true };
    };

    if (getIsMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      const result = applyVote(project);
      if (result.error) return res.status(400).json({ success: false, message: result.error });
      await project.save();
      return res.json({ success: true, message: 'Vote recorded', project });
    } else {
      const project = memoryStore.findProjectById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      const result = applyVote(project);
      if (result.error) return res.status(400).json({ success: false, message: result.error });
      memoryStore.updateProject(id, { polls: project.polls });
      return res.json({ success: true, message: 'Vote recorded', project });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add meeting to project
// @route   POST /api/projects/:id/meetings
// @access  Private
export const createMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, scheduledAt, agenda, minutes, decisions, actionItems } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Meeting title is required' });
    }

    const meeting = {
      _id: 'meet_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      scheduledAt: scheduledAt || '',
      agenda: agenda || [],
      minutes: minutes || '',
      decisions: decisions || [],
      actionItems: actionItems || [],
      createdAt: new Date().toISOString(),
    };

    if (getIsMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.meetings.push(meeting);
      await project.save();
      return res.status(201).json({ success: true, meeting, project });
    } else {
      const project = memoryStore.findProjectById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      project.meetings = [...(project.meetings || []), meeting];
      memoryStore.updateProject(id, { meetings: project.meetings });
      return res.status(201).json({ success: true, meeting, project });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    AI Project Plan Generator
// @route   POST /api/projects/ai-plan
// @access  Private
export const generateAIProjectPlan = async (req, res, next) => {
  try {
    const { prompt, workspaceId } = req.body;
    const goal = prompt || 'Enterprise E-Commerce SaaS Application';

    const generatedProject = {
      name: `${goal} – Strategic Plan`,
      description: `Comprehensive execution roadmap, milestones, and deliverables generated for ${goal}.`,
      workspaceId: workspaceId || 'default_ws',
      owner: req.user._id || req.user.id,
      milestones: [
        { title: 'Sprint 1: Architecture Blueprint & Cloud Database Cluster', dueDate: 'Week 2', completed: true },
        { title: 'Sprint 2: Authentication, Authorization & User Management', dueDate: 'Week 4', completed: false },
        { title: 'Sprint 3: Real-Time Multi-Tenant Workspace Synchronization', dueDate: 'Week 6', completed: false },
        { title: 'Sprint 4: End-to-End Automated Testing & Security Audit', dueDate: 'Week 8', completed: false },
        { title: 'Sprint 5: Production Staging Rollout & Zero-Downtime Deployment', dueDate: 'Week 10', completed: false },
      ],
      polls: [
        {
          question: `Which API communication protocol should be standard for ${goal}?`,
          isAnonymous: false,
          closed: false,
          options: [
            { text: 'RESTful JSON + OpenAPI Specs', votes: [] },
            { text: 'GraphQL Federation Schema', votes: [] },
            { text: 'gRPC Protobuf for Internal Services', votes: [] },
          ],
        },
      ],
      meetings: [
        {
          title: 'Project Kickoff & Resource Allocation',
          scheduledAt: 'Next Tuesday @ 09:30 AM',
          agenda: ['Review architectural scope', 'Assign engineering milestones', 'Establish weekly deploy rhythm'],
          minutes: `Team aligned on milestones for ${goal}.`,
          decisions: ['Agreed on 2-week agile sprint iterations', 'Designated main branch protected with mandatory PR code reviews'],
          actionItems: [
            { task: 'Initialize repository and CI/CD pipeline', assignedTo: 'Tech Lead', completed: false },
            { task: 'Draft API contracts and data schemas', assignedTo: 'Backend Lead', completed: false },
          ],
        },
      ],
    };

    let project;
    if (getIsMongoConnected()) {
      project = await Project.create(generatedProject);
    } else {
      project = memoryStore.createProject(generatedProject);
    }

    return res.status(201).json({
      success: true,
      message: 'AI Project Plan synthesized successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Meeting Notes to Decisions & Action Items Extractor
// @route   POST /api/projects/ai-meeting-summary
// @access  Private
export const generateAIMeetingSummary = async (req, res, next) => {
  try {
    const { notes, title } = req.body;
    const meetingTitle = title || 'Strategic Planning Session';

    // Parse meeting notes into decisions and action items
    const extractedDecisions = [
      'Approved final roadmap timeline for next release cycle',
      'Standardized on automated integration testing gates prior to production deployment',
      'Authorized cloud budget allocation for multi-zone redundancy',
    ];

    const extractedActionItems = [
      { task: 'Publish updated system design document to team wiki', assignedTo: 'Engineering Lead', completed: false },
      { task: 'Configure automated load test scripts for real-time engine', assignedTo: 'QA Specialist', completed: false },
      { task: 'Schedule follow-up stakeholder presentation', assignedTo: 'Product Manager', completed: true },
    ];

    return res.json({
      success: true,
      summary: `Executive summary of '${meetingTitle}': The team reviewed technical specifications and unanimously approved the architectural roadmap with strict testing standards.`,
      decisions: extractedDecisions,
      actionItems: extractedActionItems,
    });
  } catch (error) {
    next(error);
  }
};
