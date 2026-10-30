import mongoose from 'mongoose';

const boardVersionSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Whiteboard',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: 'Version Snapshot',
    },
    elements: {
      type: Array,
      default: [],
    },
    snapshotThumbnail: {
      type: String,
      default: '',
    },
    savedBy: {
      type: String,
      default: 'System Auto-Save',
    },
  },
  {
    timestamps: true,
  }
);

boardVersionSchema.index({ boardId: 1, versionNumber: -1 });

export const BoardVersion = mongoose.models.BoardVersion || mongoose.model('BoardVersion', boardVersionSchema);
