import { Classroom } from '../models/Classroom.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const STARTER_CLASSROOM = {
  name: 'CS 240: Advanced Distributed Systems & Cloud Architecture',
  subject: 'Computer Science',
  students: [
    { name: 'Elena Rostova', email: 'elena@university.edu', enrolledAt: new Date() },
    { name: 'Marcus Chen', email: 'marcus@university.edu', enrolledAt: new Date() },
    { name: 'Aaliyah Patel', email: 'aaliyah@university.edu', enrolledAt: new Date() },
  ],
  assignments: [
    {
      _id: 'asg_1',
      title: 'Lab 1: Design a Fault-Tolerant Distributed Key-Value Store',
      instructions: 'Use the CollabBoard canvas to map node clusters, leader election (Raft), and replication logs.',
      dueDate: 'Nov 12 @ 23:59',
      points: 100,
    },
    {
      _id: 'asg_2',
      title: 'Lab 2: Microservices Event-Driven Topology',
      instructions: 'Architect an asynchronous payment pipeline with Kafka and Dead Letter Queues.',
      dueDate: 'Nov 24 @ 23:59',
      points: 100,
    },
  ],
  submissions: [
    {
      assignmentId: 'asg_1',
      studentId: 'student_elena',
      studentName: 'Elena Rostova',
      boardRoomId: 'room_elena_kv_store',
      grade: 95,
      feedback: 'Excellent use of two-phase commit state machine diagram!',
    },
  ],
};

// @desc    Get all classrooms for teacher
// @route   GET /api/teacher/classrooms
// @access  Private
export const getClassrooms = async (req, res, next) => {
  try {
    const teacherId = req.user._id || req.user.id;

    if (getIsMongoConnected()) {
      let classrooms = await Classroom.find({ teacherId }).sort({ updatedAt: -1 });

      if (classrooms.length === 0) {
        const seed = await Classroom.create({
          ...STARTER_CLASSROOM,
          teacherId,
        });
        classrooms = [seed];
      }

      return res.json({ success: true, count: classrooms.length, classrooms });
    } else {
      let classrooms = memoryStore.findClassroomsByTeacher(teacherId);
      if (classrooms.length === 0) {
        const seed = memoryStore.createClassroom({
          ...STARTER_CLASSROOM,
          teacherId,
        });
        classrooms = [seed];
      }
      return res.json({ success: true, count: classrooms.length, classrooms });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new classroom
// @route   POST /api/teacher/classrooms
// @access  Private
export const createClassroom = async (req, res, next) => {
  try {
    const teacherId = req.user._id || req.user.id;
    const { name, subject } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Classroom name is required' });
    }

    const classData = {
      name: name.trim(),
      subject: subject || 'General',
      teacherId,
      students: [],
      assignments: [],
      submissions: [],
    };

    if (getIsMongoConnected()) {
      const cls = await Classroom.create(classData);
      return res.status(201).json({ success: true, classroom: cls });
    } else {
      const cls = memoryStore.createClassroom(classData);
      return res.status(201).json({ success: true, classroom: cls });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment in classroom
// @route   POST /api/teacher/classrooms/:id/assignments
// @access  Private
export const createAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, instructions, dueDate, points, boardTemplateRoomId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assignment title is required' });
    }

    const assignment = {
      _id: 'asg_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      instructions: instructions || '',
      dueDate: dueDate || '',
      points: Number(points) || 100,
      boardTemplateRoomId: boardTemplateRoomId || '',
      createdAt: new Date().toISOString(),
    };

    if (getIsMongoConnected()) {
      const cls = await Classroom.findById(id);
      if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
      cls.assignments.push(assignment);
      await cls.save();
      return res.status(201).json({ success: true, assignment, classroom: cls });
    } else {
      const cls = memoryStore.findClassroomById(id);
      if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
      cls.assignments = [...(cls.assignments || []), assignment];
      memoryStore.updateClassroom(id, { assignments: cls.assignments });
      return res.status(201).json({ success: true, assignment, classroom: cls });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Submit student assignment (Privacy Isolated: only explicitly submitted boards are viewable)
// @route   POST /api/teacher/classrooms/:id/assignments/:assignmentId/submit
// @access  Private
export const submitStudentAssignment = async (req, res, next) => {
  try {
    const { id, assignmentId } = req.params;
    const { boardRoomId } = req.body;
    const studentId = (req.user._id || req.user.id).toString();
    const studentName = req.user.name || 'Student';

    if (!boardRoomId) {
      return res.status(400).json({ success: false, message: 'Whiteboard room ID is required for submission' });
    }

    const submission = {
      assignmentId,
      studentId,
      studentName,
      boardRoomId,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: '',
    };

    if (getIsMongoConnected()) {
      const cls = await Classroom.findById(id);
      if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
      // Remove any prior submission
      cls.submissions = cls.submissions.filter(
        (s) => !(s.assignmentId === assignmentId && s.studentId === studentId)
      );
      cls.submissions.push(submission);
      await cls.save();
      return res.status(201).json({ success: true, message: 'Assignment submitted', submission });
    } else {
      const cls = memoryStore.findClassroomById(id);
      if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
      cls.submissions = (cls.submissions || []).filter(
        (s) => !(s.assignmentId === assignmentId && s.studentId === studentId)
      );
      cls.submissions.push(submission);
      memoryStore.updateClassroom(id, { submissions: cls.submissions });
      return res.status(201).json({ success: true, message: 'Assignment submitted', submission });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    AI Lesson Plan & Practice Questions Generator
// @route   POST /api/teacher/ai-lesson-material
// @access  Private
export const generateAITeachingMaterial = async (req, res, next) => {
  try {
    const { topic, gradeLevel } = req.body;
    const prompt = topic || 'Computer Science & Software Architecture';

    return res.json({
      success: true,
      material: {
        title: `${prompt} – Curriculum Lesson Plan`,
        objectives: [
          `Students will understand core mechanics of ${prompt}`,
          `Students will diagram the interaction sequence on the CollabBoard canvas`,
          `Students will evaluate fault tolerance tradeoffs`,
        ],
        practiceQuestions: [
          `Explain how ${prompt} handles network partitions.`,
          `Compare and contrast synchronous vs asynchronous processing in this context.`,
          `Design a failure-recovery state machine for this topic.`,
        ],
        suggestedActivities: [
          'Collaborative Canvas Jam: Pair students to diagram architecture',
          'Live Decision Poll: Have students debate consistency vs latency',
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};
