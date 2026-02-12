import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";

export const getProjectsApi = createAsyncThunk(
  "getProjectsApi",
  async ({ buildingId, skip = 0, limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/work-letter/projects", {
        params: {
          building_id: buildingId,
          skip,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createProjectApi = createAsyncThunk(
  "projects/createProject",
  async (
    { projectName, description, building, startDate, targetDate, buildingId },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        project_name: projectName,
        description,
        building_address: building,
        start_date: startDate,
        target_completion_date: targetDate,
        building_id: buildingId,
      };

      const response = await axiosInstance.post(
        "/work-letter/projects",
        payload,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateProjectApi = createAsyncThunk(
  "projects/updateProject",
  async (
    {
      projectId,
      projectName,
      description,
      building,
      buildingId,
      startDate,
      targetDate,
      actualCompletionDate,
      status,
    },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        project_name: projectName,
        description,
        building_address: building,
        building_id: buildingId,
        start_date: startDate,
        target_completion_date: targetDate,
        actual_completion_date: actualCompletionDate || null,
        status,
      };

      const response = await axiosInstance.put(
        `/work-letter/projects/${projectId}`,
        payload,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteProjectApi = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/work-letter/projects/${projectId}`);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addLineItemsBulkApi = createAsyncThunk(
  "addLineItemsBulkApi",
  async ({ projectId, lineItems }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/work-letter/projects/${projectId}/line-items/bulk`,
        { line_items: lineItems },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchLineItemsApi = createAsyncThunk(
  "workLetter/fetchLineItems",
  async ({ projectId, filters }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/work-letter/projects/${projectId}/line-items`,
        {
          params: filters,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching line items",
      );
    }
  },
);

export const updateLineItemApi = createAsyncThunk(
  "updateLineItemApi",
  async ({ projectId, lineItemId, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/work-letter/projects/${projectId}/line-items/${lineItemId}`,
        payload,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteLineItemApi = createAsyncThunk(
  "deleteLineItemApi",
  async ({ projectId, lineItemId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `/work-letter/projects/${projectId}/line-items/${lineItemId}`,
      );
      return lineItemId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchCostAnalysisApi = createAsyncThunk(
  "fetchCostAnalysisApi",
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/work-letter/projects/${projectId}/cost-analysis`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const getWorkLetterSummaryApi = createAsyncThunk(
  "getWorkLetterSummaryApi",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/work-letter/summary");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const uploadDocumentApi = createAsyncThunk(
  "documents/uploadDocument",
  async ({ projectId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(
        `/work-letter/projects/${projectId}/documents`,
        formData,
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchDocumentsApi = createAsyncThunk(
  "documents/fetchDocuments",
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/work-letter/projects/${projectId}/documents`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteDocumentApi = createAsyncThunk(
  "documents/deleteDocument",
  async ({ projectId, documentId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        `/work-letter/projects/${projectId}/documents/${documentId}`,
      );

      return documentId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchTimelinePhasesApi = createAsyncThunk(
  "timeline/fetchPhases",
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/work-letter/projects/${projectId}/timeline-phases`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const addTimelinePhaseApi = createAsyncThunk(
  "timeline/addPhase",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/work-letter/projects/${projectId}/timeline-phases`,
        payload,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateTimelinePhaseApi = createAsyncThunk(
  "timeline/updatePhase",
  async ({ projectId, phaseId, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/work-letter/projects/${projectId}/timeline-phases/${phaseId}`,
        payload,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchAiChatHistoryApi = createAsyncThunk(
  "aiChat/fetchHistory",
  async ({ projectId, limit = 12 }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/work-letter/projects/${projectId}/ai-chat-history?limit=${limit}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const askAiQuestionApi = createAsyncThunk(
  "aiChat/askQuestion",
  async ({ projectId, question }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/work-letter/projects/${projectId}/ai-chat`,
        { question },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);
