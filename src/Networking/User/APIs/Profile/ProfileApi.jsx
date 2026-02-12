import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { ProfileDetail, ProfileUpdateDetail } from "../../../NWconfig";

const getErrorMsg = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.response?.data?.detail || fallback;

export const getProfileDetail = createAsyncThunk(
  "auth/getProfileDetail",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ProfileDetail);
      return response.data;
    } catch (error) {
      const msg = getErrorMsg(error);
      return rejectWithValue(msg);
    }
  }
);

export const getProfileByEmailApi = createAsyncThunk(
  "admin/getProfileByEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/auth/user/profile",
        {
          params: { email },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        }
      );

      return res.data;
    } catch (err) {
      console.error("PROFILE API FAILED 👉", err.response);
      return rejectWithValue(
        err.response?.data?.message || "Profile fetch failed"
      );
    }
  }
);


export const ProfileUpdateApi = createAsyncThunk(
  "auth/ProfileUpdateApi",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ProfileUpdateDetail, formData);
      toast.success(response.data?.message || "Profile updated successfully!");
      return response.data;
    } catch (error) {
      const msg = getErrorMsg(error);
      return rejectWithValue(msg);
    }
  }
);
