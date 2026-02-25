import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "./AxiosInstance";
import {
  AskQuestion,
  baseURL,
  DeleteDoc,
  ListDoc,
  UpdateDoc,
  UploadDoc,
} from "../../NWconfig";

export const UploadDocSubmit = createAsyncThunk(
  "docs/UploadDocSubmit",
  async ({ files, buildingId, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      {
        buildingId && formData.append("building_id", buildingId);
      }
      formData.append("category", category);

      const response = await axiosInstance.post(
        `${baseURL}${UploadDoc}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const UpdateDocSubmit = createAsyncThunk(
  "docs/UpdateDocSubmit",
  async ({ file_id, new_file, building_id, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file_id", file_id);
      formData.append("new_file", new_file);
      formData.append("building_id", building_id);
      formData.append("category", category);

      const response = await axiosInstance.patch(
        `${baseURL}${UpdateDoc}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const ListDocSubmit = createAsyncThunk(
  "docs/ListDocSubmit",
  async ({ building_id, category }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${baseURL}${ListDoc}`, {
        params: { building_id, category },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const DeleteDocSubmit = createAsyncThunk(
  "docs/DeleteDocSubmit",
  async ({ building_id, category, file_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`${DeleteDoc}`, {
        params: { building_id, category, file_id },
      });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const AskQuestionAPI = createAsyncThunk(
  "docs/AskQuestionAPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${baseURL}${AskQuestion}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
