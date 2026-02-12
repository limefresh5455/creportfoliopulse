import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import {
  Session_List_Specific,
  Del_Chat_Session,
  Chat_history,
  Gemini_Chat_History,
} from "../../../NWconfig";

const getErrorMsg = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.response?.data?.detail || fallback;

export const get_Session_List_Specific = createAsyncThunk(
  "auth/get_Session_List_Specific",
  async ({ category = null, buildingId = null } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(Session_List_Specific, {
        params: {
          ...(category ? { category } : {}),
          ...(buildingId ? { building_id: buildingId } : {}),
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  },
);

export const Delete_Chat_Session = createAsyncThunk(
  "auth/Delete_Chat_Session",
  async (id, { rejectWithValue }) => {
    try {
      const url = `${Del_Chat_Session}?session_id=${id}`;
      const response = await axiosInstance.delete(url);

      return response.data;
    } catch (error) {
      console.error("Delete_Chat_Session error:", error);

      const status = error.response?.status;
      const message =
        error.response?.data?.detail || error.response?.data?.message;

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        sessionStorage.clear();
        window.location.href = "/";
        return rejectWithValue("Session expired");
      }

      const errorMessage =
        message ||
        "An unexpected error occurred while deleting the chat session.";

      return rejectWithValue(errorMessage);
    }
  },
);

export const get_Chat_History = createAsyncThunk(
  "auth/get_Chat_History",
  async ({ session_id, building_id }, { rejectWithValue }) => {
    const token = sessionStorage.getItem("token");

    try {
      const params = new URLSearchParams();

      params.append("session_id", session_id);

      if (building_id) {
        params.append("building_id", building_id);
      }

      const url = `${Chat_history}?${params.toString()}`;

      const response = await axiosInstance.get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });

      return response.data;
    } catch (error) {
      console.error("get_Chat_History error:", error);

      const status = error.response?.status;
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to fetch chat history. Please try again.";

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        sessionStorage.clear();
        window.location.href = "/";
        return rejectWithValue("Session expired");
      }

      return rejectWithValue(message);
    }
  },
);

export const get_Gemini_Chat_History = createAsyncThunk(
  "get_Gemini_Chat_History",
  async ({ session_id, building_id }, { rejectWithValue }) => {
    const token = sessionStorage.getItem("token");

    try {
      const params = new URLSearchParams();

      params.append("session_id", session_id);

      if (building_id) {
        params.append("building_id", building_id);
      }

      const url = `${Gemini_Chat_History}?${params.toString()}`;

      const response = await axiosInstance.get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });

      return response.data;
    } catch (error) {
      console.error("get_Chat_History error:", error);

      const status = error.response?.status;
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to fetch chat history. Please try again.";

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        sessionStorage.clear();
        window.location.href = "/";
        return rejectWithValue("Session expired");
      }

      return rejectWithValue(message);
    }
  },
);
