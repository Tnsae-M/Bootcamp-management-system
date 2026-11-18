import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../../services/attendance.service';
import type { AttendanceRecord } from '../../types';

interface AttendanceState {
  records: AttendanceRecord[];
  activeWindow: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  activeWindow: null,
  loading: false,
  error: null,
};

export const openAttendanceWindow = createAsyncThunk(
  'attendance/openWindow',
  async (payload: { sessionId: string; windowMinutes?: number }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.openWindow(payload);
      return res.data || res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to open check-in window');
    }
  }
);

export const submitAttendanceCode = createAsyncThunk(
  'attendance/submitCode',
  async (payload: { code: string; sessionId?: string }, { rejectWithValue }) => {
    try {
      const res = await attendanceService.submitCode(payload);
      return res.data || res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Check-in failed');
    }
  }
);

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (params: { sessionId?: string; bootcampId?: string } | undefined, { rejectWithValue }) => {
    try {
      return await attendanceService.getRecords(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load records');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(openAttendanceWindow.fulfilled, (state, action) => {
        state.activeWindow = action.payload;
      })
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default attendanceSlice.reducer;

