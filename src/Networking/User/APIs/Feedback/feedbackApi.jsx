import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import {
  feedbacksubmit,
  getfeedback,
  getinfocollaborationbuildings,
  updatefeedback,
} from "../../../NWconfig";

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
  },
);

export const fetchBuildings = createAsyncThunk(
  "getBuildings",
  async (category, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${getinfocollaborationbuildings}?category=${category}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
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
  },
);

export const UpdateFeedback = createAsyncThunk(
  "UpdateFeedback",
  async ({ id, category, building_id, form_data }, { rejectWithValue }) => {
    try {
      console.log(id, "id");

      const response = await axiosInstance.put(
        `/information_collaboration/admin/update/${id}`,
        {
          category,
          building_id: Number(building_id),
          form_data,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const DeleteFeedbackSubmit = createAsyncThunk(
  "DeleteFeedbackSubmit",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/information_collaboration/admin/delete/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const ReviewInformationCollaboration = createAsyncThunk(
  "informationCollaboration/review",
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/information_collaboration/review/${id}?decision=${decision}`,
        {},
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Review failed");
    }
  },
);

// export default UpdateFeedback = createAsyncThunk(
//   "UpdateFeedback",
//   async ({ feedback_id, feedback }, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.patch(
//         `${updatefeedback}${feedback_id}`,
//         {
//           feedback,
//         },
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   },
// );

// export const DeleteFeedbackSubmit = createAsyncThunk(
//   "DeleteFeedbackSubmit",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.delete(
//         `/feedback/?feedback_id=${id}`,
//       );
//       toast.success(response.data.message);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   },
// );
