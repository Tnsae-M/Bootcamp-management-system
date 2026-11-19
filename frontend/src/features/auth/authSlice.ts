import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  activeRole: string | null;
  isInitializing: boolean;
}

const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};

const setStorageItem = (key: string, val: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, val);
    } catch {}
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

const rawToken = getStorageItem('token');
const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;
const activeRole = getStorageItem('activeRole');

const initialState: AuthState = {
  user: null,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  activeRole,
  isInitializing: true,
};

const ROLE_PRIORITY = ['SUPER_ADMIN', 'SUPER ADMIN', 'ADMIN', 'DIVISION_ADMIN', 'INSTRUCTOR', 'STUDENT', 'GUEST'];

const getHighestRole = (roles: string[] = []): string | null => {
  const normalized = roles.map((r) => r.toUpperCase());
  return ROLE_PRIORITY.find((p) => normalized.includes(p)) || roles[0] || null;
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveRole: (state, action: PayloadAction<string>) => {
      const roleUpper = action.payload.toUpperCase();
      state.activeRole = roleUpper;
      setStorageItem('activeRole', roleUpper);
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      setStorageItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload || {};
        const accessToken = payload.accessToken || payload.tokens?.accessToken || payload.data?.accessToken || payload.data?.tokens?.accessToken;
        const user = payload.user || payload.data?.user;

        if (accessToken && user) {
          state.isAuthenticated = true;
          state.user = user;
          state.token = accessToken;
          setStorageItem('token', accessToken);

          if (!state.activeRole) {
            state.activeRole = getHighestRole(user.roles);
            if (state.activeRole) setStorageItem('activeRole', state.activeRole);
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload || {};
        const accessToken = payload.accessToken || payload.tokens?.accessToken || payload.data?.accessToken || payload.data?.tokens?.accessToken;
        const user = payload.user || payload.data?.user;

        if (accessToken && user) {
          state.isAuthenticated = true;
          state.user = user;
          state.token = accessToken;
          setStorageItem('token', accessToken);

          if (!state.activeRole) {
            state.activeRole = getHighestRole(user.roles);
            if (state.activeRole) setStorageItem('activeRole', state.activeRole);
          }
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (!state.activeRole && action.payload?.roles) {
          state.activeRole = getHighestRole(action.payload.roles);
          if (state.activeRole) setStorageItem('activeRole', state.activeRole);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        removeStorageItem('token');
        removeStorageItem('activeRole');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.activeRole = null;
        state.isInitializing = false;
      });
  },
});

export const { setActiveRole, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
