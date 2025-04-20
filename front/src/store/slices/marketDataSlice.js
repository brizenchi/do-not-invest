import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentPrice, getHistoricalData, getOHLCData } from '../../services/priceService';

const initialState = {
  currentPrice: null,
  historicalData: [],
  priceChange24h: null,
  volume24h: null,
  marketCap: null,
  loading: false,
  error: null,
  timeframe: '1d', // 默认时间框架：1d, 1w, 1m, 1y, all
  lastUpdated: null,
  realtimeEnabled: false,
};

// 异步Action：获取当前价格
export const fetchCurrentPrice = createAsyncThunk(
  'marketData/fetchCurrentPrice',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCurrentPrice();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步Action：获取历史数据
export const fetchHistoricalData = createAsyncThunk(
  'marketData/fetchHistoricalData',
  async (timeframe = '1d', { rejectWithValue }) => {
    try {
      // 根据时间周期映射到天数
      const daysMap = {
        '1h': 1,
        '1d': 30,
        '1w': 90,
        '1m': 180,
        'all': 'max'
      };
      const days = daysMap[timeframe] || 30;
      
      // 获取OHLC数据
      const data = await getOHLCData(timeframe);
      return { data, timeframe };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    fetchDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCurrentPrice: (state, action) => {
      state.currentPrice = action.payload;
      state.loading = false;
    },
    setHistoricalData: (state, action) => {
      state.historicalData = action.payload;
      state.loading = false;
    },
    setMarketStats: (state, action) => {
      const { priceChange24h, volume24h, marketCap } = action.payload;
      state.priceChange24h = priceChange24h;
      state.volume24h = volume24h;
      state.marketCap = marketCap;
    },
    setTimeframe: (state, action) => {
      state.timeframe = action.payload;
    },
    fetchDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取当前价格
      .addCase(fetchCurrentPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrice = action.payload.price;
        state.priceChange24h = action.payload.priceChange24h;
        state.volume24h = action.payload.volume24h;
        state.marketCap = action.payload.marketCap;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCurrentPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 处理获取历史数据
      .addCase(fetchHistoricalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.loading = false;
        state.historicalData = action.payload.data;
        state.timeframe = action.payload.timeframe;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchDataStart,
  setCurrentPrice,
  setHistoricalData,
  setMarketStats,
  setTimeframe,
  fetchDataFailure,
} = marketDataSlice.actions;

export default marketDataSlice.reducer;
