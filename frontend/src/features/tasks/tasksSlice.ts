import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksService } from '../../services/tasks.service';
import type { Task } from '../../types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async ({ bootcampId, sessionId }: { bootcampId?: string; sessionId?: string }, { rejectWithValue }) => {
    try {
      return await tasksService.getTasks(bootcampId, sessionId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tasks');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/create',
  async (taskData: any, { rejectWithValue }) => {
    try {
      return await tasksService.createTask(taskData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      });
  },
});

export default tasksSlice.reducer;

