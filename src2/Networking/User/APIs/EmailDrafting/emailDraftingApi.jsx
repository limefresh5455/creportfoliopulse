import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  AddnewEmailTemplate,
  AddnewTenent,
  Deletetemplatemplate,
  EmailDraftingTemlate,
  GenerateTemplate,
  TenentName,
  updateMailTemplate,
} from "../../../NWconfig";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { toast } from "react-toastify";

export const newTenentAPI = createAsyncThunk(
  "newTenentAPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(AddnewTenent, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const newEmailTemplateAPI = createAsyncThunk(
  "newEmailTemplateAPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(AddnewEmailTemplate, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const generateTemplate = createAsyncThunk(
  "generateTemplate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        GenerateTemplate,
        {},
        { params: data }
      );
      return response.data;
    } catch (error) {
      return handleApiError
        ? handleApiError(error, rejectWithValue)
        : rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const templateUpdateApi = createAsyncThunk(
  "templateUpdateApi",
  async ({ template_id, title, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${updateMailTemplate}${template_id}`,
        { title, content }
      );

      return response.data;
    } catch (error) {
      const msg = error;
      return rejectWithValue(msg);
    }
  }
);

export const Deletetemplate = createAsyncThunk(
  "Deletetemplate",
  async ({ template_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${Deletetemplatemplate}${template_id}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Deletion failed"
      );
    }
  }
);

export const tenentNameList = createAsyncThunk(
  "tenentNameList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(TenentName);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const emailDraftingList = createAsyncThunk(
  "emailDraftingList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(EmailDraftingTemlate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
