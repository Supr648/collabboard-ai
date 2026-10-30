import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['student', 'teacher', 'team', 'business', 'personal'],
      default: 'team',
      required: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      colorTheme: {
        type: String,
        default: '#6366f1',
      },
      allowPublicSharing: {
        type: Boolean,
        default: true,
      },
      defaultRole: {
        type: String,
        enum: ['editor', 'viewer'],
        default: 'editor',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
