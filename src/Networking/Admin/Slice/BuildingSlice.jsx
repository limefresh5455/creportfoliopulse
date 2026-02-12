import { createSlice } from '@reduxjs/toolkit';
import { CreateBuildingSubmit, ListBuildingSubmit } from '../APIs/BuildingApi';

const BuildingSlice = createSlice({
    name: 'BuildingSlice',
    initialState: {
        loading: false,
        Buliding: "",
        BuildingList: [],
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(CreateBuildingSubmit.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(CreateBuildingSubmit.fulfilled, (state, action) => {
            state.loading = false;
            state.Buliding = action.payload;

        })
        builder.addCase(CreateBuildingSubmit.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        builder.addCase(ListBuildingSubmit.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(ListBuildingSubmit.fulfilled, (state, action) => {
            state.loading = false;
            state.BuildingList = action.payload;

        })
        builder.addCase(ListBuildingSubmit.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default BuildingSlice.reducer;
