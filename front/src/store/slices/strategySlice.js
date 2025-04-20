import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeStrategy: null,
  savedStrategies: [],
  isExecuting: false,
  lastExecution: null,
  nextExecution: null,
  loading: false,
  error: null,
};

export const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    setActiveStrategy: (state, action) => {
      state.activeStrategy = action.payload;
    },
    saveStrategy: (state, action) => {
      const strategyExists = state.savedStrategies.some(
        (strategy) => strategy.id === action.payload.id
      );
      
      if (strategyExists) {
        state.savedStrategies = state.savedStrategies.map((strategy) =>
          strategy.id === action.payload.id ? action.payload : strategy
        );
      } else {
        state.savedStrategies.push(action.payload);
      }
    },
    deleteStrategy: (state, action) => {
      state.savedStrategies = state.savedStrategies.filter(
        (strategy) => strategy.id !== action.payload
      );
      
      if (state.activeStrategy && state.activeStrategy.id === action.payload) {
        state.activeStrategy = null;
      }
    },
    executeStrategyStart: (state) => {
      state.isExecuting = true;
      state.error = null;
    },
    executeStrategySuccess: (state, action) => {
      state.isExecuting = false;
      state.lastExecution = action.payload.timestamp;
      state.nextExecution = action.payload.nextExecution;
    },
    executeStrategyFailure: (state, action) => {
      state.isExecuting = false;
      state.error = action.payload;
    },
    setStrategies: (state, action) => {
      state.savedStrategies = action.payload;
    },
    updateExecutionSchedule: (state, action) => {
      state.nextExecution = action.payload;
    },
  },
});

export const {
  setActiveStrategy,
  saveStrategy,
  deleteStrategy,
  executeStrategyStart,
  executeStrategySuccess,
  executeStrategyFailure,
  setStrategies,
  updateExecutionSchedule,
} = strategySlice.actions;

export default strategySlice.reducer;
