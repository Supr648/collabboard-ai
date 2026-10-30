import mongoose from 'mongoose';

const whiteboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled Whiteboard',
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    elements: {
      type: Array,
      default: [],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    versionHistory: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Whiteboard = mongoose.models.Whiteboard || mongoose.model('Whiteboard', whiteboardSchema);
