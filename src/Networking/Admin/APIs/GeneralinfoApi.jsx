import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./AxiosInstance";
import {
  AskGemini,
  ASkQuestionbuildingEndpoint,
  AskQuestionReportEndpoint,
  updateGenralDoc,
} from "../../NWconfig";
import { toast } from "react-toastify";

export const UploadfloorStack = createAsyncThunk(
  "UploadfloorStack",
  async ({ file, category, building_Id, tag }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("files", file);

      formData.append("category", category);
      formData.append("building_id", building_Id);

      if (tag) {
        formData.append("tag", tag);
      }

      const response = await axiosInstance.post(
        "/building/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const UploadGeneralDocSubmit = createAsyncThunk(
  "general/UploadGeneralDocSubmit",
  async ({ file, category, building_Id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("files", file);

      let url = `/admin_user_chat/upload?category=${encodeURIComponent(
        category
      )}`;

      if (building_Id) {
        url += `&building_id=${encodeURIComponent(building_Id)}`;
      }

      const response = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const UploadgeminiDocSubmit = createAsyncThunk(
  "UploadgeminiDocSubmit",
  async ({ file, session_id  }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      if(session_id){
      formData.append("session_id",session_id);
      }

      let url = "/gemini/upload"

      const response = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const ListGeminiDoc = createAsyncThunk(
  "general/ListGeminiDoc",
  async ({ session_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/gemini/files/${session_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch list"
      );
    }
  }
);

export const DeleteGeneralDocSubmit = createAsyncThunk(
  "general/DeleteGeneralDocSubmit",
  async ({ file_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/gemini/files/${file_id}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document"
      );
    }
  }
);


export const UpdateGeneralDocSubmit = createAsyncThunk(
  "general/UpdateGeneralDocSubmit",
  async ({ file_id, new_file, category }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", new_file);

      const response = await axiosInstance.patch(
        `${updateGenralDoc}?file_id=${file_id}&category=${encodeURIComponent(
          category
        )}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const FloorPlanStackDeleteSubmit = createAsyncThunk(
  "general/FloorPlanStackDeleteSubmit",
  async ({ file_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/building/files/bs_and_fp_delete?file_id=${file_id}`
      );
     toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const GeneralInfoSubmit = createAsyncThunk(
  "general/GeneralInfoSubmit",
  async ({ buildingId, category } = {}, { rejectWithValue }) => {
    try {
      let response;

      if (buildingId) {
        response = await axiosInstance.get(
          `/chatbot/files/?building_id=${buildingId}&category=${category}`
        );
      } else {
        response = await axiosInstance.get(
          `/chatbot/files/?category=${category}`
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const FloorPlanStackListSubmit = createAsyncThunk(
  "general/FloorPlanStackListSubmit",
  async ({ buildingId, category }, { rejectWithValue }) => {
    try {
      let response;

      if (buildingId) {
        response = await axiosInstance.get(
          `/building/files/bs_fp_list?building_id=${buildingId}&category=${category}`
        );
      } else {
        response = await axiosInstance.get(
          `/building/files/bs_fp_list?category=${category}`
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const AskQuestionBuildingAPI = createAsyncThunk(
  "chat/AskQuestionBuildingAPI",
  async (Data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        ASkQuestionbuildingEndpoint,
        Data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Question not sent"
      );
    }
  }
);

export const AskQuestionGeminiAPI = createAsyncThunk(
  "chat/AskQuestionGeminiAPI",
  async (Data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(AskGemini, Data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Question not sent"
      );
    }
  }
);

export const AskQuestionReportAPI = createAsyncThunk(
  "chat/AskQuestionReportAPI",
  async (Data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        AskQuestionReportEndpoint,
        Data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Question not sent"
      );
    }
  }
);
