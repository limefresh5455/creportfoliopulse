import { createSlice } from "@reduxjs/toolkit";
import { GetRenewalTrackerList } from "../APIs/RenewalTrackeApi";

const RenewalSlice = createSlice({
  name: "RenewalSlice",
  initialState: {
    loading: false,
    list: [],
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetRenewalTrackerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetRenewalTrackerList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(GetRenewalTrackerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching list";
      });
  },
});

export default RenewalSlice.reducer;
