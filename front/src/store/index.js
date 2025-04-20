import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import authReducer from './slices/authSlice';
import marketDataReducer from './slices/marketDataSlice';
import positionReducer from './slices/positionSlice';
import strategyReducer from './slices/strategySlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    auth: authReducer,
    marketData: marketDataReducer,
    position: positionReducer,
    strategy: strategyReducer,
    notification: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略日期和BigInt序列化检查
        ignoredActions: ['marketData/setHistoricalData', 'position/setPositions'],
        ignoredPaths: ['marketData.historicalData', 'position.positions'],
      },
    }),
});
