import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    boardId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userName: {
      type: String,
      default: 'Collaborator',
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'duplicate', 'ai_synthesize', 'comment', 'export'],
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
