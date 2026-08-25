import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as checkoutApi from '../../api/checkoutApi';
import type { FeesDto } from '../../api/checkoutApi';

export interface ConfigState {
  fees: FeesDto | null;
}

const initialState: ConfigState = {
  fees: null,
};

export const loadFees = createAsyncThunk('config/loadFees', async () => {
  return checkoutApi.fetchFees();
});

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFees.fulfilled, (state, action) => {
      state.fees = action.payload;
    });
  },
});

export default configSlice.reducer;
