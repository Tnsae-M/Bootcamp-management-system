import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackService } from '../../services';

interface FeedbackState {
  feedbacks: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  loading: false,
  error: null,
};

export const fetchSessionFeedback = createAsyncThunk(
  'feedback/fetch',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await feedbackService.getFeedback(sessionId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load feedback');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionFeedback.fulfilled, (state, action) => {
        state.feedbacks = action.payload;
      });
  },
});

export default feedbackSlice.reducer;

