import { createSlice } from "@reduxjs/toolkit";
import {
  askAiQuestionApi,
  fetchAiChatHistoryApi,
} from "../APIs/ProjectManagement/projectManagement";

const workLetterChatSlice = createSlice({
  name: "workLetterChatSlice",
  initialState: {
    messages: [],
    loading: false,
    sending: false,
  },

  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchAiChatHistoryApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAiChatHistoryApi.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchAiChatHistoryApi.rejected, (state) => {
        state.loading = false;
      })

      .addCase(askAiQuestionApi.pending, (state) => {
        state.sending = true;
      })
      .addCase(askAiQuestionApi.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.unshift(action.payload);
      })
      .addCase(askAiQuestionApi.rejected, (state) => {
        state.sending = false;
      });
  },
});

export const { clearChat } = workLetterChatSlice.actions;
export default workLetterChatSlice.reducer;
