import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "./AxiosInstance";
import { Upload_General_info } from "../../NWconfig";

export const UploadBuildinginfoSubmit = createAsyncThunk(
  "auth/UploadBuildinginfoSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        Upload_General_info,
        credentials
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
