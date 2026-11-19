import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { setActiveRole, clearError, setToken } from '../features/auth/authSlice';

describe('Auth Redux Slice', () => {
  const initialTestState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: 'Previous error message',
    activeRole: null,
    isInitializing: false,
  };

  it('updates activeRole and persists to localStorage on setActiveRole', () => {
    const nextState = authReducer(initialTestState, setActiveRole('instructor'));
    expect(nextState.activeRole).toBe('INSTRUCTOR');
  });

  it('clears error on clearError action', () => {
    const nextState = authReducer(initialTestState, clearError());
    expect(nextState.error).toBeNull();
  });

  it('updates token and isAuthenticated flag on setToken', () => {
    const nextState = authReducer(initialTestState, setToken('mock-jwt-token-xyz'));
    expect(nextState.token).toBe('mock-jwt-token-xyz');
    expect(nextState.isAuthenticated).toBe(true);
  });
});

