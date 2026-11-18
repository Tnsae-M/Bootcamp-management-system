import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { groupsService } from '../../services/groups.service';
import type { Group } from '../../types';

interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
};

export const fetchGroupsByBootcamp = createAsyncThunk(
  'groups/fetchByBootcamp',
  async (bootcampId: string, { rejectWithValue }) => {
    try {
      return await groupsService.getGroupsByBootcamp(bootcampId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load groups');
    }
  }
);

export const createGroupAsync = createAsyncThunk(
  'groups/create',
  async (groupData: any, { rejectWithValue }) => {
    try {
      return await groupsService.createGroup(groupData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create group');
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupsByBootcamp.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupsByBootcamp.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroupsByBootcamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGroupAsync.fulfilled, (state, action) => {
        state.groups.unshift(action.payload);
      });
  },
});

export default groupsSlice.reducer;

