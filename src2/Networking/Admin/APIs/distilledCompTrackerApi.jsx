import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import {
  AskQuestionDCTEndpoint,
  distilledBenchmarkEndpoint,
  distilledCompTrackerEndpoint,
  distilledCompTrackerlistEndPoint,
} from "../../NWconfig";
import { toast } from "react-toastify";

export const distilledCompTracker = createAsyncThunk(
  "distilledCompTracker",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        distilledCompTrackerEndpoint,
        payload
      );
      toast.success(response.data.message)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getdistilledCompTrackerlistApi = createAsyncThunk(
  "getdistilledCompTrackerlistApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        distilledCompTrackerlistEndPoint
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const AskQuestionDCTAPI = createAsyncThunk(
  "AskQuestionDCTAPI",
  async ({ question }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(AskQuestionDCTEndpoint, {
        question,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const distilledBenchmarkApi = createAsyncThunk(
  "distilledBenchmarkApi",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        distilledBenchmarkEndpoint,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
