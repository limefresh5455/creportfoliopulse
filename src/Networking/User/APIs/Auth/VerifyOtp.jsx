import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { ForgetPassword, ResetPasswod, VerifyOtp } from "../../../NWconfig";

export const Forget_passwordSubmit = createAsyncThunk(
  "auth/Forget_passwordSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ForgetPassword, credentials);
      toast.success(response?.data?.message);
      console.log("response", response);
      return response.data;
    } catch (error) {
      console.log(error, "response");
      return rejectWithValue(error.response?.data?.message || "OTP failed");
    }
  }
);

export const VerifyOtpSubmit = createAsyncThunk(
  "auth/VerifyOtpSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(VerifyOtp, credentials);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const Reset_password_Submit = createAsyncThunk(
  "auth/Reset_password_Submit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ResetPasswod, credentials);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "An error occurred while resetting password"
      );
    }
  }
);
