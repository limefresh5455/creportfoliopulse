import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import { dashboardData, SystemTracing } from "../../NWconfig";

export const getdashboardApi = createAsyncThunk(
  "auth/getdashboardApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(dashboardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getsystemtracingApi = createAsyncThunk(
  "auth/getsystemtracingApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(SystemTracing);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
