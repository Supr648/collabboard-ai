import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['backlog', 'in_progress', 'in_review', 'done'],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: String,
      default: '',
    },
    boardId: {
      type: String,
      required: true,
      index: true,
    },
    originElementId: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
    },
    createdBy: {
      type: String,
      default: 'Collaborator',
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', TaskSchema);
