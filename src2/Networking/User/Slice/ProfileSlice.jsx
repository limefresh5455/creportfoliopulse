import { createSlice } from "@reduxjs/toolkit";
import { getProfileDetail } from "../APIs/Profile/ProfileApi";

const ProfileSlice = createSlice({
  name: "ProfileSlice",
  initialState: {
    loading: false,
    userdata: "",
    error: null,
  },
  extraReducers: (builder) => {
    builder.addCase(getProfileDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProfileDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.userdata = action.payload;
    });
    builder.addCase(getProfileDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default ProfileSlice.reducer;
