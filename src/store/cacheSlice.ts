import { createSlice } from '@reduxjs/toolkit';
import { RecommendationResponse } from '../services/recommendation';
import { RoadmapResponse } from '../services/roadmap';

interface CacheState {
  recommendations: Record<string, RecommendationResponse>;
  roadmaps: Record<string, RoadmapResponse>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: CacheState = {
  recommendations: {},
  roadmaps: {},
  loading: {},
  errors: {},
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    clearCache: (state) => {
        state.recommendations = {};
        state.roadmaps = {};
        state.loading = {};
        state.errors = {};
    }
  }
});

export const { clearCache } = cacheSlice.actions;
export default cacheSlice.reducer;
