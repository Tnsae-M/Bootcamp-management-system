import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsService } from '../../services/reports.service';

interface ReportsState {
  reports: any[];
  analytics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  analytics: null,
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk('reports/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await reportsService.getReports();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load reports');
  }
});

export const fetchAnalyticsAsync = createAsyncThunk('reports/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    return await reportsService.getAnalytics();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load analytics');
  }
});

export const createReportAsync = createAsyncThunk(
  'reports/create',
  async (payload: { title: string; content: string }, { rejectWithValue }) => {
    try {
      return await reportsService.createReport(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create report');
    }
  }
);

export const updateReportAsync = createAsyncThunk(
  'reports/update',
  async ({ id, payload }: { id: string; payload: { title: string; content: string } }, { rejectWithValue }) => {
    try {
      return await reportsService.updateReport(id, payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update report');
    }
  }
);

export const deleteReportAsync = createAsyncThunk('reports/delete', async (id: string, { rejectWithValue }) => {
  try {
    await reportsService.deleteReport(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete report');
  }
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAnalyticsAsync.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(createReportAsync.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
      })
      .addCase(deleteReportAsync.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => (r.id || r._id) !== action.payload);
      });
  },
});

export default reportsSlice.reducer;

