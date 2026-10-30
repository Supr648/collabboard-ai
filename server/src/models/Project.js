import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'on_hold'],
      default: 'active',
    },
    milestones: [
      {
        title: { type: String, required: true },
        dueDate: { type: String, default: '' },
        completed: { type: Boolean, default: false },
      },
    ],
    polls: [
      {
        question: { type: String, required: true },
        isAnonymous: { type: Boolean, default: false },
        closed: { type: Boolean, default: false },
        options: [
          {
            text: { type: String, required: true },
            votes: [{ type: String }], // userIds
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    meetings: [
      {
        title: { type: String, required: true },
        scheduledAt: { type: String, default: '' },
        agenda: [{ type: String }],
        minutes: { type: String, default: '' },
        decisions: [{ type: String }],
        actionItems: [
          {
            task: String,
            assignedTo: String,
            completed: { type: Boolean, default: false },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
