import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentsService } from '../../services/enrollments.service';
import type { Enrollment } from '../../types';

interface EnrollmentsState {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  enrollments: [],
  loading: false,
  error: null,
};

export const fetchMyEnrollments = createAsyncThunk('enrollments/fetchMine', async (_, { rejectWithValue }) => {
  try {
    return await enrollmentsService.getMyEnrollments();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load enrollments');
  }
});

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default enrollmentsSlice.reducer;

