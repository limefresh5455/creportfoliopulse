import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Admin/APIs/AxiosInstance";

export const getNotificationStatusAPI = createAsyncThunk(
    "notifications/getStatus",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/notifications/status", {
                headers: { accept: "application/json" },
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || error.message || "Something went wrong"
            );
        }
    }
);


export const toggleNotificationStatusAPI = createAsyncThunk(
    "notifications/toggleStatus",
    async (enabled, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(
                "/notifications/toggle",
                { enabled },
                {
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || error.message || "Something went wrong"
            );
        }
    }
);