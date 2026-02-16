import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/messenger/conversations");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/messenger/conversations/messages/${conversationId}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const uploadfileChatSystemAPi = createAsyncThunk(
  "chat/uploadFile",
  async ({ file, receiverId, myUserId }, { rejectWithValue, dispatch }) => {
    if (!file || !receiverId || !myUserId) {
      return rejectWithValue("Missing required data for file upload");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "chat_files");

      const token = sessionStorage.getItem("access_token");

      const response = await axiosInstance.post("/messenger/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          dispatch(setUploadProgress(progress));
        },
      });

      const fileId = response.data.file_id;

      return {
        fileId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        receiverId,
        myUserId,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchFileUrl = createAsyncThunk(
  "chat/fetchFileUrl",
  async (fileId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await axiosInstance.get(`/messenger/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { fileId, url: res.data.url };
    } catch (err) {
      return rejectWithValue({
        fileId,
        error: err.response?.data || err.message,
      });
    }
  },
);

export const downloadFileApi = createAsyncThunk(
  "chat/downloadFile",
  async ({ fileId, fileName }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("access_token");

      const res = await axiosInstance.get(`/messenger/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const link = document.createElement("a");
      link.href = res.data.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { fileId, success: true };
    } catch (err) {
      return rejectWithValue({
        fileId,
        error: err.response?.data || err.message,
      });
    }
  },
);

export const sendMessageAPi = createAsyncThunk(
  "chat/sendMessageAPi",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/messenger/messages", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/messenger/messages/${messageId}`);
      return messageId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const markMessageRead = createAsyncThunk(
  "chat/markMessageRead",
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/messenger/messages/${messageId}/read`);
      return messageId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const createGroupApi = createAsyncThunk(
  "chat/createGroup",
  async ({ name, member_ids }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/messenger/conversations/group",
        {
          name,
          member_ids,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        },
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const uploadChatFileApi = createAsyncThunk(
  "chat/uploadFile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/messenger/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload failed");
    }
  },
);

export const deleteMessageApi = async (messageId) => {
  const res = await axiosInstance.delete(`/messenger/messages/${messageId}`);
  return res.data;
};

export const leaveGroupApi = createAsyncThunk(
  "chat/leaveGroup",
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/messenger/conversations/${conversationId}/leave`,
      );

      return { conversationId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
