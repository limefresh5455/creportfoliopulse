import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "./AxiosInstance";
import {
  CreateBuilding,
  DeleteBuildingEndpoint,
  ListBuilding,
  UpdateBuildingEndpoint,
} from "../../NWconfig";

export const CreateBuildingSubmit = createAsyncThunk(
  "auth/CreateBuildingSubmit",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(CreateBuilding, payload);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const ListBuildingSubmit = createAsyncThunk(
  "auth/ListBuildingSubmit",
  async (category, { rejectWithValue }) => {
    try {
      if (!category || category.trim() === "") {
        return rejectWithValue("Category is required");
      }

      const response = await axiosInstance.get(ListBuilding, {
        params: { category: category },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const UpdateBuildingSubmit = createAsyncThunk(
  "auth/UpdateBuildingSubmit",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        UpdateBuildingEndpoint,
        payload
      );
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const DeleteBuilding = createAsyncThunk(
  "auth/DeleteBuilding",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${DeleteBuildingEndpoint}?building_id=${id}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
