import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import messageReducer from './messageSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    message: messageReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
