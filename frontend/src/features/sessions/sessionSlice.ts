import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionsService } from '../../services/sessions.service';
import type { Session } from '../../types';

interface SessionsState {
  items: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionsState = {
  items: [],
  currentSession: null,
  loading: false,
  error: null,
};

export const fetchSessions = createAsyncThunk('sessions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await sessionsService.getSessions();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
  }
});

export const fetchSessionsByBootcamp = createAsyncThunk(
  'sessions/fetchByBootcamp',
  async (bootcampId: string, { rejectWithValue }) => {
    try {
      return await sessionsService.getSessionsByBootcamp(bootcampId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const createSessionAsync = createAsyncThunk(
  'sessions/create',
  async (sessionData: any, { rejectWithValue }) => {
    try {
      return await sessionsService.createSession(sessionData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to schedule session');
    }
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSessionsByBootcamp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionsByBootcamp.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSessionsByBootcamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSessionAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default sessionSlice.reducer;

