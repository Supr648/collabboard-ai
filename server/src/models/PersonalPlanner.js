import mongoose from 'mongoose';

const personalPlannerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dailyTasks: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
      },
    ],
    weeklyGoals: [
      {
        title: { type: String, required: true },
        targetDate: { type: String, default: '' },
        completed: { type: Boolean, default: false },
        subtasks: [
          {
            text: { type: String, required: true },
            done: { type: Boolean, default: false },
          },
        ],
      },
    ],
    habits: [
      {
        name: { type: String, required: true },
        streak: { type: Number, default: 0 },
        history: [{ type: String }], // 'YYYY-MM-DD'
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PersonalPlanner = mongoose.models.PersonalPlanner || mongoose.model('PersonalPlanner', personalPlannerSchema);
