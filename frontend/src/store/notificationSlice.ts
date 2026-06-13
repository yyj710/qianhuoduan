import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
});

export const { setNotificationUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
