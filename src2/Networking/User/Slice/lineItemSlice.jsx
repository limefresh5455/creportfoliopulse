import { createSlice } from "@reduxjs/toolkit";
import { fetchLineItemsApi } from "../APIs/ProjectManagement/projectManagement";

const lineItemSlice = createSlice({
  name: "lineItemSlice",
  initialState: {
    lineItems: [],
    loading: false,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLineItemsApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLineItemsApi.fulfilled, (state, action) => {
        state.loading = false;
        state.lineItems = action.payload;
      })
      .addCase(fetchLineItemsApi.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default lineItemSlice.reducer;
