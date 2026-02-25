import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import {
  distilledExpenseTrackerEndpoint,
  distilledExpenseTrackerlistEndPoint,
} from "../../NWconfig";
import { toast } from "react-toastify";

export const distilledExpenseTracker = createAsyncThunk(
  "distilledExpenseTracker",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        distilledExpenseTrackerEndpoint,
        payload
      );
      toast.success(response.data.message)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getdistilledExpenseTrackerlistApi = createAsyncThunk(
  "getdistilledExpenseTrackerlistApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        distilledExpenseTrackerlistEndPoint
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
