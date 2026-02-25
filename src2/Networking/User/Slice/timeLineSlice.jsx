import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTimelinePhasesApi,
  addTimelinePhaseApi,
  updateTimelinePhaseApi,
} from "../APIs/ProjectManagement/projectManagement";

const timelineSlice = createSlice({
  name: "timelineSlice",
  initialState: {
    list: [],
    loading: false,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTimelinePhasesApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimelinePhasesApi.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTimelinePhasesApi.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addTimelinePhaseApi.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateTimelinePhaseApi.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.list.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.list[index] = updated;
        }
      });
  },
});

export default timelineSlice.reducer;
