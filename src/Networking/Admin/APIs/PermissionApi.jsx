import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "./AxiosInstance";
import {
  Approved_list,
  baseURL,
  Denied_list,
  Request_approve_deny,
  Request_list,
} from "../../NWconfig";

export const ListRequestSubmit = createAsyncThunk(
  "auth/ListRequestSubmit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${baseURL}${Request_list}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const Request_Approved_Deny_Submit = createAsyncThunk(
  "auth/Request_Approved_Deny_Submit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${baseURL}${Request_approve_deny}`,
        data
      );
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const Approved_list_submit = createAsyncThunk(
  "auth/Approved_list_submit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${baseURL}${Approved_list}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const Denied_list_submit = createAsyncThunk(
  "auth/Denied_list_submit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${baseURL}${Denied_list}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
