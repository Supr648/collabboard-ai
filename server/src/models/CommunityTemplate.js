import mongoose from 'mongoose';

const communityTemplateSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['study', 'project', 'business', 'mindmap', 'flowchart'],
      default: 'project',
      index: true,
    },
    tags: [{ type: String }],
    elements: {
      type: Array,
      default: [],
    },
    author: {
      id: { type: String, required: true },
      name: { type: String, default: 'Community Member' },
      avatar: { type: String, default: '' },
    },
    clonesCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const CommunityTemplate =
  mongoose.models.CommunityTemplate || mongoose.model('CommunityTemplate', communityTemplateSchema);
