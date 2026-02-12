import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";
import { toast } from "react-toastify";

export const notes = "/notes/";

export const createNoteApi = createAsyncThunk(
  "notes/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/notes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


export const getNotesApi = createAsyncThunk(
  "notes/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getNoteByIdApi = createAsyncThunk(
  "notes/getOne",
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${notes}${noteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateNoteApi = createAsyncThunk(
  "notes/update",
  async ({ noteId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/notes/${noteId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


export const deleteNoteFileApi = createAsyncThunk(
  "notes/deleteFile",
  async ({ fileId }, { rejectWithValue }) => {
    console.log(fileId,"fileId");
    
    try {
      const res = await axiosInstance.delete(`/notes/files/${fileId}`);
      return { fileId }; 
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);


export const deleteNoteApi = createAsyncThunk(
  "notes/delete",
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`${notes}${noteId}`);
      toast.success("Note deleted!");
      return { noteId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
