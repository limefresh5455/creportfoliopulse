import { createSlice } from '@reduxjs/toolkit';
import { AskQuestionAPI, ListDocSubmit } from '../APIs/UploadDocApi';

const DocSlice = createSlice({
    name: 'DocSlice',
    initialState: {
        loading: false,
        Buliding: "",
        DocList: [],
        Data: "",
        error: null,
    },
    extraReducers: (builder) => {

        builder.addCase(ListDocSubmit.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(ListDocSubmit.fulfilled, (state, action) => {
            state.loading = false;
            state.DocList = action.payload;

        });
        builder.addCase(ListDocSubmit.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        builder.addCase(AskQuestionAPI.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(AskQuestionAPI.fulfilled, (state, action) => {
            state.loading = false;
            let config = action.payload;
            state.Data = config;

        });
        builder.addCase(AskQuestionAPI.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default DocSlice.reducer;
