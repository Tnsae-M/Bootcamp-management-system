import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bootcampsService } from '../../services/bootcamps.service';
import type { Bootcamp } from '../../types';

interface BootcampsState {
  bootcamps: Bootcamp[];
  currentBootcamp: Bootcamp | null;
  loading: boolean;
  error: string | null;
}

const initialState: BootcampsState = {
  bootcamps: [],
  currentBootcamp: null,
  loading: false,
  error: null,
};

export const fetchBootcamps = createAsyncThunk('bootcamps/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await bootcampsService.getBootcamps();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load bootcamps');
  }
});

export const fetchBootcampsByDivision = createAsyncThunk(
  'bootcamps/fetchByDivision',
  async (divisionId: string, { rejectWithValue }) => {
    try {
      return await bootcampsService.getBootcampsByDivision(divisionId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load division bootcamps');
    }
  }
);

export const fetchBootcampById = createAsyncThunk(
  'bootcamps/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await bootcampsService.getBootcampById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bootcamp');
    }
  }
);

export const createBootcamp = createAsyncThunk(
  'bootcamps/create',
  async ({ divisionId, data }: { divisionId: string; data: any }, { rejectWithValue }) => {
    try {
      return await bootcampsService.createBootcamp(divisionId, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create bootcamp');
    }
  }
);

const bootcampsSlice = createSlice({
  name: 'bootcamps',
  initialState,
  reducers: {
    clearCurrentBootcamp: (state) => {
      state.currentBootcamp = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBootcamps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBootcamps.fulfilled, (state, action) => {
        state.loading = false;
        state.bootcamps = action.payload;
      })
      .addCase(fetchBootcamps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBootcampsByDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBootcampsByDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.bootcamps = action.payload;
      })
      .addCase(fetchBootcampsByDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBootcampById.fulfilled, (state, action) => {
        state.currentBootcamp = action.payload;
      })
      .addCase(createBootcamp.fulfilled, (state, action) => {
        state.bootcamps.unshift(action.payload);
      });
  },
});

export const { clearCurrentBootcamp } = bootcampsSlice.actions;
export default bootcampsSlice.reducer;

