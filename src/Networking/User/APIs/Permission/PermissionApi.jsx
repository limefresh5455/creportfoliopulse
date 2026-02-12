import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { Request_permission } from "../../../NWconfig";

const getErrorMsg = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.response?.data?.detail || fallback;

export const RequestPermissionSubmit = createAsyncThunk(
  "auth/RequestPermissionSubmit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(Request_permission, data);
      toast.success(
        response.data?.message || "Request submitted successfully!"
      );
      return response.data;
    } catch (error) {
      toast.error(getErrorMsg(error));
      return rejectWithValue(getErrorMsg(error));
    }
  }
);
