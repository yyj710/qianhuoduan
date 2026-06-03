import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessageState {
  unreadCount: number;
}

const initialState: MessageState = {
  unreadCount: 0,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    },
  },
});

export const { setUnreadCount, incrementUnread } = messageSlice.actions;
export default messageSlice.reducer;
