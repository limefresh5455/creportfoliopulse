import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import { subleasetrackerendpoint } from "../../NWconfig";

export const SubleaseTrackerSubmit = createAsyncThunk(
  "SubleaseTracker",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(subleasetrackerendpoint, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UpdateSubleaseById = createAsyncThunk(
  "sublease/update",
  async ({ tracker_id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/sublease/" + tracker_id, data);
      return response.data;
    } catch (error) {
      console.error("UpdateSubleaseById Error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const GetSubleaseTrackerList = createAsyncThunk(
  "SubleaseTrackerList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/sublease/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const GetSubleaseById = createAsyncThunk(
  "GetSubleaseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/sublease/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const DeleteSubleaseById = createAsyncThunk(
  "DeleteSubleaseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/sublease/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
