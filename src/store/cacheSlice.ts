import { createSlice } from '@reduxjs/toolkit';

interface CacheState {
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: CacheState = {
  loading: {},
  errors: {},
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    clearCache: (state) => {
        state.loading = {};
        state.errors = {};
    }
  }
});

export const { clearCache } = cacheSlice.actions;
export default cacheSlice.reducer;
