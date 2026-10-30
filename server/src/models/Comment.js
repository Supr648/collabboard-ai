import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    authorColor: {
      type: String,
      default: '#6366f1',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    replies: [
      {
        author: String,
        avatarColor: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
