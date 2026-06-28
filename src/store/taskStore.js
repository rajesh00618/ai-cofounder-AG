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

  resetTasks: () => set({
    tasks: [],
    sprints: [],
    currentSprintId: null,
    taskError: null,
  }),
    }),
    {
      name: 'ai-cofounder-task-storage',
    }
  )
);
