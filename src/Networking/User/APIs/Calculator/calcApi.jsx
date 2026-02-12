import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { toast } from "react-toastify";
import { calcEndpoint, itcalculatorEndpoint } from "../../../NWconfig";

export const calcSubmitApi = createAsyncThunk(
  "calcSubmitApi",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(calcEndpoint, data);
      toast.success(response.data?.message);
      return response.data;
    } catch (error) {
      const backendError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to calculate";

      return rejectWithValue(backendError);
    }
  }
);

export const commissionSimpleApi = createAsyncThunk(
  "calculator/commissionSimple",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/calc/commission_simple",
        payload
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const itcalculatorApi = createAsyncThunk(
  "calculator/itcalculatorApi",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        itcalculatorEndpoint,
        payload
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
