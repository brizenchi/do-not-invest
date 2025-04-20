import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  positions: [],
  totalInvested: 0,
  totalBtcAmount: 0,
  averageCost: 0,
  currentValue: 0,
  profitLoss: 0,
  profitLossPercentage: 0,
  loading: false,
  error: null,
};

export const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    fetchPositionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setPositions: (state, action) => {
      state.positions = action.payload;
      state.loading = false;
      
      // 计算汇总数据
      if (action.payload.length > 0) {
        const totalInvested = action.payload.reduce((sum, pos) => sum + pos.investedAmount, 0);
        const totalBtcAmount = action.payload.reduce((sum, pos) => sum + pos.btcAmount, 0);
        
        state.totalInvested = totalInvested;
        state.totalBtcAmount = totalBtcAmount;
        state.averageCost = totalInvested / totalBtcAmount;
      }
    },
    updatePositionSummary: (state, action) => {
      const { currentPrice } = action.payload;
      if (currentPrice && state.totalBtcAmount > 0) {
        const currentValue = currentPrice * state.totalBtcAmount;
        const profitLoss = currentValue - state.totalInvested;
        const profitLossPercentage = (profitLoss / state.totalInvested) * 100;
        
        state.currentValue = currentValue;
        state.profitLoss = profitLoss;
        state.profitLossPercentage = profitLossPercentage;
      }
    },
    addPosition: (state, action) => {
      state.positions.push(action.payload);
      
      // 更新汇总数据
      state.totalInvested += action.payload.investedAmount;
      state.totalBtcAmount += action.payload.btcAmount;
      state.averageCost = state.totalInvested / state.totalBtcAmount;
    },
    fetchPositionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchPositionsStart,
  setPositions,
  updatePositionSummary,
  addPosition,
  fetchPositionsFailure,
} = positionSlice.actions;

export default positionSlice.reducer;
