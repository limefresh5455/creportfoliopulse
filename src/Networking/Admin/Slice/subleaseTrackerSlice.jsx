import { createSlice } from "@reduxjs/toolkit";
import { GetSubleaseTrackerList } from "../APIs/subleaseTrackerApi";

const subleaseSlice = createSlice({
  name: "subleaseSlice",
  initialState: {
    loading: false,
    list: [],
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetSubleaseTrackerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetSubleaseTrackerList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(GetSubleaseTrackerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching list";
      });
  },
});

export default subleaseSlice.reducer;
