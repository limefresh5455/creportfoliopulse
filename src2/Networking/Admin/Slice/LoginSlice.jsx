import { createSlice } from "@reduxjs/toolkit";
import { LoginSubmit } from "../APIs/LoginAPIs";

const savedAuth = sessionStorage.getItem("auth");

const savedToken = sessionStorage.getItem("token");

const loginSlice = createSlice({
  name: "loginSlice",
  initialState: {
    loading: false,
    Athorization: savedToken || "",
    Role: savedAuth ? JSON.parse(savedAuth).role : "",
    error: null,
  },
  extraReducers: (builder) => {
    builder.addCase(LoginSubmit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(LoginSubmit.fulfilled, (state, action) => {
      state.loading = false;
      state.Athorization = action.payload.access_token;
      state.Role = action.payload.role;
      console.log(state.Role, "state.Role");
    });
    builder.addCase(LoginSubmit.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    });
  },
});

export default loginSlice.reducer;
