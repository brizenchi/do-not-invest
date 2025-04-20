import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    priceAlerts: true,
    strategyExecutions: true,
    systemUpdates: true,
    emailNotifications: false,
    pushNotifications: false,
  },
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action) => {
      const notificationToDelete = state.notifications.find(
        (n) => n.id === action.payload
      );
      
      if (notificationToDelete && !notificationToDelete.read) {
        state.unreadCount -= 1;
      }
      
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    updateNotificationSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  updateNotificationSettings,
} = notificationSlice.actions;

export default notificationSlice.reducer;
