import { createSlice } from "@reduxjs/toolkit";
import { get_Threads_Api, getBenchmark } from "../APIs/forumApi";

const ForumSlice = createSlice({
  name: "ForumSlice",
  initialState: {
    loading: false,
    Buliding: "",
    ThreadList: [],
    Data: {},
    error: null,
  },

  extraReducers: (builder) => {
    builder.addCase(get_Threads_Api.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(get_Threads_Api.fulfilled, (state, action) => {
      state.loading = false;
      state.ThreadList = action.payload;
    });
    builder.addCase(get_Threads_Api.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder
      .addCase(getBenchmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBenchmark.fulfilled, (state, action) => {
        state.loading = false;
        state.Data = action.payload;
      })
      .addCase(getBenchmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ForumSlice.reducer;
