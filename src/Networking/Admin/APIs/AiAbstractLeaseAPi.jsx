import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "./AxiosInstance";
import {
  deleteAbstractDoc,
  deleteDraftingDoc,
  extractMetadata,
  extractTextViewdata,
  extractTextdata,
  listAbstractDoc,
  listDraftingDoc,
  updatetextdata,
  upload_Abstract_Lease,
  upload_Drafting_Lease,
  upload_Report_Generator,
} from "../../NWconfig";

export const UploadReportGenerator = createAsyncThunk(
  "/UploadReportGenerator",
  async ({ file, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await axiosInstance.post(
        upload_Report_Generator,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const UploadAbstractLeaseDoc = createAsyncThunk(
  "/UploadAbstractLeaseDoc",
  async ({ file, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category.toLowerCase());

      const response = await axiosInstance.post(
        upload_Abstract_Lease,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const DeleteAbstractDoc = createAsyncThunk(
  "DeleteAbstractDoc",
  async ({ fileId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(deleteAbstractDoc, {
        params: { file_id: fileId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Deletion failed"
      );
    }
  }
);

export const ListAbstractLeaseDoc = createAsyncThunk(
  "ListAbstractLeaseDoc",
  async ({ category }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(listAbstractDoc, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch list"
      );
    }
  }
);

export const UploadDraftingLeaseDoc = createAsyncThunk(
  "/UploadDraftingLeaseDoc",
  async ({ file, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category.toLowerCase());

      const response = await axiosInstance.post(
        upload_Drafting_Lease,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const DeleteDrafingDoc = createAsyncThunk(
  "DeleteDrafingDoc",
  async ({ fileId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(deleteDraftingDoc, {
        params: { file_id: fileId },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Deletion failed"
      );
    }
  }
);

export const ListDraftingLeaseDoc = createAsyncThunk(
  "ListDraftingLeaseDoc",
  async ({ category }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(listDraftingDoc, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch list"
      );
    }
  }
);

export const getMetaData = createAsyncThunk(
  "getMetaData",
  async (file_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(extractMetadata, {
        params: { file_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch metadata"
      );
    }
  }
);

export const getTextViewData = createAsyncThunk(
  "getTextViewData",
  async (file_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(extractTextViewdata, {
        params: { file_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch text view data"
      );
    }
  }
);

export const getTextData = createAsyncThunk(
  "getTextData",
  async (file_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(extractTextdata, {
        params: { file_id },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch text data"
      );
    }
  }
);

export const UpdateDraftingtext = createAsyncThunk(
  "/UpdateDraftingtext",
  async ({ file_id, text }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(updatetextdata, text, {
        params: { file_id },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);
