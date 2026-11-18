import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bootcampsReducer from '../features/bootcamps/bootcampsSlice';
import sessionsReducer from '../features/sessions/sessionSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import groupsReducer from '../features/groups/groupsSlice';
import enrollmentsReducer from '../features/enrollments/enrollmentsSlice';
import reportsReducer from '../features/reports/reportsSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bootcamps: bootcampsReducer,
    sessions: sessionsReducer,
    tasks: tasksReducer,
    attendance: attendanceReducer,
    groups: groupsReducer,
    enrollments: enrollmentsReducer,
    reports: reportsReducer,
    feedback: feedbackReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

