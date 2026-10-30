import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatarColor: {
      type: String,
      default: () => {
        const colors = [
          '#6366f1', // Indigo
          '#ec4899', // Pink
          '#8b5cf6', // Purple
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#3b82f6', // Blue
          '#14b8a6', // Teal
          '#ef4444', // Red
          '#06b6d4', // Cyan
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },
    primaryWorkspaceType: {
      type: String,
      enum: ['student', 'teacher', 'team', 'business', 'personal'],
      default: 'team',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Remove password when serialized
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
