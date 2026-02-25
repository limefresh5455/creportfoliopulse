import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  deleteMessage,
  leaveGroupApi,
  deleteConversationApi,
  fetchMessages,
  fetchFileUrl,
} from "../APIs/ChatSystem/chatSystemApi";

const initialState = {
  conversations: [],
  messages: [],
  activeConversation: null,
  leavingGroup: null,
  userStatus: {},
  fileUrls: {},
  fileLoading: {},

  typingUsers: {},

  loading: false,
  error: null,
};

const chatSystemSlice = createSlice({
  name: "chatSystemSlice",
  initialState,

  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    addMessageSocket: (state, action) => {
      const newMessage = action.payload;

      const index = state.messages.findIndex(
        (msg) =>
          msg.id === newMessage.id ||
          (msg.is_temp &&
            newMessage.temp_id &&
            msg.temp_id === newMessage.temp_id),
      );

      if (newMessage.file_id) {
        newMessage.is_file = true;
      }

      if (index === -1) {
        state.messages.push({
          ...newMessage,
          is_temp: false,
        });
      } else {
        state.messages[index] = {
          ...state.messages[index],
          ...newMessage,
          is_temp: false,
          is_file: newMessage.file_id ?? state.messages[index].is_file,
        };
      }
    },

    addMessage: (state, action) => {
      const newMessage = action.payload;

      const exists = state.messages.some((msg) => msg.id === newMessage.id);

      if (!exists) {
        state.messages.push({
          ...newMessage,
          is_file: !!newMessage.file_id,
        });
      }
    },

    setUserStatus: (state, action) => {
      const { user_id, online, last_seen } = action.payload;
      if (!user_id) return;

      (online,
        (state.userStatus[user_id] = {
          last_seen,
        }));
    },

    setTypingStatus: (state, action) => {
      const { conversation_id, sender_id, is_typing } = action.payload;

      if (!conversation_id || !sender_id) return;

      if (!state.typingUsers[conversation_id]) {
        state.typingUsers[conversation_id] = {};
      }

      state.typingUsers[conversation_id][sender_id] = is_typing === true;
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    clearTypingForConversation: (state, action) => {
      const conversationId = action.payload;
      if (conversationId) {
        delete state.typingUsers[conversationId];
      }
    },

    deleteMessageSocket: (state, action) => {
      const { conversation_id, message_id } = action.payload;
      if (!conversation_id || !message_id) return;
      state.messages = state.messages.filter(
        (msg) =>
          !(msg.conversation_id === conversation_id && msg.id === message_id),
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;

        if (action.meta.arg.page === 1) {
          state.messages = action.payload || [];
        } else {
          state.messages = [...state.messages, ...(action.payload || [])];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(
          (msg) => msg.id !== action.payload,
        );
      });
    builder
      .addCase(leaveGroupApi.pending, (state) => {
        state.leavingGroup = true;
      })

      .addCase(leaveGroupApi.fulfilled, (state, action) => {
        state.leavingGroup = false;

        state.conversations = state.conversations.filter(
          (conv) => conv.id !== action.payload.conversationId,
        );
      })

      .addCase(leaveGroupApi.rejected, (state, action) => {
        state.leavingGroup = false;
        state.error = action.payload;
      });
    builder.addCase(deleteConversationApi.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteConversationApi.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteConversationApi.fulfilled, (state) => {
      state.loading = false;
    });
    builder
      .addCase(fetchFileUrl.pending, (state, action) => {
        state.fileLoading[action.meta.arg] = true;
      })

      .addCase(fetchFileUrl.fulfilled, (state, action) => {
        const { fileId, url } = action.payload;

        state.fileLoading[fileId] = false;
        state.fileUrls[fileId] = url;
      })

      .addCase(fetchFileUrl.rejected, (state, action) => {
        state.fileLoading[action.meta.arg] = false;
      });
  },
});

export const {
  setActiveConversation,
  addMessageSocket,
  addMessage,
  setUserStatus,
  setTypingStatus,
  clearMessages,
  clearTypingForConversation,
  deleteMessageSocket,
} = chatSystemSlice.actions;

export default chatSystemSlice.reducer;
