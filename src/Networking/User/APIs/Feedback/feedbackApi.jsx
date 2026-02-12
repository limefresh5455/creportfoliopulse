import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { feedbacksubmit, getfeedback, updatefeedback } from "../../../NWconfig";

export const FeedbackSubmit = createAsyncThunk(
  "auth/FeedbackSubmit",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(feedbacksubmit, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


export const GetFeedbackList = createAsyncThunk(
  "auth/GetFeedbackList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(getfeedback);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
 
export const UpdateFeedback = createAsyncThunk(
  "UpdateFeedback",
  async ({ feedback_id, feedback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${updatefeedback}${feedback_id}`,
        {
          feedback,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const DeleteFeedbackSubmit = createAsyncThunk(
  "DeleteFeedbackSubmit",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/feedback/?feedback_id=${id}`
      );
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
