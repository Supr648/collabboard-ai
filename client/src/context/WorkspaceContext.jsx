import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getWorkspaces,
  createWorkspace as apiCreateWorkspace,
  updateWorkspace as apiUpdateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
} from '../api/workspace';
import {
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  CalendarCheck,
} from 'lucide-react';

const WorkspaceContext = createContext();

export const WORKSPACE_METADATA = {
  student: {
    label: 'Student Learning Workspace',
    shortLabel: 'Student Hub',
    description: 'Study notes, flashcards, AI quizzes, and revision schedules',
    icon: GraduationCap,
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    color: '#f59e0b',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  },
  teacher: {
    label: 'Teacher & Classroom Workspace',
    shortLabel: 'Classroom',
    description: 'Virtual classrooms, lesson boards, and student assignments',
    icon: Compass,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  },
  team: {
    label: 'Team Collaborative Workspace',
    shortLabel: 'Team Space',
    description: 'Sprint planning, project Kanban, architecture, and live voting',
    icon: Users,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    color: '#6366f1',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
  },
  business: {
    label: 'Enterprise Business Workspace',
    shortLabel: 'Business',
    description: 'Cross-functional initiatives, milestones, and strategic roadmaps',
    icon: Briefcase,
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    color: '#3b82f6',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
  },
  personal: {
    label: 'Personal Productivity Workspace',
    shortLabel: 'Personal',
    description: 'Daily planning, weekly goals, habit tracker, and personal notes',
    icon: CalendarCheck,
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-500',
    color: '#ec4899',
    badgeBg: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300',
  },
};

export const WorkspaceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all user workspaces
  const loadWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getWorkspaces();
      if (res.success && res.workspaces) {
        setWorkspaces(res.workspaces);

        // Retrieve persisted workspace preference or pick the first
        const savedId = localStorage.getItem('collabboard_active_workspace_id');
        const matched = res.workspaces.find((w) => (w._id || w.id) === savedId);

        if (matched) {
          setCurrentWorkspace(matched);
        } else if (res.workspaces.length > 0) {
          setCurrentWorkspace(res.workspaces[0]);
          localStorage.setItem('collabboard_active_workspace_id', res.workspaces[0]._id || res.workspaces[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load workspaces:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Switch active workspace
  const switchWorkspace = (workspaceId) => {
    const target = workspaces.find((w) => (w._id || w.id) === workspaceId);
    if (target) {
      setCurrentWorkspace(target);
      localStorage.setItem('collabboard_active_workspace_id', target._id || target.id);
    }
  };

  // Create new workspace
  const createNewWorkspace = async (workspaceData) => {
    const res = await apiCreateWorkspace(workspaceData);
    if (res.success && res.workspace) {
      setWorkspaces((prev) => [...prev, res.workspace]);
      setCurrentWorkspace(res.workspace);
      localStorage.setItem('collabboard_active_workspace_id', res.workspace._id || res.workspace.id);
    }
    return res;
  };

  // Update current workspace
  const updateCurrentWorkspace = async (updates) => {
    if (!currentWorkspace) return null;
    const wsId = currentWorkspace._id || currentWorkspace.id;
    const res = await apiUpdateWorkspace(wsId, updates);
    if (res.success && res.workspace) {
      setCurrentWorkspace(res.workspace);
      setWorkspaces((prev) =>
        prev.map((w) => ((w._id || w.id) === wsId ? res.workspace : w))
      );
    }
    return res;
  };

  // Delete current workspace
  const deleteCurrentWorkspace = async (workspaceId) => {
    const res = await apiDeleteWorkspace(workspaceId);
    if (res.success) {
      const remaining = workspaces.filter((w) => (w._id || w.id) !== workspaceId);
      setWorkspaces(remaining);
      if (remaining.length > 0) {
        setCurrentWorkspace(remaining[0]);
        localStorage.setItem('collabboard_active_workspace_id', remaining[0]._id || remaining[0].id);
      }
    }
    return res;
  };

  const currentMetadata = currentWorkspace
    ? WORKSPACE_METADATA[currentWorkspace.type] || WORKSPACE_METADATA.team
    : WORKSPACE_METADATA.team;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        workspaceMetadata: currentMetadata,
        loading,
        switchWorkspace,
        createNewWorkspace,
        updateCurrentWorkspace,
        deleteCurrentWorkspace,
        refreshWorkspaces: loadWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
