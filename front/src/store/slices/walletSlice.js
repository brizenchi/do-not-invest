import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  publicKey: null,
  isConnected: false,
  balance: null,
  network: null,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (state, action) => {
      const { address, publicKey } = action.payload;
      state.address = address;
      state.publicKey = publicKey;
      state.isConnected = true;
      state.error = null;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.publicKey = null;
      state.isConnected = false;
      state.balance = null;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setNetwork: (state, action) => {
      state.network = action.payload;
    },
    setWalletError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  connectWallet,
  disconnectWallet,
  setBalance,
  setNetwork,
  setWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;
