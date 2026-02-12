import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import { renewaltrackerendpoint } from "../../NWconfig";

export const RenewalTrackerSubmit = createAsyncThunk(
  "RenewalTrackerSubmit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(renewaltrackerendpoint, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UpdateRenewalById = createAsyncThunk(
  "UpdateRenewalById",
  async ({ tracker_id, data }, { rejectWithValue }) => {

    try {
      const response = await axiosInstance.put("/renewal/" + tracker_id, data);
      return response.data;
    } catch (error) {
      console.error("UpdateSubleaseById Error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const GetRenewalTrackerList = createAsyncThunk(
  "GetRenewalTrackerList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/renewal/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const GetRenewalById = createAsyncThunk(
  "GetRenewalById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/renewal/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const DeleteRenewalById = createAsyncThunk(
  "DeleteRenewalById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/renewal/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
