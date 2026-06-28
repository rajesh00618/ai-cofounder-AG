import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../../store/taskStore';

beforeEach(() => {
  useTaskStore.setState({ tasks: [], sprints: [], currentSprintId: null, taskError: null });
});

describe('taskStore', () => {
  it('has initial state', () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.sprints).toEqual([]);
    expect(state.currentSprintId).toBeNull();
    expect(state.taskError).toBeNull();
  });

  it('adds a task', () => {
    useTaskStore.getState().addTask({ title: 'Test task', priority: 'high' });
    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test task');
    expect(tasks[0].priority).toBe('high');
    expect(tasks[0].status).toBe('todo');
    expect(tasks[0].id).toBeDefined();
    expect(tasks[0].createdAt).toBeDefined();
  });

  it('completes a task', () => {
    useTaskStore.getState().addTask({ title: 'Task to complete' });
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().completeTask(taskId);
    expect(useTaskStore.getState().tasks[0].status).toBe('done');
    expect(useTaskStore.getState().tasks[0].completedAt).toBeDefined();
  });

  it('updates a task', () => {
    useTaskStore.getState().addTask({ title: 'Original' });
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().updateTask(taskId, { title: 'Updated', priority: 'low' });
    expect(useTaskStore.getState().tasks[0].title).toBe('Updated');
    expect(useTaskStore.getState().tasks[0].priority).toBe('low');
  });

  it('deletes a task', () => {
    useTaskStore.getState().addTask({ title: 'To delete' });
    useTaskStore.getState().addTask({ title: 'Keep' });
    const deleteId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().deleteTask(deleteId);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0].title).toBe('Keep');
  });

  it('creates a sprint', () => {
    const id = useTaskStore.getState().createSprint({ goal: 'Launch MVP', deadline: 'Friday', week: 1 });
    expect(id).toBeDefined();
    expect(useTaskStore.getState().sprints).toHaveLength(1);
    expect(useTaskStore.getState().sprints[0].goal).toBe('Launch MVP');
    expect(useTaskStore.getState().sprints[0].status).toBe('active');
    expect(useTaskStore.getState().currentSprintId).toBe(id);
  });

  it('completes a sprint', () => {
    useTaskStore.getState().createSprint({ goal: 'Sprint 1' });
    const sprintId = useTaskStore.getState().currentSprintId;
    useTaskStore.getState().completeSprint(sprintId);
    expect(useTaskStore.getState().sprints[0].status).toBe('completed');
  });

  it('gets active sprint', () => {
    expect(useTaskStore.getState().getActiveSprint()).toBeUndefined();
    useTaskStore.getState().createSprint({ goal: 'Active Sprint' });
    expect(useTaskStore.getState().getActiveSprint().goal).toBe('Active Sprint');
  });

  it('filters tasks by status', () => {
    useTaskStore.getState().addTask({ title: 'Task 1' });
    useTaskStore.getState().addTask({ title: 'Task 2' });
    const taskId = useTaskStore.getState().tasks[0].id;
    useTaskStore.getState().completeTask(taskId);
    expect(useTaskStore.getState().getTasksByStatus('todo')).toHaveLength(1);
    expect(useTaskStore.getState().getTasksByStatus('done')).toHaveLength(1);
  });

  it('associates tasks with sprint', () => {
    const sprintId = useTaskStore.getState().createSprint({ goal: 'Sprint' });
    useTaskStore.getState().addTask({ title: 'Sprint task', sprintId });
    const otherSprintId = useTaskStore.getState().createSprint({ goal: 'Other' });
    useTaskStore.getState().addTask({ title: 'Other sprint task', sprintId: otherSprintId });
    expect(useTaskStore.getState().getTasksBySprint(sprintId)).toHaveLength(1);
    expect(useTaskStore.getState().getTasksBySprint(otherSprintId)).toHaveLength(1);
  });

  it('sets and clears task error', () => {
    useTaskStore.getState().setTaskError('Failed to create task');
    expect(useTaskStore.getState().taskError).toBe('Failed to create task');
  });

  it('resets task state', () => {
    useTaskStore.getState().addTask({ title: 'T1' });
    useTaskStore.getState().createSprint({ goal: 'Sprint 1' });
    useTaskStore.getState().resetTasks();
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.sprints).toEqual([]);
    expect(state.currentSprintId).toBeNull();
    expect(state.taskError).toBeNull();
  });
});
