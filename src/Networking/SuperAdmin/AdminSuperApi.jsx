import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { inviteAdmin, listAdmin } from "../NWconfig";
import axiosInstance from "../Admin/APIs/AxiosInstance";

export const inviteAdminApi = createAsyncThunk(
  "inviteAdminApi",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(inviteAdmin, credentials);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAdminlistApi = createAsyncThunk(
  "getAdminlistApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(listAdmin);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchAdminStatsApi = createAsyncThunk(
  "admin/fetchStats",
  async (user_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get(`/admin/stats?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch admin stats",
      );
    }
  },
);

export const fetchAdminAnalyticsApi = createAsyncThunk(
  "admin/fetchAnalytics",
  async ({ user_id, days = 7 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get(
        `/admin/analytics?days=${days}&user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch admin analytics",
      );
    }
  },
);
