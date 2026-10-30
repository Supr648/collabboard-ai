import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    students: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        enrolledAt: { type: Date, default: Date.now },
      },
    ],
    assignments: [
      {
        title: { type: String, required: true },
        instructions: { type: String, default: '' },
        dueDate: { type: String, default: '' },
        points: { type: Number, default: 100 },
        boardTemplateRoomId: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    submissions: [
      {
        assignmentId: String,
        studentId: String,
        studentName: String,
        boardRoomId: String,
        submittedAt: { type: Date, default: Date.now },
        grade: { type: Number, default: null },
        feedback: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);
