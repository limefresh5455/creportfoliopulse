import { createSlice } from "@reduxjs/toolkit";
import { getNotificationStatusAPI, toggleNotificationStatusAPI } from "../APIs/Notification/notificationApi";


const notificationSlice = createSlice({
    name: "notificationSlice",
    initialState: {
        enabled: true,
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(getNotificationStatusAPI.pending, (state) => {
                state.loading = true;
            })
            .addCase(getNotificationStatusAPI.fulfilled, (state, action) => {
                state.loading = false;
                state.enabled = action.payload.enabled;
            })
            .addCase(getNotificationStatusAPI.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(toggleNotificationStatusAPI.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleNotificationStatusAPI.fulfilled, (state, action) => {
                state.loading = false;
                state.enabled = action.payload.enabled;
            })
            .addCase(toggleNotificationStatusAPI.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default notificationSlice.reducer;