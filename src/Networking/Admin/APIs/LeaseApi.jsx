import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import { toast } from "react-toastify";
import {
  CreateLeaseEndpoint,
  DeleteLeaseEndpoint,
  LeaselistEndpoint,
  UpdateLeaseeEndpoint,
} from "../../NWconfig";

export const CreateLeaseSubmit = createAsyncThunk(
  "auth/CreateLeaseSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        CreateLeaseEndpoint,
        credentials
      );
      toast.success(response.data?.message || "Lease created successfully!");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lease"
      );
    }
  }
);

export const ListLeaseSubmit = createAsyncThunk(
  "auth/ListLeaseSubmit",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${LeaselistEndpoint}?building_id=${buildingId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leases"
      );
    }
  }
);

export const UpdateLeaseSubmit = createAsyncThunk(
  "admin/UpdateLeaseSubmit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        UpdateLeaseeEndpoint,
        formData
      );
      toast.success(response.data?.message || "Lease updated successfully!");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lease"
      );
    }
  }
);

export const DeleteLease = createAsyncThunk(
  "auth/DeleteLease",
  async (ids, { rejectWithValue }) => {
    try {
      const { lease_id, building_id } = ids;
      const response = await axiosInstance.delete(
        `${DeleteLeaseEndpoint}?lease_id=${lease_id}&building_id=${building_id}`
      );
      toast.success(response.data?.message || "Lease deleted successfully!");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lease"
      );
    }
  }
);
