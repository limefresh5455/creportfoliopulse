import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import {
  Deleteconfig,
  getspaceinqurylist,
  getspaceinquryView,
  ingestionconfigs,
  togglebutton,
  updateingestionconfigs,
} from "../../NWconfig";

export const IngestionConfigsSubmit = createAsyncThunk(
  "IngestionConfigsSubmit",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ingestionconfigs, payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getIngestionConfigsSubmit = createAsyncThunk(
  "getIngestionConfigsSubmit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ingestionconfigs);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getSpaceInquryList = createAsyncThunk(
  "getSpaceInquryList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(getspaceinqurylist);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getSpaceInquryview = createAsyncThunk(
  "getSpaceInquryview",
  async (inquiry_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${getspaceinquryView}${inquiry_id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const togglebuttonApi = createAsyncThunk(
  "togglebuttonApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(togglebutton);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const UpdateIngestionConfigsSubmit = createAsyncThunk(
  "IngestionConfigsSubmit",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        updateingestionconfigs,
        payload
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const DeleteIngestionConfigs = createAsyncThunk(
  "DeleteIngestionConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(Deleteconfig);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
