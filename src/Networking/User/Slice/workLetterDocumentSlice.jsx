import { createSlice } from "@reduxjs/toolkit";
import {
  deleteDocumentApi,
  fetchDocumentsApi,
} from "../APIs/ProjectManagement/projectManagement";

const workLetterdocumentSlice = createSlice({
  name: "workLetterdocumentSlice",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentsApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocumentsApi.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDocumentsApi.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteDocumentApi.fulfilled, (state, action) => {
        state.list = state.list.filter((doc) => doc.id !== action.payload);
      });
  },
});

export default workLetterdocumentSlice.reducer;
