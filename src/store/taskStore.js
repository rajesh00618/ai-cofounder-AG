import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

export const useTaskStore = create(
  persist(
    (set, get) => ({
  tasks: [],
  sprints: [],
  currentSprintId: null,
  taskError: null,
  fullPlan: null,

  addTask: (task) => set(s => ({
    tasks: [...s.tasks, {
      id: generateId(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      estimatedTime: task.estimatedTime || '1 hr',
      difficulty: task.difficulty || 'medium',
      dependencies: task.dependencies || [],
      aiAssistance: task.aiAssistance || 'assisted',
      status: 'todo',
      sprintId: task.sprintId || s.currentSprintId,
      dueDate: task.dueDate || null,
      createdAt: new Date().toISOString(),
      completedAt: null
    }]
  })),

  updateTask: (id, updates) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  completeTask: (id) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t)
  })),

  deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

  setTaskError: (error) => set({ taskError: error }),

  setFullPlan: (plan) => set({ fullPlan: plan }),

  createSprint: (sprint) => {
    const id = generateId();
    set(s => ({
      sprints: [...s.sprints, { id, ...sprint, status: 'active', createdAt: new Date().toISOString() }],
      currentSprintId: id
    }));
    return id;
  },

  completeSprint: (id) => set(s => ({
    sprints: s.sprints.map(sp => sp.id === id ? { ...sp, status: 'completed' } : sp),
    currentSprintId: s.currentSprintId === id ? null : s.currentSprintId,
  })),

  getActiveSprint: () => {
    const state = get();
    return state.sprints.find(s => s.status === 'active');
  },

  getTasksByStatus: (status) => get().tasks.filter(t => t.status === status),
  getTasksBySprint: (sprintId) => get().tasks.filter(t => t.sprintId === sprintId),

  getTodaysTasks: () => {
    const state = get();
    const sprintTasks = state.sprints.find(s => s.id === state.currentSprintId)
      ? state.tasks.filter(t => state.sprints.find(s => s.id === state.currentSprintId)?.tasks?.includes(t.id) || t.sprintId === state.currentSprintId)
      : [];
    const pending = (sprintTasks.length > 0 ? sprintTasks : state.tasks).filter(t => t.status !== 'done');
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    pending.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
    return pending.slice(0, 4);
  },

  resetTasks: () => set({
    tasks: [],
    sprints: [],
    currentSprintId: null,
    taskError: null,
    fullPlan: null,
  }),
    }),
    {
      name: 'ai-cofounder-task-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { ...persisted, fullPlan: persisted?.fullPlan || null, taskError: null };
        return persisted;
      },
      partialize: (state) => {
        const { taskError: _te, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('[taskStore] Persist rehydration error:', error);
      },
    }
  )
);
