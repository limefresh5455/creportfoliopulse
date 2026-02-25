import { createAsyncThunk } from "@reduxjs/toolkit";
import { health } from "../../../NWconfig";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";

export const getHealth = createAsyncThunk(
  "getHealth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(health);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
