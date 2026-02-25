import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { baseURL, login, Sigup, UserDelete } from "../../NWconfig";
import axiosInstance from "./AxiosInstance";

export const LoginSubmit = createAsyncThunk(
  "auth/LoginSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(login, credentials, {
        headers: { "Content-Type": "application/json" },
      });

      const res = response.data;

      return res;
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        toast.error("Invalid email or password.");
        return rejectWithValue("Invalid email or password.");
      }

      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const SignUpSubmit = createAsyncThunk(
  "auth/SignUpSubmit",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(Sigup, credentials);

      const { role, message } = response.data;

      if (message) {
        toast.success(message);
        return { message };
      }

      if (role) {
        return { role };
      }

      return rejectWithValue("Invalid response from server");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Signup failed";
      return rejectWithValue(message);
    }
  }
);

export const DeleteUser = createAsyncThunk(
  "auth/DeleteUser",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${UserDelete}?email=${email}`
      );

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const googleLoginService = createAsyncThunk(
  "auth/googleLoginService",
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/auth/google", { token: idToken }
      );

      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        "Google login failed. Please try again.";

      return rejectWithValue(errMsg);
    }
  }
);